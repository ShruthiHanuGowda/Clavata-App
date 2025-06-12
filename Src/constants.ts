// network
export const CUSTOM_RPC_URL = 'https://rpc.denergytestnet.com';
export const SEPOLIA_RPC_URL =
  'https://sepolia.infura.io/v3/60c88b9a394a48e8b459bcfa38dfaede';
export const CUSTOM_NETWORK = 'denergy';
export const CUSTOM_NETWORK_CHAIN_ID = 4442;

export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
export const BANK_ADDRESS = '0xa427CC7f6EA29CCff9b1f3910199C5b087821214';
export const BRIDGE_ADDRESS = '0x986cFDe622234531c6232EcC117a48f6fC04e719';
export const EURC_ADDRESS = '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4';
export const DENERGY_USDC_ADDRESS =
  '0x847eE0Ba6a31b8E2B8A9f5DE6246f38F4522BC9f';
export const DENERGY_EURC_ADDRESS =
  '0xAAf262Df44f5260288C014980D171e77d3E1CC65';
export const DESTINATION_ADDRESS = '0x162e6284219043F6DC74301236D0c53cf5f9661F';
export const STAKING_ADDRESS = '0x0000000000000000000000000000000000000808';
export const STAKING_VALIDATOR_ADDRESS =
  'denergyvaloper1p5ldj55zchl940d6xtnel0ma2pu3hp5eye7hsl';

// contract token
export const TOKEN_CONTRACTS = {
  denergy: {
    USDC: DENERGY_USDC_ADDRESS,
    EURC: DENERGY_EURC_ADDRESS,
  },
  sepolia: {
    USDC: USDC_ADDRESS,
    EURC: EURC_ADDRESS,
  },
  nftMarket: '0xCb781C0608EF63437adF8Fc0cceCF17eb29BA263',
};

export const API_NFT_URL =
  'https://y2veqyu78j.execute-api.me-central-1.amazonaws.com/default';

export const API_OFFSETTING_URL =
  'https://brh92tcajc.execute-api.me-central-1.amazonaws.com/Testing/evident-redeem';

export const GRAPH_API_NFTMARKET =
  'https://nftmarket-subgraph.wattswaps.com/subgraphs/name/nftmarket-subgraph';

export const KYC_API_URL =
  'https://gh6hwmywzjfvlghrmqctqmo42u.appsync-api.me-central-1.amazonaws.com/graphql';

export const KYC_API_KEY = 'da2-pamxpzqquvenlmpacbqq6ejwda';

export const PLATFORM_SETTINGS_API_URL =
  'https://z5xzy7dsije2hgtxlkl7q6mzve.appsync-api.me-central-1.amazonaws.com/graphql';

export const PLATFORM_SETTINGS_API_KEY = 'da2-mefhraz6cvgxbctio2efrac6ke';

export const STAKED_API_URL =
  'https://nftmarket-subgraph.wattswaps.com/subgraphs/name/nftstaking-subgraph';

export const NEWS_API_URL =
  'https://ug7ihehawff6vf4kylaobwvqxu.appsync-api.me-central-1.amazonaws.com/graphql';

export const NEWS_API_KEY = 'da2-gaeekkkmyzduppwbp3fftryhj4';

export const NFT_DEFAULT_IMAGE_URL =
  'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg';
