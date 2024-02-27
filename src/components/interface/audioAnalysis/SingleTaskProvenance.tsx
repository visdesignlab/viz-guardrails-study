/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';

import { StoredAnswer } from '../../../store/types';
import { AnimatedCircle } from './AnimatedCircle';

export function SingleTaskProvenance({
  xScale, answer, height, currentNode, setCurrentNode,
} : {answer: StoredAnswer, height: number, xScale: d3.ScaleLinear<number, number>, currentNode: string | null, setCurrentNode: (node: string) => void}) {
  return (
    <g style={{ cursor: 'pointer' }}>
      {answer.provenanceGraph ? Object.entries(answer.provenanceGraph.nodes).map((entry) => {
        const [nodeId, node] = entry;

        return <g key={nodeId} onClick={() => setCurrentNode(nodeId)}><AnimatedCircle color={nodeId === currentNode ? 'cornflowerblue' : 'lightgray'} cx={xScale(node.createdOn)} cy={height / 2} r={5} /></g>;
      }) : null}
      {currentNode && answer.provenanceGraph && answer.provenanceGraph.nodes[currentNode] ? <circle fill="cornflowerblue" cx={xScale(answer.provenanceGraph.nodes[currentNode].createdOn)} cy={height / 2} r={5} /> : null}
    </g>
  );
}
