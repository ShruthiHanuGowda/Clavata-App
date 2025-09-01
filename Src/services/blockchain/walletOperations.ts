import { ethers } from 'ethers';
import { networkProvider } from './providers';
import { contractManager } from './contracts';

export interface TokenBalance {
  balance: string;
  balanceUsd: string;
  decimals: number;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  network: string;
  decimals: number;
}

export interface TransactionParams {
  to: string;
  amount: string;
  tokenAddress?: string;
  network: string;
  gasLimit?: bigint;
  gasPrice?: bigint;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  receipt?: ethers.TransactionReceipt;
  error?: string;
}

class WalletOperations {
  async getNativeBalance(address: string, network: string): Promise<string> {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid wallet address');
    }

    const provider = networkProvider.getProvider(network);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(
    tokenAddress: string,
    walletAddress: string,
    network: string,
    decimals: number = 18
  ): Promise<string> {
    if (!ethers.isAddress(walletAddress) || !ethers.isAddress(tokenAddress)) {
      throw new Error('Invalid address provided');
    }

    const contract = contractManager.getERC20Contract(tokenAddress, network);
    const balance = await contract.balanceOf(walletAddress);
    return ethers.formatUnits(balance, decimals);
  }

  async getMultipleTokenBalances(
    walletAddress: string,
    tokens: TokenInfo[],
    exchangeRates?: Record<string, number>
  ): Promise<Record<string, TokenBalance>> {
    const balances: Record<string, TokenBalance> = {};

    const balancePromises = tokens.map(async (token) => {
      try {
        let balance: string;

        if (token.address === 'native') {
          balance = await this.getNativeBalance(walletAddress, token.network);
        } else {
          balance = await this.getTokenBalance(
            token.address,
            walletAddress,
            token.network,
            token.decimals
          );
        }

        const balanceUsd = exchangeRates?.[token.symbol]
          ? (parseFloat(balance) * exchangeRates[token.symbol]).toFixed(2)
          : '0';

        balances[token.symbol] = {
          balance,
          balanceUsd,
          decimals: token.decimals,
        };
      } catch (error) {
        console.error(`Error fetching balance for ${token.symbol}:`, error);
        balances[token.symbol] = {
          balance: '0',
          balanceUsd: '0',
          decimals: token.decimals,
        };
      }
    });

    await Promise.allSettled(balancePromises);
    return balances;
  }

  async sendNativeToken(
    params: TransactionParams,
    signer: ethers.Signer
  ): Promise<TransactionResult> {
    try {
      const provider = networkProvider.getProvider(params.network);

      const transaction: ethers.TransactionRequest = {
        to: params.to,
        value: ethers.parseEther(params.amount),
        gasLimit: params.gasLimit,
        gasPrice: params.gasPrice,
      };

      if (!params.gasLimit) {
        transaction.gasLimit = await provider.estimateGas(transaction);
      }

      const tx = await signer.sendTransaction(transaction);

      return {
        hash: tx.hash,
        status: 'pending',
      };
    } catch (error: any) {
      return {
        hash: '',
        status: 'failed',
        error: error.message || 'Transaction failed',
      };
    }
  }

  async sendToken(
    params: TransactionParams,
    signer: ethers.Signer,
    decimals: number = 18
  ): Promise<TransactionResult> {
    if (!params.tokenAddress) {
      throw new Error('Token address is required for token transfers');
    }

    try {
      const contract = contractManager.getERC20Contract(
        params.tokenAddress,
        params.network,
        signer
      );

      const amount = ethers.parseUnits(params.amount, decimals);

      let gasLimit = params.gasLimit;
      if (!gasLimit) {
        gasLimit = await contract.transfer.estimateGas(params.to, amount);
      }

      const tx = await contract.transfer(params.to, amount, {
        gasLimit,
        gasPrice: params.gasPrice,
      });

      return {
        hash: tx.hash,
        status: 'pending',
      };
    } catch (error: any) {
      return {
        hash: '',
        status: 'failed',
        error: error.message || 'Token transfer failed',
      };
    }
  }

  async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    network: string,
    signer: ethers.Signer,
    decimals: number = 18
  ): Promise<TransactionResult> {
    try {
      const contract = contractManager.getERC20Contract(tokenAddress, network, signer);
      const approvalAmount = ethers.parseUnits(amount, decimals);

      const tx = await contract.approve(spenderAddress, approvalAmount);

      return {
        hash: tx.hash,
        status: 'pending',
      };
    } catch (error: any) {
      return {
        hash: '',
        status: 'failed',
        error: error.message || 'Approval failed',
      };
    }
  }

  async getAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    network: string,
    decimals: number = 18
  ): Promise<string> {
    const contract = contractManager.getERC20Contract(tokenAddress, network);
    const allowance = await contract.allowance(ownerAddress, spenderAddress);
    return ethers.formatUnits(allowance, decimals);
  }

  async waitForTransaction(
    txHash: string,
    network: string,
    confirmations: number = 1
  ): Promise<TransactionResult> {
    try {
      const provider = networkProvider.getProvider(network);
      const receipt = await provider.waitForTransaction(txHash, confirmations);

      if (receipt && receipt.status === 1) {
        return {
          hash: txHash,
          status: 'confirmed',
          receipt,
        };
      } else {
        return {
          hash: txHash,
          status: 'failed',
          receipt: receipt || undefined,
          error: 'Transaction failed',
        };
      }
    } catch (error: any) {
      return {
        hash: txHash,
        status: 'failed',
        error: error.message || 'Transaction confirmation failed',
      };
    }
  }

  async getTransactionStatus(txHash: string, network: string): Promise<TransactionResult> {
    try {
      const provider = networkProvider.getProvider(network);
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return {
          hash: txHash,
          status: 'pending',
        };
      }

      return {
        hash: txHash,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        receipt,
      };
    } catch (error: any) {
      return {
        hash: txHash,
        status: 'failed',
        error: error.message || 'Failed to get transaction status',
      };
    }
  }

  async estimateTransactionCost(
    params: TransactionParams,
    signer?: ethers.Signer
  ): Promise<{ gasLimit: bigint; gasPrice: bigint; totalCost: string }> {
    const provider = networkProvider.getProvider(params.network);

    let gasLimit: bigint;
    if (params.tokenAddress) {
      const contract = contractManager.getERC20Contract(
        params.tokenAddress,
        params.network,
        signer
      );
      const amount = ethers.parseUnits(params.amount, 18); // Assuming 18 decimals
      gasLimit = await contract.transfer.estimateGas(params.to, amount);
    } else {
      gasLimit = await provider.estimateGas({
        to: params.to,
        value: ethers.parseEther(params.amount),
      });
    }

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);

    const totalCost = ethers.formatEther(gasLimit * gasPrice);

    return { gasLimit, gasPrice, totalCost };
  }

  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  formatBalance(balance: string, decimals: number = 18): string {
    const num = parseFloat(balance);
    if (num === 0) {return '0';}
    if (num < 0.01) {return '<0.01';}
    return num.toFixed(decimals === 6 ? 2 : 4);
  }

  parseAmount(amount: string, decimals: number = 18): bigint {
    return ethers.parseUnits(amount, decimals);
  }

  formatAmount(amount: bigint, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals);
  }
}

export const walletOperations = new WalletOperations();
export default walletOperations;
