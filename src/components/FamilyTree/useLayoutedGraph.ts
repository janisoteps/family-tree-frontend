import Dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { Person } from '../../types/familyTree';

/**
 * Calculates initial positions for nodes.
 * Uses stored positions from the database when available,
 * falls back to Dagre auto-layout for nodes without stored positions.
 * 
 * This is a pure function, not a hook - call it once when loading the graph.
 */
export function calculateNodePositions(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  if (nodes.length === 0) {
    return { nodes, edges };
  }

  // Run Dagre layout for all nodes to calculate hierarchical positions
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    ranksep: 150,
    nodesep: 80,
    align: 'UL',
  });

  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: 200,
      height: 150,
    });
  });

  // Only use parent-child edges for hierarchy layout
  const parentEdges = edges.filter((edge) => edge.type === 'parent');
  parentEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  // Apply positions: use stored position if available, otherwise use Dagre
  const layoutedNodes = nodes.map((node) => {
    const personData = node.data as unknown as Person;

    // Use stored position if available
    if (personData.position_x != null && personData.position_y != null) {
      return {
        ...node,
        position: {
          x: personData.position_x,
          y: personData.position_y,
        },
      };
    }

    // Fall back to Dagre-calculated position
    const nodeWithPosition = g.node(node.id);
    if (nodeWithPosition) {
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 100, // Center the node
          y: nodeWithPosition.y - 75,
        },
      };
    }

    return node;
  });

  return { nodes: layoutedNodes, edges };
}
