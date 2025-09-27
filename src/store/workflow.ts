import { create } from 'zustand';
import { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';

interface WorkflowVersion {
  id: string;
  version: number;
  metadata: any;
  hash: string;
  timestamp: number;
  name: string;
  description: string;
  data: WorkflowData;
}

interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
}

interface CurrentWorkflow extends WorkflowData {
  name?: string;
  timestamp?: number;
  versions?: WorkflowVersion[];
  currentVersion?: WorkflowVersion;
}

interface NodeState {
  nodes: Node[];
  edges: Edge[];
  isExecuting: boolean;
  executionLog: any[];
  currentWorkflow: CurrentWorkflow | null;
}

interface NodeActions {
  addNode: (node: Node) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, data: any) => void;
  updateStoreNodes: (nodes: Node[]) => void;
  updateStoreEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  saveWorkflow: (name: string) => Promise<void>;
  loadWorkflow: (workflow: CurrentWorkflow) => void;
  getWorkflowData: () => WorkflowData;
  clearWorkflow: () => void;
  executeWorkflow: (inputs?: any) => Promise<void>;
  startExecution: () => void;
  stopExecution: () => void;
  saveVersion: (name?: string, description?: string) => Promise<void>;
  loadVersion: (hash: string) => Promise<void>;
  rollbackToVersion: (hash: string) => Promise<void>;
  getVersionHistory: () => Promise<WorkflowVersion[]>;
}

type WorkflowStore = NodeState & NodeActions;

const initialState: NodeState = {
  nodes: [],
  edges: [],
  isExecuting: false,
  executionLog: [],
  currentWorkflow: null,
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  ...initialState,

  addNode: (node) => {
    console.log('Adding node to store:', node);
    set((state) => {
      const newNodes = [...state.nodes, node];
      console.log('New nodes state:', newNodes);
      return { nodes: newNodes };
    });
  },

  removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    }));
  },

  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, data } : n)),
    }));
  },

  updateStoreNodes: (nodes) => {
    set({ nodes });
  },

  updateStoreEdges: (edges) => {
    set({ edges });
  },

  onNodesChange: (changes) => {
    console.log('Handling node changes:', changes);
    set((state) => ({
      nodes: changes.reduce((acc, change) => {
        console.log('Processing change:', change);
        let nodes = [...acc];

        switch (change.type) {
          case 'add':
            return [...nodes, change.item];
          
          case 'remove':
            return nodes.filter((n) => n.id !== change.id);
          
          case 'select':
            return nodes.map((n) => 
              n.id === change.id ? { ...n, selected: change.selected } : n
            );
          
          case 'position':
            if (change.position) {
              console.log('Updating node position:', change.id, change.position);
              return nodes.map((n) =>
                n.id === change.id
                  ? {
                      ...n,
                      position: change.position!,
                      ...(change.positionAbsolute && { positionAbsolute: change.positionAbsolute })
                    }
                  : n
              );
            }
            console.warn('Position change without position data:', change);
            return nodes;
          
          case 'dimensions':
            if (change.dimensions) {
              return nodes.map((n) =>
                n.id === change.id
                  ? {
                      ...n,
                      measured: {
                        width: change.dimensions!.width,
                        height: change.dimensions!.height,
                      },
                    }
                  : n
              );
            }
            return nodes;
          
          case 'replace':
            return nodes.map((n) => 
              n.id === change.id ? change.item : n
            );
          
          default:
            console.warn(`Unhandled node change type: ${(change as any).type}`);
            return nodes;
        }
      }, state.nodes),
    }));
  },

  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, edge],
    }));
  },

  removeEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: changes.reduce((acc, change) => {
        let edges = [...acc];

        switch (change.type) {
          case 'add':
            return [...edges, change.item];
          
          case 'remove':
            return edges.filter((e) => e.id !== change.id);
          
          case 'select':
            return edges.map((e) => 
              e.id === change.id ? { ...e, selected: change.selected } : e
            );
          
          case 'replace':
            return edges.map((e) => 
              e.id === change.id ? change.item : e
            );
          
          default:
            console.warn(`Unhandled edge change type: ${(change as any).type}`);
            return edges;
        }
      }, state.edges),
    }));
  },

  onConnect: (connection) => {
    const edge: Edge = {
      id: `e${connection.source}-${connection.target}`,
      source: connection.source || '',
      target: connection.target || '',
    };
    get().addEdge(edge);
  },

  saveWorkflow: async (name) => {
    const data = get().getWorkflowData();
    set({
      currentWorkflow: {
        name,
        ...data,
        timestamp: Date.now(),
      },
    });
  },

  loadWorkflow: (workflow) => {
    set({
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
      currentWorkflow: workflow,
    });
  },

  getWorkflowData: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      currentWorkflow: null,
    });
  },

  executeWorkflow: async (inputs) => {
    set({ isExecuting: true });
    try {
      const nodes = get().nodes;
      for (const node of nodes) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Execution error:', error);
    }
    set({ isExecuting: false });
  },

  startExecution: () => {
    set({ isExecuting: true });
  },

  stopExecution: () => {
    set({ isExecuting: false });
  },

  saveVersion: async (name = 'Untitled', description = '') => {
    const data = get().getWorkflowData();
    const version: WorkflowVersion = {
      id: Math.random().toString(36).substring(7),
      version: Date.now(),
      metadata: {},
      hash: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      name,
      description,
      data,
    };
    const workflow = get().currentWorkflow || { nodes: [], edges: [] };
    const versions = [...(workflow.versions || []), version];
    set({
      currentWorkflow: {
        ...workflow,
        versions,
        currentVersion: version,
      },
    });
  },

  loadVersion: async (hash) => {
    const workflow = get().currentWorkflow;
    if (!workflow?.versions) return;
    const version = workflow.versions.find((v) => v.hash === hash);
    if (version?.data) {
      get().loadWorkflow({ ...workflow, ...version.data });
    }
  },

  rollbackToVersion: async (hash) => {
    await get().loadVersion(hash);
    await get().saveVersion('Rollback version');
  },

  getVersionHistory: async () => {
    const workflow = get().currentWorkflow;
    return workflow?.versions || [];
  },
}));