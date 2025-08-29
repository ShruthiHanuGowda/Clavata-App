import { ethers } from 'ethers';
import { CUSTOM_RPC_URL, SEPOLIA_RPC_URL } from '../../constants';

export type NetworkConfig = {
  name: string;
  rpcUrl: string;
  chainId: number;
  blockExplorer?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
};

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  denergy: {
    name: 'Denergy Network',
    rpcUrl: CUSTOM_RPC_URL,
    chainId: 1, // Update with actual chain ID
    nativeCurrency: {
      name: 'WATT',
      symbol: 'WATT',
      decimals: 18,
    },
  },
  sepolia: {
    name: 'Sepolia Testnet',
    rpcUrl: SEPOLIA_RPC_URL,
    chainId: 11155111,
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

class NetworkProvider {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();
  private networkConfigs: Map<string, NetworkConfig> = new Map();

  constructor() {
    this.initializeNetworks();
  }

  private initializeNetworks(): void {
    Object.entries(NETWORK_CONFIGS).forEach(([key, config]) => {
      this.networkConfigs.set(key, config);
      this.providers.set(key, new ethers.JsonRpcProvider(config.rpcUrl));
    });
  }

  getProvider(networkName: string): ethers.JsonRpcProvider {
    const provider = this.providers.get(networkName);
    if (!provider) {
      throw new Error(`No provider found for network: ${networkName}`);
    }
    return provider;
  }

  getNetworkConfig(networkName: string): NetworkConfig {
    const config = this.networkConfigs.get(networkName);
    if (!config) {
      throw new Error(`No config found for network: ${networkName}`);
    }
    return config;
  }

  getSupportedNetworks(): string[] {
    return Array.from(this.networkConfigs.keys());
  }

  async getChainId(networkName: string): Promise<number> {
    const provider = this.getProvider(networkName);
    const network = await provider.getNetwork();
    return Number(network.chainId);
  }

  async getBlockNumber(networkName: string): Promise<number> {
    const provider = this.getProvider(networkName);
    return await provider.getBlockNumber();
  }

  async getGasPrice(networkName: string): Promise<bigint> {
    const provider = this.getProvider(networkName);
    const feeData = await provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  async estimateGas(
    networkName: string,
    transaction: ethers.TransactionRequest
  ): Promise<bigint> {
    const provider = this.getProvider(networkName);
    return await provider.estimateGas(transaction);
  }

  isNetworkSupported(networkName: string): boolean {
    return this.networkConfigs.has(networkName);
  }

  refreshProvider(networkName: string): void {
    if (!this.isNetworkSupported(networkName)) {
      throw new Error(`Unsupported network: ${networkName}`);
    }
    
    const config = this.getNetworkConfig(networkName);
    this.providers.set(networkName, new ethers.JsonRpcProvider(config.rpcUrl));
  }

  async checkNetworkConnection(networkName: string): Promise<boolean> {
    try {
      const provider = this.getProvider(networkName);
      await provider.getBlockNumber();
      return true;
    } catch (error) {
      console.error(`Network ${networkName} connection failed:`, error);
      return false;
    }
  }
}

export const networkProvider = new NetworkProvider();
export default networkProvider;