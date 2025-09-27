import { WorkflowVersion } from '@/types/workflow';
import { getZGClient } from './0g/client';

export class WorkflowVersionManager {
  private client = getZGClient();

  async saveVersion(workflowId: string, version: WorkflowVersion): Promise<string> {
    try {
      // Store workflow data in 0G Storage
      const storage = this.client.storage;
      const storageResult = await storage.storeData({
        data: version,
        filename: `workflow_${workflowId}_v${version.version}.json`,
        metadata: {
          workflowId,
          version: version.version,
          timestamp: version.timestamp,
          ...version.metadata
        }
      });

      if (!storageResult.success) {
        throw new Error('Failed to store workflow version');
      }

      // Store version reference in 0G DA for durability
      const da = this.client.da;
      const result = await da.submitWorkflowVersion({
        id: workflowId,
        version: parseInt(version.version),
        hash: storageResult.hash || '',
        timestamp: version.timestamp,
        metadata: {
          author: version.metadata?.author || 'unknown',
          description: version.metadata?.description || '',
          changes: version.metadata?.changes || []
        }
      });
      
      if (!result.success) {
        throw new Error(`Failed to store workflow version in DA: ${result.error}`);
      }

      return storageResult.hash || '';
    } catch (error) {
      console.error('Failed to save workflow version:', error);
      throw error;
    }
  }

  async getVersions(workflowId: string): Promise<WorkflowVersion[]> {
    try {
      // Use storage service to get version data
      const storage = this.client.storage;
      
      // Get latest version from storage
      // TODO: Implement proper version history tracking
      const result = await storage.retrieveData({
        hash: workflowId, // Using workflowId as storage hash for now
        verify: true
      });
      
      if (!result.success) {
        return [];
      }
      
      const latestVersion: WorkflowVersion = {
        workflowId,
        version: '1',
        hash: result.hash || '',
        timestamp: result.metadata?.timestamp || Date.now(),
        metadata: {
          author: 'local',
          description: 'Local version'
        },
        nodes: [],
        edges: []
      };
      
      return [latestVersion];
    } catch (error) {
      console.error('Failed to get workflow versions:', error);
      throw error;
    }
  }

  async rollbackToVersion(workflowId: string, version: string): Promise<WorkflowVersion> {
    try {
      const versions = await this.getVersions(workflowId);
      const targetVersion = versions.find(v => v.version === version);
      
      if (!targetVersion) {
        throw new Error(`Version ${version} not found`);
      }

      // Create new version with rollback reference
      const newVersion: WorkflowVersion = {
        ...targetVersion,
        version: `${targetVersion.version}_rollback_${Date.now()}`,
        timestamp: Date.now(),
        parentVersion: version,
      };

      await this.saveVersion(workflowId, newVersion);
      return newVersion;
    } catch (error) {
      console.error('Failed to rollback workflow:', error);
      throw error;
    }
  }

  async cloneWorkflow(workflowId: string, newWorkflowId: string): Promise<string> {
    try {
      const versions = await this.getVersions(workflowId);
      const latestVersion = versions[versions.length - 1];

      if (!latestVersion) {
        throw new Error('No versions found to clone');
      }

      const newVersion: WorkflowVersion = {
        ...latestVersion,
        workflowId: newWorkflowId,
        version: '1',
        timestamp: Date.now(),
        clonedFrom: workflowId,
      };

      return await this.saveVersion(newWorkflowId, newVersion);
    } catch (error) {
      console.error('Failed to clone workflow:', error);
      throw error;
    }
  }
}