import { Edge } from '@xyflow/react';
import { WorkflowNode } from '@/types/workflow';
import { DAService, WorkflowVersion } from './0g/da-service';
import { ethers } from 'ethers';

export interface WorkflowPersistenceConfig {
  daService: DAService;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  description?: string;
  currentVersion: number;
  versions: WorkflowVersion[];
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  edges: Edge[];
}

export class WorkflowPersistenceService {
  private daService: DAService;

  constructor(config: WorkflowPersistenceConfig) {
    this.daService = config.daService;
  }

  private generateWorkflowId(name: string): string {
    const timestamp = Date.now();
    const randomness = Math.random().toString(36).substring(2, 15);
    return ethers.keccak256(
      ethers.toUtf8Bytes(`${name}-${timestamp}-${randomness}`)
    );
  }

  async saveWorkflow(
    workflow: SavedWorkflow,
    data: WorkflowData,
    description?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create new version
      const version: WorkflowVersion = {
        id: workflow.id,
        version: workflow.currentVersion + 1,
        timestamp: Date.now(),
        hash: '', // Will be set after submission
        metadata: {
          author: '', // TODO: Add user address
          description,
          changes: [], // TODO: Calculate changes from previous version
          nodes: data.nodes,
          edges: data.edges
        }
      };

      // Submit to DA layer
      const result = await this.daService.submitWorkflowVersion(version);
      
      if (!result.success || !result.hash) {
        throw new Error(result.error || 'Failed to submit workflow version');
      }

      // Update version with actual hash
      version.hash = result.hash;
      workflow.versions.push(version);
      workflow.currentVersion++;
      workflow.updatedAt = Date.now();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createNewWorkflow(
    name: string,
    data: WorkflowData,
    description?: string
  ): Promise<{ success: boolean; workflow?: SavedWorkflow; error?: string }> {
    try {
      const id = this.generateWorkflowId(name);
      const timestamp = Date.now();

      // Create initial workflow
      const workflow: SavedWorkflow = {
        id,
        name,
        description,
        currentVersion: 0,
        versions: [],
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Save initial version
      const saveResult = await this.saveWorkflow(workflow, data, 'Initial version');
      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }

      return {
        success: true,
        workflow
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async verifyWorkflowVersion(
    version: WorkflowVersion
  ): Promise<boolean> {
    return this.daService.verifyWorkflowVersion(version.hash, version);
  }

  async getVersionStatus(hash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    return this.daService.getWorkflowStatus(hash);
  }

  async checkHealth(): Promise<{ healthy: boolean; details?: any }> {
    return this.daService.checkHealth();
  }
}