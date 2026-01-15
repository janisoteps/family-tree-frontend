import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { Person } from '../../types/familyTree';
import './PersonNode.css';

interface PersonNodeData extends Person {
  onNodeClick?: (person: Person) => void;
  onNodeDoubleClick?: (person: Person) => void;
}

export function PersonNode(props: NodeProps) {
  const { data } = props;
  
  if (!data) {
    return null;
  }

  // Type assertion to ensure TypeScript knows data is PersonNodeData
  const nodeData = data as unknown as PersonNodeData;

  const isDeceased = nodeData.death_date !== null;
  const birthYear = nodeData.birth_date ? new Date(nodeData.birth_date).getFullYear() : null;
  const deathYear = nodeData.death_date ? new Date(nodeData.death_date).getFullYear() : null;
  
  const fullName = [
    nodeData.first_name,
    nodeData.last_name,
  ].filter(Boolean).join(' ') || 'Unknown';
  
  const maidenName = nodeData.maiden_name ? ` (${nodeData.maiden_name})` : '';
  
  const getGenderClass = () => {
    if (nodeData.gender === 'male') return 'person-node-male';
    if (nodeData.gender === 'female') return 'person-node-female';
    return 'person-node-other';
  };
  
  const getInitials = () => {
    const first = nodeData.first_name?.[0] || '';
    const last = nodeData.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };
  
  const handleClick = () => {
    if (nodeData.onNodeClick) {
      nodeData.onNodeClick(nodeData);
    }
  };
  
  const handleDoubleClick = () => {
    if (nodeData.onNodeDoubleClick) {
      nodeData.onNodeDoubleClick(nodeData);
    }
  };

  return (
    <div
      className={`person-node ${getGenderClass()} ${isDeceased ? 'person-node-deceased' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Right} id="right-target" />
      
      {isDeceased && <div className="person-node-ribbon" />}
      
      <div className="person-node-photo">
        {nodeData.photo_url ? (
          <img src={nodeData.photo_url} alt={fullName} />
        ) : (
          <div className="person-node-avatar">
            {getInitials()}
          </div>
        )}
      </div>
      
      <div className="person-node-content">
        <div className="person-node-name">
          {fullName}
          {maidenName && <span className="person-node-maiden">{maidenName}</span>}
        </div>
        
        <div className="person-node-dates">
          {birthYear && (
            <>
              {birthYear}
              {deathYear ? ` - ${deathYear}` : ' - present'}
            </>
          )}
        </div>
        
        {nodeData.occupation && (
          <div className="person-node-occupation">{nodeData.occupation}</div>
        )}
      </div>
    </div>
  );
}

