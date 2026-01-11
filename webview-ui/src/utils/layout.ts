import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';
import { GraphData } from '../types';

const nodeWidth = 172;
const nodeHeight = 36;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'LR' ? Position.Left : Position.Top;
    node.sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};

export const transformDataToFlow = (data: GraphData) => {
    const flowNodes: Node[] = data.nodes.map(n => {
        let borderColor = '#333';
        let background = '#000';

        switch (n.type) {
            case 'file':
                borderColor = '#0070f3'; // Blue
                break;
            case 'class':
                borderColor = '#7928ca'; // Purple
                break;
            case 'function':
                borderColor = '#10b981'; // Green
                break;
            case 'variable':
            default:
                borderColor = '#f5a623'; // Orange
                break;
        }

        return {
            id: n.id,
            type: 'default',
            data: { label: n.label, original: n, color: borderColor },
            position: { x: 0, y: 0 },
            style: { 
                background,
                color: '#fff',
                border: `1px solid ${borderColor}`,
                width: 170,
                borderRadius: '8px',
                boxShadow: `0 0 10px ${borderColor}20` // Subtle glow
            }
        };
    });

    const flowEdges: Edge[] = data.edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: true,
        label: e.type !== 'usage' ? e.type : undefined
    }));

    return { flowNodes, flowEdges };
}
