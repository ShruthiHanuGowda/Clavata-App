# Environment Configuration Setup

This project uses `react-native-config` for managing environment variables across different environments.

## Available Environments

### 1. **Dwallet (Production/Mainnet)** - `.env.dwallet`
- Mainnet configuration
- Production RPC endpoints
- Production contract addresses

### 2. **Dwallet Testnet** - `.env.dwallet.testnet`
- Testnet configuration
- Testnet RPC endpoints
- Testnet contract addresses

## Usage

### Running the app with different environments

#### iOS
```bash
# Run with Dwallet (Production)
npm run ios:dwallet

# Run with Dwallet Testnet
npm run ios:testnet

# Run with default environment
npm run ios
```

#### Android
```bash
# Run with Dwallet (Production)
npm run android:dwallet

# Run with Dwallet Testnet
npm run android:testnet

# Run with default environment
npm run android
```

#### Metro Bundler
```bash
# Start Metro with Dwallet (Production)
npm run start:dwallet

# Start Metro with Dwallet Testnet
npm run start:testnet

# Start with default environment
npm start
```

## Setup Instructions

### 1. Install dependencies
The `react-native-config` package is already included in package.json.

```bash
npm install
```

### 2. Link native modules (if needed)
For iOS:
```bash
cd ios && pod install && cd ..
```

For Android, the package should auto-link.

### 3. Clean and rebuild
After switching environments, you may need to clean and rebuild:

#### iOS
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios:dwallet  # or ios:testnet
```

#### Android
```bash
cd android
./gradlew clean
cd ..
npm run android:dwallet  # or android:testnet
```

## Environment Files

- `.env.dwallet` - Production/Mainnet configuration
- `.env.dwallet.testnet` - Testnet configuration
- `.env` - Legacy file (can be removed after migration)

**Note:** All `.env*` files are gitignored for security. Make sure to share these files securely with your team.

## Accessing Environment Variables in Code

Import and use environment variables from `constants.ts`:

```typescript
import { CUSTOM_RPC_URL, USDC_ADDRESS, KYC_API_KEY } from './Src/constants';

// Use the variables
console.log(CUSTOM_RPC_URL);
```

Or access directly from react-native-config:

```typescript
import Config from 'react-native-config';

console.log(Config.CUSTOM_RPC_URL);
```

## Troubleshooting

### iOS: Environment variables not loading
1. Clean build folder: `cd ios && xcodebuild clean && cd ..`
2. Reinstall pods: `cd ios && rm -rf Pods Podfile.lock && pod install && cd ..`
3. Rebuild the app

### Android: Environment variables not loading
1. Clean gradle: `cd android && ./gradlew clean && cd ..`
2. Clear metro cache: `npm start -- --reset-cache`
3. Rebuild the app

### Environment not switching
Make sure to:
1. Stop the metro bundler
2. Rebuild the native app (not just refresh)
3. Use the correct npm script (e.g., `npm run ios:dwallet`)
