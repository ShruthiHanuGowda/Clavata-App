import { ethers } from 'ethers';
import { CUSTOM_RPC_URL, SEPOLIA_RPC_URL, CUSTOM_NETWORK } from '../../constants';

export type NetworkType = 'denergy' | 'sepolia';

export interface BlockchainProvider {
  provider: ethers.JsonRpcProvider;
  network: NetworkType;
  chainId: number;
}

export interface ContractConfig {
  address: string;
  abi: any;
  network: NetworkType;
}

export interface TransactionOptions {
  gasLimit?: bigint;
  gasPrice?: bigint;
  value?: bigint;
}

export interface WalletBalance {
  balance: string;
  balanceUsd: string;
}

export interface TokenInfo {
  symbol: string;
  decimals: number;
  address: string;
  network: NetworkType;
}

class BlockchainService {
  private providers: Map<NetworkType, ethers.JsonRpcProvider> = new Map();
  private contracts: Map<string, ethers.Contract> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    this.providers.set('denergy', new ethers.JsonRpcProvider(CUSTOM_RPC_URL));
    this.providers.set('sepolia', new ethers.JsonRpcProvider(SEPOLIA_RPC_URL));
  }

  getProvider(network: NetworkType): ethers.JsonRpcProvider {
    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`Provider not found for network: ${network}`);
    }
    return provider;
  }

  getContract(config: ContractConfig, signer?: ethers.Signer): ethers.Contract {
    const key = `${config.network}-${config.address}`;

    if (!this.contracts.has(key)) {
      const provider = this.getProvider(config.network);
      const contract = new ethers.Contract(
        config.address,
        config.abi,
        signer || provider
      );
      this.contracts.set(key, contract);
    }

    return this.contracts.get(key)!;
  }

  async getNativeBalance(address: string, network: NetworkType): Promise<string> {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address format');
    }

    const provider = this.getProvider(network);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(
    tokenAddress: string,
    walletAddress: string,
    network: NetworkType,
    abi: any,
    decimals: number = 18
  ): Promise<string> {
    if (!ethers.isAddress(walletAddress) || !ethers.isAddress(tokenAddress)) {
      throw new Error('Invalid address format');
    }

    const contract = this.getContract({
      address: tokenAddress,
      abi,
      network,
    });

    const balance = await contract.balanceOf(walletAddress);
    return ethers.formatUnits(balance, decimals);
  }

  async estimateGas(
    contract: ethers.Contract,
    method: string,
    params: any[]
  ): Promise<bigint> {
    return await contract[method].estimateGas(...params);
  }

  async sendTransaction(
    contract: ethers.Contract,
    method: string,
    params: any[],
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    const tx = await contract[method](...params, options);
    return tx;
  }

  async waitForTransaction(
    txHash: string,
    network: NetworkType,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt | null> {
    const provider = this.getProvider(network);
    return await provider.waitForTransaction(txHash, confirmations);
  }

  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  formatEther(value: bigint): string {
    return ethers.formatEther(value);
  }

  formatUnits(value: bigint, decimals: number): string {
    return ethers.formatUnits(value, decimals);
  }

  parseEther(value: string): bigint {
    return ethers.parseEther(value);
  }

  parseUnits(value: string, decimals: number): bigint {
    return ethers.parseUnits(value, decimals);
  }

  clearCache(): void {
    this.contracts.clear();
  }
}

export const blockchainService = new BlockchainService();
export default blockchainService;
