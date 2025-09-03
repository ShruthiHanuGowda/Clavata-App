export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

export interface TransactionError extends AppError {
  txHash?: string;
  network?: string;
}

export interface ApiError extends AppError {
  status?: number;
  url?: string;
}

export enum ErrorCode {
  // Transaction errors
  TX_FAILED = 'TX_FAILED',
  TX_REJECTED = 'TX_REJECTED',
  TX_TIMEOUT = 'TX_TIMEOUT',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // API errors
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  API_TIMEOUT = 'API_TIMEOUT',
  API_UNAUTHORIZED = 'API_UNAUTHORIZED',
  API_NOT_FOUND = 'API_NOT_FOUND',

  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

class ErrorService {
  createError(
    code: ErrorCode,
    message: string,
    details?: any,
    context?: string
  ): AppError {
    return {
      code,
      message,
      details,
      context,
      timestamp: new Date(),
    };
  }

  createTransactionError(
    code: ErrorCode,
    message: string,
    txHash?: string,
    network?: string,
    details?: any,
    context?: string
  ): TransactionError {
    return {
      ...this.createError(code, message, details, context),
      txHash,
      network,
    };
  }

  createApiError(
    code: ErrorCode,
    message: string,
    status?: number,
    url?: string,
    details?: any,
    context?: string
  ): ApiError {
    return {
      ...this.createError(code, message, details, context),
      status,
      url,
    };
  }

  logError(error: AppError | Error, level: LogLevel = LogLevel.ERROR): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${level.toUpperCase()}] ${timestamp}`;

    if (error instanceof Error) {
      console[level](`${prefix} [${ErrorCode.UNKNOWN_ERROR}]`, error.message, error);
    } else {
      const context = error.context ? `[${error.context}]` : '';
      console[level](`${prefix} ${context} [${error.code}]`, error.message, error.details);
    }
  }

  handleTransactionError(error: any, context: string): TransactionError {
    let code = ErrorCode.TX_FAILED;
    let message = 'Transaction failed';

    if (this.isUserRejectedError(error)) {
      code = ErrorCode.TX_REJECTED;
      message = 'Transaction was rejected by user';
    } else if (this.isInsufficientFundsError(error)) {
      code = ErrorCode.INSUFFICIENT_FUNDS;
      message = 'Insufficient funds for transaction';
    } else if (this.isNetworkError(error)) {
      code = ErrorCode.NETWORK_ERROR;
      message = 'Network connection error';
    } else if (error?.message) {
      message = error.message;
    }

    const txError = this.createTransactionError(
      code,
      message,
      error?.hash,
      error?.network,
      error,
      context
    );

    this.logError(txError);
    return txError;
  }

  handleApiError(error: any, url?: string, context?: string): ApiError {
    let code = ErrorCode.API_REQUEST_FAILED;
    let message = 'API request failed';
    let status: number | undefined;

    if (error?.name === 'AbortError') {
      return this.createApiError(ErrorCode.API_TIMEOUT, 'Request was cancelled', undefined, url, error, context);
    }

    if (error?.status) {
      status = error.status;
      switch (status) {
        case 401:
          code = ErrorCode.API_UNAUTHORIZED;
          message = 'Unauthorized request';
          break;
        case 404:
          code = ErrorCode.API_NOT_FOUND;
          message = 'Resource not found';
          break;
        case 408:
          code = ErrorCode.API_TIMEOUT;
          message = 'Request timeout';
          break;
        default:
          message = error.statusText || message;
      }
    } else if (error?.message) {
      message = error.message;
    }

    const apiError = this.createApiError(code, message, status, url, error, context);
    this.logError(apiError);
    return apiError;
  }

  getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case ErrorCode.TX_REJECTED:
        return 'You cancelled the transaction. Please try again if you want to proceed.';
      case ErrorCode.INSUFFICIENT_FUNDS:
        return 'You don\'t have enough funds for this transaction. Please check your balance.';
      case ErrorCode.INVALID_ADDRESS:
        return 'The wallet address is invalid. Please check and try again.';
      case ErrorCode.NETWORK_ERROR:
        return 'Network connection issue. Please check your internet and try again.';
      case ErrorCode.API_UNAUTHORIZED:
        return 'Please log in again to continue.';
      case ErrorCode.API_NOT_FOUND:
        return 'The requested information could not be found.';
      case ErrorCode.API_TIMEOUT:
        return 'Request is taking too long. Please try again.';
      default:
        return 'Something went wrong. Please try again or contact support if the issue persists.';
    }
  }

  private isUserRejectedError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return message.includes('user rejected') ||
           message.includes('user denied') ||
           error?.code === 4001;
  }

  private isInsufficientFundsError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return message.includes('insufficient funds') ||
           message.includes('insufficient balance');
  }

  private isNetworkError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return message.includes('network') ||
           message.includes('connection') ||
           error?.code === 'NETWORK_ERROR';
  }
}

export const errorService = new ErrorService();
