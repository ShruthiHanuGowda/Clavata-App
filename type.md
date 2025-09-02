yarn run v1.22.22
$ eslint .

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/GlobalKycBottomSheet.tsx
  91:6  error  React Hook useCallback has an unnecessary dependency: 'hideKycBottomSheet'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/GlobalKycProvider.tsx
   55:11  error  'KycTokenData' is defined but never used                                                                                       @typescript-eslint/no-unused-vars
  221:10  error  'isKycStarted' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u    @typescript-eslint/no-unused-vars
  503:21  error  'event' is defined but never used. Allowed unused args must match /^_/u                                                        @typescript-eslint/no-unused-vars
  655:5   error  React Hook useCallback has an unnecessary dependency: 'kycStatus.isSkipped'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/KYC/KycBottomSheet.tsx
  7:3  error  'Dimensions' is defined but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/KYC/KycServiceProvider.tsx
  178:8  error  React Hook useCallback has a missing dependency: 'handleVerificationCompleted'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/KYC/useKycStatusUpdate.tsx
   64:14  warning  'error' is already declared in the upper scope on line 57 column 37  @typescript-eslint/no-shadow
  124:7   warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  124:14  warning  'error' is already declared in the upper scope on line 57 column 37  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Navigation/NavigationTab.tsx
  25:15  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Tabs” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Navigation/TabBar.tsx
   95:43  warning  Inline style: { opacity: 'active ? 1 : 0.5' }                               react-native/no-inline-styles
  172:9   warning  Inline style: { paddingBottom: "Platform.OS === 'android' ? bottom : 10" }  react-native/no-inline-styles
  180:11  warning  Inline style: { top: -24, left: 16 }                                        react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Navigation/constant.js
  99:3  error  Duplicate key 'STAKE'  no-dupe-keys

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Navigation/constant.ts
  145:79  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AddressBookScreens/AddressBookList/index.tsx
  248:6  error  React Hook useCallback has an unnecessary dependency: 'handleCreateBeneficiary'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AddressBookScreens/ContactModal.tsx
    8:3   error    'Dimensions' is defined but never used                                                                                                                                                                                                                                                                                                                                                                                     @typescript-eslint/no-unused-vars
  209:6   error    React Hook useCallback has a missing dependency: 'onAddContact'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                          react-hooks/exhaustive-deps
  284:33  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “ContactModal” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Accountpage/index.tsx
  33:35  warning  Expected { after 'if' condition                                                                                            curly
  59:10  error    'visible' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u     @typescript-eslint/no-unused-vars
  59:19  error    'setVisible' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Beneficiaries/beneficary.tsx
  47:9   error    'ListItem' is assigned a value but never used                                                                                                                                                                                                                                                                                                 @typescript-eslint/no-unused-vars
  47:45  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “AccountBeneficiary” and pass data as props  react/no-unstable-nested-components
  75:9   error    'ListEmpty' is assigned a value but never used                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unused-vars
  75:31  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “AccountBeneficiary” and pass data as props  react/no-unstable-nested-components

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/CoinWallet/CoinWallet.tsx
   23:9   error    'useMutation' is defined but never used                                                                              @typescript-eslint/no-unused-vars
   24:9   error    'CREATE_TRANSACTION_HISTORY_MOBILE' is defined but never used                                                        @typescript-eslint/no-unused-vars
  177:6   error    React Hook useEffect has a missing dependency: 'fetchChartData'. Either include it or remove the dependency array    react-hooks/exhaustive-deps
  330:6   error    React Hook useEffect has a missing dependency: 'setActiveNetwork'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  341:43  warning  'coinCode' is already declared in the upper scope on line 319 column 9                                               @typescript-eslint/no-shadow
  364:5   error    'userDetails' is assigned a value but never used                                                                     @typescript-eslint/no-unused-vars
  371:5   warning  Value of 'error' may be overwritten in IE 8 and earlier                                                              no-catch-shadow
  387:7   warning  Value of 'error' may be overwritten in IE 8 and earlier                                                              no-catch-shadow
  387:14  warning  'error' is already declared in the upper scope on line 376 column 30                                                 @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/CoinWallet/MiniTransactionHistory.tsx
  22:11  error  'UserDetails' is defined but never used                                                                                    @typescript-eslint/no-unused-vars
  55:19  error  'setFilters' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/CoinWallet/operationButton.tsx
  80:3  error  'coinData' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/QRcodeScreen/ShowQr.tsx
  32:60  error  'name' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/TransactionHistory/ListItem.tsx
  203:24  warning  Missing radix parameter                        radix
  210:37  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/TransactionHistory/RedemptionListItem.tsx
  2:21  error  'Image' is defined but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/TransactionHistory/TransactionDetailsModal.tsx
  36:65  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “TransactionDetailsModal” and pass data as props  react/no-unstable-nested-components

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/TransactionHistory/index.tsx
  22:16  error  'setUserName' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
  25:10  error  'page' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u         @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Transfer/TrasferCoin/TransferCoin.tsx
  157:12  error  'bridgeError' is assigned a value but never used                                                                                                                                                                                   @typescript-eslint/no-unused-vars
  185:10  error  'usdValue' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u                                                                                                            @typescript-eslint/no-unused-vars
  197:45  error  'tokenBalanceUsd' is assigned a value but never used                                                                                                                                                                               @typescript-eslint/no-unused-vars
  254:6   error  React Hook useEffect has a missing dependency: 'coinCode'. Either include it or remove the dependency array. You can also replace multiple useState variables with useReducer if 'setToken' needs the current value of 'coinCode'  react-hooks/exhaustive-deps
  286:6   error  React Hook useEffect has a missing dependency: 'initiateSwap'. Either include it or remove the dependency array                                                                                                                    react-hooks/exhaustive-deps
  306:6   error  React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array                                                                                                                react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AuthScreens/loginScreen.tsx
   83:6   error    React Hook useEffect has a missing dependency: 'handleUserData'. Either include it or remove the dependency array                                                                                                                                                                                                                      react-hooks/exhaustive-deps
  217:15  warning  'userData' is already declared in the upper scope on line 70 column 32                                                                                                                                                                                                                                                                 @typescript-eslint/no-shadow
  240:15  warning  'userData' is already declared in the upper scope on line 70 column 32                                                                                                                                                                                                                                                                 @typescript-eslint/no-shadow
  260:15  warning  'userData' is already declared in the upper scope on line 70 column 32                                                                                                                                                                                                                                                                 @typescript-eslint/no-shadow
  312:6   error    React Hook useCallback has unnecessary dependencies: 'checkDenergyNetworkAuth' and 'checkSepoliaNetworkAuth'. Either exclude them or remove the dependency array                                                                                                                                                                       react-hooks/exhaustive-deps
  387:5   error    React Hook useCallback has a missing dependency: 'prepareNewUserData'. Either include it or remove the dependency array                                                                                                                                                                                                                react-hooks/exhaustive-deps
  403:13  warning  'userData' is already declared in the upper scope on line 70 column 32                                                                                                                                                                                                                                                                 @typescript-eslint/no-shadow
  533:25  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “LoginScreen” and pass data as props  react/no-unstable-nested-components
  550:16  warning  Inline style: {
  marginTop: 20,
  fontSize: 16,
  color: '#333',
  textAlign: 'center',
  fontWeight: '500'
}                                                                                                                                                                                                                         react-native/no-inline-styles
  561:16  warning  Inline style: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' }                                                                                                                                                                                                                                                       react-native/no-inline-styles
  574:14  warning  Inline style: {
  flex: 1,
  backgroundColor: '#fff',
  paddingTop: "Platform.OS === 'ios' ? 0 : 20"
}                                                                                                                                                                                                                                 react-native/no-inline-styles
  589:24  warning  Inline style: { paddingVertical: 15, marginHorizontal: 15 }                                                                                                                                                                                                                                                                            react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/HomeScreen/PieChart.tsx
  59:14  error    'slice' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
  80:42  warning  Inline style: { color: '#000000' }                                       react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/HomeScreen/index.tsx
  128:8  error  React Hook useCallback has a missing dependency: 'refreshAllBalances'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/BuyNFT/TransactionConfirmed.tsx
  62:6  error  React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/BuyNFT/index.tsx
  113:6   error    React Hook useEffect has a missing dependency: 'refreshBalance'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                          react-hooks/exhaustive-deps
  118:19  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “BuyNFTScreen” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components
  124:20  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “BuyNFTScreen” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components
  131:6   error    React Hook useEffect has missing dependencies: 'handleClose' and 'handleGoBack'. Either include them or remove the dependency array                                                                                                                                                                                                                                                                                        react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/CollectionDetailsPage/index.tsx
  53:6  error  React Hook useEffect has a missing dependency: 'fadeAnim'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/NFTDetailsPage/index.tsx
   25:10  error    'isBuyModalVisible' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u      @typescript-eslint/no-unused-vars
   25:29  error    'setIsBuyModalVisible' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u   @typescript-eslint/no-unused-vars
   26:10  error    'isSellModalVisible' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u     @typescript-eslint/no-unused-vars
   26:30  error    'setIsSellModalVisible' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
   52:6   error    React Hook useEffect has a missing dependency: 'refetch'. Either include it or remove the dependency array                            react-hooks/exhaustive-deps
   58:6   error    React Hook useEffect has a missing dependency: 'refetchActivity'. Either include it or remove the dependency array                    react-hooks/exhaustive-deps
  108:25  warning  Inline style: { backgroundColor: '#f9fafa' }                                                                                          react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/OffsetScreen/index.tsx
   59:10  error    'dateFieldEditing' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
  131:6   error    React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array              react-hooks/exhaustive-deps
  368:30  warning  Inline style: { flexGrow: 1 }                                                                                                    react-native/no-inline-styles
  679:25  warning  Inline style: { borderBottomWidth: 0 }                                                                                           react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/SellNFT/TransactionConfirmed.tsx
  45:6  error  React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/SellNFT/index.tsx
  180:6   error    React Hook useEffect has a missing dependency: 'nftToSell?.marketData?.activeAsks'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  186:6   error    React Hook useEffect has a missing dependency: 'setActiveNetwork'. Either include it or remove the dependency array                   react-hooks/exhaustive-deps
  263:17  warning  'isApproved' is already declared in the upper scope on line 256 column 23                                                             @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/WalletNFTDetailsPage/NFTDetailHistory.tsx
  44:19  error  'setFilters' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/WalletNFTDetailsPage/NFTHistory/EnergyCertificateList.tsx
   10:3   error    'Dimensions' is defined but never used                               @typescript-eslint/no-unused-vars
  167:11  warning  'date' is already declared in the upper scope on line 164 column 55  @typescript-eslint/no-shadow
  329:49  warning  Inline style: { marginBottom: 20 }                                   react-native/no-inline-styles
  360:5   warning  'data' is already declared in the upper scope on line 349 column 3   @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/WalletNFTDetailsPage/index.tsx
  129:10  error  'userDetails' is assigned a value but never used                                                                                                                                                             @typescript-eslint/no-unused-vars
  137:10  error  'metadataLoading' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u                                                                               @typescript-eslint/no-unused-vars
  139:36  error  'isKycSkipped' is assigned a value but never used                                                                                                                                                            @typescript-eslint/no-unused-vars
  207:6   error  React Hook useEffect has missing dependencies: 'fetchNftMetadata', 'magic.rpcProvider', 'nft.collectionAddress', 'nft?.tokenId', and 'setActiveNetwork'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  256:18  error  'error' is defined but never used. Allowed unused args must match /^_/u                                                                                                                                      @typescript-eslint/no-unused-vars
  295:14  error  'activityLoading' is assigned a value but never used                                                                                                                                                         @typescript-eslint/no-unused-vars
  296:12  error  'activityError' is assigned a value but never used                                                                                                                                                           @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/WalletNFTDetailsPage/useNFTTransactionHistory.ts
   2:8   error    'moment' is defined but never used                                   @typescript-eslint/no-unused-vars
  61:9   error    'queryParams' is assigned a value but never used                     @typescript-eslint/no-unused-vars
  62:11  warning  'params' is already declared in the upper scope on line 43 column 3  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/index.tsx
    3:3   error    'SafeAreaView' is defined but never used                                                                             @typescript-eslint/no-unused-vars
    9:3   error    'ActivityIndicator' is defined but never used                                                                        @typescript-eslint/no-unused-vars
   40:6   error    React Hook useEffect has a missing dependency: 'setActiveNetwork'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  271:36  warning  Inline style: { paddingBottom: 20 }                                                                                  react-native/no-inline-styles
  475:29  warning  Inline style: { borderBottomWidth: 0 }                                                                               react-native/no-inline-styles
  499:26  warning  Inline style: { marginBottom: 'index === processedCollections.length - 1 ? 150 : 0' }                                react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/NewsScreens/News/index.tsx
   54:15  error    'props' is defined but never used. Allowed unused args must match /^_/u                                                                                                                                                                                                                                                                                                                                            @typescript-eslint/no-unused-vars
  125:35  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “News” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/NewsScreens/NewsDetail/index.tsx
  103:48  warning  Inline style: { width: '60%' }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Send/SendCoin/index.tsx
  136:6  error  React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/CategoryTab.tsx
  2:22  error  'Tab' is defined but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/Hooks/useNFTStaking.ts
  144:15  warning  'magic' is already declared in the upper scope on line 65 column 10                                                                                    @typescript-eslint/no-shadow
  187:5   error    React Hook useCallback has an unnecessary dependency: 'magic'. Either exclude it or remove the dependency array                                        react-hooks/exhaustive-deps
  220:13  warning  'magic' is already declared in the upper scope on line 65 column 10                                                                                    @typescript-eslint/no-shadow
  241:15  warning  'isApproved' is already declared in the upper scope on line 63 column 10                                                                               @typescript-eslint/no-shadow
  345:5   error    React Hook useCallback has unnecessary dependencies: 'magic', 'refreshBalance', and 'userDetails'. Either exclude them or remove the dependency array  react-hooks/exhaustive-deps
  489:5   error    React Hook useCallback has unnecessary dependencies: 'refreshBalance' and 'userDetails'. Either exclude them or remove the dependency array            react-hooks/exhaustive-deps
  534:17  warning  'validatorAddress' is already declared in the upper scope on line 60 column 31                                                                         @typescript-eslint/no-shadow
  575:17  warning  'validatorAddress' is already declared in the upper scope on line 60 column 31                                                                         @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/Hooks/useWATTStaking.ts
  215:5   error    React Hook useCallback has an unnecessary dependency: 'userDetails'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps
  354:5   error    React Hook useCallback has an unnecessary dependency: 'userDetails'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps
  370:38  warning  'validatorAddress' is already declared in the upper scope on line 50 column 32                                         @typescript-eslint/no-shadow
  443:17  warning  'validatorAddress' is already declared in the upper scope on line 50 column 32                                         @typescript-eslint/no-shadow
  477:17  warning  'validatorAddress' is already declared in the upper scope on line 50 column 32                                         @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/StakeListingScreen.tsx
   72:10  error    'expandedAddresses' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u     @typescript-eslint/no-unused-vars
   72:29  error    'setExpandedAddresses' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
  468:25  warning  Missing radix parameter                                                                                                              radix
  482:25  warning  Missing radix parameter                                                                                                              radix

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/StakeScreen/NFTStakeComponent.tsx
   16:9   error    'useAuth' is defined but never used                                                                                                                    @typescript-eslint/no-unused-vars
   47:6   error    React Hook useEffect has missing dependencies: 'activeNetwork', 'refresh', and 'setActiveNetwork'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  252:15  warning  Inline style: { padding: 4 }                                                                                                                           react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/StakeScreen/WATTStakeComponent.tsx
   7:9   error  'useAuth' is defined but never used                                                                                          @typescript-eslint/no-unused-vars
   8:9   error  'useWallet' is defined but never used                                                                                        @typescript-eslint/no-unused-vars
  34:21  error  'setIsLoading' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/StakeScreen/index.tsx
   34:5   error    'nfts' is assigned a value but never used                                                                                                                                                                                                                                                                                              @typescript-eslint/no-unused-vars
   35:16  error    'isNFTLoading' is assigned a value but never used                                                                                                                                                                                                                                                                                      @typescript-eslint/no-unused-vars
   36:5   error    'error' is assigned a value but never used                                                                                                                                                                                                                                                                                             @typescript-eslint/no-unused-vars
   37:5   error    'refresh' is assigned a value but never used                                                                                                                                                                                                                                                                                           @typescript-eslint/no-unused-vars
   45:16  error    'isNFTStakingLoading' is assigned a value but never used                                                                                                                                                                                                                                                                               @typescript-eslint/no-unused-vars
   46:12  error    'nftStakingError' is assigned a value but never used                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unused-vars
   50:10  error    'setActiveNetwork' is assigned a value but never used                                                                                                                                                                                                                                                                                  @typescript-eslint/no-unused-vars
   62:29  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “StakeScreen” and pass data as props  react/no-unstable-nested-components
   68:30  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “StakeScreen” and pass data as props  react/no-unstable-nested-components
   91:9   error    'handleStake' is assigned a value but never used                                                                                                                                                                                                                                                                                       @typescript-eslint/no-unused-vars
  156:31  warning  Inline style: { backgroundColor: 'transparent' }                                                                                                                                                                                                                                                                                       react-native/no-inline-styles
  159:22  warning  Inline style: { backgroundColor: 'transparent' }                                                                                                                                                                                                                                                                                       react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/UnstakeScreen/index.tsx
   24:10  error    'userDetails' is assigned a value but never used                                                                     @typescript-eslint/no-unused-vars
   27:12  error    'nftStakingError' is assigned a value but never used                                                                 @typescript-eslint/no-unused-vars
   44:6   error    React Hook useEffect has a missing dependency: 'setActiveNetwork'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  186:21  warning  Inline style: {
  backgroundColor: "stakingData.status === 'active' ? '#D4F5E9' : '#F5F5F5'"
}                       react-native/no-inline-styles
  194:23  warning  Inline style: { color: "stakingData.status === 'active' ? '#28A745' : '#666'" }                                      react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/ValidatorDetailsScreen.tsx
   55:36  error    'isKycSkipped' is assigned a value but never used                                                                   @typescript-eslint/no-unused-vars
  109:6   error    React Hook useEffect has a missing dependency: 'singleValidator'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  145:18  error    'error' is defined but never used. Allowed unused args must match /^_/u                                             @typescript-eslint/no-unused-vars
  145:18  warning  'error' is already declared in the upper scope on line 54 column 10                                                 @typescript-eslint/no-shadow
  303:41  error    'index' is defined but never used. Allowed unused args must match /^_/u                                             @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/ValidatorsScreen.tsx
   31:59  error    'props' is defined but never used. Allowed unused args must match /^_/u                                                                                                                        @typescript-eslint/no-unused-vars
   58:6   error    React Hook useEffect has a missing dependency: 'fetchValidators'. Either include it or remove the dependency array                                                                             react-hooks/exhaustive-deps
  139:9   error    'getFilteredCount' is assigned a value but never used                                                                                                                                          @typescript-eslint/no-unused-vars
  140:9   error    'getTotalCount' is assigned a value but never used                                                                                                                                             @typescript-eslint/no-unused-vars
  220:19  warning  Inline style: { marginBottom: "index === validators.length - 1 ? '22%' : 16" }                                                                                                                 react-native/no-inline-styles
  234:27  warning  Inline style: {
  backgroundColor: "formattedStatus.toLowerCase() === 'active'\n" +
    "                                ? '#4CAF50'\n" +
    "                                : '#F44336'"
}  react-native/no-inline-styles
  245:27  warning  Inline style: {
  color: "formattedStatus.toLowerCase() === 'active'\n" +
    "                                ? '#4CAF50'\n" +
    "                                : '#F44336'"
}            react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/index.tsx
    3:27  error    'Text' is defined but never used                                                                                                                                                                                                                                                                                                 @typescript-eslint/no-unused-vars
    3:33  error    'RefreshControl' is defined but never used                                                                                                                                                                                                                                                                                       @typescript-eslint/no-unused-vars
   55:11  error    'StakeListingScreenProps' is defined but never used                                                                                                                                                                                                                                                                              @typescript-eslint/no-unused-vars
   64:11  error    'ValidatorsScreenProps' is defined but never used                                                                                                                                                                                                                                                                                @typescript-eslint/no-unused-vars
   70:16  error    'props' is defined but never used. Allowed unused args must match /^_/u                                                                                                                                                                                                                                                          @typescript-eslint/no-unused-vars
  116:31  error    'index' is defined but never used. Allowed unused args must match /^_/u                                                                                                                                                                                                                                                          @typescript-eslint/no-unused-vars
  116:31  warning  'index' is already declared in the upper scope on line 71 column 10                                                                                                                                                                                                                                                              @typescript-eslint/no-shadow
  117:38  warning  Missing radix parameter                                                                                                                                                                                                                                                                                                          radix
  121:31  warning  Missing radix parameter                                                                                                                                                                                                                                                                                                          radix
  122:27  warning  Missing radix parameter                                                                                                                                                                                                                                                                                                          radix
  183:29  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Stake” and pass data as props  react/no-unstable-nested-components
  189:30  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Stake” and pass data as props  react/no-unstable-nested-components
  202:30  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Stake” and pass data as props  react/no-unstable-nested-components
  218:25  warning  Inline style: { borderBottomWidth: 0 }                                                                                                                                                                                                                                                                                           react-native/no-inline-styles
  235:27  warning  Inline style: { backgroundColor: 'transparent' }                                                                                                                                                                                                                                                                                 react-native/no-inline-styles
  238:18  warning  Inline style: { backgroundColor: 'transparent' }                                                                                                                                                                                                                                                                                 react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Swap/SwapConfirmationModal.tsx
   13:9   error    'ScreenWidth' is defined but never used                                                                                                                                                                                                                     @typescript-eslint/no-unused-vars
  136:23  warning  Inline style: {
  color: 'priceImpact > 3\n' +
    "                            ? '#FF3B30'\n" +
    '                            : priceImpact > 1\n' +
    "                            ? '#FF9500'\n" +
    "                            : '#34C759'"
}  react-native/no-inline-styles
  252:47  warning  Inline style: { opacity: 'isLoading ? 0.7 : 1' }                                                                                                                                                                                                            react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Swap/index.tsx
   58:5   error    'account' is assigned a value but never used                                                                                                                                                                                                                                                                                                                                                                       @typescript-eslint/no-unused-vars
  134:6   error    React Hook useEffect has a missing dependency: 'setActiveNetwork'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                react-hooks/exhaustive-deps
  157:6   error    React Hook useEffect has a missing dependency: 'TOKENS'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                          react-hooks/exhaustive-deps
  187:6   error    React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                react-hooks/exhaustive-deps
  439:28  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Swap” and pass data as props                                                                                     react/no-unstable-nested-components
  471:29  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Swap” and pass data as props                                                                                     react/no-unstable-nested-components
  719:19  warning  Inline style: { color: "quote.priceImpact > 3 ? '#FF3B30' : '#34C759'" }                                                                                                                                                                                                                                                                                                                                           react-native/no-inline-styles
  838:25  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Swap” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/wallet/AreaChart.tsx
  7:18  warning  Inline style: { width: 100, height: 120 }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/wallet/MyCryptoCard.tsx
   34:25  warning  'code' is already declared in the upper scope on line 22 column 3    @typescript-eslint/no-shadow
   39:25  warning  'width' is already declared in the upper scope on line 31 column 9   @typescript-eslint/no-shadow
   41:36  warning  'width' is already declared in the upper scope on line 31 column 9   @typescript-eslint/no-shadow
   41:43  warning  'height' is already declared in the upper scope on line 30 column 9  @typescript-eslint/no-shadow
  102:22  warning  Inline style: { alignItems: 'flex-end' }                             react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/wallet/index.tsx
   43:11  error    'Balance' is defined but never used                                                                                   @typescript-eslint/no-unused-vars
   67:10  error    'items' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
   73:9   error    'account' is assigned a value but never used                                                                          @typescript-eslint/no-unused-vars
  220:6   error    React Hook useEffect has a missing dependency: 'init'. Either include it or remove the dependency array               react-hooks/exhaustive-deps
  225:18  warning  Inline style: { backgroundColor: '#fff', flex: 1 }                                                                    react-native/no-inline-styles
  228:32  warning  Inline style: { paddingBottom: 50 }                                                                                   react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/wallet/style.js
    2:9  warning  'Colors' is defined but never used  no-unused-vars
  129:3  error    Duplicate key 'divider'             no-dupe-keys
  135:3  error    Duplicate key 'contentText'         no-dupe-keys

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/bottomsheet.js
  13:43  error  React Hook useMemo has a missing dependency: 'sizes'. Either include it or remove the dependency array             react-hooks/exhaustive-deps
  39:6   error  React Hook useCallback has a missing dependency: 'closeOnIndex'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  44:8   error  'BottomSheetBackdrop' is not defined                                                                               react/jsx-no-undef

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/cart.js
   9:9   warning  'addMultipleToCartNft' is defined but never used                     no-unused-vars
  20:12  warning  'error' is already declared in the upper scope on line 15 column 10  no-shadow
  20:35  error    'listCartApi' is not defined                                         no-undef
  40:12  warning  'error' is already declared in the upper scope on line 15 column 10  no-shadow
  40:19  warning  'data' is already declared in the upper scope on line 14 column 10   no-shadow
  40:33  error    'removeFromCartNftApi' is not defined                                no-undef
  51:12  warning  'error' is already declared in the upper scope on line 15 column 10  no-shadow
  51:19  warning  'data' is already declared in the upper scope on line 14 column 10   no-shadow
  51:33  error    'addMultiplToCartNftApi' is not defined                              no-undef
  61:12  warning  'error' is already declared in the upper scope on line 15 column 10  no-shadow
  61:19  warning  'data' is already declared in the upper scope on line 14 column 10   no-shadow
  61:33  error    'addToCartNftApi' is not defined                                     no-undef
  71:12  warning  'error' is already declared in the upper scope on line 15 column 10  no-shadow
  71:19  warning  'data' is already declared in the upper scope on line 14 column 10   no-shadow
  71:33  error    'clearCartApi' is not defined                                        no-undef

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketPlace.ts
   78:13  warning  'activeAsks' is already declared in the upper scope on line 11 column 3  @typescript-eslint/no-shadow
  170:3   warning  'activeAsks' is already declared in the upper scope on line 11 column 3  @typescript-eslint/no-shadow
  531:7   error    'fetchWalletMarketData' is assigned a value but never used               @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketplace/requiresApproval.ts
  52:11  warning  'isApprovedForAll' is already declared in the upper scope on line 37 column 14  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketplace/useCallWithGasPrice.ts
  21:9  error  The 'provider' object construction makes the dependencies of useCallback Hook (at line 70) change on every render. Move it inside the useCallback callback. Alternatively, wrap the initialization of 'provider' in its own useMemo() Hook  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketplace/useCatchTxError.tsx
  25:7  error  'provider' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketplace/useGasPrice.ts
  36:6  error  React Hook useEffect has a missing dependency: 'signer'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useApi.ts
  23:50  error  React Hook useMemo has a missing dependency: 'options'. Either include it or remove the dependency array                                react-hooks/exhaustive-deps
  23:51  error  React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useBridge.ts
  246:5   error  React Hook useCallback has missing dependencies: 'refreshBalance', 'setActiveNetwork', and 'updateProcessingStep'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  284:17  error  'balance' is assigned a value but never used                                                                                                                           @typescript-eslint/no-unused-vars
  352:5   error  React Hook useCallback has missing dependencies: 'refreshBalance', 'setActiveNetwork', and 'updateProcessingStep'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  376:15  error  'usdcAddress' is assigned a value but never used                                                                                                                       @typescript-eslint/no-unused-vars
  394:17  error  'balance' is assigned a value but never used                                                                                                                           @typescript-eslint/no-unused-vars
  409:15  error  'approvalReceipt' is assigned a value but never used                                                                                                                   @typescript-eslint/no-unused-vars
  464:5   error  React Hook useCallback has missing dependencies: 'refreshBalance', 'setActiveNetwork', and 'updateProcessingStep'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  489:15  error  'eurcAddress' is assigned a value but never used                                                                                                                       @typescript-eslint/no-unused-vars
  522:15  error  'approvalReceipt' is assigned a value but never used                                                                                                                   @typescript-eslint/no-unused-vars
  575:5   error  React Hook useCallback has missing dependencies: 'refreshBalance', 'setActiveNetwork', and 'updateProcessingStep'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useCompleteNft.ts
  33:7   warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  33:14  warning  'error' is already declared in the upper scope on line 22 column 10  @typescript-eslint/no-shadow
  61:13  warning  'nft' is already declared in the upper scope on line 20 column 10    @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useNfts.ts
  32:7   warning  Value of 'error' may be overwritten in IE 8 and earlier                                                       no-catch-shadow
  32:14  warning  'error' is already declared in the upper scope on line 23 column 10                                           @typescript-eslint/no-shadow
  76:6   error    React Hook useEffect has a missing dependency: 'fetchNfts'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useNftsForAddress.ts
  17:9  error  The 'collectionsRes' logical expression could make the dependencies of useCallback Hook (at line 41) change on every render. To fix this, wrap the initialization of 'collectionsRes' in its own useMemo() Hook  react-hooks/exhaustive-deps
  17:9  error  The 'collectionsRes' logical expression could make the dependencies of useEffect Hook (at line 51) change on every render. To fix this, wrap the initialization of 'collectionsRes' in its own useMemo() Hook    react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useOffsetNft.ts
   14:56  error    'walletAddress' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
  248:13  warning  'data' is already declared in the upper scope on line 43 column 10               @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSendEth.ts
  117:16  error    'data' is assigned a value but never used                            @typescript-eslint/no-unused-vars
  132:9   warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  132:16  warning  'error' is already declared in the upper scope on line 43 column 10  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSendUSDCANDEURC.ts
  145:16  error  'data' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSendWATT.ts
   39:3   error    'customRpcUrl' is assigned a value but never used                    @typescript-eslint/no-unused-vars
  100:18  error    'data' is assigned a value but never used                            @typescript-eslint/no-unused-vars
  115:11  warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  115:18  warning  'error' is already declared in the upper scope on line 42 column 10  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSuccessSound.ts
  19:60  warning  'error' is already declared in the upper scope on line 7 column 10  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSwap.ts
  263:20  error    'setTxStatus' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u                 @typescript-eslint/no-unused-vars
  352:17  warning  'balance' is already declared in the upper scope on line 267 column 10                                                                     @typescript-eslint/no-shadow
  372:17  warning  'balance' is already declared in the upper scope on line 267 column 10                                                                     @typescript-eslint/no-shadow
  419:13  warning  'allowance' is already declared in the upper scope on line 268 column 10                                                                   @typescript-eslint/no-shadow
  429:6   error    React Hook useCallback has a missing dependency: 'getInputToken'. Either include it or remove the dependency array                         react-hooks/exhaustive-deps
  608:6   error    React Hook useCallback has missing dependencies: 'getInputToken' and 'getOutputToken'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  860:11  warning  'errorMessage' is already declared in the upper scope on line 262 column 10                                                                @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useTransactionHistory.ts
   37:54  warning  Missing radix parameter                                                                                                 radix
   38:29  warning  Missing radix parameter                                                                                                 radix
   50:31  warning  Missing radix parameter                                                                                                 radix
   51:13  error    'timeDiff' is assigned a value but never used                                                                           @typescript-eslint/no-unused-vars
  237:6   error    React Hook useCallback has a missing dependency: 'fetchTransactions'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  248:6   error    React Hook useCallback has a missing dependency: 'fetchTransactions'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  324:6   error    React Hook useEffect has a missing dependency: 'fetchTransactions'. Either include it or remove the dependency array    react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useWalletBalance.ts
   63:10  error    'userDetails' is assigned a value but never used                     @typescript-eslint/no-unused-vars
  160:11  warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  160:18  warning  'error' is already declared in the upper scope on line 81 column 10  @typescript-eslint/no-shadow
  182:11  warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  182:18  warning  'error' is already declared in the upper scope on line 81 column 10  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/services/errorService.ts
  213:48  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/navigation/constant.js
  99:3  error  Duplicate key 'STAKE'  no-dupe-keys

/Users/jeminramani/Documents/projects/denergy/d_wallet/screens/Provider/GraphQLProvider.tsx
  130:11  error  'handleAuthChange' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/screens/Provider/NftProvider.tsx
   62:9  error  The 'collectionsRes' logical expression could make the dependencies of useCallback Hook (at line 103) change on every render. To fix this, wrap the initialization of 'collectionsRes' in its own useMemo() Hook  react-hooks/exhaustive-deps
   62:9  error  The 'collectionsRes' logical expression could make the dependencies of useEffect Hook (at line 114) change on every render. To fix this, wrap the initialization of 'collectionsRes' in its own useMemo() Hook    react-hooks/exhaustive-deps
  127:6  error  React Hook useCallback has an unnecessary dependency: 'account'. Either exclude it or remove the dependency array                                                                                                 react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/screens/Provider/WalletProvider.tsx
  93:6  error  React Hook useEffect has a missing dependency: 'fetchAllBalances'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/screens/Provider/authProvider.tsx
  5:9  error  'Alert' is defined but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/shim.js
  21:3  error  'localStorage' is not defined  no-undef

✖ 292 problems (166 errors, 126 warnings)
  0 errors and 4 warnings potentially fixable with the `--fix` option.

info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
