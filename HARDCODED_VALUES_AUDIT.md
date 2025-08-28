# Hardcoded Values Audit Report

This document lists all hardcoded values found in the codebase that should be moved to environment variables for better security, configuration management, and deployment flexibility.

## 🚨 Critical Security Issues (HIGH PRIORITY)

### API Keys & Secrets
| File | Line | Current Value | Recommended Env Variable |
|------|------|---------------|-------------------------|
| `screens/Provider/GraphQLProvider.tsx` | 17 | `'da2-baxdpa3fcnh55ph4mgfoygz7em'` | `GRAPHQL_API_KEY` |
| `Src/Screens/AuthScreens/loginScreenNew.tsx` | 9 | `'pk_live_F22A388602152902'` | `MAGIC_API_KEY_LOGIN` |

### API URLs
| File | Line | Current Value | Recommended Env Variable |
|------|------|---------------|-------------------------|
| `screens/Provider/GraphQLProvider.tsx` | 18-19 | `'https://rbp2j64ilzapvcxolmwmv4cuj4.appsync-api.me-central-1.amazonaws.com/graphql'` | `GRAPHQL_API_URL` |

## 🔧 Smart Contract Addresses (MEDIUM PRIORITY)

| File | Line | Current Value | Recommended Env Variable |
|------|------|---------------|-------------------------|
| `screens/Web3Screen.tsx` | 11 | `'0x9D5975DD1123032aE0B2D943e9735d88dC90a2DE'` | `WEB3_CONTRACT_ADDRESS` |
| `Src/Screens/Stake/UnstakeScreen/index.tsx` | 62 | `'0xb18c23b04e82ce8ba14597966e25f63343e346b7'` | `ERC1155_CONTRACT_ADDRESS` |
| `Src/Screens/Send/SendPin/sendPin.js` | 59 | `'0x4423cf2abb62f73c1b316ff1e740ac4161f14227'` | `SENDPIN_ADDRESS_1` |
| `Src/Screens/Send/SendPin/sendPin.js` | 61 | `'0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4'` | `SENDPIN_ADDRESS_2` |
| `Src/Screens/Send/SendPin/sendPin.js` | 63 | `'0x20a18bc67fBa28D8ffd286760d7adeEC8838A3ff'` | `SENDPIN_ADDRESS_3` |
| `Src/Screens/AppScreens/Beneficiaries/beneficary.js` | 32 | `'0x742d35Cc6634C0532925a3b844Bc454e4438f44e'` | `BENEFICIARY_ADDRESS` |

## ⚙️ Chain Configuration (MEDIUM PRIORITY)

### Chain IDs
| File | Line | Current Value | Recommended Env Variable |
|------|------|---------------|-------------------------|
| `Src/Screens/Send/SendCoin/index.tsx` | 569 | `11155111` (Sepolia) | `SEPOLIA_CHAIN_ID` (already exists) |
| `Src/Screens/Send/SendPin/sendPin.js` | 202 | `11155111` (Sepolia) | `SEPOLIA_CHAIN_ID` (already exists) |

### Gas Configuration
| File | Line | Current Value | Recommended Env Variable |
|------|------|---------------|-------------------------|
| `Src/hooks/useSendWATT.ts` | 89 | `'0x4A817C800'` | `DEFAULT_GAS_LIMIT` |

## 📁 Configuration Values (LOW PRIORITY)

### Image URLs
| File | Line | Current Value | Recommended Env Variable |
|------|------|---------------|-------------------------|
| `Src/Screens/Stake/StakeListItem.jsx` | 23 | `'https://userprofleimages.s3.amazonaws.com/PROFILE/1684802521386.jpg'` | `PROFILE_IMAGE_BASE_URL` |

### Timeout Values
| File | Line | Current Value | Recommended Env Variable |
|------|------|---------------|-------------------------|
| `Src/hooks/useSwap.ts` | 365 | `10000` (Balance query timeout) | `BALANCE_QUERY_TIMEOUT` |
| `Src/hooks/useSwap.ts` | 411 | `10000` (Allowance query timeout) | `ALLOWANCE_QUERY_TIMEOUT` |
| `Src/hooks/useSwap.ts` | 514 | `10000` (Quote timeout) | `QUOTE_TIMEOUT` |
| `Src/Screens/MarketPlace/OffsetScreen/index.tsx` | 295 | `30000` (Request timeout) | `REQUEST_TIMEOUT` |

## 📝 Recommended Environment Variables

Add these to your `.env` file:

```bash
# ==============================================
# CRITICAL SECURITY - IMMEDIATE ACTION REQUIRED
# ==============================================
GRAPHQL_API_KEY=da2-baxdpa3fcnh55ph4mgfoygz7em
GRAPHQL_API_URL=https://rbp2j64ilzapvcxolmwmv4cuj4.appsync-api.me-central-1.amazonaws.com/graphql
MAGIC_API_KEY_LOGIN=pk_live_F22A388602152902

# ==============================================
# SMART CONTRACT ADDRESSES
# ==============================================
WEB3_CONTRACT_ADDRESS=0x9D5975DD1123032aE0B2D943e9735d88dC90a2DE
ERC1155_CONTRACT_ADDRESS=0xb18c23b04e82ce8ba14597966e25f63343e346b7
BENEFICIARY_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
SENDPIN_ADDRESS_1=0x4423cf2abb62f73c1b316ff1e740ac4161f14227
SENDPIN_ADDRESS_2=0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4
SENDPIN_ADDRESS_3=0x20a18bc67fBa28D8ffd286760d7adeEC8838A3ff

# ==============================================
# GAS & CHAIN CONFIGURATION
# ==============================================
DEFAULT_GAS_LIMIT=0x4A817C800

# ==============================================
# TIMEOUTS & URLS
# ==============================================
BALANCE_QUERY_TIMEOUT=10000
ALLOWANCE_QUERY_TIMEOUT=10000
QUOTE_TIMEOUT=10000
REQUEST_TIMEOUT=30000
PROFILE_IMAGE_BASE_URL=https://userprofleimages.s3.amazonaws.com/PROFILE/
```

## 🔄 Implementation Steps

### 1. Update Constants File
Add imports for new environment variables in `Src/constants.ts`:

```typescript
// Add to imports from '@env'
GRAPHQL_API_KEY as GRAPHQL_API_KEY_ENV,
GRAPHQL_API_URL as GRAPHQL_API_URL_ENV,
MAGIC_API_KEY_LOGIN as MAGIC_API_KEY_LOGIN_ENV,
WEB3_CONTRACT_ADDRESS as WEB3_CONTRACT_ADDRESS_ENV,
ERC1155_CONTRACT_ADDRESS as ERC1155_CONTRACT_ADDRESS_ENV,
BENEFICIARY_ADDRESS as BENEFICIARY_ADDRESS_ENV,
SENDPIN_ADDRESS_1 as SENDPIN_ADDRESS_1_ENV,
SENDPIN_ADDRESS_2 as SENDPIN_ADDRESS_2_ENV,
SENDPIN_ADDRESS_3 as SENDPIN_ADDRESS_3_ENV,
DEFAULT_GAS_LIMIT as DEFAULT_GAS_LIMIT_ENV,
BALANCE_QUERY_TIMEOUT as BALANCE_QUERY_TIMEOUT_ENV,
ALLOWANCE_QUERY_TIMEOUT as ALLOWANCE_QUERY_TIMEOUT_ENV,
QUOTE_TIMEOUT as QUOTE_TIMEOUT_ENV,
REQUEST_TIMEOUT as REQUEST_TIMEOUT_ENV,
PROFILE_IMAGE_BASE_URL as PROFILE_IMAGE_BASE_URL_ENV,

// Add exports
export const GRAPHQL_API_KEY = GRAPHQL_API_KEY_ENV;
export const GRAPHQL_API_URL = GRAPHQL_API_URL_ENV;
export const MAGIC_API_KEY_LOGIN = MAGIC_API_KEY_LOGIN_ENV;
export const WEB3_CONTRACT_ADDRESS = WEB3_CONTRACT_ADDRESS_ENV;
export const ERC1155_CONTRACT_ADDRESS = ERC1155_CONTRACT_ADDRESS_ENV;
export const BENEFICIARY_ADDRESS = BENEFICIARY_ADDRESS_ENV;
export const SENDPIN_ADDRESS_1 = SENDPIN_ADDRESS_1_ENV;
export const SENDPIN_ADDRESS_2 = SENDPIN_ADDRESS_2_ENV;
export const SENDPIN_ADDRESS_3 = SENDPIN_ADDRESS_3_ENV;
export const DEFAULT_GAS_LIMIT = DEFAULT_GAS_LIMIT_ENV;
export const BALANCE_QUERY_TIMEOUT = BALANCE_QUERY_TIMEOUT_ENV;
export const ALLOWANCE_QUERY_TIMEOUT = ALLOWANCE_QUERY_TIMEOUT_ENV;
export const QUOTE_TIMEOUT = QUOTE_TIMEOUT_ENV;
export const REQUEST_TIMEOUT = REQUEST_TIMEOUT_ENV;
export const PROFILE_IMAGE_BASE_URL = PROFILE_IMAGE_BASE_URL_ENV;
```

### 2. Replace Hardcoded Values
Update each file to import and use the constants from `Src/constants.ts` instead of hardcoded values.

### 3. Update Environment Files
- Add all new environment variables to your `.env` files
- Update `.env.example` with placeholder values
- Ensure production environments have the correct values

## ⚠️ Security Recommendations

1. **Immediate Action Required**: The Magic API key and GraphQL credentials are currently exposed in the codebase
2. **Never commit**: Ensure `.env` files are in `.gitignore`
3. **Rotate Keys**: Consider rotating the exposed API keys after moving them to environment variables
4. **Access Control**: Limit access to production environment variables
5. **Validation**: Add runtime validation for critical environment variables

## 📋 Completion Checklist

- [ ] Add environment variables to `.env` files
- [ ] Update `Src/constants.ts` with new imports/exports
- [ ] Replace hardcoded values in all identified files
- [ ] Test application with environment variables
- [ ] Update deployment configurations
- [ ] Rotate any exposed API keys
- [ ] Document environment setup for team members

## 🎯 Priority Order

1. **CRITICAL**: API keys and secrets (security risk)
2. **HIGH**: Contract addresses (deployment flexibility)
3. **MEDIUM**: Chain IDs and gas limits (configuration management)
4. **LOW**: Timeouts and URLs (operational flexibility)

---

**Generated on:** $(date)
**Total Issues Found:** 20
**Critical Issues:** 3
**Files Affected:** 11