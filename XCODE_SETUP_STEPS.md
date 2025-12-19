# Quick Xcode Setup Guide

## Step-by-Step: Adding Build Phase Script

You need to add a "Run Script" build phase to **BOTH** iOS targets. Here's how:

### For DWallet Target:

1. **Open Xcode**
   ```bash
   open ios/DWallet.xcworkspace
   ```

2. **Navigate to Target Settings**
   - Click on "DWallet" project in the left navigator (blue icon)
   - In the main area, select **DWallet** target from the TARGETS list
   - Click on the **Build Phases** tab at the top

3. **Add New Run Script Phase**
   - Click the **+** button at the top left of the Build Phases area
   - Select **"New Run Script Phase"**
   - A new phase called "Run Script" will appear at the bottom

4. **Configure the Script**
   - Expand the "Run Script" phase by clicking the disclosure triangle
   - **Change the name** to: `Setup Environment File`
   - In the script text box, add:
     ```bash
     "${PROJECT_DIR}/scripts/setup-env.sh"
     ```
   - **IMPORTANT:** Uncheck "Based on dependency analysis"

5. **Reorder the Script Phase**
   - **CRITICAL STEP:** Drag the "Setup Environment File" phase **UP** so it comes **BEFORE** the "Bundle React Native code and images" phase
   - The order should be:
     1. ... (other phases)
     2. **Setup Environment File** ← Your new script
     3. Bundle React Native code and images
     4. ... (other phases)

### For DWallet TestNet Target:

Repeat the **EXACT SAME STEPS** as above, but:
- Select **DWallet TestNet** target instead of DWallet target
- Add the same script in the Build Phases

### Visual Order Check

Your Build Phases should look like this:

```
DWallet Target Build Phases:
├─ Target Dependencies
├─ [CP] Check Pods Manifest.lock
├─ Sources (Compile Sources)
├─ Frameworks (Link Binary With Libraries)
├─ Resources (Bundle Resources)
├─ Embed Frameworks
├─ **Setup Environment File** ← YOUR NEW SCRIPT HERE
├─ Bundle React Native code and images
├─ [CP] Embed Pods Frameworks
└─ [CP] Copy Pods Resources
```

## Verification

After adding the build phases:

1. **Build the project** (Cmd+B)
2. **Check the build log** for:
   ```
   Setting up environment for target: DWallet
   Using production environment: .env.dwallet
   Environment setup complete!
   ```

## Quick Test Script

To verify which environment is loaded, add this to your app:

```typescript
// In your App.tsx or any component
import Config from 'react-native-config';

console.log('=== Environment Check ===');
console.log('RPC URL:', Config.CUSTOM_RPC_URL);
console.log('Chain ID:', Config.CUSTOM_NETWORK_CHAIN_ID);
console.log('Network:', Config.CUSTOM_NETWORK);
console.log('=======================');
```

**Expected Output:**

- **DWallet target**:
  - RPC URL: `https://rpc.d.energy`
  - Chain ID: `369369`

- **DWallet TestNet target**:
  - RPC URL: `https://rpc.denergytestnet.com`
  - Chain ID: `4442`

## Common Mistakes to Avoid

❌ **Don't:** Put the script phase AFTER "Bundle React Native code and images"
✅ **Do:** Put it BEFORE

❌ **Don't:** Forget to uncheck "Based on dependency analysis"
✅ **Do:** Uncheck it so the script runs every time

❌ **Don't:** Add the script to only one target
✅ **Do:** Add it to BOTH DWallet and DWallet TestNet targets

❌ **Don't:** Forget to make the script executable
✅ **Do:** Run `chmod +x ios/scripts/setup-env.sh` (already done)

## Need Help?

If the environment isn't loading correctly:

1. Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
2. Delete `ios/build` folder
3. Run `cd ios && pod install && cd ..`
4. Rebuild the app

Check the [IOS_ENV_SETUP.md](IOS_ENV_SETUP.md) for detailed troubleshooting.
