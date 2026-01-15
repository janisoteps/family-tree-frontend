import { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Node, Edge, NodeTypes, EdgeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PersonNode } from './PersonNode';
import { ParentEdge } from './ParentEdge';
import { UnionEdge } from './UnionEdge';
import { calculateNodePositions } from './useLayoutedGraph';
import { Modal } from '../ui/Modal';
import { Sidebar } from '../ui/Sidebar';
import { PersonForm } from '../forms/PersonForm';
import { UnionForm } from '../forms/UnionForm';
import { ParentOfForm } from '../forms/ParentOfForm';
import {
  getFamilyTreeGraph,
  createPerson,
  updatePerson,
  createUnion,
  createParentOf,
  deletePerson,
  updatePersonPosition,
} from '../../services/familyTreeService';
import type {
  FamilyTreeGraph,
  Person,
  CreatePersonInput,
  CreateUnionInput,
  CreateParentOfInput,
  UnionRow,
} from '../../types/familyTree';
import './FamilyTree.css';

const nodeTypes: NodeTypes = {
  person: PersonNode,
};

const edgeTypes: EdgeTypes = {
  parent: ParentEdge,
  union: UnionEdge,
};

function transformToReactFlow(graph: FamilyTreeGraph) {
  const nodes: Node[] = graph.nodes.map((person) => ({
    id: person.id,
    type: 'person',
    data: person as unknown as Record<string, unknown>,
    position: { x: 0, y: 0 },
  }));

  const edges: Edge[] = [
    ...graph.parentOf.map((rel) => ({
      id: `parent-${rel.parent_id}-${rel.child_id}`,
      source: rel.parent_id,
      target: rel.child_id,
      type: 'parent',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      data: rel as unknown as Record<string, unknown>,
      markerEnd: {
        type: 'arrowclosed' as const,
        color: '#9ca3af',
        width: 30,
        height: 30,
      },
    })),
    ...graph.unions.map((rel) => ({
      id: `union-${rel.person1_id}-${rel.person2_id}`,
      source: rel.person1_id,
      target: rel.person2_id,
      type: 'union',
      sourceHandle: 'right',
      targetHandle: 'left',
      data: rel as unknown as Record<string, unknown>,
    })),
  ];

  return { nodes, edges };
}

function FamilyTreeInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [graphData, setGraphData] = useState<FamilyTreeGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Person | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<UnionRow | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showUnionModal, setShowUnionModal] = useState(false);
  const [showParentOfModal, setShowParentOfModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [preSelectedParent, setPreSelectedParent] = useState<string | undefined>();
  const [preSelectedChild, setPreSelectedChild] = useState<string | undefined>();
  const [preSelectedPerson1, setPreSelectedPerson1] = useState<string | undefined>();
  const [preSelectedPerson2, setPreSelectedPerson2] = useState<string | undefined>();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    personId: string;
  } | null>(null);

  const { fitView } = useReactFlow();

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const graph = await getFamilyTreeGraph();
      setGraphData(graph);
      const { nodes: rfNodes, edges: rfEdges } = transformToReactFlow(graph);
      // Calculate positions (uses stored positions or Dagre fallback)
      const { nodes: layoutedNodes, edges: layoutedEdges } = calculateNodePositions(rfNodes, rfEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family tree');
      console.error('Error loading graph:', err);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges, fitView]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const handleNodeClick = useCallback((person: Person) => {
    setSelectedNode(person);
    setSelectedEdge(null);
    setContextMenu(null);
  }, []);

  const handleNodeDoubleClick = useCallback((person: Person) => {
    setEditingPerson(person);
    setShowPersonModal(true);
  }, []);

  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    if (edge.type === 'union' && edge.data) {
      setSelectedEdge(edge.data as unknown as UnionRow);
      setSelectedNode(null);
    }
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setContextMenu(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        personId: node.id,
      });
    },
    []
  );

  const handleNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      try {
        await updatePersonPosition(node.id, node.position.x, node.position.y);
      } catch (err) {
        console.error('Failed to save node position:', err);
        // Position will be saved next time - no need to show error to user
      }
    },
    []
  );

  const handleCreatePerson = async (data: CreatePersonInput) => {
    if (editingPerson) {
      // Update existing person
      await updatePerson(editingPerson.id, data);
    } else {
      // Create new person
      await createPerson(data);
    }
    setShowPersonModal(false);
    setEditingPerson(null);
    await loadGraph();
  };

  const handleCreateUnion = async (data: CreateUnionInput) => {
    await createUnion(data);
    setShowUnionModal(false);
    setPreSelectedPerson1(undefined);
    setPreSelectedPerson2(undefined);
    await loadGraph();
  };

  const handleCreateParentOf = async (data: CreateParentOfInput) => {
    await createParentOf(data);
    setShowParentOfModal(false);
    setPreSelectedParent(undefined);
    setPreSelectedChild(undefined);
    await loadGraph();
  };

  const handleDeletePerson = async () => {
    if (!personToDelete) return;
    
    try {
      await deletePerson(personToDelete.id);
      setShowDeleteConfirmModal(false);
      setPersonToDelete(null);
      setSelectedNode(null);
      await loadGraph();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete person');
      console.error('Error deleting person:', err);
    }
  };

  const handleContextMenuAction = (action: string, personId: string) => {
    setContextMenu(null);
    if (action === 'add-child') {
      setPreSelectedParent(personId);
      setShowParentOfModal(true);
    } else if (action === 'add-spouse') {
      setPreSelectedPerson1(personId);
      setShowUnionModal(true);
    } else if (action === 'add-parent') {
      setPreSelectedChild(personId);
      setShowParentOfModal(true);
    }
  };

  // Get relationships for a person
  const getPersonRelationships = useCallback((personId: string) => {
    if (!graphData) return { parents: [], children: [], spouses: [] };

    const parents = graphData.parentOf
      .filter(rel => rel.child_id === personId)
      .map(rel => {
        const parent = graphData.nodes.find(p => p.id === rel.parent_id);
        return { person: parent, type: rel.parent_type };
      })
      .filter(item => item.person !== undefined) as Array<{ person: Person; type: string | null }>;

    const children = graphData.parentOf
      .filter(rel => rel.parent_id === personId)
      .map(rel => {
        const child = graphData.nodes.find(p => p.id === rel.child_id);
        return { person: child, type: rel.parent_type };
      })
      .filter(item => item.person !== undefined) as Array<{ person: Person; type: string | null }>;

    const spouses = graphData.unions
      .filter(rel => rel.person1_id === personId || rel.person2_id === personId)
      .map(rel => {
        const spouseId = rel.person1_id === personId ? rel.person2_id : rel.person1_id;
        const spouse = graphData.nodes.find(p => p.id === spouseId);
        return { person: spouse, union: rel };
      })
      .filter(item => item.person !== undefined) as Array<{ person: Person; union: UnionRow }>;

    return { parents, children, spouses };
  }, [graphData]);

  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onNodeClick: handleNodeClick,
      onNodeDoubleClick: handleNodeDoubleClick,
    },
  }));

  if (loading) {
    return (
      <div className="family-tree-loading">
        <div>Loading family tree...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="family-tree-error">
        <div>Error: {error}</div>
        <button onClick={loadGraph}>Retry</button>
      </div>
    );
  }

  return (
    <div className="family-tree-container">
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_event, node) => handleNodeClick(node.data as unknown as Person)}
        onNodeDoubleClick={(_event, node) => handleNodeDoubleClick(node.data as unknown as Person)}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDragStop={handleNodeDragStop}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        nodesDraggable={true}
      >
        <Background gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const personData = node.data as unknown as Person;
            return personData.gender === 'male' ? '#dbeafe' : '#fce7f3';
          }}
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>

      <div className="fab-container">
        <button
          className="fab fab-primary"
          onClick={() => {
            setEditingPerson(null);
            setShowPersonModal(true);
          }}
          title="Add Person"
        >
          +
        </button>
        <div className="fab-menu">
          <button
            className="fab fab-secondary"
            onClick={() => {
              setPreSelectedPerson1(undefined);
              setPreSelectedPerson2(undefined);
              setShowUnionModal(true);
            }}
            title="Add Union"
          >
            💍
          </button>
          <button
            className="fab fab-secondary"
            onClick={() => {
              setPreSelectedParent(undefined);
              setPreSelectedChild(undefined);
              setShowParentOfModal(true);
            }}
            title="Add Parent-Child Relationship"
          >
            👨‍👩‍👧
          </button>
        </div>
      </div>

      <Modal
        isOpen={showPersonModal}
        onClose={() => {
          setShowPersonModal(false);
          setEditingPerson(null);
        }}
        title={editingPerson ? 'Edit Person' : 'Add Person'}
      >
        <PersonForm
          person={editingPerson}
          onSubmit={handleCreatePerson}
          onCancel={() => {
            setShowPersonModal(false);
            setEditingPerson(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showUnionModal}
        onClose={() => {
          setShowUnionModal(false);
          setPreSelectedPerson1(undefined);
          setPreSelectedPerson2(undefined);
        }}
        title="Add Union"
      >
        <UnionForm
          preSelectedPerson1={preSelectedPerson1}
          preSelectedPerson2={preSelectedPerson2}
          onSubmit={handleCreateUnion}
          onCancel={() => {
            setShowUnionModal(false);
            setPreSelectedPerson1(undefined);
            setPreSelectedPerson2(undefined);
          }}
        />
      </Modal>

      <Modal
        isOpen={showParentOfModal}
        onClose={() => {
          setShowParentOfModal(false);
          setPreSelectedParent(undefined);
          setPreSelectedChild(undefined);
        }}
        title="Add Parent-Child Relationship"
      >
        <ParentOfForm
          preSelectedParent={preSelectedParent}
          preSelectedChild={preSelectedChild}
          onSubmit={handleCreateParentOf}
          onCancel={() => {
            setShowParentOfModal(false);
            setPreSelectedParent(undefined);
            setPreSelectedChild(undefined);
          }}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => {
          setShowDeleteConfirmModal(false);
          setPersonToDelete(null);
        }}
        title="Confirm Delete"
      >
        <div className="delete-confirm-content">
          <p>
            Are you sure you want to delete{' '}
            <strong>
              {personToDelete
                ? [personToDelete.first_name, personToDelete.last_name]
                    .filter(Boolean)
                    .join(' ') || 'this person'
                : 'this person'}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="delete-confirm-actions">
            <button
              className="delete-confirm-button delete-confirm-button-danger"
              onClick={handleDeletePerson}
            >
              Delete
            </button>
            <button
              className="delete-confirm-button delete-confirm-button-cancel"
              onClick={() => {
                setShowDeleteConfirmModal(false);
                setPersonToDelete(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Sidebar
        isOpen={!!selectedNode || !!selectedEdge}
        onClose={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
        title={selectedNode ? 'Person Details' : 'Union Details'}
      >
        {selectedNode && (() => {
          const relationships = graphData ? getPersonRelationships(selectedNode.id) : null;
          const hasRelationships = relationships && (
            relationships.parents.length > 0 || 
            relationships.children.length > 0 || 
            relationships.spouses.length > 0
          );

          return (
            <div className="person-details">
              {selectedNode.photo_url && (
                <img
                  src={selectedNode.photo_url}
                  alt="Person"
                  className="person-details-photo"
                />
              )}
              <h3>
                {[selectedNode.first_name, selectedNode.last_name]
                  .filter(Boolean)
                  .join(' ') || 'Unknown'}
              </h3>
              {selectedNode.maiden_name && (
                <p className="maiden-name">Maiden: {selectedNode.maiden_name}</p>
              )}
              <div className="details-section">
                <p>
                  <strong>Gender:</strong> {selectedNode.gender || 'Not specified'}
                </p>
                {selectedNode.birth_date && (
                  <p>
                    <strong>Birth:</strong> {selectedNode.birth_date ? new Date(selectedNode.birth_date).toLocaleDateString() : 'Not specified'}
                    {selectedNode.birth_place && ` in ${selectedNode.birth_place}`}
                  </p>
                )}
                {selectedNode.death_date && (
                  <p>
                    <strong>Death:</strong> {selectedNode.death_date ? new Date(selectedNode.death_date).toLocaleDateString() : 'Not specified'}
                    {selectedNode.death_place && ` in ${selectedNode.death_place}`}
                  </p>
                )}
                {selectedNode.occupation && (
                  <p>
                    <strong>Occupation:</strong> {selectedNode.occupation}
                  </p>
                )}
                {selectedNode.email && (
                  <p>
                    <strong>Email:</strong> {selectedNode.email}
                  </p>
                )}
                {selectedNode.phone && (
                  <p>
                    <strong>Phone:</strong> {selectedNode.phone}
                  </p>
                )}
                {selectedNode.current_address && (
                  <p>
                    <strong>Address:</strong> {selectedNode.current_address}
                  </p>
                )}
                {selectedNode.notes && (
                  <div>
                    <strong>Notes:</strong>
                    <p>{selectedNode.notes}</p>
                  </div>
                )}
              </div>
              {hasRelationships && relationships && (
                <div className="relationships-section">
                  <h4>Relationships</h4>
                  {relationships.parents.length > 0 && (
                    <div className="relationship-group">
                      <strong>Parents:</strong>
                      <ul className="relationship-list">
                        {relationships.parents.map(({ person, type }) => (
                          <li key={person.id}>
                            {[person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unknown'}
                            {type && <span className="relationship-type"> ({type})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {relationships.children.length > 0 && (
                    <div className="relationship-group">
                      <strong>Children:</strong>
                      <ul className="relationship-list">
                        {relationships.children.map(({ person, type }) => (
                          <li key={person.id}>
                            {[person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unknown'}
                            {type && <span className="relationship-type"> ({type})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {relationships.spouses.length > 0 && (
                    <div className="relationship-group">
                      <strong>Spouses/Partners:</strong>
                      <ul className="relationship-list">
                        {relationships.spouses.map(({ person, union }) => (
                          <li key={person.id}>
                            {[person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unknown'}
                            {union.type && <span className="relationship-type"> - {union.type}</span>}
                            {union.status && union.status !== 'ongoing' && (
                              <span className="relationship-status"> ({union.status})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className="person-details-actions">
              <button
                className="edit-button"
                onClick={() => {
                  setEditingPerson(selectedNode);
                  setShowPersonModal(true);
                }}
              >
                Edit Person
              </button>
              <button
                className="delete-button"
                onClick={() => {
                  setPersonToDelete(selectedNode);
                  setShowDeleteConfirmModal(true);
                }}
              >
                Delete Person
              </button>
            </div>
            </div>
          );
        })()}
        {selectedEdge && (
          <div className="union-details">
            <p>
              <strong>Type:</strong> {selectedEdge.type || 'Not specified'}
            </p>
            <p>
              <strong>Status:</strong> {selectedEdge.status || 'Not specified'}
            </p>
            {selectedEdge.startDate && (
              <p>
                <strong>Start Date:</strong> {selectedEdge.startDate}
              </p>
            )}
            {selectedEdge.endDate && (
              <p>
                <strong>End Date:</strong> {selectedEdge.endDate}
              </p>
            )}
            {selectedEdge.place && (
              <p>
                <strong>Place:</strong> {selectedEdge.place}
              </p>
            )}
            {selectedEdge.notes && (
              <div>
                <strong>Notes:</strong>
                <p>{selectedEdge.notes}</p>
              </div>
            )}
          </div>
        )}
      </Sidebar>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => handleContextMenuAction('add-child', contextMenu.personId)}>
            Add Child
          </button>
          <button onClick={() => handleContextMenuAction('add-spouse', contextMenu.personId)}>
            Add Spouse/Partner
          </button>
          <button onClick={() => handleContextMenuAction('add-parent', contextMenu.personId)}>
            Add Parent
          </button>
        </div>
      )}
    </div>
  );
}

export function FamilyTree() {
  return (
    <ReactFlowProvider>
      <FamilyTreeInner />
    </ReactFlowProvider>
  );
}

