import { getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { ParentOfRow } from '../../types/familyTree';
import './ParentEdge.css';

interface ParentEdgeData extends ParentOfRow {}

export function ParentEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
  } = props;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Type assertion to ensure TypeScript knows data is ParentEdgeData
  const edgeData = (data as unknown as ParentEdgeData) || null;

  const label = edgeData?.parent_type && edgeData.parent_type !== 'biological' 
    ? edgeData.parent_type 
    : null;

  return (
    <>
      <path
        id={String(id)}
        style={{
          strokeWidth: 2,
          stroke: '#9ca3af',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {label && (
        <text>
          <textPath
            href={`#${String(id)}`}
            style={{ fontSize: 12, fill: '#6b7280' }}
            startOffset="50%"
            textAnchor="middle"
          >
            {label}
          </textPath>
        </text>
      )}
    </>
  );
}

