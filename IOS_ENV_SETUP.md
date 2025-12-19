# iOS Environment Configuration Setup

This guide explains how to configure your iOS targets to automatically use the correct environment file.

## Overview

You have two iOS targets:
- **DWallet** → Uses `.env.dwallet` (Production/Mainnet)
- **DWallet TestNet** → Uses `.env.dwallet.testnet` (Testnet)

## Setup Instructions

### 1. Install Pods

First, install the pods for both targets:

```bash
npm run pods:install
# or
cd ios && pod install && cd ..
```

### 2. Configure Build Phase in Xcode

You need to add a "Run Script" build phase to **BOTH** targets that will copy the correct `.env` file before building.

#### For DWallet Target:

1. Open `ios/DWallet.xcworkspace` in Xcode
2. Select the **DWallet** project in the navigator
3. Select the **DWallet** target
4. Go to **Build Phases** tab
5. Click the **+** button → **New Run Script Phase**
6. **IMPORTANT:** Drag this new script phase to be **BEFORE** "Bundle React Native code and images"
7. Name it: `Setup Environment File`
8. Add this script:

```bash
"${PROJECT_DIR}/scripts/setup-env.sh"
```

9. Make sure "Run script: Based on dependency analysis" is **UNCHECKED**

#### For DWallet TestNet Target:

Repeat the same steps for the **DWallet TestNet** target:

1. Select the **DWallet TestNet** target
2. Go to **Build Phases** tab
3. Click the **+** button → **New Run Script Phase**
4. **IMPORTANT:** Drag this new script phase to be **BEFORE** "Bundle React Native code and images"
5. Name it: `Setup Environment File`
6. Add this script:

```bash
"${PROJECT_DIR}/scripts/setup-env.sh"
```

7. Make sure "Run script: Based on dependency analysis" is **UNCHECKED**

### 3. Set Build Configurations (Optional but Recommended)

To make the configuration cleaner, you can set the xcconfig files:

1. Select the **DWallet** project (top level)
2. Select the **DWallet** project (not target) in the main area
3. Go to the **Info** tab
4. Under **Configurations** → **Debug** → **DWallet**:
   - Set to `DWallet` (or select `ios/DWallet.xcconfig` if you see file selection)
5. Under **Configurations** → **Release** → **DWallet**:
   - Set to `DWallet` (or select `ios/DWallet.xcconfig` if you see file selection)
6. Repeat for **DWallet TestNet**:
   - Debug → **DWallet TestNet** → Set to `DWalletTestNet`
   - Release → **DWallet TestNet** → Set to `DWalletTestNet`

## Running the App

### Using npm scripts:

```bash
# Run DWallet (Production/Mainnet)
npm run ios:dwallet

# Run DWallet TestNet
npm run ios:testnet
```

### Using Xcode:

1. Open `ios/DWallet.xcworkspace`
2. Select the scheme from the top bar:
   - **DWallet** for production/mainnet
   - **DWallet copy** for testnet
3. Press the Run button (Cmd+R)

The build script will automatically:
- Detect which target is being built
- Copy the appropriate `.env` file
- Make it available to `react-native-config`

## Verification

To verify the setup is working:

1. Add a console log in your app:
```typescript
import Config from 'react-native-config';
console.log('Current RPC URL:', Config.CUSTOM_RPC_URL);
console.log('Chain ID:', Config.CUSTOM_NETWORK_CHAIN_ID);
```

2. Build with DWallet target:
   - Should show: `https://rpc.d.energy` and chain ID `369369`

3. Build with DWallet TestNet target:
   - Should show: `https://rpc.denergytestnet.com` and chain ID `4442`

## Troubleshooting

### Environment variables not loading

1. **Clean Build Folder:**
   - In Xcode: Product → Clean Build Folder (Shift+Cmd+K)
   - Or delete `ios/build` folder

2. **Reinstall Pods:**
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   ```

3. **Check script is running:**
   - Build the app in Xcode
   - Check the build log for "Setting up environment for target: DWallet" or "DWallet TestNet"

4. **Verify script permissions:**
   ```bash
   chmod +x ios/scripts/setup-env.sh
   ```

### Wrong environment being used

1. Make sure you selected the correct **scheme** in Xcode (not just the target)
2. Check that the build script ran by looking at the build logs
3. Verify the `.env` file in the project root was updated

### Build fails

1. Make sure both `.env.dwallet` and `.env.dwallet.testnet` files exist in the project root
2. Check that the script file exists at `ios/scripts/setup-env.sh`
3. Verify the script has execute permissions

## Files Created

- `ios/scripts/setup-env.sh` - Build script that copies the correct env file
- `ios/DWallet.xcconfig` - Configuration for DWallet target
- `ios/DWalletTestNet.xcconfig` - Configuration for DWallet TestNet target
- `ios/Podfile` - Updated to include both targets

## Important Notes

- The build script **copies** the environment file (not symlinks) to ensure compatibility
- Each time you build, the `.env` file in the root will be overwritten with the target-specific file
- If you make changes to environment files, you need to rebuild (not just refresh) the app
- The scripts folder should be committed to git, but the `.env*` files should not be
