import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import { ZGNetworkConfig } from '@/types/workflow';

export class ComputeService {
  private broker: any; // TODO: Add proper type from SDK
  private acknowledgedProviders: Set<string> = new Set();

  constructor(private config: ZGNetworkConfig) {}

  async initialize(privateKey: string) {
    const provider = new ethers.JsonRpcProvider(this.config.chain.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    this.broker = await createZGComputeNetworkBroker(wallet);
    
    // Check balance
    const account = await this.broker.ledger.getLedger();
    console.log(`Balance: ${ethers.formatEther(account.totalbalance)} OG`);
  }

  async listAvailableServices() {
    return await this.broker.inference.listService();
  }

  async executeInference(params: {
    providerAddress: string;
    model: string;
    messages: { role: string; content: string }[];
  }) {
    try {
      // Ensure provider is acknowledged
      if (!this.acknowledgedProviders.has(params.providerAddress)) {
        await this.broker.inference.acknowledgeProviderSigner(params.providerAddress);
        this.acknowledgedProviders.add(params.providerAddress);
      }

      // Get service metadata
      const { endpoint, model } = await this.broker.inference.getServiceMetadata(params.providerAddress);

      // Generate request headers
      const content = JSON.stringify({
        messages: params.messages,
        model: params.model,
      });
      const headers = await this.broker.inference.getRequestHeaders(params.providerAddress, content);

      // Send request
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: content,
      });

      const data = await response.json();

      // Verify response
      const isValid = await this.broker.inference.processResponse(
        params.providerAddress,
        data
      );

      if (!isValid) {
        throw new Error('Invalid response from provider');
      }

      return {
        success: true,
        result: data.choices[0].message.content,
        raw: data,
      };
    } catch (error) {
      console.error('Inference execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkBalance() {
    const ledger = await this.broker.ledger.getLedger();
    return {
      total: ethers.formatEther(ledger.balance),
      locked: ethers.formatEther(ledger.locked),
      available: ethers.formatEther(ledger.balance - ledger.locked),
    };
  }

  async addFunds(amount: string) {
    return await this.broker.ledger.addLedger(amount);
  }

  async withdrawFunds(amount: string) {
    return await this.broker.ledger.retrieveFund('inference', amount);
  }
}