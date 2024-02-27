import { useMemo } from 'react';
import * as d3 from 'd3';
import { Tooltip } from '@mantine/core';
import { ParticipantData } from '../../../storage/types';
import { SingleTask } from './SingleTask';
import { SingleTaskLabelLines } from './SingleTaskLabelLines';

const margin = {
  left: 5, top: 0, right: 5, bottom: 0,
};

const LABEL_GAP = 25;
const CHARACTER_SIZE = 8;

export function AllTasksTimeline({
  participantData, width, height, setSelectedTask, selectedTask, maxDuration,
} : {participantData: ParticipantData, width: number, height: number, setSelectedTask: (task: string | null) => void, selectedTask: string | null, maxDuration?: number}) {
  const xScale = useMemo(() => {
    console.log(participantData.answers);
    const allStartTimes = Object.values(participantData.answers || {}).map((answer) => [answer.startTime, answer.endTime]).flat();

    const extent = d3.extent(allStartTimes) as [number, number];

    const scale = d3.scaleLinear([margin.left, width + margin.left + margin.right]).domain(maxDuration ? [extent[0], extent[0] + maxDuration] : extent).clamp(true);

    return scale;
  }, [maxDuration, participantData.answers, width]);

  const tasks = useMemo(() => {
    let currentHeight = 0;

    const sortedEntries = Object.entries(participantData.answers || {}).sort((a, b) => a[1].startTime - b[1].startTime);

    return sortedEntries.map((entry, i) => {
      const [name, answer] = entry;

      const prev = i > 0 ? sortedEntries[i - currentHeight - 1] : null;

      if (prev && prev[0].length * CHARACTER_SIZE + xScale(prev[1].startTime) > xScale(answer.startTime)) {
        currentHeight += 1;
      } else {
        currentHeight = 0;
      }

      return (
        <SingleTask labelHeight={currentHeight * LABEL_GAP} key={name} isSelected={selectedTask === name} setSelectedTask={setSelectedTask} answer={answer} height={height} name={name} xScale={xScale} />
      );
    });
  }, [height, participantData.answers, selectedTask, setSelectedTask, xScale]);

  const lines = useMemo(() => {
    let currentHeight = 0;

    const sortedEntries = Object.entries(participantData.answers || {}).sort((a, b) => a[1].startTime - b[1].startTime);

    return sortedEntries.map((entry, i) => {
      const [name, answer] = entry;

      const prev = i > 0 ? sortedEntries[i - currentHeight - 1] : null;

      if (prev && prev[0].length * CHARACTER_SIZE + xScale(prev[1].startTime) > xScale(answer.startTime)) {
        currentHeight += 1;
      } else {
        currentHeight = 0;
      }

      return (
        <SingleTaskLabelLines labelHeight={currentHeight * LABEL_GAP} key={name} answer={answer} height={height} xScale={xScale} />
      );
    });
  }, [height, participantData.answers, selectedTask, setSelectedTask, xScale]);

  const browsedAway = useMemo(() => {
    const sortedEntries = Object.entries(participantData.answers || {}).sort((a, b) => a[1].startTime - b[1].startTime);

    return sortedEntries.map((entry) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [name, answer] = entry;

      const browsedAwayList: [number, number][] = [];
      let currentBrowsedAway: [number, number] = [-1, -1];
      let currentState: 'visible' | 'hidden' = 'visible';
      if (answer.windowEvents) {
        for (let i = 0; i < answer.windowEvents.length; i += 1) {
          if (answer.windowEvents[i][1] === 'visibility') {
            if (answer.windowEvents[i][2] === 'hidden' && currentState === 'visible') {
              currentBrowsedAway = [answer.windowEvents[i][0], -1];
              currentState = 'hidden';
            } else if (answer.windowEvents[i][2] === 'visible' && currentState === 'hidden') {
              currentBrowsedAway[1] = answer.windowEvents[i][0];
              browsedAwayList.push(currentBrowsedAway);
              currentBrowsedAway = [-1, -1];
              currentState = 'visible';
            }
          }
        }
      }

      return (
        browsedAwayList.map((browse, i) => <Tooltip withinPortal key={i} label="Browsed away"><rect x={xScale(browse[0])} width={xScale(browse[1]) - xScale(browse[0])} y={height - 5} height={10} /></Tooltip>)
      );
    });
  }, [height, participantData, xScale]);

  return (
    <svg style={{ width, height, overflow: 'visible' }}>
      {lines}
      {tasks}
      {browsedAway}
    </svg>
  );
}
