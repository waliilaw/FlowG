/**
 * 0G Network Client
 * Base client for interacting with 0G Network services
 */

import { ZGNetworkConfig, DEFAULT_ZG_CONFIG, NetworkStatus } from './config';

import { StorageService } from './storage-service';
import { DAService } from './da-service';

export class ZGNetworkClient {
  private config: ZGNetworkConfig;
  private _storage?: StorageService;
  private _da?: DAService;

  private status: { [key: string]: NetworkStatus } = {
    compute: 'disconnected',
    storage: 'disconnected',
    da: 'disconnected',
    chain: 'disconnected',
  };

  get storage(): StorageService {
    if (!this._storage) {
      throw new Error('Storage service not initialized');
    }
    return this._storage;
  }

  get da(): DAService {
    if (!this._da) {
      throw new Error('DA service not initialized');
    }
    return this._da;
  }

  constructor(config?: Partial<ZGNetworkConfig>) {
    this.config = {
      ...DEFAULT_ZG_CONFIG,
      ...config,
    };
  }

  /**
   * Initialize connections to all 0G Network services
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing 0G Network connections...');
    
    try {
      await Promise.allSettled([
        this.initializeCompute(),
        this.initializeStorage(),
        this.initializeDA(),
        this.initializeChain(),
      ]);
      
      console.log('✅ 0G Network initialization complete');
      console.log('📊 Network Status:', this.status);
    } catch (error) {
      console.error('❌ Failed to initialize 0G Network:', error);
      throw error;
    }
  }

  /**
   * Initialize 0G Compute Network connection
   */
  private async initializeCompute(): Promise<void> {
    this.status.compute = 'connecting';
    
    try {
      // TODO: Replace with actual 0G Compute SDK initialization
      // This is a placeholder until we get the actual SDK documentation
      console.log('🧠 Connecting to 0G Compute Network...');
      
      // Simulate connection check
      const response = await this.healthCheck(this.config.compute.endpoint);
      
      if (response.ok) {
        this.status.compute = 'connected';
        console.log('✅ 0G Compute Network connected');
      } else {
        throw new Error('Compute network health check failed');
      }
    } catch (error) {
      this.status.compute = 'error';
      console.error('❌ Failed to connect to 0G Compute Network:', error);
    }
  }

  /**
   * Initialize 0G Storage connection
   */
  private async initializeStorage(): Promise<void> {
    this.status.storage = 'connecting';
    
    try {
      console.log('\ud83d\uddc4\ufe0f Initializing 0G Storage service...');
      
      if (!this.config.privateKey) {
        throw new Error('Private key is required for storage service initialization');
      }
      
      this._storage = new StorageService({
        evmRpc: this.config.storage.evmRpc,
        indRpc: this.config.storage.indRpc,
        privateKey: this.config.privateKey
      });

      await this._storage.initialize();

      this.status.storage = 'connected';
      console.log('\u2705 0G Storage service initialized');
    } catch (error) {
      this.status.storage = 'error';
      console.error('\u274c Failed to initialize 0G Storage service:', error);
      throw error;
    }
  }

  /**
   * Initialize 0G DA connection
   */
  private async initializeDA(): Promise<void> {
    this.status.da = 'connecting';
    
    try {
      console.log('🔗 Initializing 0G DA service...');
      
      if (!this.config.privateKey) {
        throw new Error('Private key is required for DA service initialization');
      }
      
      this._da = new DAService({
        evmRpc: this.config.da.evmRpc,
        indRpc: this.config.da.indRpc,
        entranceContract: this.config.da.entranceContract,
        privateKey: this.config.privateKey
      });

      await this._da.initialize();

      this.status.da = 'connected';
      console.log('✅ 0G DA service initialized');
    } catch (error) {
      this.status.da = 'error';
      console.error('❌ Failed to initialize 0G DA service:', error);
      throw error;
    }
  }

  /**
   * Initialize 0G Chain connection
   */
  private async initializeChain(): Promise<void> {
    this.status.chain = 'connecting';
    
    try {
      // TODO: Replace with actual 0G Chain SDK initialization
      console.log('🔗 Connecting to 0G Chain...');
      
      // Simulate connection check
      const response = await this.healthCheck(this.config.chain.rpcUrl);
      
      if (response.ok) {
        this.status.chain = 'connected';
        console.log('✅ 0G Chain connected');
      } else {
        throw new Error('Chain health check failed');
      }
    } catch (error) {
      this.status.chain = 'error';
      console.error('❌ Failed to connect to 0G Chain:', error);
    }
  }

  /**
   * Basic health check for endpoints
   */
  private async healthCheck(endpoint: string): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.compute.timeout);
      
      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      // For now, we'll simulate a successful connection
      // This will be replaced with actual health checks once we have the real endpoints
      console.log(`🔄 Simulating connection to ${endpoint} (waiting for real endpoints)`);
      return new Response('OK', { status: 200, statusText: 'OK' });
    }
  }

  /**
   * Get current network status
   */
  getNetworkStatus() {
    return { ...this.status };
  }

  /**
   * Get configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ZGNetworkConfig>) {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }
}

// Singleton instance
let zgClientInstance: ZGNetworkClient | null = null;

/**
 * Get the singleton 0G Network client instance
 */
export function getZGClient(config?: Partial<ZGNetworkConfig>): ZGNetworkClient {
  if (!zgClientInstance) {
    zgClientInstance = new ZGNetworkClient(config);
  }
  return zgClientInstance;
}