import { Node, Edge } from '@xyflow/react';

export interface WorkflowVersion {
  workflowId: string;
  version: string;
  timestamp: number;
  nodes: Node[];
  edges: Edge[];
  name?: string;
  description?: string;
  parentVersion?: string;  // For rollbacks
  clonedFrom?: string;    // For cloned workflows
  metadata?: {
    createdBy: string;
    lastModified: number;
    executionCount: number;
    [key: string]: any;
  };
}

export interface WorkflowVersionInfo {
  workflowId: string;
  version: string;
  storageHash: string;
  timestamp: number;
  metadata?: Record<string, any>;
}