// network
export const CUSTOM_RPC_URL = 'https://rpc.denergytestnet.com';
export const SEPOLIA_RPC_URL =
  'https://sepolia.infura.io/v3/60c88b9a394a48e8b459bcfa38dfaede';
export const CUSTOM_NETWORK = 'denergy';
export const CUSTOM_NETWORK_CHAIN_ID = 4442;

export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
export const BANK_ADDRESS = '0x16b7cc8f9a30cb3306731621742400b228564f94';
export const BRIDGE_ADDRESS = '0xf64470ae8f406328e59d9d4c9acea323eeae8405';
export const EURC_ADDRESS = '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4';
export const DENERGY_USDC_ADDRESS =
  '0xA0C2961f003f97448c8351f94758e9D4e4b1033b';
export const DENERGY_EURC_ADDRESS =
  '0xe3dA95AB1bcb8C488ce79cC2ea978649B5435460';
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

export const ADDRESS_BOOK_API_URL =
  'https://jf7gnnptu5avrbi35y5zyjcvvm.appsync-api.me-central-1.amazonaws.com/graphql';

export const ADDRESS_BOOK_API_KEY = 'da2-7najvwkoefectg7udgke7wco7i';

export const NFT_DEFAULT_IMAGE_URL =
  'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg';
