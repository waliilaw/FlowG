import type { WorkflowVersion } from '@/lib/0g/da-service';
import type { WorkflowNode } from '@/types/workflow';
import { ChainService } from './0g/chain-service';

export class WorkflowDeployer {
  private chainService: ChainService;
  
  constructor() {
    this.chainService = new ChainService({
      network: 'testnet',
      privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY || '',
      rpcUrl: 'https://evmrpc-testnet.0g.ai'
    });
  }

  async initialize(): Promise<void> {
    await this.chainService.initialize();
  }

  async deployToTestnet(workflow: WorkflowVersion & { nodes: WorkflowNode[] }): Promise<string> {
    try {
      // 1. Generate smart contract for workflow
      const contract = await this.generateWorkflowContract(workflow);
      
      // 2. Deploy contract to testnet
      const deployment = await this.chainService.deployContract({
        abi: contract.abi,
        bytecode: contract.bytecode,
        args: [workflow.id],
        evmVersion: 'cancun'
      });

      if (!deployment.success || !deployment.contractAddress) {
        throw new Error(deployment.error || 'Failed to deploy workflow contract');
      }

      // 3. Register workflow version on chain
      const result = await this.chainService.callContract({
        contractAddress: deployment.contractAddress,
        abi: contract.abi,
        method: 'registerVersion',
        args: [
          workflow.version,
          workflow.hash,
          workflow.timestamp
        ]
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to register workflow version');
      }

      return deployment.contractAddress;
    } catch (error) {
      console.error('Failed to deploy workflow to testnet:', error);
      throw error;
    }
  }

  private async generateWorkflowContract(workflow: WorkflowVersion & { nodes: WorkflowNode[] }) {
    // Define contract interface
    const contractInterface: { abi: any[], bytecode: string } = {
      abi: [
        {
          inputs: [{ name: 'id', type: 'string' }],
          stateMutability: 'nonpayable',
          type: 'constructor'
        },
        {
          inputs: [
            { name: 'version', type: 'uint256' },
            { name: 'hash', type: 'bytes32' },
            { name: 'timestamp', type: 'uint256' }
          ],
          name: 'registerVersion',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function'
        },
        {
          inputs: [{ name: 'version', type: 'string' }],
          name: 'executeWorkflow',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function'
        },
        {
          anonymous: false,
          inputs: [
            { indexed: false, name: 'version', type: 'string' },
            { indexed: false, name: 'timestamp', type: 'uint256' }
          ],
          name: 'WorkflowExecuted',
          type: 'event'
        },
        {
          anonymous: false,
          inputs: [
            { indexed: false, name: 'nodeIndex', type: 'uint256' },
            { indexed: false, name: 'nodeType', type: 'string' },
            { indexed: false, name: 'timestamp', type: 'uint256' }
          ],
          name: 'NodeExecuted',
          type: 'event'
        }
      ],
      
      // Contract bytecode with workflow-specific node execution
      bytecode: `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.19;

        contract Workflow {
          string public workflowId;
          string public currentVersion;
          uint public lastExecuted;
          
          event WorkflowExecuted(string version, uint timestamp);
          event NodeExecuted(uint nodeIndex, string nodeType, uint timestamp);
          
          constructor(string memory _workflowId) {
            workflowId = _workflowId;
          }
          
          function executeWorkflow(string memory version) public {
            currentVersion = version;
            lastExecuted = block.timestamp;
            
            emit WorkflowExecuted(version, block.timestamp);
            
            // Execute nodes in sequence
            ${workflow.nodes.map((node, index) => `
              // Execute ${node.type} node
              emit NodeExecuted(${index}, "${node.type}", block.timestamp);
            `).join('\n')}
          }
        }
      `
    };

    return contractInterface;
  }
}