import { useMemo } from 'react';
import Dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

export function useLayoutedGraph(nodes: Node[], edges: Edge[]) {
  return useMemo(() => {
    if (nodes.length === 0) {
      return { nodes, edges };
    }

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
    // Union edges will connect nodes at the same rank
    const parentEdges = edges.filter((edge) => edge.type === 'parent');
    parentEdges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    Dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
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
  }, [nodes, edges]);
}

