# React Native Config Implementation Summary

## Overview

Successfully migrated from `react-native-dotenv` to `react-native-config` with separate environment configurations for:
- **DWallet (Production/Mainnet)** - `.env.dwallet`
- **DWallet TestNet** - `.env.dwallet.testnet`

## What Was Changed

### 1. Environment Files Created

✅ [.env.dwallet](.env.dwallet) - Production/Mainnet configuration
- RPC: `https://rpc.d.energy`
- Chain ID: `369369`
- Mainnet contract addresses

✅ [.env.dwallet.testnet](.env.dwallet.testnet) - Testnet configuration
- RPC: `https://rpc.denergytestnet.com`
- Chain ID: `4442`
- Testnet contract addresses

### 2. Code Changes

✅ [Src/constants.ts](Src/constants.ts:3)
- Changed from `import {...} from '@env'`
- To `import Config from 'react-native-config'`
- All env variables now accessed via `Config.VARIABLE_NAME`

✅ [babel.config.js](babel.config.js:3)
- Removed `react-native-dotenv` plugin
- Cleaned up babel configuration

✅ [.gitignore](.gitignore:79-81)
- Added `.env.dwallet` and `.env.dwallet.testnet`
- Keeps sensitive configuration out of git

✅ [react-native-config.d.ts](react-native-config.d.ts)
- TypeScript declarations for all environment variables
- Provides autocomplete and type safety

### 3. iOS Configuration

✅ [ios/DWallet.xcconfig](ios/DWallet.xcconfig)
- Configuration file for DWallet target
- Sets `ENVFILE=.env.dwallet`

✅ [ios/DWalletTestNet.xcconfig](ios/DWalletTestNet.xcconfig)
- Configuration file for DWallet TestNet target
- Sets `ENVFILE=.env.dwallet.testnet`

✅ [ios/Podfile](ios/Podfile:40-48)
- Added `DWallet TestNet` target configuration
- Both targets now properly configured

✅ [ios/scripts/setup-env.sh](ios/scripts/setup-env.sh)
- Build script that copies correct env file based on target
- Runs automatically during Xcode build

### 4. Package.json Scripts

✅ [package.json](package.json:5-17)

**Android:**
- `npm run android:dwallet` - Run with mainnet
- `npm run android:testnet` - Run with testnet

**iOS:**
- `npm run ios:dwallet` - Run with DWallet scheme (mainnet)
- `npm run ios:testnet` - Run with DWallet copy scheme (testnet)

**Metro:**
- `npm run start:dwallet` - Start metro with mainnet env
- `npm run start:testnet` - Start metro with testnet env

**Utilities:**
- `npm run pods:install` - Install/update iOS pods

### 5. Documentation

✅ [ENV_SETUP.md](ENV_SETUP.md) - General environment setup guide
✅ [IOS_ENV_SETUP.md](IOS_ENV_SETUP.md) - Detailed iOS configuration guide
✅ [XCODE_SETUP_STEPS.md](XCODE_SETUP_STEPS.md) - Step-by-step Xcode setup

## Required Manual Steps

### ⚠️ IMPORTANT: Xcode Build Phase Setup

You **MUST** add a build phase script to both iOS targets in Xcode:

1. Open `ios/DWallet.xcworkspace` in Xcode
2. For **BOTH** targets (DWallet and DWallet TestNet):
   - Go to Build Phases tab
   - Add New Run Script Phase
   - Name it: "Setup Environment File"
   - Script: `"${PROJECT_DIR}/scripts/setup-env.sh"`
   - Uncheck "Based on dependency analysis"
   - **DRAG IT BEFORE** "Bundle React Native code and images"

See [XCODE_SETUP_STEPS.md](XCODE_SETUP_STEPS.md) for detailed instructions with visuals.

### Installation Steps

1. **Install iOS Pods:**
   ```bash
   npm run pods:install
   ```

2. **Configure Xcode Build Phases** (see above)

3. **Clean and Rebuild:**
   ```bash
   # iOS
   npm run ios:dwallet  # or ios:testnet

   # Android
   npm run android:dwallet  # or android:testnet
   ```

## Usage

### Accessing Environment Variables

```typescript
import Config from 'react-native-config';

// Direct access
console.log(Config.CUSTOM_RPC_URL);
console.log(Config.CUSTOM_NETWORK_CHAIN_ID);

// Or use the constants file (recommended)
import { CUSTOM_RPC_URL, CUSTOM_NETWORK_CHAIN_ID } from './Src/constants';
console.log(CUSTOM_RPC_URL);
console.log(CUSTOM_NETWORK_CHAIN_ID);
```

### Switching Environments

#### iOS (via Xcode):
1. Open `ios/DWallet.xcworkspace`
2. Select scheme: **DWallet** (mainnet) or **DWallet copy** (testnet)
3. Build and run (Cmd+R)

#### iOS (via CLI):
```bash
npm run ios:dwallet   # Production/Mainnet
npm run ios:testnet   # Testnet
```

#### Android (via CLI):
```bash
npm run android:dwallet   # Production/Mainnet
npm run android:testnet   # Testnet
```

## Testing the Setup

Add this to your app to verify:

```typescript
import Config from 'react-native-config';

console.log('=== Current Environment ===');
console.log('RPC:', Config.CUSTOM_RPC_URL);
console.log('Chain ID:', Config.CUSTOM_NETWORK_CHAIN_ID);
console.log('Network:', Config.CUSTOM_NETWORK);
```

**Expected Values:**

| Environment | RPC URL | Chain ID |
|-------------|---------|----------|
| DWallet (Mainnet) | https://rpc.d.energy | 369369 |
| DWallet TestNet | https://rpc.denergytestnet.com | 4442 |

## Cleanup (Optional)

After confirming everything works, you can remove `react-native-dotenv`:

```bash
npm uninstall react-native-dotenv
```

Then remove it from [package.json](package.json:98) devDependencies.

## Architecture Benefits

✅ **Type Safety** - Full TypeScript support with autocomplete
✅ **Native Support** - Environment variables compiled into native builds
✅ **Multiple Environments** - Easy switching between mainnet/testnet
✅ **Xcode Integration** - Schemes automatically use correct environment
✅ **Security** - Environment files properly gitignored
✅ **No Runtime Overhead** - Values embedded at build time

## File Structure

```
d_wallet/
├── .env.dwallet                    # Mainnet config (gitignored)
├── .env.dwallet.testnet            # Testnet config (gitignored)
├── react-native-config.d.ts        # TypeScript declarations
├── Src/constants.ts                # Updated to use react-native-config
├── babel.config.js                 # Cleaned up (removed dotenv)
├── package.json                    # Updated scripts
├── ios/
│   ├── DWallet.xcconfig           # Mainnet xcconfig
│   ├── DWalletTestNet.xcconfig    # Testnet xcconfig
│   ├── Podfile                     # Updated with both targets
│   └── scripts/
│       └── setup-env.sh            # Build script (executable)
└── docs/
    ├── ENV_SETUP.md                # General setup guide
    ├── IOS_ENV_SETUP.md            # iOS-specific guide
    ├── XCODE_SETUP_STEPS.md        # Xcode configuration steps
    └── IMPLEMENTATION_SUMMARY.md   # This file
```

## Support & Troubleshooting

If you encounter issues:
1. Check [IOS_ENV_SETUP.md](IOS_ENV_SETUP.md) for iOS troubleshooting
2. Clean build folders and reinstall pods
3. Verify build script is running (check Xcode build logs)
4. Ensure `.env.dwallet` and `.env.dwallet.testnet` files exist

## Next Steps

1. ✅ Complete Xcode build phase setup (required)
2. ✅ Test both environments
3. ✅ Verify environment variables are loading correctly
4. ⚠️ Share `.env.dwallet` and `.env.dwallet.testnet` files securely with your team (don't commit them)
5. ⚠️ Update CI/CD pipelines if needed
6. ✅ Remove `react-native-dotenv` when ready
