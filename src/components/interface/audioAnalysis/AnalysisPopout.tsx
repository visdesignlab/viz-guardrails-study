/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box, Button, Center, Divider, Group, Highlight, Loader, Menu, Popover, ScrollArea, Stack, Text, TextInput, Tooltip,
} from '@mantine/core';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useResizeObserver, useTextSelection } from '@mantine/hooks';
import { Registry, initializeTrrack } from '@trrack/core';
import { WaveForm, useWavesurfer } from 'wavesurfer-react';
import WaveSurferContext from 'wavesurfer-react/dist/contexts/WaveSurferContext';
import { createPortal } from 'react-dom';
import * as icons from '@tabler/icons-react';
import { useStorageEngine } from '../../../store/storageEngineHooks';
import { useAsync } from '../../../store/hooks/useAsync';
import { StorageEngine } from '../../../storage/engines/StorageEngine';
import { AllTasksTimeline } from './AllTasksTimeline';
import { SingleTaskTimeline } from './SingleTaskTimeline';

import { deepCopy } from '../../../utils/deepCopy';
import { useEvent } from '../../../store/hooks/useEvent';
import { AudioTag } from '../../../store/types';
import { TranscribedAudio } from './Analysis';
import { useTextHighlight } from '../../../store/hooks/useTextHighlight';

function getParticipantData(trrackId: string | undefined, storageEngine: StorageEngine | undefined) {
  if (storageEngine) {
    return storageEngine.getParticipantData(trrackId);
  }

  return null;
}

function getAllParticipantsData(storageEngine: StorageEngine | undefined) {
  if (storageEngine) {
    return storageEngine.getAllParticipantsData();
  }

  return null;
}

function getAudioTags(storageEngine: StorageEngine | undefined) {
  if (storageEngine) {
    return storageEngine.getAudioTags();
  }

  return null;
}

function getTextTags(participantId: string, storageEngine: StorageEngine | undefined) {
  if (storageEngine) {
    return storageEngine.getTextTags(participantId);
  }

  return null;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AnalysisPopout({ cssUpdate, popoutWindow } : {cssUpdate: () => void, popoutWindow: Window}) {
  const { trrackId, trialName, studyId } = useParams();

  const { storageEngine } = useStorageEngine();

  const [ref, { width }] = useResizeObserver();

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<string | null>(null);

  const [transcription, setTranscription] = useState<TranscribedAudio | null>(null);
  const [currentShownTranscription, setCurrentShownTranscription] = useState<number | null>(null);
  const { value: participant, status } = useAsync(getParticipantData, [trrackId, storageEngine]);

  const { value: allParts, status: allPartsStatus } = useAsync(getAllParticipantsData, [storageEngine]);

  const { value: audioTags, status: audioTagsStatus, execute: refetchTags } = useAsync(getAudioTags, [storageEngine]);
  const { value: textTags, status: textTagsStatus, execute: refetchTextTags } = useAsync(getTextTags, [trrackId || '', storageEngine]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playTime, setPlayTime] = useState<number>(0);

  const [addedTag, setAddedTag] = useState<AudioTag>({ name: '', icon: '' });

  const highlightedAudio = useTextHighlight(popoutWindow);
  const waveSurferDiv = useRef(null);

  const [hasHighlight, setHasHighlight] = useState<boolean>(false);

  cssUpdate();

  const handleWSMount = useCallback(
    (waveSurfer: any) => {
      if (waveSurfer) {
        storageEngine?.getAudio(trrackId!).then((url) => {
          if (waveSurfer) {
            waveSurfer.load(url);
            setCurrentShownTranscription(2);
          }
        });
      }
    },
    [storageEngine, trrackId],
  );

  const wavesurfer = useWavesurfer({ container: waveSurferDiv.current!, plugins: [], onMount: handleWSMount });

  const _setPlayTime = useCallback((n: number, percent: number) => {
    setPlayTime(n);

    if (wavesurfer && percent) {
      wavesurfer?.seekTo(percent);
    }
  }, [wavesurfer]);

  const _setIsPlaying = useCallback((b: boolean) => {
    setIsPlaying(b);

    if (wavesurfer) {
      if (b) {
        wavesurfer.play();
      } else {
        wavesurfer.pause();
      }
    }
  }, [wavesurfer]);

  useEffect(() => {
    if (studyId && trialName && trrackId) {
      storageEngine?.getTranscription(trrackId).then((data) => {
        setTranscription(JSON.parse(data));
      });
    }
  }, [storageEngine, studyId, trialName, trrackId]);

  //   console.log(transcription);

  //   console.log(trrackId);

  //   console.log(highlightedAudio?.toString());

  console.log(textTags?.map((tag) => tag.text));

  console.log(audioTags);

  console.log(highlightedAudio);

  console.log(transcription, currentShownTranscription);

  return (
    <Group noWrap spacing={25}>
      <Stack ref={ref} style={{ width: '100%' }} spacing={25}>
        {status === 'success' && participant ? <AllTasksTimeline selectedTask={selectedTask} setSelectedTask={setSelectedTask} participantData={participant} width={width} height={200} /> : <Center style={{ height: '275px' }}><Loader /></Center>}
        {status === 'success' && participant ? <SingleTaskTimeline setSelectedTask={setSelectedTask} playTime={playTime} setPlayTime={_setPlayTime} isPlaying={isPlaying} setIsPlaying={_setIsPlaying} currentNode={currentNode} setCurrentNode={setCurrentNode} selectedTask={selectedTask} participantData={participant} width={width} height={50} /> : null}
        <Box ref={waveSurferDiv} style={{ width: '100%' }}>

          <WaveSurferContext.Provider value={wavesurfer}>
            <WaveForm id="waveform" />
          </WaveSurferContext.Provider>
        </Box>
        <Group style={{ width: '100%', height: '100px' }} align="center" position="center">
          <Center>
            <Text color="dimmed" size={20} style={{ width: '100%' }}>
              {transcription && currentShownTranscription !== null ? transcription.results[currentShownTranscription].alternatives[0].transcript : ''}
            </Text>
          </Center>
        </Group>
        <Group>
          <Button onClick={() => _setIsPlaying(true)}>Play</Button>
          <Button onClick={() => _setIsPlaying(false)}>Pause</Button>
          <Text>{new Date(playTime).toLocaleString()}</Text>
        </Group>

        <Menu width={250} position="bottom" shadow="md" trigger="hover">
          <Menu.Target>
            <Tooltip withinPortal label="example">
              <Highlight
                highlight={textTags?.map((tag) => tag.text) || []}
                highlightStyles={{
                  backgroundImage:
            'cornflowerblue',
                  fontWeight: 700,
                  backgroundColor: 'cornflowerblue',
                  color: 'cornflowerblue',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {transcription?.results.map((res) => res.alternatives[0].transcript).join(' ') || ''}
              </Highlight>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown>
            {audioTags ? audioTags.map((tag) => (
              <Menu.Item
                key={tag.name}
                onClick={() => {
                  storageEngine?.saveTextTags(trrackId, [...(textTags || []), { tag, text: highlightedAudio?.toString() }]).then(() => refetchTextTags(trrackId || '', storageEngine));
                }}
              >
                <Group>
                  {icons[`Icon${tag.icon}`]?.render({ color: 'gray' })}
                  <Text key={tag.name}>
                    {tag.name}
                  </Text>
                </Group>
              </Menu.Item>
            )) : null}
          </Menu.Dropdown>
        </Menu>
      </Stack>
      {/* <Divider orientation="vertical" ml={25} />
        <Stack style={{ width: '300px', height: '100%' }}>
          <ScrollArea h={380}>
            <Stack>
              {allPartsStatus === 'success' && allParts ? allParts.map((part) => (
                <Text
                  onClick={() => {
                    const splitArr = location.pathname.split('/');
                    splitArr[splitArr.length - 2] = part.participantId;
                    navigate(splitArr.join('/'));
                  }}
                  color={trrackId === part.participantId ? 'cornflowerblue' : 'dimmed'}
                  key={part.participantId}
                  style={{ cursor: 'pointer' }}
                >
                  {part.participantId}
                </Text>
              )) : null}
            </Stack>
          </ScrollArea>
        </Stack> */}

      <Divider orientation="vertical" ml={25} />
      <Stack style={{ width: '300px', height: '100%' }}>
        <ScrollArea h={380}>
          <Stack>
            <Popover width={200} trapFocus position="bottom" withArrow shadow="md">
              <Popover.Target>
                <Button>Create new tag</Button>
              </Popover.Target>
              <Popover.Dropdown>
                <TextInput value={addedTag.name} onChange={(event) => setAddedTag({ ...addedTag, name: event.currentTarget.value })} label="Name" placeholder="Name" size="xs" />
                <TextInput value={addedTag.icon} onChange={(event) => setAddedTag({ ...addedTag, icon: event.currentTarget.value })} label="Icon" placeholder="icon" size="xs" mt="xs" />
                <Button onClick={() => storageEngine?.saveAudioTags([...(audioTags || []), addedTag]).then(() => refetchTags(storageEngine))}>Create Tag</Button>
              </Popover.Dropdown>
            </Popover>
            {audioTags ? audioTags.map((tag) => (
              <Group key={tag.name}>
                {icons[`Icon${tag.icon}`]?.render({ color: 'gray' })}
                <Text key={tag.name}>
                  {tag.name}
                </Text>
              </Group>
            )) : null}
          </Stack>
        </ScrollArea>
      </Stack>
    </Group>
  );
}
