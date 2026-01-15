import { getStraightPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { UnionRow } from '../../types/familyTree';
import './UnionEdge.css';

interface UnionEdgeData extends UnionRow {}

export function UnionEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    markerEnd,
  } = props;

  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Type assertion to ensure TypeScript knows data is UnionEdgeData
  const edgeData = (data as unknown as UnionEdgeData) || null;

  const isOngoing = edgeData?.status === 'ongoing';
  const isEnded = edgeData?.status === 'divorced' || edgeData?.status === 'annulled';
  
  const startYear = edgeData?.startDate 
    ? new Date(edgeData.startDate).getFullYear() 
    : null;

  return (
    <>
      <path
        id={String(id)}
        style={{
          strokeWidth: 2,
          stroke: isOngoing ? '#6366f1' : '#9ca3af',
          strokeDasharray: isEnded ? '5,5' : '0',
        }}
        className="react-flow__edge-path union-edge"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {startYear && (
        <text>
          <textPath
            href={`#${String(id)}`}
            style={{ fontSize: 11, fill: '#6b7280' }}
            startOffset="50%"
            textAnchor="middle"
          >
            {startYear}
          </textPath>
        </text>
      )}
    </>
  );
}

