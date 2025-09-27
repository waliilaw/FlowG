/**
 * Workflow Execution Engine - Updated for 0G Network Integration
 * Handles the execution of workflows using real 0G Network services
 */

import { WorkflowNode } from '@/types/workflow';
import { Edge } from '@xyflow/react';
import { ZGComputeService } from '@/lib/0g/compute';
import { StorageService, StorageServiceConfig } from '@/lib/0g/storage-service';
import { ZGChainService } from '@/lib/0g/chain';

export interface ExecutionContext {
  variables: { [key: string]: any };
  outputs: { [nodeId: string]: any };
}

export interface ExecutionPlan {
  executionOrder: string[];
  dependencies: { [nodeId: string]: string[] };
}

export interface ExecutionLogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  nodeId?: string;
  data?: any;
  status?: 'running' | 'completed' | 'error';
}

export class WorkflowExecutionEngine {
  private onNodeStatusUpdate?: (nodeId: string, status: 'running' | 'completed' | 'error', result?: any) => void;
  private onExecutionLog?: (entry: ExecutionLogEntry) => void;
  private zgComputeService?: ZGComputeService;
  private zgStorageService?: StorageService;
  private zgChainService?: ZGChainService;

  constructor(callbacks?: {
    onNodeStatusUpdate?: (nodeId: string, status: 'running' | 'completed' | 'error', result?: any) => void;
    onExecutionLog?: (entry: ExecutionLogEntry) => void;
  }, privateKey?: string) {
    this.onNodeStatusUpdate = callbacks?.onNodeStatusUpdate;
    this.onExecutionLog = callbacks?.onExecutionLog;
    
    // Initialize services if private key provided
    if (privateKey) {
      this.initializeServices(privateKey).catch(error => {
        this.log('warn', `⚠️ Failed to initialize 0G services: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
    }
  }

  private log(level: 'info' | 'warn' | 'error', message: string, nodeId?: string, data?: any) {
    const entry: ExecutionLogEntry = {
      timestamp: Date.now(),
      level,
      message,
      nodeId,
      data,
    };
    
    console.log(`[${level.toUpperCase()}] ${message}`);
    this.onExecutionLog?.(entry);
  }

  /**
   * Create execution plan using topological sort
   */
  private createExecutionPlan(nodes: WorkflowNode[], edges: Edge[]): ExecutionPlan {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const dependencies: { [nodeId: string]: string[] } = {};
    const inDegree: { [nodeId: string]: number } = {};

    // Initialize dependencies and in-degree count
    nodes.forEach(node => {
      dependencies[node.id] = [];
      inDegree[node.id] = 0;
    });

    // Build dependency graph
    edges.forEach(edge => {
      if (edge.source && edge.target && nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
        dependencies[edge.target].push(edge.source);
        inDegree[edge.target]++;
      }
    });

    // Topological sort
    const executionOrder: string[] = [];
    const queue: string[] = [];

    // Find nodes with no dependencies
    Object.keys(inDegree).forEach(nodeId => {
      if (inDegree[nodeId] === 0) {
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      executionOrder.push(currentNode);

      // Update in-degree for dependent nodes
      Object.keys(dependencies).forEach(nodeId => {
        if (dependencies[nodeId].includes(currentNode)) {
          inDegree[nodeId]--;
          if (inDegree[nodeId] === 0) {
            queue.push(nodeId);
          }
        }
      });
    }

    return { executionOrder, dependencies };
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    this.log('info', `🔄 Executing node: ${node.data.label}`, node.id);
    this.onNodeStatusUpdate?.(node.id, 'running');

    try {
      // Get input data from dependencies
      const inputData = this.getNodeInputs(node, context);
      let result: any;

      switch (node.type) {
        case 'input':
          result = await this.executeInputNode(node, inputData);
          break;
        case 'ai-compute':
          result = await this.executeAIComputeNode(node, inputData);
          break;
        case 'storage':
          result = await this.executeStorageNode(node, inputData);
          break;
        case 'chain-interaction':
          result = await this.executeChainInteractionNode(node, inputData);
          break;
        case 'logic':
          result = await this.executeLogicNode(node, inputData);
          break;
        case 'output':
          result = await this.executeOutputNode(node, inputData);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // Store result in context
      context.outputs[node.id] = result;
      
      this.log('info', `✅ Node completed: ${node.data.label}`, node.id, result);
      this.onNodeStatusUpdate?.(node.id, 'completed', result);

      return { success: true, result };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', `❌ Node failed: ${node.data.label} - ${errorMessage}`, node.id);
      this.onNodeStatusUpdate?.(node.id, 'error', { error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  }

  private getNodeInputs(node: WorkflowNode, context: ExecutionContext): any {
    // For now, return a simple aggregate of all previous outputs
    // In a more sophisticated implementation, this would map specific outputs to inputs
    return {
      ...context.variables,
      previousOutputs: context.outputs,
    };
  }

  private async executeInputNode(node: WorkflowNode, inputData: any): Promise<any> {
    // Input nodes provide initial data
    return node.data.config?.value || inputData || {};
  }

  private async executeAIComputeNode(node: WorkflowNode, inputData: any): Promise<any> {
    if (this.zgComputeService) {
      // Use real 0G Compute service
      const result = await this.zgComputeService.processData({
        data: inputData,
        model: node.data.config?.model || 'llama-3.3-70b-instruct',
        operation: node.data.config?.operation || 'process'
      });
      
      return {
        success: result.success,
        result: result.result,
        error: result.error
      };
    } else {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        result: `AI processed: ${JSON.stringify(inputData).substring(0, 100)}...`,
        operation: node.data.config?.operation || 'process'
      };
    }
  }

  private async executeStorageNode(node: WorkflowNode, inputData: any): Promise<any> {
    if (this.zgStorageService) {
      // Use real 0G Storage service
      const operation = node.data.config?.operation || 'store';
      
      if (operation === 'store') {
        const result = await this.zgStorageService.storeData({
          data: inputData,
          filename: node.data.config?.filename,
          metadata: {
            nodeId: node.id,
            timestamp: Date.now(),
          },
        });
        return result;
      } else if (operation === 'retrieve') {
        const result = await this.zgStorageService.retrieveData({
          hash: node.data.config?.hash || '',
          verify: node.data.config?.verify || false
        });
        return result;
      }
    } else {
      // Simulate storage operation
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        hash: `0x${Math.random().toString(16).substring(2, 66)}`,
        operation: node.data.config?.operation || 'store'
      };
    }
  }

  private async executeChainInteractionNode(node: WorkflowNode, inputData: any): Promise<any> {
    if (this.zgChainService) {
      // Use real 0G Chain service
      const operation = node.data.config?.operation || 'execute';
      
      if (operation === 'execute') {
        const result = await this.zgChainService.executeWorkflow({
          workflowId: `workflow-${Date.now()}`,
          data: inputData,
          gasLimit: node.data.config?.gasLimit
        });
        return result;
      }
    } else {
      // Simulate chain interaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        operation: node.data.config?.operation || 'execute'
      };
    }
  }

  private async executeLogicNode(node: WorkflowNode, inputData: any): Promise<any> {
    // Execute logic operations
    const operation = node.data.config?.operation || 'passthrough';
    
    switch (operation) {
      case 'filter':
        return {
          success: true,
          result: inputData,
          filtered: true
        };
      case 'transform':
        return {
          success: true,
          result: { ...inputData, transformed: true },
          operation: 'transform'
        };
      case 'aggregate':
        return {
          success: true,
          result: { aggregated: inputData },
          count: Array.isArray(inputData) ? inputData.length : 1
        };
      default:
        return {
          success: true,
          result: inputData
        };
    }
  }

  private async executeOutputNode(node: WorkflowNode, inputData: any): Promise<any> {
    // Output nodes format and return final results
    return {
      success: true,
      output: inputData,
      format: node.data.config?.format || 'json',
      timestamp: Date.now()
    };
  }

  /**
   * Execute a complete workflow
   */
  async executeWorkflow(
    nodes: WorkflowNode[],
    edges: Edge[],
    initialInputs?: { [key: string]: any }
  ): Promise<{ success: boolean; results: any; error?: string }> {
    this.log('info', '🚀 Starting workflow execution...');

    try {
      // Create execution plan
      const plan = this.createExecutionPlan(nodes, edges);
      this.log('info', `📋 Execution plan created: ${plan.executionOrder.length} nodes`);

      // Initialize execution context
      const context: ExecutionContext = {
        variables: initialInputs || {},
        outputs: {},
      };

      // Execute nodes in order
      const results: { [nodeId: string]: any } = {};
      
      for (const nodeId of plan.executionOrder) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) {
          throw new Error(`Node not found: ${nodeId}`);
        }

        const result = await this.executeNode(node, context);
        results[nodeId] = result;

        if (!result.success) {
          throw new Error(`Node execution failed: ${node.data.label} - ${result.error}`);
        }
      }

      this.log('info', '🎉 Workflow execution completed successfully!');
      return { success: true, results };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', `❌ Workflow execution failed: ${errorMessage}`);
      return { success: false, results: {}, error: errorMessage };
    }
  }

  /**
   * Initialize 0G services with private key
   */
  async initializeServices(privateKey: string): Promise<void> {
    try {
      // Initialize compute service
      this.zgComputeService = new ZGComputeService(privateKey);
      await this.zgComputeService.initialize();
      
      // Initialize storage service
      const storageConfig: StorageServiceConfig = {
        evmRpc: 'https://evmrpc-testnet.0g.ai',
        indRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
        privateKey
      };
      this.zgStorageService = new StorageService(storageConfig);
      await this.zgStorageService.initialize();
      
      // Initialize chain service
      this.zgChainService = new ZGChainService('testnet', privateKey);
      
      this.log('info', '✅ 0G Network services initialized successfully');
    } catch (error) {
      this.log('error', `❌ Failed to initialize 0G services: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Check if 0G services are available
   */
  areServicesInitialized(): boolean {
    return !!(this.zgComputeService && this.zgStorageService && this.zgChainService);
  }

  /**
   * Get service health status
   */
  async getServiceHealth(): Promise<{
    compute: boolean;
    storage: boolean;
    chain: boolean;
  }> {
    const health = {
      compute: false,
      storage: false,
      chain: false,
    };

    if (this.zgComputeService) {
      try {
        const computeHealth = await this.zgComputeService.checkHealth();
        health.compute = computeHealth.healthy;
      } catch (error) {
        console.warn('Compute health check failed:', error);
      }
    }

    if (this.zgStorageService) {
      try {
        const storageHealth = await this.zgStorageService.checkHealth();
        health.storage = storageHealth.healthy;
      } catch (error) {
        console.warn('Storage health check failed:', error);
      }
    }

    if (this.zgChainService) {
      try {
        const chainHealth = await this.zgChainService.checkHealth();
        health.chain = chainHealth.healthy;
      } catch (error) {
        console.warn('Chain health check failed:', error);
      }
    }

    return health;
  }
}

export default WorkflowExecutionEngine;