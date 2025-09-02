# Error Service Integration Guide

This document outlines how the `errorService` has been integrated throughout the project and what still needs to be done.

## ✅ Already Integrated Files

### Core Services
- `Src/services/errorService.ts` - Main error service with comprehensive error handling
- `Src/hooks/marketplace/useCatchTxError.tsx` - Already uses errorService for transaction errors
- `Src/hooks/useApi.ts` - Already uses errorService for API error handling
- `Src/services/blockchain/walletOperations.ts` - Fully integrated with errorService

### Recently Updated Files
- `Src/hooks/useSendEth.ts` - Updated to use errorService for transaction and validation errors
- `Src/utils/secureStorage.ts` - Updated to use errorService for storage operation errors
- `Src/hooks/useCollections.ts` - Updated to use errorService for API and enrichment errors

## 🔄 Files Needing Integration

### High Priority - Transaction/Blockchain Related
- `Src/hooks/useSendWATT.ts`
- `Src/hooks/useSendUSDCANDEURC.ts` 
- `Src/hooks/useSendDenergyUSDCAndEURC.ts`
- `Src/hooks/useBridge.ts`
- `Src/hooks/useSwap.ts` - Has many console.log/error statements
- `Src/hooks/marketplace/useGasPrice.ts`
- `Src/hooks/marketplace/useCallWithGasPrice.ts`
- `Src/Screens/Stake/Hooks/useWATTStaking.ts`
- `Src/Screens/Stake/Hooks/useNFTStaking.ts`

### Medium Priority - API/Data Related
- `Src/hooks/useWalletBalance.ts`
- `Src/hooks/useTransactionHistory.ts`
- `Src/hooks/useNfts.ts`
- `Src/hooks/useNftsForAddress.ts`
- `Src/hooks/useCompleteNft.ts`
- `Src/hooks/useOffsetNft.ts`
- `Src/Screens/NewsScreens/Hooks/NewsGraphql.ts`
- `Src/Screens/AddressBookScreens/Hooks/AddressBookGraphql.ts`

### Low Priority - UI/Utility Related
- `Src/hooks/useSuccessSound.ts` - Has debug console.log statements
- `Src/CustomHooks/KYC/*.tsx` files
- Various Provider files

## 🛠 Integration Pattern

For each file, follow this pattern:

1. **Add import:**
   ```typescript
   import {errorService, ErrorCode, TransactionError, ApiError} from '../services/errorService';
   ```

2. **Replace console.error/console.log with structured logging:**
   ```typescript
   // Before
   console.error('Transaction failed:', error);
   
   // After
   const txError = errorService.handleTransactionError(error, 'functionName');
   ```

3. **Update error state to use typed errors:**
   ```typescript
   // Before
   const [error, setError] = useState<string | null>(null);
   
   // After  
   const [error, setError] = useState<TransactionError | ApiError | null>(null);
   ```

4. **Use getUserFriendlyMessage for UI display:**
   ```typescript
   setError(errorService.getUserFriendlyMessage(txError));
   ```

## 📝 Next Steps

1. Update high-priority transaction-related hooks first
2. Update API-related hooks 
3. Update UI components that display errors to show user-friendly messages
4. Add error boundaries at the React component level
5. Consider adding error reporting/telemetry integration

## 🧪 Testing

After integration:
1. Test transaction failures (insufficient funds, network errors, user rejection)
2. Test API failures (timeout, network errors, 404s)
3. Verify error messages are user-friendly
4. Check that all errors are properly logged