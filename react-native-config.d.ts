declare module 'react-native-config' {
  export interface NativeConfig {
    // Network Configuration
    CUSTOM_RPC_URL?: string;
    SEPOLIA_RPC_URL?: string;
    CUSTOM_NETWORK?: string;
    CUSTOM_NETWORK_CHAIN_ID?: string;
    SEPOLIA_CHAIN_ID?: string;
    ETHEREUM_CHAIN_ID?: string;

    // Smart Contract Addresses
    USDC_ADDRESS?: string;
    BANK_ADDRESS?: string;
    BRIDGE_ADDRESS?: string;
    EURC_ADDRESS?: string;
    DENERGY_USDC_ADDRESS?: string;
    DENERGY_EURC_ADDRESS?: string;
    DESTINATION_ADDRESS?: string;
    WATT_STAKING_ADDRESS?: string;
    STAKING_ADDRESS?: string;
    STAKING_VALIDATOR_ADDRESS?: string;
    NFT_MARKET_ADDRESS?: string;
    SWAP_SMART_ROUTER?: string;
    SWAP_V3_QUOTER?: string;
    SWAP_V3_FACTORY?: string;
    SWAP_WETH?: string;

    // API URLs
    API_NFT_URL?: string;
    API_OFFSETTING_URL?: string;
    API_TRANSFER_URL?: string;
    API_ACCOUNT_VALIDATE_URL?: string;
    GRAPH_API_NFTMARKET?: string;
    KYC_API_URL?: string;
    PLATFORM_SETTINGS_API_URL?: string;
    STAKED_API_URL?: string;
    NEWS_API_URL?: string;
    ADDRESS_BOOK_API_URL?: string;
    NFT_DEFAULT_IMAGE_URL?: string;
    PRICE_HISTORY_API_URL?: string;
    VALIDATORS_API_URL?: string;
    QUEUED_DELEGATIONS_API_URL?: string;
    WATT_QUEUED_DELEGATIONS_API_URL?: string;
    NFT_STAKED_ASSETS_API_URL?: string;
    WATT_STAKED_ASSETS_API_URL?: string;
    BRIDGE_API_URL?: string;
    CRYPTO_PRICES_API_URL?: string;
    MERGED_API_URL?: string;

    // API Keys
    KYC_API_KEY?: string;
    PLATFORM_SETTINGS_API_KEY?: string;
    NEWS_API_KEY?: string;
    ADDRESS_BOOK_API_KEY?: string;
    BRIDGE_API_KEY?: string;
    MAGIC_API_KEY_PROD?: string;

    // Explorer
    EXPLORER_URL?: string;
    SEPOLIA_EXPLORER_URL?: string;
    DEFAULT_GAS_LIMIT?: string;
    TREASURY_ADDRESS?: string;
    WALLETCONNECT_PROJECT_ID?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
