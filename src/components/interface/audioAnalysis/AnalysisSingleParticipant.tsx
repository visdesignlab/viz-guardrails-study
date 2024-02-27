/* eslint-disable @typescript-eslint/no-explicit-any */

import { useNavigate } from 'react-router-dom';

import {
  Anchor, Center, Group, Stack, Text,
} from '@mantine/core';
import { useMemo } from 'react';
import { useResizeObserver } from '@mantine/hooks';
import { AllTasksTimeline } from './AllTasksTimeline';
import { ParticipantData } from '../../../storage/types';

function humanReadableDuration(msDuration: number): string {
  const h = Math.floor(msDuration / 1000 / 60 / 60);
  const m = Math.floor((msDuration / 1000 / 60 / 60 - h) * 60);
  const s = Math.floor(((msDuration / 1000 / 60 / 60 - h) * 60 - m) * 60);

  // To get time format 00:00:00
  const seconds: string = s < 10 ? `0${s}` : `${s}`;
  const minutes: string = m < 10 ? `0${m}` : `${m}`;
  const hours: string = h < 10 ? `0${h}` : `${h}`;

  return `${hours}h ${minutes}m ${seconds}s`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AnalysisSingleParticipant({ participant, maxDuration } : {participant: ParticipantData, maxDuration?: number | undefined}) {
  const navigate = useNavigate();

  const duration = useMemo(() => {
    if (!participant.answers || Object.entries(participant.answers).length === 0) {
      return 0;
    }

    const answersSorted = Object.values(participant.answers).sort((a, b) => a.startTime - b.startTime);

    return new Date(answersSorted[answersSorted.length - 1].endTime - answersSorted[0].startTime).getTime();
  }, [participant]);

  const [ref, { width }] = useResizeObserver();

  return (
    <Center>
      <Stack spacing={25} ref={ref} style={{ width: '75%' }} key={participant.participantId}>
        <Group position="apart">
          <Anchor size={25} onClick={() => navigate(`${participant.participantId}/${participant.sequence[0]}`)}>{participant.participantId}</Anchor>
          {' '}
          <Text size="xl">{`${humanReadableDuration(duration)}`}</Text>
          {' '}
        </Group>
        <AllTasksTimeline maxDuration={maxDuration} selectedTask={null} setSelectedTask={() => null} participantData={participant} width={width} height={250} />
      </Stack>
    </Center>
  );
}
