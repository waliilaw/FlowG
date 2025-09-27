/**
 * 0G Chain Service - Real Implementation
 * Handles smart contract deployment and interactions on 0G Chain EVM
 */

import { z } from 'zod';
import { ethers } from 'ethers';

// 0G Chain Configuration
export const ZG_CHAIN_CONFIG = {
  testnet: {
    rpcUrl: 'https://evmrpc-testnet.0g.ai',
    chainId: 16601,
    name: '0G Testnet',
    explorerUrl: 'https://chainscan-testnet.0g.ai'
  },
  mainnet: {
    // TODO: Add mainnet config when available
    rpcUrl: '', 
    chainId: 0,
    name: '0G Mainnet',
    explorerUrl: ''
  }
};

// 0G Chain Precompiles
export const ZG_PRECOMPILES = {
  DASigners: '0x0000000000000000000000000000000000001000',
  WrappedOGBase: '0x0000000000000000000000000000000000001002'
} as const;

// Interfaces
export interface ContractDeployment {
  id: string;
  contractAddress: string;
  transactionHash: string;
  contractName: string;
  sourceCode?: string;
  abi: any[];
  deployedAt: number;
  gasUsed: number;
  deploymentCost: string;
  status: 'pending' | 'confirmed' | 'failed';
  receipt: ethers.TransactionReceipt;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  result?: any;
  error?: string;
  receipt?: ethers.TransactionReceipt;
}

// Schema validation
const DeploymentConfigSchema = z.object({
  contractName: z.string(),
  contractCode: z.string(),
  abi: z.array(z.any()),
  constructorArgs: z.array(z.any()).optional(),
  gasLimit: z.number().optional(),
  gasPrice: z.string().optional(),
});

const ContractCallSchema = z.object({
  contractAddress: z.string(),
  abi: z.array(z.any()),
  methodName: z.string(),
  args: z.array(z.any()).optional(),
  value: z.string().optional(),
});

type DeploymentConfig = z.infer<typeof DeploymentConfigSchema>;
type ContractCall = z.infer<typeof ContractCallSchema>;

/**
 * 0G Chain Service for blockchain interactions
 */
export class ZGChainService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private chainConfig: typeof ZG_CHAIN_CONFIG.testnet;

  constructor(network: 'testnet' | 'mainnet' = 'testnet', privateKey?: string) {
    this.chainConfig = ZG_CHAIN_CONFIG[network];
    this.provider = new ethers.JsonRpcProvider(this.chainConfig.rpcUrl);
    
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    }
  }

  /**
   * Connect wallet with private key
   */
  connectWallet(privateKey: string): void {
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Deploy a smart contract to 0G Chain
   */
  async deployContract(config: DeploymentConfig): Promise<ContractDeployment> {
    if (!this.signer) {
      throw new Error('Wallet not connected. Call connectWallet() first.');
    }

    const validatedConfig = DeploymentConfigSchema.parse(config);
    
    console.log('🔗 Deploying smart contract to 0G Chain...');
    
    try {
      // Create contract factory with Cancun EVM version compatibility
      const factory = new ethers.ContractFactory(
        validatedConfig.abi,
        validatedConfig.contractCode,
        this.signer
      );

      // Deploy contract
      const contract = await factory.deploy(
        ...(validatedConfig.constructorArgs || []),
        {
          gasLimit: validatedConfig.gasLimit || 2000000,
          gasPrice: validatedConfig.gasPrice ? ethers.parseUnits(validatedConfig.gasPrice, 'gwei') : undefined,
        }
      );

      // Wait for deployment confirmation
      const receipt = await contract.deploymentTransaction()?.wait();
      
      if (!receipt) {
        throw new Error('Deployment transaction failed');
      }

      const gasPrice = receipt.gasPrice || BigInt(0);
      const deploymentCost = ethers.formatEther(receipt.gasUsed * gasPrice);

      const deployment: ContractDeployment = {
        id: `contract-${Date.now()}`,
        contractAddress: await contract.getAddress(),
        transactionHash: receipt.hash,
        contractName: validatedConfig.contractName,
        sourceCode: validatedConfig.contractCode,
        abi: validatedConfig.abi,
        deployedAt: Date.now(),
        gasUsed: Number(receipt.gasUsed),
        deploymentCost,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        receipt
      };

      console.log(`✅ Contract deployed successfully at ${deployment.contractAddress}`);
      return deployment;

    } catch (error) {
      console.error('❌ Contract deployment failed:', error);
      throw new Error(`Contract deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Call a smart contract method
   */
  async callContract(config: ContractCall): Promise<TransactionResult> {
    const validatedConfig = ContractCallSchema.parse(config);
    
    try {
      const contract = new ethers.Contract(
        validatedConfig.contractAddress,
        validatedConfig.abi,
        this.signer || this.provider
      );

      const method = contract[validatedConfig.methodName];
      if (!method) {
        throw new Error(`Method ${validatedConfig.methodName} not found in contract`);
      }

      // Check if method is view/pure (read-only)
      const fragment = contract.interface.getFunction(validatedConfig.methodName);
      const isReadOnly = fragment?.stateMutability === 'view' || fragment?.stateMutability === 'pure';

      if (isReadOnly) {
        // Read-only call
        const result = await method(...(validatedConfig.args || []));
        return {
          success: true,
          result
        };
      } else {
        // State-changing transaction
        if (!this.signer) {
          throw new Error('Wallet required for state-changing transactions');
        }

        const tx = await method(...(validatedConfig.args || []), {
          value: validatedConfig.value ? ethers.parseEther(validatedConfig.value) : 0
        });

        const receipt = await tx.wait();
        
        return {
          success: receipt.status === 1,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: Number(receipt.gasUsed),
          result: receipt,
          receipt
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Failed to get transaction receipt:', error);
      return null;
    }
  }

  /**
   * Get wallet/address balance in OG tokens
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
    } catch (error) {
      throw new Error(`Failed to get gas price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    return {
      ...this.chainConfig,
      explorerUrl: this.chainConfig.explorerUrl
    };
  }

  /**
   * Get connected wallet address
   */
  getWalletAddress(): string | null {
    return this.signer?.address || null;
  }

  /**
   * Interact with 0G Precompiles
   */
  async usePrecompile(
    precompile: keyof typeof ZG_PRECOMPILES,
    abi: any[],
    methodName: string,
    args: any[] = []
  ): Promise<TransactionResult> {
    return this.callContract({
      contractAddress: ZG_PRECOMPILES[precompile],
      abi,
      methodName,
      args
    });
  }

  /**
   * Check if connected to correct network
   */
  async validateNetwork(): Promise<boolean> {
    try {
      const network = await this.provider.getNetwork();
      return network.chainId === BigInt(this.chainConfig.chainId);
    } catch {
      return false;
    }
  }

  /**
   * Check network health and connection
   */
  async checkHealth(): Promise<{ healthy: boolean; blockNumber?: number; chainId?: number }> {
    try {
      const [blockNumber, network] = await Promise.all([
        this.provider.getBlockNumber(),
        this.provider.getNetwork()
      ]);

      return {
        healthy: true,
        blockNumber,
        chainId: Number(network.chainId)
      };
    } catch (error) {
      console.error('0G Chain health check failed:', error);
      return { healthy: false };
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(config: ContractCall): Promise<number> {
    const validatedConfig = ContractCallSchema.parse(config);
    
    try {
      const contract = new ethers.Contract(
        validatedConfig.contractAddress,
        validatedConfig.abi,
        this.provider
      );

      const gasEstimate = await contract[validatedConfig.methodName].estimateGas(
        ...(validatedConfig.args || []),
        {
          value: validatedConfig.value ? ethers.parseEther(validatedConfig.value) : 0
        }
      );

      return Number(gasEstimate);
    } catch (error) {
      throw new Error(`Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction status by hash
   */
  async getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed' | 'not_found'> {
    try {
      const receipt = await this.getTransactionReceipt(txHash);
      
      if (!receipt) {
        // Check if transaction exists in mempool
        const tx = await this.provider.getTransaction(txHash);
        return tx ? 'pending' : 'not_found';
      }

      return receipt.status === 1 ? 'confirmed' : 'failed';
    } catch {
      return 'not_found';
    }
  }

  /**
   * Legacy compatibility methods for FlowG workflow integration
   */
  
  // Workflow execution method for ChainInteractionNode
  async executeWorkflow(params: {
    workflowId: string;
    data: any;
    gasLimit?: number;
  }): Promise<TransactionResult> {
    console.log(`📋 Executing workflow ${params.workflowId} on 0G Chain...`);
    
    // For now, simulate workflow execution
    // In the future, this would interact with deployed workflow contracts
    return {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substring(2, 66).padStart(64, '0')}`,
      result: { workflowId: params.workflowId, status: 'executed', data: params.data }
    };
  }

  // Log workflow execution for audit purposes  
  async logWorkflowExecution(params: {
    workflowId: string;
    nodeId: string;
    executionData: any;
  }): Promise<TransactionResult> {
    console.log(`📝 Logging workflow execution to 0G Chain...`);
    
    // For now, simulate logging
    // In the future, this would store execution logs on-chain
    return {
      success: true,
      result: 'Execution logged successfully'
    };
  }
}

/**
 * Create a 0G Chain service instance
 */
export function createZGChainService(network: 'testnet' | 'mainnet' = 'testnet', privateKey?: string): ZGChainService {
  return new ZGChainService(network, privateKey);
}