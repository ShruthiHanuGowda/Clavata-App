import { ethers } from 'ethers';
import { networkProvider } from './providers';
import { contractManager } from './contracts';
import { errorService, ErrorCode, TransactionError } from '../errorService';

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
  error?: TransactionError;
}

class WalletOperations {
  async getNativeBalance(address: string, network: string): Promise<string> {
    if (!ethers.isAddress(address)) {
      const error = errorService.createTransactionError(
        ErrorCode.INVALID_ADDRESS,
        'Invalid wallet address',
        undefined,
        network,
        { address },
        'getNativeBalance'
      );
      errorService.logError(error);
      throw error;
    }

    try {
      const provider = networkProvider.getProvider(network);
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      const txError = errorService.handleTransactionError(error, 'getNativeBalance');
      throw txError;
    }
  }

  async getTokenBalance(
    tokenAddress: string,
    walletAddress: string,
    network: string,
    decimals: number = 18
  ): Promise<string> {
    if (!ethers.isAddress(walletAddress) || !ethers.isAddress(tokenAddress)) {
      const error = errorService.createTransactionError(
        ErrorCode.INVALID_ADDRESS,
        'Invalid address provided',
        undefined,
        network,
        { tokenAddress, walletAddress },
        'getTokenBalance'
      );
      errorService.logError(error);
      throw error;
    }

    try {
      const contract = contractManager.getERC20Contract(tokenAddress, network);
      const balance = await contract.balanceOf(walletAddress);
      return ethers.formatUnits(balance, decimals);
    } catch (error: any) {
      const txError = errorService.handleTransactionError(error, 'getTokenBalance');
      throw txError;
    }
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
        errorService.handleTransactionError(error, `getMultipleTokenBalances-${token.symbol}`);
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
      const txError = errorService.handleTransactionError(error, 'sendNativeToken');
      return {
        hash: '',
        status: 'failed',
        error: txError,
      };
    }
  }

  async sendToken(
    params: TransactionParams,
    signer: ethers.Signer,
    decimals: number = 18
  ): Promise<TransactionResult> {
    if (!params.tokenAddress) {
      const error = errorService.createTransactionError(
        ErrorCode.VALIDATION_ERROR,
        'Token address is required for token transfers',
        undefined,
        params.network,
        params,
        'sendToken'
      );
      errorService.logError(error);
      throw error;
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
      const txError = errorService.handleTransactionError(error, 'sendToken');
      return {
        hash: '',
        status: 'failed',
        error: txError,
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
      const txError = errorService.handleTransactionError(error, 'approveToken');
      return {
        hash: '',
        status: 'failed',
        error: txError,
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
        const txError = errorService.createTransactionError(
          ErrorCode.TX_FAILED,
          'Transaction failed',
          txHash,
          network,
          { receipt },
          'waitForTransaction'
        );
        return {
          hash: txHash,
          status: 'failed',
          receipt: receipt || undefined,
          error: txError,
        };
      }
    } catch (error: any) {
      const txError = errorService.handleTransactionError(error, 'waitForTransaction');
      return {
        hash: txHash,
        status: 'failed',
        error: txError,
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
      const txError = errorService.handleTransactionError(error, 'getTransactionStatus');
      return {
        hash: txHash,
        status: 'failed',
        error: txError,
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
