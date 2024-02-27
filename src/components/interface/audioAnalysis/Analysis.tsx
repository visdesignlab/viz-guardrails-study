/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box, Button, Center, Divider, Group, Loader, Menu, Popover, ScrollArea, Stack, Text, TextInput,
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
import { AnalysisPopout } from './AnalysisPopout';

// import WaveSurfer from 'wavesurfer.js';

export interface TranscribedAudioSnippet {
    alternatives: {confidence: number, transcript: string}[]
    languageCode: string;
    resultEndTime: string;
}
export interface TranscribedAudio {
    results: TranscribedAudioSnippet[]
}

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

function copyStyles(sourceDoc: any, targetDoc: any) {
  console.log(sourceDoc.stylesheet);
  console.log(sourceDoc.head.children);
  Array.from(sourceDoc.head.children).forEach((styleSheet: any) => {
    // if (styleSheet.cssRules) { // for <style> elements
    console.log('we did ti');
    const newStyleEl = sourceDoc.createElement('style');

    Array.from(styleSheet.cssRules).forEach((cssRule: any) => {
      console.log(cssRule);
      // write the text of each rule into the body of the style element
      newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
    });

    targetDoc.head.appendChild(newStyleEl);
    // } else if (styleSheet.href) { // for <link> elements loading CSS from a URL
    //   const newLinkEl = sourceDoc.createElement('link');

    //   newLinkEl.rel = 'stylesheet';
    //   newLinkEl.href = styleSheet.href;
    //   targetDoc.head.appendChild(newLinkEl);
    // }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Analysis({ setProvState } : {setProvState: (state: any) => void}) {
  const { trrackId, trialName, studyId } = useParams();

  const navigate = useNavigate();

  const location = useLocation();
  const { storageEngine } = useStorageEngine();

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<string | null>(null);

  const [transcription, setTranscription] = useState<TranscribedAudio | null>(null);
  const { value: participant, status } = useAsync(getParticipantData, [trrackId, storageEngine]);

  const popoutRef = useRef<Window>();

  useEffect(() => {
    if (selectedTask) {
      const splitArr = location.pathname.split('/');

      setCurrentNode(null);
      splitArr[splitArr.length - 1] = selectedTask;
      navigate(splitArr.join('/'));
    }
  }, [location.pathname, navigate, selectedTask]);

  // Create an instance of trrack to ensure getState works, incase the saved state is not a full state node.
  useEffect(() => {
    if (currentNode && selectedTask && participant) {
      const reg = Registry.create();

      const trrack = initializeTrrack({ registry: reg, initialState: {} });

      if (participant.answers[selectedTask].provenanceGraph) {
        trrack.importObject(deepCopy(participant.answers[selectedTask].provenanceGraph!));

        const state = trrack.getState(trrack.graph.backend.nodes[currentNode]);

        setProvState(state);
      }
    } else {
      setProvState(null);
    }
  }, [currentNode, participant, selectedTask, setProvState]);

  const containerEl = useMemo(() => document.createElement('div'), []);

  useEffect(() => {
    if (studyId && trialName && trrackId) {
      storageEngine?.getTranscription(trrackId).then((data) => {
        setTranscription(JSON.parse(data));
      });
    }
  }, [storageEngine, studyId, trialName, trrackId]);

  useEffect(() => {
    const externalWindow = window.open(
      'about:blank',
      'newWin',
      `width=2000,height=400,left=${window.screen.availWidth / 3
                - 200},top=${window.screen.availHeight / 3 - 150}`,
    )!;

    externalWindow.document.body.appendChild(containerEl);
    externalWindow.document.head.innerHTML = window.document.head.innerHTML;

    popoutRef.current = externalWindow;
    return () => {
      externalWindow.close();
    };
  }, []);

  const updateCss = useCallback(() => {
    if (popoutRef.current) {
      popoutRef.current.document.head.innerHTML = window.document.head.innerHTML;
    }
  }, []);

  console.log(popoutRef.current);

  return (
    <div>

      {/* {children} */}
      {createPortal(<div><AnalysisPopout popoutWindow={popoutRef.current || document} cssUpdate={updateCss} /></div>, containerEl)}
    </div>
  );
}
