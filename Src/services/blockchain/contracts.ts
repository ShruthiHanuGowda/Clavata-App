import { ethers } from 'ethers';
import { networkProvider } from './providers';
import {
  ERC20_ABI,
  BRIDGE_ABI,
  DEPOSIT_TOKEN_ABI,
  ERC1155_ABI,
  NFT_MARKETPLACE_ABI,
  STAKING_CONTRACT_ABI,
  STAKING_WATT_ABI,
} from '../../utils/Contracts';
import { TOKEN_CONTRACTS } from '../../constants';

export interface ContractInterface {
  address: string;
  abi: any;
  network: string;
}

export interface ContractCall {
  method: string;
  params: any[];
  options?: ethers.Overrides;
}

export type ContractType = 
  | 'ERC20'
  | 'ERC1155'
  | 'NFTMarketplace'
  | 'Bridge'
  | 'DepositToken'
  | 'Staking'
  | 'StakingWatt';

export const CONTRACT_ABIS: Record<ContractType, any> = {
  ERC20: ERC20_ABI,
  ERC1155: ERC1155_ABI,
  NFTMarketplace: NFT_MARKETPLACE_ABI,
  Bridge: BRIDGE_ABI,
  DepositToken: DEPOSIT_TOKEN_ABI,
  Staking: STAKING_CONTRACT_ABI,
  StakingWatt: STAKING_WATT_ABI,
};

class ContractManager {
  private contracts: Map<string, ethers.Contract> = new Map();

  private generateContractKey(address: string, network: string): string {
    return `${network}-${address.toLowerCase()}`;
  }

  getContract(
    address: string,
    abi: any,
    network: string,
    signer?: ethers.Signer
  ): ethers.Contract {
    const key = this.generateContractKey(address, network);
    
    if (!this.contracts.has(key)) {
      const provider = networkProvider.getProvider(network);
      const providerOrSigner = signer || provider;
      const contract = new ethers.Contract(address, abi, providerOrSigner);
      this.contracts.set(key, contract);
    }

    return this.contracts.get(key)!;
  }

  getContractByType(
    contractType: ContractType,
    address: string,
    network: string,
    signer?: ethers.Signer
  ): ethers.Contract {
    const abi = CONTRACT_ABIS[contractType];
    if (!abi) {
      throw new Error(`ABI not found for contract type: ${contractType}`);
    }
    
    return this.getContract(address, abi, network, signer);
  }

  getERC20Contract(address: string, network: string, signer?: ethers.Signer): ethers.Contract {
    return this.getContractByType('ERC20', address, network, signer);
  }

  getNFTMarketplaceContract(network: string, signer?: ethers.Signer): ethers.Contract {
    const address = TOKEN_CONTRACTS.nftMarket;
    if (!address) {
      throw new Error('NFT Marketplace contract address not configured');
    }
    return this.getContractByType('NFTMarketplace', address, network, signer);
  }

  getERC1155Contract(address: string, network: string, signer?: ethers.Signer): ethers.Contract {
    return this.getContractByType('ERC1155', address, network, signer);
  }

  getBridgeContract(network: string, signer?: ethers.Signer): ethers.Contract {
    const address = (TOKEN_CONTRACTS as any)[network]?.BRIDGE;
    if (!address) {
      throw new Error(`Bridge contract address not found for network: ${network}`);
    }
    return this.getContractByType('Bridge', address, network, signer);
  }

  getStakingContract(network: string, signer?: ethers.Signer): ethers.Contract {
    const address = (TOKEN_CONTRACTS as any)[network]?.STAKING;
    if (!address) {
      throw new Error(`Staking contract address not found for network: ${network}`);
    }
    return this.getContractByType('Staking', address, network, signer);
  }

  async callContract(
    contract: ethers.Contract,
    call: ContractCall
  ): Promise<any> {
    try {
      const result = await contract[call.method](...call.params, call.options);
      return result;
    } catch (error) {
      console.error(`Contract call failed for ${call.method}:`, error);
      throw error;
    }
  }

  async estimateGas(
    contract: ethers.Contract,
    call: ContractCall
  ): Promise<bigint> {
    try {
      const gasEstimate = await contract[call.method].estimateGas(
        ...call.params,
        call.options
      );
      return gasEstimate;
    } catch (error) {
      console.error(`Gas estimation failed for ${call.method}:`, error);
      throw error;
    }
  }

  async sendTransaction(
    contract: ethers.Contract,
    call: ContractCall
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const tx = await contract[call.method](...call.params, call.options);
      return tx;
    } catch (error) {
      console.error(`Transaction failed for ${call.method}:`, error);
      throw error;
    }
  }

  async batchCall(
    calls: Array<{
      contract: ethers.Contract;
      call: ContractCall;
    }>
  ): Promise<any[]> {
    const promises = calls.map(({ contract, call }) =>
      this.callContract(contract, call)
    );
    
    return await Promise.allSettled(promises);
  }

  clearCache(): void {
    this.contracts.clear();
  }

  removeContract(address: string, network: string): void {
    const key = this.generateContractKey(address, network);
    this.contracts.delete(key);
  }

  hasContract(address: string, network: string): boolean {
    const key = this.generateContractKey(address, network);
    return this.contracts.has(key);
  }

  getContractsByNetwork(network: string): ethers.Contract[] {
    const networkContracts: ethers.Contract[] = [];
    
    for (const [key, contract] of this.contracts.entries()) {
      if (key.startsWith(`${network}-`)) {
        networkContracts.push(contract);
      }
    }
    
    return networkContracts;
  }

  async validateContract(address: string, network: string): Promise<boolean> {
    try {
      const provider = networkProvider.getProvider(network);
      const code = await provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.error(`Contract validation failed for ${address}:`, error);
      return false;
    }
  }
}

export const contractManager = new ContractManager();
export default contractManager;