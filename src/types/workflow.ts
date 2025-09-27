import { Node, Edge } from '@xyflow/react';

export interface WorkflowNode extends Node {
  type: NodeType;
  data: {
    label: string;
    description?: string;
    config: NodeConfig;
    status: NodeStatus;
    outputs?: any;
    errors?: string[];
  };
}

export type NodeType = 
  | 'ai-compute' 
  | 'storage' 
  | 'chain-interaction' 
  | 'logic' 
  | 'input' 
  | 'output';

export type NodeStatus = 'idle' | 'running' | 'completed' | 'error';

export interface NodeConfig {
  [key: string]: any;
}

export interface WorkflowVersion {
  workflowId: string;
  version: string;
  hash: string;
  timestamp: number;
  parentVersion?: string;
  clonedFrom?: string;
  metadata?: {
    author?: string;
    description?: string;
    changes?: string[];
    [key: string]: any;
  };
  nodes: WorkflowNode[];
  edges: Edge[];
}

export interface AIComputeConfig extends NodeConfig {
  model?: string;
  operation: 'process' | 'text-generation' | 'image-generation' | 'classify';
  prompt?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    [key: string]: any;
  };
}

export interface StorageConfig extends NodeConfig {
  operation: 'store' | 'retrieve';
  data?: any;
  filename?: string;
  hash?: string;
  verify?: boolean;
  metadata?: {
    [key: string]: any;
  };
}

export interface ChainConfig extends NodeConfig {
  operation: 'deploy-contract' | 'call-contract' | 'wrap-og' | 'unwrap-og';
  contractAddress?: string;
  contractAbi?: any[];
  contractBytecode?: string;
  methodName?: string;
  parameters?: any[];
  value?: string;
  constructorArgs?: any[];
  gasLimit?: number;
}

export interface LogicConfig extends NodeConfig {
  operation: 'condition' | 'loop' | 'timer' | 'branch';
  condition?: string;
  loopCount?: number;
  delay?: number;
  branches?: { condition: string; output: string }[];
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: Edge[];
  isExecuting: boolean;
  executionLog: ExecutionLogEntry[];
}

export interface ExecutionLogEntry {
  nodeId: string;
  timestamp: number;
  status: NodeStatus;
  message: string;
  data?: any;
}

export interface ZGNetworkConfig {
  compute: {
    endpoint: string;
    apiKey?: string;
  };
  storage: {
    endpoint: string;
    apiKey?: string;
  };
  da: {
    endpoint: string;
    apiKey?: string;
  };
  chain: {
    rpcUrl: string;
    chainId: number;
    contractAddresses: {
      [key: string]: string;
    };
  };
}