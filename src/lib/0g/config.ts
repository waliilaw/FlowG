/**
 * 0G Network Configuration
 * This file contains the configuration for connecting to 0G Network services
 */

export interface ZGNetworkConfig {
  compute: {
    endpoint: string;
    apiKey?: string;
    timeout?: number;
  };
  storage: {
    endpoint: string;
    evmRpc: string;
    indRpc: string;
    apiKey?: string;
    timeout?: number;
  };
  privateKey?: string;
  da: {
    endpoint: string;
    evmRpc: string;
    indRpc: string;
    entranceContract: string;
    apiKey?: string;
    timeout?: number;
  };
  chain: {
    rpcUrl: string;
    chainId: number;
    explorerUrl?: string;
    contractAddresses: {
      [key: string]: string;
    };
  };
}

// Default configuration for 0G Network testnet/devnet
export const DEFAULT_ZG_CONFIG: ZGNetworkConfig = {
  compute: {
    endpoint: process.env.NEXT_PUBLIC_ZG_COMPUTE_ENDPOINT || 'https://compute-testnet.0g.ai',
    apiKey: process.env.NEXT_PUBLIC_ZG_COMPUTE_API_KEY,
    timeout: 30000,
  },
  storage: {
    endpoint: process.env.NEXT_PUBLIC_ZG_STORAGE_ENDPOINT || 'https://storage-testnet.0g.ai',
    evmRpc: process.env.NEXT_PUBLIC_ZG_STORAGE_EVM_RPC || 'https://evmrpc-testnet.0g.ai',
    indRpc: process.env.NEXT_PUBLIC_ZG_STORAGE_IND_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
    apiKey: process.env.NEXT_PUBLIC_ZG_STORAGE_API_KEY,
    timeout: 30000,
  },
  privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY,
  da: {
    endpoint: process.env.NEXT_PUBLIC_ZG_DA_ENDPOINT || 'https://da-testnet.0g.ai',
    evmRpc: process.env.NEXT_PUBLIC_ZG_DA_EVM_RPC || 'https://evmrpc-testnet.0g.ai',
    indRpc: process.env.NEXT_PUBLIC_ZG_DA_IND_RPC || 'https://indexer-da-testnet-turbo.0g.ai',
    entranceContract: process.env.NEXT_PUBLIC_ZG_DA_ENTRANCE || '0x0000000000000000000000000000000000001000',
    apiKey: process.env.NEXT_PUBLIC_ZG_DA_API_KEY,
    timeout: 30000,
  },
  chain: {
    rpcUrl: process.env.NEXT_PUBLIC_ZG_CHAIN_RPC || 'https://rpc-testnet.0g.ai',
    chainId: parseInt(process.env.NEXT_PUBLIC_ZG_CHAIN_ID || '16600'),
    explorerUrl: process.env.NEXT_PUBLIC_ZG_EXPLORER_URL || 'https://explorer-testnet.0g.ai',
    contractAddresses: {
      // These will be populated with actual contract addresses from 0G docs
      workflowRegistry: process.env.NEXT_PUBLIC_WORKFLOW_REGISTRY_CONTRACT || '',
      aiCompute: process.env.NEXT_PUBLIC_AI_COMPUTE_CONTRACT || '',
      storage: process.env.NEXT_PUBLIC_STORAGE_CONTRACT || '',
    },
  },
};

// Network status types
export type NetworkStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface NetworkStatusInfo {
  compute: NetworkStatus;
  storage: NetworkStatus;
  da: NetworkStatus;
  chain: NetworkStatus;
}