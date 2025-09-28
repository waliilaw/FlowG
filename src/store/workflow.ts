import { create } from 'zustand';
import { 
  Node,
  Edge,
  addEdge,
  applyNodeChanges, 
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection
} from '@xyflow/react';
import { WorkflowNode, WorkflowState, ExecutionLogEntry, NodeStatus } from '@/types/workflow';
import WorkflowExecutionEngine from '@/lib/workflow-execution';
import { WorkflowPersistenceService, SavedWorkflow } from '@/lib/workflow-persistence';
import { WorkflowVersionManager } from '@/lib/workflow-version';
import { DAService } from '@/lib/0g/da-service';

// Workflow version info type
export interface WorkflowVersionInfo {
  id: string;
  version: string;
  hash: string;
  timestamp: number;
  metadata?: {
    author?: string;
    description?: string;
    changes?: string[];
  };
}

// Version control operations
export interface VersionOps {
  saveVersion: (name?: string, description?: string) => Promise<string>;
  loadVersion: (hash: string) => Promise<void>;
  rollbackToVersion: (hash: string) => Promise<void>;
  cloneWorkflow: (workflowId: string) => Promise<string>;
  getVersionHistory: () => Promise<WorkflowVersionInfo[]>;
}

// Store interface
export interface WorkflowStore extends WorkflowState, VersionOps {
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  // Workflow state
  nodes: WorkflowNode[];
  edges: Edge[];
  isExecuting: boolean;
  executionLog: ExecutionLogEntry[];
  
  // Current workflow
  currentWorkflow?: SavedWorkflow;
  
  // Node operations
  addNode: (node: WorkflowNode) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<WorkflowNode['data']>) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  
  // Edge operations
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // Execution operations
  executeWorkflow: (inputs?: Record<string, any>) => Promise<void>;
  startExecution: () => void;
  stopExecution: () => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus, message?: string, data?: any) => void;
  addExecutionLog: (entry: ExecutionLogEntry) => void;
  clearExecutionLog: () => void;
  
  // Workflow operations
  clearWorkflow: () => void;
  loadWorkflow: (workflow: { nodes: WorkflowNode[]; edges: Edge[] }) => void;
  getWorkflowData: () => { nodes: WorkflowNode[]; edges: Edge[] };
  saveWorkflow: (name: string) => Promise<void>;
}

// Initialize services
const versionManager = new WorkflowVersionManager();

// Create store
export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  isExecuting: false,
  executionLog: [],

  // Current workflow data
  currentWorkflow: undefined,


  // Node operations
  setNodes: (nodes: WorkflowNode[]) => {
    set(() => ({ nodes }));
  },
  setEdges: (edges: Edge[]) => {
    set(() => ({ edges }));
  },
  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
  },

  removeNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
    }));
  },

  updateNode: (nodeId, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      ),
    }));
  },

  onNodesChange: (changes : any ) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  // Edge operations
  addEdge: (edge) => {
    set((state) => ({
      edges: addEdge(edge, state.edges),
    }));
  },

  removeEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
  },

  // Execution operations
  executeWorkflow: async (inputs) => {
    console.log('🚀 Starting workflow execution...');
    set({ isExecuting: true });
    
    try {
      const { nodes, edges } = get();
      
      if (nodes.length === 0) {
        console.log('❌ No nodes to execute');
        alert('Please add some nodes to your workflow first!');
        set({ isExecuting: false });
        return;
      }
      
      console.log(`📊 Executing workflow with ${nodes.length} nodes and ${edges.length} connections`);
      
      // Execute each node with visual feedback
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        console.log(`⚡ Executing node: ${node.data.label} (${node.type})`);
        
        // Update node status to running
        set((state) => ({
          nodes: state.nodes.map(n => 
            n.id === node.id 
              ? { ...n, data: { ...n.data, status: 'running' } }
              : n
          )
        }));
        
        // Simulate processing time based on node type
        const processingTime = node.type === 'ai-compute' ? 3000 : 1500;
        await new Promise((resolve) => setTimeout(resolve, processingTime));
        
        // Update node status to completed
        set((state) => ({
          nodes: state.nodes.map(n => 
            n.id === node.id 
              ? { ...n, data: { ...n.data, status: 'completed' } }
              : n
          )
        }));
        
        console.log(`✅ Completed node: ${node.data.label}`);
      }
      
      console.log('🎉 Workflow execution completed successfully!');
      alert('🎉 Workflow executed successfully! Check the console for details.');
      
    } catch (error) {
      console.error('❌ Execution error:', error);
      alert('❌ Workflow execution failed! Check the console for details.');
    } finally {
      set({ isExecuting: false });
      
      // Reset all node statuses after a delay
      setTimeout(() => {
        set((state) => ({
          nodes: state.nodes.map(n => ({ 
            ...n, 
            data: { ...n.data, status: 'idle' } 
          }))
        }));
      }, 3000);
    }
  },

  startExecution: () => {
    set({ isExecuting: true });
  },

  stopExecution: () => {
    set({ isExecuting: false });
  },

  updateNodeStatus: (nodeId, status, message, data) => {
    const { updateNode, addExecutionLog } = get();
    
    updateNode(nodeId, { status, outputs: data });
    
    if (message) {
      addExecutionLog({
        nodeId,
        timestamp: Date.now(),
        status,
        message,
        data,
      });
    }
  },

  addExecutionLog: (entry) => {
    set((state) => ({
      executionLog: [...state.executionLog, entry],
    }));
  },

  clearExecutionLog: () => {
    set({ executionLog: [] });
  },

  // Workflow operations
  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      isExecuting: false,
      executionLog: [],
    });
  },

  loadWorkflow: (workflow) => {
    set({
      nodes: workflow.nodes,
      edges: workflow.edges,
      isExecuting: false,
      executionLog: [],
    });
  },

  getWorkflowData: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  saveWorkflow: async (name: string) => {
    const { nodes, edges } = get();
    const workflowData = {
      name,
      nodes,
      edges,
      createdAt: Date.now(),
    };
    
    try {
      // Save to localStorage for now
      const savedWorkflows = JSON.parse(localStorage.getItem('flowg-workflows') || '[]');
      savedWorkflows.push(workflowData);
      localStorage.setItem('flowg-workflows', JSON.stringify(savedWorkflows));
      
      // Add to log
      get().addExecutionLog({
        nodeId: 'system',
        timestamp: Date.now(),
        status: 'completed',
        message: `💾 Workflow "${name}" saved successfully`,
      });
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async save
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    }
  },

  // Version control operations
  saveVersion: async (name?: string, description?: string) => {
    const state = get();
    const version = {
      workflowId: state.currentWorkflow?.id || 'temp',
      version: Date.now().toString(),
      hash: '',
      timestamp: Date.now(),
      metadata: {
        author: 'user',
        description: description || `Version created at ${new Date().toLocaleString()}`,
        changes: name ? [`Named version: ${name}`] : undefined
      },
      nodes: state.nodes,
      edges: state.edges
    };

    try {
      const hash = await versionManager.saveVersion(version.workflowId, version);
      return hash;
    } catch (error) {
      console.error('Failed to save version:', error);
      throw error;
    }
  },

  loadVersion: async (hash: string) => {
    try {
      const versions = await versionManager.getVersions(get().currentWorkflow?.id || '');
      const version = versions.find(v => v.hash === hash);
      if (!version) {
        throw new Error('Version not found');
      }

      get().loadWorkflow(version);
    } catch (error) {
      console.error('Failed to load version:', error);
      throw error;
    }
  },

  rollbackToVersion: async (hash: string) => {
    try {
      // First load the version
      await get().loadVersion(hash);
      
      // Then save it as the latest
      await get().saveVersion(undefined, 'Rollback to previous version');
    } catch (error) {
      console.error('Failed to rollback version:', error);
      throw error;
    }
  },

  cloneWorkflow: async (workflowId: string) => {
    try {
      const versions = await versionManager.getVersions(workflowId);
      if (!versions.length) {
        throw new Error('No versions found for workflow');
      }

      // Load the latest version
      const latest = versions[versions.length - 1];
      get().loadWorkflow(latest);

      // Save as new workflow
      const newId = `${workflowId}-clone-${Date.now()}`;
      await get().saveVersion(newId, `Cloned from ${workflowId}`);

      return newId;
    } catch (error) {
      console.error('Failed to clone workflow:', error);
      throw error;
    }
  },

  getVersionHistory: async () => {
    try {
      const state = get();
      if (!state.currentWorkflow?.id) {
        return [];
      }

      const versions = await versionManager.getVersions(state.currentWorkflow.id);
      return versions.map(v => ({
        id: v.workflowId,
        version: v.version,
        hash: v.hash,
        timestamp: v.timestamp,
        metadata: v.metadata
      }));
    } catch (error) {
      console.error('Failed to get version history:', error);
      return [];
    }
  }
}));