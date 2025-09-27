import { ethers } from 'ethers';

export interface ChainServiceConfig {
  network: 'mainnet' | 'testnet';
  privateKey: string;
  rpcUrl?: string;
}

export interface ChainDeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
  metadata?: {
    blockNumber: number;
    timestamp: number;
    gasUsed: bigint;
    [key: string]: any;
  };
}

export interface ContractCallResult {
  success: boolean;
  result?: any;
  transactionHash?: string;
  error?: string;
}

export class ChainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private readonly defaultRpcUrls = {
    mainnet: 'https://evmrpc.0g.ai',
    testnet: 'https://evmrpc-testnet.0g.ai'
  };
  private readonly chainIds = {
    mainnet: 16600,
    testnet: 16601
  };
  private readonly precompiles = {
    DASigners: '0x0000000000000000000000000000000000001000',
    WrappedOGBase: '0x0000000000000000000000000000000000001002'
  };

  constructor(config: ChainServiceConfig) {
    const rpcUrl = config.rpcUrl || this.defaultRpcUrls[config.network];
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
  }

  async initialize(): Promise<void> {
    try {
      // Verify connection and chain ID
      const network = await this.provider.getNetwork();
      const networkName = (network.name || 'testnet') as 'mainnet' | 'testnet';
      const expectedChainId = this.chainIds[networkName];
      
      if (network.chainId.toString() !== expectedChainId.toString()) {
        throw new Error(`Wrong chain ID. Expected ${expectedChainId}, got ${network.chainId}`);
      }

      // Verify account has funds
      const balance = await this.provider.getBalance(this.wallet.address);
      if (balance.toString() === '0') {
        throw new Error('Account has no funds. Get testnet OG tokens from faucet.');
      }
    } catch (error) {
      throw new Error(`Failed to initialize ChainService: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deployContract(params: {
    abi: any[];
    bytecode: string;
    args?: any[];
    evmVersion?: string;
  }): Promise<ChainDeploymentResult> {
    try {
      // Create contract factory
      const factory = new ethers.ContractFactory(
        params.abi,
        params.bytecode,
        this.wallet
      );

      // Deploy with constructor arguments if provided
      const contract = await factory.deploy(...(params.args || []), {
        gasLimit: 2000000 // Default gas limit, can be adjusted
      });

      // Wait for deployment and get receipt
      const receipt = await contract.deploymentTransaction()?.wait();
      if (!receipt) throw new Error('No deployment receipt');

      return {
        success: true,
        contractAddress: await contract.getAddress(),
        transactionHash: receipt.hash,
        metadata: {
          blockNumber: receipt.blockNumber,
          timestamp: Date.now(),
          gasUsed: receipt.gasUsed,
          evmVersion: params.evmVersion || 'cancun'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async callContract(params: {
    contractAddress: string;
    abi: any[];
    method: string;
    args?: any[];
    value?: bigint;
  }): Promise<ContractCallResult> {
    try {
      const contract = new ethers.Contract(
        params.contractAddress,
        params.abi,
        this.wallet
      );

      // Call the contract method
      const tx = await contract[params.method](...(params.args || []), {
        value: params.value || BigInt(0)
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      return {
        success: true,
        result: tx,
        transactionHash: receipt.hash
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getDASignerContract() {
    // Get the DASigners precompile interface
    const abi = [
      'function submitSignature(bytes32 hash, bytes signature) external',
      'function verifySignature(bytes32 hash, bytes signature, address signer) external view returns (bool)',
      'function isDANode(address node) external view returns (bool)',
      'function getDANodes() external view returns (address[])'
    ] as const;
    return new ethers.Contract(this.precompiles.DASigners, abi, this.wallet);
  }

  async getWrappedOGContract() {
    // Get the WrappedOGBase precompile interface
    const abi = [
      'function deposit() external payable',
      'function withdraw(uint256 amount) external',
      'function balanceOf(address account) external view returns (uint256)',
      'function transfer(address to, uint256 amount) external returns (bool)'
    ] as const;
    return new ethers.Contract(this.precompiles.WrappedOGBase, abi, this.wallet);
  }

  async checkHealth(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const [network, blockNumber, gasPrice] = await Promise.all([
        this.provider.getNetwork(),
        this.provider.getBlockNumber(),
        this.provider.getFeeData(),
      ]);

      return {
        healthy: true,
        details: {
          network: network.name,
          chainId: network.chainId,
          blockNumber,
          gasPrice: gasPrice.gasPrice?.toString()
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