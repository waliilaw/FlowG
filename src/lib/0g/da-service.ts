import { ethers } from 'ethers';

export interface DAServiceConfig {
  evmRpc: string;
  indRpc: string;
  privateKey: string;
  entranceContract: string;
}

export interface BlobSubmissionResult {
  success: boolean;
  hash?: string;
  transactionHash?: string;
  error?: string;
  metadata?: {
    timestamp: number;
    size: number;
    nodes: string[];
  };
}

export interface WorkflowVersion {
  id: string;
  version: number;
  timestamp: number;
  hash: string;
  metadata: {
    author: string;
    description?: string;
    changes?: string[];
    [key: string]: any;
  };
}

export class DAService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private entranceContract: ethers.Contract;

  constructor(config: DAServiceConfig) {
    this.provider = new ethers.JsonRpcProvider(config.evmRpc);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    // DA Entrance contract ABI (minimal interface)
    const entranceAbi = [
      'function submitBlob(bytes blob) external payable returns (bytes32)',
      'function getBlobStatus(bytes32 hash) external view returns (uint8)',
      'function verifyBlob(bytes32 hash, bytes blob) external view returns (bool)'
    ];

    this.entranceContract = new ethers.Contract(
      config.entranceContract,
      entranceAbi,
      this.wallet
    );
  }

  async initialize(): Promise<void> {
    try {
      await this.provider.getNetwork();
    } catch (error) {
      throw new Error(`Failed to initialize DAService: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private serializeWorkflowVersion(workflow: WorkflowVersion): Uint8Array {
    // Convert workflow to buffer
    const data = JSON.stringify(workflow);
    return new TextEncoder().encode(data);
  }

  private deserializeWorkflowVersion(data: Uint8Array): WorkflowVersion {
    const text = new TextDecoder().decode(data);
    return JSON.parse(text);
  }

  async submitWorkflowVersion(workflow: WorkflowVersion): Promise<BlobSubmissionResult> {
    try {
      // Serialize workflow data
      const blob = this.serializeWorkflowVersion(workflow);

      // Check size limit (32,505,852 bytes)
      if (blob.length > 32505852) {
        throw new Error('Workflow data exceeds maximum blob size');
      }

      // Submit blob
      const tx = await this.entranceContract.submitBlob(blob, {
        gasLimit: 2000000
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      const hash = receipt.logs[0].topics[1]; // Get blob hash from event

      return {
        success: true,
        hash,
        transactionHash: receipt.hash,
        metadata: {
          timestamp: Date.now(),
          size: blob.length,
          nodes: [] // TODO: Add DA nodes that received the blob
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async verifyWorkflowVersion(hash: string, workflow: WorkflowVersion): Promise<boolean> {
    try {
      const blob = this.serializeWorkflowVersion(workflow);
      return await this.entranceContract.verifyBlob(hash, blob);
    } catch (error) {
      console.error('Failed to verify workflow version:', error);
      return false;
    }
  }

  async getWorkflowStatus(hash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    try {
      const status = await this.entranceContract.getBlobStatus(hash);
      switch (status) {
        case 0: return 'pending';
        case 1: return 'confirmed';
        default: return 'failed';
      }
    } catch (error) {
      console.error('Failed to get workflow status:', error);
      return 'failed';
    }
  }

  async checkHealth(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const [network, blockNumber] = await Promise.all([
        this.provider.getNetwork(),
        this.provider.getBlockNumber()
      ]);

      const entranceCode = await this.provider.getCode(this.entranceContract.target);
      if (entranceCode === '0x') {
        throw new Error('DA Entrance contract not deployed');
      }

      return {
        healthy: true,
        details: {
          network: network.name,
          chainId: network.chainId,
          blockNumber,
          entranceContract: this.entranceContract.target
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}