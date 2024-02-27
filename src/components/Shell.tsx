import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Provider } from 'react-redux';
import {
  RouteObject, useMatch, useParams, useRoutes, useSearchParams,
} from 'react-router-dom';
import { Box, Center, Loader } from '@mantine/core';
import { parseStudyConfig } from '../parser/parser';
import {
  GlobalConfig,
  Nullable,
  StudyConfig,
} from '../parser/types';
import { StudyIdParam } from '../routes';
import {
  StudyStoreContext,
  StudyStore,
  studyStoreCreator,
  useStoreDispatch,
  useStoreActions,
  useStoreSelector,
} from '../store/store';
import { sanitizeStringForUrl } from '../utils/sanitizeStringForUrl';

import ComponentController from '../controllers/ComponentController';
import { NavigateWithParams } from '../utils/NavigateWithParams';
import { StudyEnd } from './StudyEnd';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion
import { useStorageEngine } from '../store/storageEngineHooks';
import { generateSequenceArray } from '../utils/handleRandomSequences';
import { StepRenderer } from './StepRenderer';
import { ProvenanceWrapper } from './interface/audioAnalysis/ProvenanceWrapper';
import { StorageEngine } from '../storage/engines/StorageEngine';
import { AnalysisHome } from './interface/audioAnalysis/AnalysisHome';
import { PREFIX } from './Prefix';

async function fetchStudyConfig(configLocation: string, configKey: string) {
  const config = await (await fetch(`${PREFIX}${configLocation}`)).text();
  return parseStudyConfig(config, configKey);
}

export function GenerateStudiesRoutes({ studyId, config, storage }: {
  studyId: Nullable<string>,
  config: Nullable<StudyConfig>,
  storage: StorageEngine}) {
  const [audioStream, setAudioStream] = useState<MediaRecorder | null>(null);
  const dispatch = useStoreDispatch();
  const { setIsRecording } = useStoreActions();

  const sequence = useStoreSelector((state) => state.sequence);

  const atEnd = useMatch('/:studyId/end');

  useEffect(() => {
    let _stream: Promise<MediaStream> | null;
    if (config && config.recordStudyAudio) {
      _stream = navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      _stream.then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        setAudioStream(mediaRecorder);
        dispatch(setIsRecording(true));
      });
    }

    return () => {
      if (_stream) {
        _stream.then((data) => {
          data.getTracks().forEach((track) => track.stop());
        });
      }
    };
  }, [config, dispatch, setIsRecording]);

  useEffect(() => {
    if (atEnd && config && config.recordStudyAudio && audioStream) {
      storage.saveAudio(audioStream);
      dispatch(setIsRecording(false));
    }
  }, [config, atEnd, audioStream, dispatch, setIsRecording, storage]);

  const routes = useMemo(() => {
    if (studyId && config && sequence) {
      const stepRoutes: RouteObject[] = [];

      stepRoutes.push({
        path: '/',
        element: <NavigateWithParams to={`${sequence[0]}`} replace />,
      });

      stepRoutes.push({
        path: '/analysis/:trrackId/:trialName/',
        element: <ProvenanceWrapper />,
      });

      stepRoutes.push({
        path: '/analysis',
        element: <AnalysisHome />,
      });

      stepRoutes.push({
        path: '/:trialName',
        element: <ComponentController />,
      });

      stepRoutes.push({
        path: '/end',
        element: <StudyEnd />,
      });

      const studyRoute: RouteObject = {
        element: <StepRenderer />,
        children: stepRoutes,
      };

      return [studyRoute];
    }
    return [];
  }, [config, sequence, studyId]);

  return useRoutes(routes);
}

export function Shell({ globalConfig }: {
  globalConfig: GlobalConfig;
}) {
  // Pull study config
  const { studyId } = useParams<StudyIdParam>();
  if (!studyId || !globalConfig.configsList.find((c) => sanitizeStringForUrl(c))) {
    throw new Error('Study id invalid');
  }
  const [activeConfig, setActiveConfig] = useState<Nullable<StudyConfig>>(null);
  useEffect(() => {
    const configKey = globalConfig.configsList.find(
      (c) => sanitizeStringForUrl(c) === studyId,
    );

    if (configKey) {
      const configJSON = globalConfig.configs[configKey];
      fetchStudyConfig(`${configJSON.path}`, configKey).then((config) => {
        setActiveConfig(config);
      });
    }
  }, [globalConfig, studyId]);

  const [store, setStore] = useState<Nullable<StudyStore>>(null);
  const { storageEngine } = useStorageEngine();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    async function initializeUserStoreRouting() {
      // Check that we have a storage engine and active config (studyId is set for config, but typescript complains)
      if (!storageEngine || !activeConfig || !studyId) return;

      // Make sure that we have a study database and that the study database has a sequence array
      await storageEngine.initializeStudyDb(studyId, activeConfig);
      const sequenceArray = await storageEngine.getSequenceArray();
      if (!sequenceArray) {
        await storageEngine.setSequenceArray(await generateSequenceArray(activeConfig));
      }

      // Get or generate participant session
      const urlParticipantId = activeConfig.uiConfig.urlParticipantIdParam ? searchParams.get(activeConfig.uiConfig.urlParticipantIdParam) || undefined : undefined;
      const searchParamsObject = Object.fromEntries(searchParams.entries());
      const participantSession = await storageEngine.initializeParticipantSession(searchParamsObject, activeConfig, urlParticipantId);

      // Initialize the redux stores
      const _store = await studyStoreCreator(studyId, activeConfig, participantSession.sequence, participantSession.answers);
      setStore(_store);
    }
    initializeUserStoreRouting();
  }, [storageEngine, activeConfig, studyId, searchParams]);

  return !store || !storageEngine
    ? (
      <Box style={{ height: '100vh' }}>
        <Center style={{ height: '100%' }}>
          <Loader style={{ height: '100%' }} size={60} />
        </Center>
      </Box>
    ) : (
      <StudyStoreContext.Provider value={store}>
        <Provider store={store.store}>
          <GenerateStudiesRoutes studyId={studyId} config={activeConfig} storage={storageEngine} />
        </Provider>
      </StudyStoreContext.Provider>
    );
}
