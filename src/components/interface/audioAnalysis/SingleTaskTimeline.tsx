import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import * as d3 from 'd3';
import { Stack } from '@mantine/core';
import { ParticipantData } from '../../../storage/types';
import { SingleTaskProvenance } from './SingleTaskProvenance';

const margin = {
  left: 5, top: 0, right: 5, bottom: 0,
};
export function SingleTaskTimeline({
  participantData, width, height, selectedTask, currentNode, setCurrentNode, playTime, setPlayTime, isPlaying, setIsPlaying, setSelectedTask,
} : {participantData: ParticipantData, width: number, height: number, selectedTask?: string | null, currentNode: string | null, setCurrentNode: (node: string) => void, isPlaying: boolean, setIsPlaying: (b: boolean) => void, playTime: number, setPlayTime: (n: number, p: number) => void, setSelectedTask: (s: string) => void}) {
  const [taskIndex, setTaskIndex] = useState<number>(0);
  const [provNodeIndex, setProvNodeIndex] = useState<number>(0);

  const xScale = useMemo(() => {
    const allStartTimes = selectedTask ? [participantData.answers[selectedTask].startTime, participantData.answers[selectedTask].endTime] : Object.values(participantData.answers).map((answer) => [answer.startTime, answer.endTime]).flat();

    const scale = d3.scaleLinear([margin.left, width + margin.left + margin.right]).domain(d3.extent(allStartTimes) as [number, number]);

    return scale;
  }, [participantData.answers, selectedTask, width]);

  const { allTaskTimes } = useMemo(() => {
    const _allTaskTimes = Object.entries(participantData.answers).map((answer) => ({ time: answer[1].startTime, name: answer[0], nodes: answer[1].provenanceGraph ? Object.entries(answer[1].provenanceGraph?.nodes).map((entry) => ({ time: entry[1].createdOn, name: entry[0] })).sort((a, b) => a.time - b.time) : [] })).flat().sort((a, b) => a.time - b.time);
    return { allTaskTimes: _allTaskTimes };
  }, [participantData.answers]);

  const wholeXScale = useMemo(() => {
    const allStartTimes = Object.values(participantData.answers).map((answer) => [answer.startTime, answer.endTime]).flat();

    const scale = d3.scaleLinear([margin.left, width + margin.left + margin.right]).domain(d3.extent(allStartTimes) as [number, number]);

    return scale;
  }, [participantData.answers, width]);

  const totalLength = useMemo(() => wholeXScale.domain()[1] - wholeXScale.domain()[0], [wholeXScale]);

  useEffect(() => {
    if (isPlaying && playTime <= xScale.domain()[1]) {
      if (playTime + wholeXScale.domain()[0] > allTaskTimes[taskIndex + 1].time) {
        setTaskIndex(taskIndex + 1);
        setSelectedTask(allTaskTimes[taskIndex + 1].name);
        setProvNodeIndex(0);
      } else if (playTime + wholeXScale.domain()[0] > allTaskTimes[taskIndex]?.nodes[provNodeIndex + 1]?.time) {
        setProvNodeIndex(provNodeIndex + 1);
        setCurrentNode(allTaskTimes[taskIndex].nodes[provNodeIndex + 1].name);
      }
    }
  }, [allTaskTimes, isPlaying, playTime, provNodeIndex, setCurrentNode, setSelectedTask, taskIndex, wholeXScale, xScale]);

  useEffect(() => {
    setPlayTime(xScale.domain()[0] - wholeXScale.domain()[0], (xScale.domain()[0] - wholeXScale.domain()[0]) / totalLength);
  }, [setPlayTime, totalLength, wholeXScale, xScale]);

  useEffect(() => {
    setTaskIndex(allTaskTimes.indexOf(allTaskTimes.find((task) => task.name === selectedTask)!));
  }, [selectedTask, allTaskTimes]);

  const currentNodeCallback = useCallback((node: string) => {
    setPlayTime(allTaskTimes[taskIndex].nodes.find((n) => n.name === node)!.time, (allTaskTimes[taskIndex].nodes.find((n) => n.name === node)!.time - wholeXScale.domain()[0]) / totalLength);
    setProvNodeIndex(allTaskTimes[taskIndex].nodes.indexOf(allTaskTimes[taskIndex].nodes.find((n) => n.name === node)!));

    setIsPlaying(false);

    setCurrentNode(node);
  }, [allTaskTimes, setPlayTime, taskIndex, wholeXScale, totalLength, setIsPlaying, setCurrentNode]);

  return (
    <Stack>
      <svg style={{ width, height }}>
        <line stroke="black" strokeWidth={1} x1={margin.left} x2={width + margin.left} y1={height / 2} y2={height / 2} />
        {/* {selectedTask ? <line stroke="cornflowerblue" strokeWidth={1} opacity={1} x1={margin.left} x2={wholeXScale(participantData.answers[selectedTask].startTime)} y1={height / 2} y2={0}></line> : null } */}
        {/* {selectedTask ? <AnimatedPath d={`M 0,${height/2} C 0,0 ${wholeXScale(participantData.answers[selectedTask].startTime)},${height/4} ${wholeXScale(participantData.answers[selectedTask].startTime)},0`}></AnimatedPath> : null }
            {selectedTask ? <AnimatedPath d={`M ${width},${height/2} C ${width},0 ${wholeXScale(participantData.answers[selectedTask].endTime)},${height/4} ${wholeXScale(participantData.answers[selectedTask].endTime)},0`}></AnimatedPath> : null } */}

        {/* {selectedTask ? <line stroke="cornflowerblue" strokeWidth={1} opacity={1} x1={margin.left + width} x2={wholeXScale(participantData.answers[selectedTask].endTime)} y1={height / 2} y2={0}></line> : null } */}

        {Object.entries(participantData.answers).map((entry) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [name, answer] = entry;

          return <SingleTaskProvenance key={name} answer={answer} height={height} currentNode={currentNode} setCurrentNode={currentNodeCallback} xScale={xScale} />;
        })}

      </svg>
    </Stack>
  );
}
