/* eslint-disable @typescript-eslint/no-explicit-any */

import { Loader, Stack } from '@mantine/core';
import * as d3 from 'd3';
import { useMemo } from 'react';
import { useStorageEngine } from '../../../store/storageEngineHooks';
import { useAsync } from '../../../store/hooks/useAsync';
import { StorageEngine } from '../../../storage/engines/StorageEngine';
import { AnalysisSingleParticipant } from './AnalysisSingleParticipant';

function getParticipantData(storageEngine: StorageEngine | undefined) {
  if (storageEngine) {
    return storageEngine.getAllParticipantsData();
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AnalysisHome() {
  const { storageEngine } = useStorageEngine();

  const { value: allPartsData, status } = useAsync(getParticipantData, [storageEngine]);

  const maxDuration = useMemo(() => {
    if (status !== 'success' || !allPartsData) {
      return undefined;
    }

    return d3.max(allPartsData?.map((participant) => {
      if (!participant.answers || Object.entries(participant.answers).length === 0) {
        return 0;
      }

      const answersSorted = Object.values(participant.answers).sort((a, b) => a.startTime - b.startTime);

      return new Date(answersSorted[answersSorted.length - 1].endTime - answersSorted[0].startTime).getTime();
    }));
  }, [allPartsData, status]);

  return status === 'success' && allPartsData ? (
    <Stack spacing={50} style={{ width: '100%' }}>
      {allPartsData?.map((participant) => <AnalysisSingleParticipant maxDuration={maxDuration} key={participant.participantId} participant={participant} />)}
    </Stack>
  ) : <Loader />;
}
