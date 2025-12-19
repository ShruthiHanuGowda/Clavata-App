# Setup Checklist for iOS Environment Configuration

## ✅ Completed Automatically

- [x] Created `.env.dwallet` (Production/Mainnet)
- [x] Created `.env.dwallet.testnet` (Testnet)
- [x] Updated `Src/constants.ts` to use `react-native-config`
- [x] Removed `react-native-dotenv` from `babel.config.js`
- [x] Created TypeScript declarations (`react-native-config.d.ts`)
- [x] Updated `.gitignore` to exclude environment files
- [x] Created iOS xcconfig files for both targets
- [x] Updated `Podfile` with both targets
- [x] Created build script (`ios/scripts/setup-env.sh`)
- [x] Updated `package.json` with environment-specific scripts
- [x] Created comprehensive documentation

## ⚠️ Required Manual Steps

### Step 1: Install iOS Dependencies
```bash
npm run pods:install
```
**Status:** [ ] Not Done | [ ] ✅ Done

---

### Step 2: Configure Xcode Build Phases

#### For DWallet Target:
1. [ ] Open `ios/DWallet.xcworkspace` in Xcode
2. [ ] Select **DWallet** target → **Build Phases** tab
3. [ ] Click **+** → **New Run Script Phase**
4. [ ] Name it: `Setup Environment File`
5. [ ] Add script: `"${PROJECT_DIR}/scripts/setup-env.sh"`
6. [ ] Uncheck "Based on dependency analysis"
7. [ ] **DRAG** the phase **BEFORE** "Bundle React Native code and images"

**Status:** [ ] Not Done | [ ] ✅ Done

#### For DWallet TestNet Target:
1. [ ] Select **DWallet TestNet** target → **Build Phases** tab
2. [ ] Click **+** → **New Run Script Phase**
3. [ ] Name it: `Setup Environment File`
4. [ ] Add script: `"${PROJECT_DIR}/scripts/setup-env.sh"`
5. [ ] Uncheck "Based on dependency analysis"
6. [ ] **DRAG** the phase **BEFORE** "Bundle React Native code and images"

**Status:** [ ] Not Done | [ ] ✅ Done

---

### Step 3: Test DWallet (Mainnet)
```bash
npm run ios:dwallet
```
Expected in console:
- RPC URL: `https://rpc.d.energy`
- Chain ID: `369369`

**Status:** [ ] Not Done | [ ] ✅ Works

---

### Step 4: Test DWallet TestNet
```bash
npm run ios:testnet
```
Expected in console:
- RPC URL: `https://rpc.denergytestnet.com`
- Chain ID: `4442`

**Status:** [ ] Not Done | [ ] ✅ Works

---

### Step 5: Test Android (Optional)
```bash
# Mainnet
npm run android:dwallet

# Testnet
npm run android:testnet
```

**Status:** [ ] Not Done | [ ] ✅ Works | [ ] N/A

---

## Quick Reference Commands

### iOS
```bash
# Mainnet (Production)
npm run ios:dwallet

# Testnet
npm run ios:testnet

# Reinstall pods
npm run pods:install
```

### Android
```bash
# Mainnet (Production)
npm run android:dwallet

# Testnet
npm run android:testnet
```

### Troubleshooting
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..

# Reset Metro cache
npm start -- --reset-cache
```

## Documentation Reference

- 📘 [XCODE_SETUP_STEPS.md](XCODE_SETUP_STEPS.md) - Visual Xcode setup guide
- 📗 [IOS_ENV_SETUP.md](IOS_ENV_SETUP.md) - Complete iOS configuration
- 📕 [ENV_SETUP.md](ENV_SETUP.md) - General environment guide
- 📙 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - All changes made

## Verification Test Code

Add this to your app to verify environments:

```typescript
import Config from 'react-native-config';

console.log('=== Environment Check ===');
console.log('RPC:', Config.CUSTOM_RPC_URL);
console.log('Chain:', Config.CUSTOM_NETWORK_CHAIN_ID);
console.log('Network:', Config.CUSTOM_NETWORK);
console.log('========================');
```

## Common Issues

### Issue: Environment variables are undefined
**Solution:**
1. Make sure build script phase is added to target
2. Clean build folder (Shift+Cmd+K in Xcode)
3. Rebuild the app

### Issue: Wrong environment is loading
**Solution:**
1. Check you selected the correct **scheme** in Xcode
2. Verify the build script ran (check Xcode build log)
3. Rebuild (not just refresh)

### Issue: Build script not running
**Solution:**
```bash
chmod +x ios/scripts/setup-env.sh
```

## Sign-Off

Once all checkboxes are marked, the setup is complete!

**Setup completed by:** ________________

**Date:** ________________

**Mainnet tested:** [ ] Yes [ ] No

**Testnet tested:** [ ] Yes [ ] No
