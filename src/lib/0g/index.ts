/**
 * 0G Network Integration
 * Main export file for all 0G Network services
 */

// Core client and configuration
export { ZGNetworkClient, getZGClient } from './client';
export { DEFAULT_ZG_CONFIG } from './config';
export type { ZGNetworkConfig, NetworkStatus, NetworkStatusInfo } from './config';

// 0G Compute Network
export { ZGComputeService } from './compute';
export type { ModelProvider, InferenceRequest, InferenceResult, HealthStatus } from './compute';

// 0G Storage Network
export { ZGStorageService } from './storage';
export type { StorageFile, UploadRequest, UploadResponse, DownloadRequest, DownloadResponse } from './storage';

// 0G Chain
export { ZGChainService } from './chain';
export type { ContractDeployment, TransactionResult } from './chain';

/**
 * Initialize all 0G Network services
 */
export async function initializeZGNetwork(config?: Partial<import('./config').ZGNetworkConfig>) {
  const { ZGNetworkClient } = await import('./client');
  const { DEFAULT_ZG_CONFIG } = await import('./config');
  const client = new ZGNetworkClient({ ...DEFAULT_ZG_CONFIG, ...config });
  await client.initialize();
  return client;
}

/**
 * Get the status of all 0G Network services (requires initialized client)
 */
export function getZGNetworkStatus(client: import('./client').ZGNetworkClient) {
  return client.getNetworkStatus();
}