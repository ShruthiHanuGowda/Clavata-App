yarn run v1.22.22
$ eslint .

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/Dinputs.tsx
  57:20  warning  Unnecessary escape character: \+  no-useless-escape
  57:44  warning  Unnecessary escape character: \.  no-useless-escape
  57:60  warning  Unnecessary escape character: \.  no-useless-escape

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/Loading/LoadingScreenWIthStep.tsx
  58:27  warning  Expected { after 'if' condition  curly
  79:30  warning  Expected { after 'if' condition  curly
  99:19  warning  Expected { after 'if' condition  curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/MarketPlace/ActivityList/index.tsx
  62:23  warning  'activity' is already declared in the upper scope on line 28 column 53  @typescript-eslint/no-shadow
  97:25  warning  Missing radix parameter                                                 radix

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/MarketPlace/BuySellModal/BuyModal/index.tsx
  130:11  warning  Strings must use singlequote     quotes
  139:39  warning  Expected { after 'if' condition  curly
  166:46  warning  Inline style: { padding: 16 }    react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/MarketPlace/BuySellModal/SellModal/SellStage.tsx
  39:9  error  'handleConfirmSell' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/MarketPlace/BuySellModal/SellModal/SetPriceStage.tsx
  95:22  warning  Inline style: { flex: 1 }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/MarketPlace/BuySellModal/SellModal/TransferStage.tsx
  74:22  warning  Inline style: { flex: 1 }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/MarketPlace/BuySellModal/SellModal/index.tsx
  130:27  error    'setCurrentAskPrice' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
  213:23  warning  Expected { after 'if' condition                                                                                                    curly
  215:17  warning  'isApproved' is already declared in the upper scope on line 210 column 23                                                          @typescript-eslint/no-shadow
  233:33  error    'receipt' is defined but never used. Allowed unused args must match /^_/u                                                          @typescript-eslint/no-unused-vars
  235:11  warning  Strings must use singlequote                                                                                                       quotes
  289:23  warning  Expected { after 'if' condition                                                                                                    curly
  322:46  warning  Inline style: { padding: 16 }                                                                                                      react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/MarketPlace/ContractInfo/index.tsx
  43:35  warning  Inline style: { marginTop: 12 }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/MarketPlace/NFTCard/index.tsx
   51:36  warning  Missing trailing comma                         comma-dangle
  148:24  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/MarketPlace/UserNFTCard/index.tsx
  15:11  error  'SellNftProps' is defined but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/QRScan/QRCodeScannerModal.tsx
  25:8   error  'width' is assigned a value but never used                               @typescript-eslint/no-unused-vars
  25:15  error  'height' is assigned a value but never used                              @typescript-eslint/no-unused-vars
  98:36  error  'frame' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/ReceiverDetails.tsx
  11:9  error  'DTextInput' is defined but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/rc_imageButton.js
  20:22  warning  Inline style: { justifyContent: 'center', alignItems: 'center' }                                                                                                                                                             react-native/no-inline-styles
  22:20  warning  Inline style: {
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#BCBFBF',
  backgroundColor: '#BCBFBF',
  width: '98%',
  height: '100%',
  marginHorizontal: 10,
  borderRadius: 7
}  react-native/no-inline-styles
  35:24  warning  Inline style: { color: '#fff', textAlign: 'center', fontSize: 14 }                                                                                                                                                           react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/rc_menuList.js
  3:22  warning  'Images' is defined but never used                            no-unused-vars
  7:30  warning  Inline style: { paddingVertical: 10 }                         react-native/no-inline-styles
  9:22  warning  Inline style: { flexDirection: 'row', alignItems: 'center' }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Componants/rc_radioButton.js
  11:12  warning  'value' is assigned a value but never used  no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/GlobalKycBottomSheet.tsx
    9:3  error  'Alert' is defined but never used                                                                                             @typescript-eslint/no-unused-vars
   10:3  error  'ViewStyle' is defined but never used                                                                                         @typescript-eslint/no-unused-vars
   11:3  error  'TextStyle' is defined but never used                                                                                         @typescript-eslint/no-unused-vars
  114:6  error  React Hook useCallback has an unnecessary dependency: 'hideKycBottomSheet'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps
  190:8  error  'width' is assigned a value but never used                                                                                    @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/GlobalKycProvider.tsx
   10:9   error    'Alert' is defined but never used                                                                                              @typescript-eslint/no-unused-vars
   10:16  error    'Platform' is defined but never used                                                                                           @typescript-eslint/no-unused-vars
   15:3   error    'ApolloClient' is defined but never used                                                                                       @typescript-eslint/no-unused-vars
   16:3   error    'NormalizedCacheObject' is defined but never used                                                                              @typescript-eslint/no-unused-vars
   63:11  error    'KycTokenData' is defined but never used                                                                                       @typescript-eslint/no-unused-vars
  230:10  error    'isKycStarted' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u    @typescript-eslint/no-unused-vars
  512:21  error    'event' is defined but never used. Allowed unused args must match /^_/u                                                        @typescript-eslint/no-unused-vars
  646:9   error    'showAlerts' is assigned a value but never used                                                                                @typescript-eslint/no-unused-vars
  654:24  warning  Expected { after 'if' condition                                                                                                curly
  669:5   error    React Hook useCallback has an unnecessary dependency: 'kycStatus.isSkipped'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/KYC/KycBottomSheet.tsx
    7:3  error  'Image' is defined but never used           @typescript-eslint/no-unused-vars
  171:8  error  'width' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/KYC/KycServiceProvider.tsx
    1:56  error  'useState' is defined but never used                                                                                              @typescript-eslint/no-unused-vars
   50:29  error  'expiryTime' is assigned a value but never used                                                                                   @typescript-eslint/no-unused-vars
   86:29  error  'userId' is assigned a value but never used                                                                                       @typescript-eslint/no-unused-vars
  179:8   error  React Hook useCallback has a missing dependency: 'handleVerificationCompleted'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/KYC/useKycStatusUpdate.tsx
   61:18  error    'data' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
   61:18  warning  'data' is already declared in the upper scope on line 57 column 44      @typescript-eslint/no-shadow
   64:14  warning  'error' is already declared in the upper scope on line 57 column 37     @typescript-eslint/no-shadow
  124:7   warning  Value of 'error' may be overwritten in IE 8 and earlier                 no-catch-shadow
  124:14  warning  'error' is already declared in the upper scope on line 57 column 37     @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/CustomHooks/useKycVerification.ts
  1:22  error  'gql' is defined but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Navigation/LinkingConfiguration.js
  7:9  warning  'LinkingOptions' is defined but never used  no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Navigation/NavigationTab.tsx
  25:15  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Tabs” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Navigation/TabBar.tsx
   94:43  warning  Inline style: { opacity: 'active ? 1 : 0.5' }                               react-native/no-inline-styles
  171:9   warning  Inline style: { paddingBottom: "Platform.OS === 'android' ? bottom : 10" }  react-native/no-inline-styles
  179:11  warning  Inline style: { top: -24, left: 16 }                                        react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Navigation/constant.js
  99:3  error  Duplicate key 'STAKE'  no-dupe-keys

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Navigation/index.tsx
  317:18  warning  Inline style: { flex: 1 }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AddressBookScreens/AddressBookList/index.tsx
    1:53  error    'useEffect' is defined but never used                                                                                              @typescript-eslint/no-unused-vars
    9:3   error    'ActivityIndicator' is defined but never used                                                                                      @typescript-eslint/no-unused-vars
   40:22  error    'props' is defined but never used. Allowed unused args must match /^_/u                                                            @typescript-eslint/no-unused-vars
   57:14  error    'deleteLoading' is assigned a value but never used                                                                                 @typescript-eslint/no-unused-vars
   58:12  error    'deleteError' is assigned a value but never used                                                                                   @typescript-eslint/no-unused-vars
  192:46  warning  Expected { after 'if' condition                                                                                                    curly
  264:6   error    React Hook useCallback has an unnecessary dependency: 'handleCreateBeneficiary'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps
  298:50  warning  Inline style: { bottom: 5 }                                                                                                        react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AddressBookScreens/Componants/ContactCard.tsx
  39:28  error  'address' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AddressBookScreens/ContactModal.tsx
   17:8   error    'width' is assigned a value but never used                                                                                                                                                                                                                                                                                                                                                                                 @typescript-eslint/no-unused-vars
   41:3   error    'emptyMessage' is assigned a value but never used                                                                                                                                                                                                                                                                                                                                                                          @typescript-eslint/no-unused-vars
   70:31  warning  Expected { after 'if' condition                                                                                                                                                                                                                                                                                                                                                                                            curly
  117:13  error    'index' is defined but never used. Allowed unused args must match /^_/u                                                                                                                                                                                                                                                                                                                                                    @typescript-eslint/no-unused-vars
  210:6   error    React Hook useCallback has a missing dependency: 'onAddContact'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                          react-hooks/exhaustive-deps
  285:33  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “ContactModal” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Account/profilesetting.tsx
   26:1   warning  Trailing spaces not allowed                        no-trailing-spaces
   27:9   error    'toggleSwitch' is assigned a value but never used  @typescript-eslint/no-unused-vars
   30:1   warning  Trailing spaces not allowed                        no-trailing-spaces
   52:9   error    'copy' is assigned a value but never used          @typescript-eslint/no-unused-vars
  158:31  warning  Newline required at end of file but not found      eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Account/styles.ts
  74:4  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Accountpage/index.tsx
    7:3   error    'Pressable' is defined but never used                                                                                           @typescript-eslint/no-unused-vars
   10:9   error    'SafeAreaView' is defined but never used                                                                                        @typescript-eslint/no-unused-vars
   13:9   error    'SCREEN_CONSTANT' is defined but never used                                                                                     @typescript-eslint/no-unused-vars
   17:9   error    'isDev' is defined but never used                                                                                               @typescript-eslint/no-unused-vars
   45:1   warning  Trailing spaces not allowed                                                                                                     no-trailing-spaces
   49:1   warning  Trailing spaces not allowed                                                                                                     no-trailing-spaces
   54:10  error    'updateKycStatus' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
   64:10  error    'rating' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u           @typescript-eslint/no-unused-vars
   65:1   warning  Trailing spaces not allowed                                                                                                     no-trailing-spaces
   66:9   error    'toggleBottomView' is assigned a value but never used                                                                           @typescript-eslint/no-unused-vars
  145:1   warning  Trailing spaces not allowed                                                                                                     no-trailing-spaces
  146:9   warning  Empty components are self-closing                                                                                               react/self-closing-comp
  147:1   warning  Trailing spaces not allowed                                                                                                     no-trailing-spaces
  154:1   warning  Trailing spaces not allowed                                                                                                     no-trailing-spaces
  160:1   warning  Trailing spaces not allowed                                                                                                     no-trailing-spaces
  166:1   warning  Trailing spaces not allowed                                                                                                     no-trailing-spaces
  206:24  warning  Newline required at end of file but not found                                                                                   eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Accountpage/style.ts
  119:4  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Beneficiaries/beneficary.tsx
   47:9   error    'ListItem' is assigned a value but never used                                                                                                                                                                                                                                                                                                 @typescript-eslint/no-unused-vars
   47:45  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “AccountBeneficiary” and pass data as props  react/no-unstable-nested-components
   75:9   error    'ListEmpty' is assigned a value but never used                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unused-vars
   75:31  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “AccountBeneficiary” and pass data as props  react/no-unstable-nested-components
  107:1   warning  Trailing spaces not allowed                                                                                                                                                                                                                                                                                                                   no-trailing-spaces
  116:1   warning  Trailing spaces not allowed                                                                                                                                                                                                                                                                                                                   no-trailing-spaces
  231:35  warning  Newline required at end of file but not found                                                                                                                                                                                                                                                                                                 eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Beneficiaries/styles.ts
  88:4  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/CoinWallet/CoinWallet.tsx
   86:6   error    'CoinCode' is defined but never used                                                                                                           @typescript-eslint/no-unused-vars
   90:18  warning  Expected { after 'if' condition                                                                                                                curly
  125:42  warning  Expected { after 'if' condition                                                                                                                curly
  325:10  error    'createTransactionHistoryMobile' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
  334:43  warning  'coinCode' is already declared in the upper scope on line 312 column 9                                                                         @typescript-eslint/no-shadow
  353:22  error    React Hook "useAuth" is called conditionally. React Hooks must be called in the exact same order in every component render                     react-hooks/rules-of-hooks
  356:5   error    'userDetails' is assigned a value but never used                                                                                               @typescript-eslint/no-unused-vars
  363:5   warning  Value of 'error' may be overwritten in IE 8 and earlier                                                                                        no-catch-shadow
  376:7   warning  Value of 'error' may be overwritten in IE 8 and earlier                                                                                        no-catch-shadow
  376:14  warning  'error' is already declared in the upper scope on line 368 column 30                                                                           @typescript-eslint/no-shadow
  426:1   warning  Trailing spaces not allowed                                                                                                                    no-trailing-spaces
  776:27  warning  Newline required at end of file but not found                                                                                                  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/CoinWallet/MiniTransactionHistory.tsx
   31:3   error    'showFilter' is defined but never used. Allowed unused args must match /^_/u                                               @typescript-eslint/no-unused-vars
   32:3   error    'setShowFilter' is defined but never used. Allowed unused args must match /^_/u                                            @typescript-eslint/no-unused-vars
   59:19  error    'setFilters' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
   67:16  warning  Expected { after 'if' condition                                                                                            curly
   68:1   warning  Trailing spaces not allowed                                                                                                no-trailing-spaces
  175:39  warning  Newline required at end of file but not found                                                                              eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/CoinWallet/PriceHistoryGraph.tsx
   27:18  warning  Expected { after 'if' condition                curly
  125:34  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/CoinWallet/operationButton.tsx
  80:3  error  'coinData' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/CoinWallet/styles.ts
  118:4  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/ContactUs.tsx
  229:26  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/QRcodeScreen/ShowQr.tsx
   25:60  error    'name' is defined but never used. Allowed unused args must match /^_/u                                                      @typescript-eslint/no-unused-vars
   26:9   error    'saveQrToDisk' is assigned a value but never used                                                                           @typescript-eslint/no-unused-vars
   27:10  error    'downloading' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
   86:19  error    'res' is defined but never used. Allowed unused args must match /^_/u                                                       @typescript-eslint/no-unused-vars
  104:1   warning  Trailing spaces not allowed                                                                                                 no-trailing-spaces

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Receive/ReceiveScreen.tsx
  88:30  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/TransactionHistory/ListItem.js
    2:21  warning  'Image' is defined but never used                                                                       no-unused-vars
  169:18  warning  Inline style: { flexDirection: 'row', alignItems: 'center', width: '60%' }                              react-native/no-inline-styles
  171:20  warning  Inline style: { width: '100%', flexDirection: 'row', alignItems: 'center' }                             react-native/no-inline-styles
  173:26  warning  Inline style: { width: '80%', paddingRight: 10 }                                                        react-native/no-inline-styles
  175:24  warning  Inline style: { textTransform: 'capitalize' }                                                           react-native/no-inline-styles
  197:18  warning  Inline style: {
  width: '40%',
  alignSelf: 'flex-end',
  alignItems: 'flex-end',
  paddingLeft: 10
}  react-native/no-inline-styles
  215:26  warning  Missing radix parameter                                                                                 radix

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/TransactionHistory/RedemptionListItem.tsx
   2:21  error    'Image' is defined but never used                                                                                                                          @typescript-eslint/no-unused-vars
  27:3   error    'setSelectedItems' is defined but never used. Allowed unused args must match /^_/u                                                                         @typescript-eslint/no-unused-vars
  42:17  warning  Inline style: {
  color: "item.transactionStatus === 'Pending'\n" +
    "                      ? '#F7931A'\n" +
    "                      : '#515151'"
}  react-native/no-inline-styles
  94:35  warning  Newline required at end of file but not found                                                                                                              eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/TransactionHistory/TransactionDetailsModal.tsx
   36:65  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “TransactionDetailsModal” and pass data as props  react/no-unstable-nested-components
  112:40  warning  Newline required at end of file but not found                                                                                                                                                                                                                                                                                                      eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/TransactionHistory/TransactionFlatList.tsx
   51:22  warning  Expected { after 'if' condition                                    curly
   72:18  warning  Expected { after 'if' condition                                    curly
   73:22  warning  Expected { after 'if' condition                                    curly
   74:24  warning  Expected { after 'if' condition                                    curly
   75:34  warning  Expected { after 'if' condition                                    curly
  126:21  warning  Expected { after 'if' condition                                    curly
  174:25  warning  'data' is already declared in the upper scope on line 36 column 3  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/TransactionHistory/index.tsx
  22:16  error  'setUserName' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
  25:10  error  'page' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u         @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AppScreens/Transfer/TrasferCoin/TransferCoin.tsx
   29:9   error    'useMagic' is defined but never used                                                                                                                                                                                               @typescript-eslint/no-unused-vars
   87:11  error    'LoadingScreenProps' is defined but never used                                                                                                                                                                                     @typescript-eslint/no-unused-vars
  123:16  warning  Expected { after 'if' condition                                                                                                                                                                                                    curly
  129:15  warning  Expected { after 'if' condition                                                                                                                                                                                                    curly
  174:12  error    'bridgeError' is assigned a value but never used                                                                                                                                                                                   @typescript-eslint/no-unused-vars
  202:10  error    'usdValue' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u                                                                                                            @typescript-eslint/no-unused-vars
  214:45  error    'tokenBalanceUsd' is assigned a value but never used                                                                                                                                                                               @typescript-eslint/no-unused-vars
  271:6   error    React Hook useEffect has a missing dependency: 'coinCode'. Either include it or remove the dependency array. You can also replace multiple useState variables with useReducer if 'setToken' needs the current value of 'coinCode'  react-hooks/exhaustive-deps
  303:6   error    React Hook useEffect has a missing dependency: 'initiateSwap'. Either include it or remove the dependency array                                                                                                                    react-hooks/exhaustive-deps
  323:6   error    React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array                                                                                                                react-hooks/exhaustive-deps
  450:11  error    'targetCoinCode' is assigned a value but never used                                                                                                                                                                                @typescript-eslint/no-unused-vars
  459:11  error    'targetName' is assigned a value but never used                                                                                                                                                                                    @typescript-eslint/no-unused-vars
  476:16  warning  Expected { after 'if' condition                                                                                                                                                                                                    curly
  732:18  warning  Inline style: { width: 24, height: 24 }                                                                                                                                                                                            react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/AuthScreens/loginScreen.tsx
   55:26  error    'userDetails' is assigned a value but never used                                                                                                                                                                                                                                                                                       @typescript-eslint/no-unused-vars
   59:10  error    'isUserLogin' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u                                                                                                                                                                                                             @typescript-eslint/no-unused-vars
   73:31  error    'queryLoading' is assigned a value but never used                                                                                                                                                                                                                                                                                      @typescript-eslint/no-unused-vars
   84:6   error    React Hook useEffect has a missing dependency: 'handleUserData'. Either include it or remove the dependency array                                                                                                                                                                                                                      react-hooks/exhaustive-deps
  218:15  warning  'userData' is already declared in the upper scope on line 73 column 12                                                                                                                                                                                                                                                                 @typescript-eslint/no-shadow
  241:15  warning  'userData' is already declared in the upper scope on line 73 column 12                                                                                                                                                                                                                                                                 @typescript-eslint/no-shadow
  261:15  warning  'userData' is already declared in the upper scope on line 73 column 12                                                                                                                                                                                                                                                                 @typescript-eslint/no-shadow
  313:6   error    React Hook useCallback has unnecessary dependencies: 'checkDenergyNetworkAuth' and 'checkSepoliaNetworkAuth'. Either exclude them or remove the dependency array                                                                                                                                                                       react-hooks/exhaustive-deps
  389:5   error    React Hook useCallback has a missing dependency: 'prepareNewUserData'. Either include it or remove the dependency array                                                                                                                                                                                                                react-hooks/exhaustive-deps
  405:13  warning  'userData' is already declared in the upper scope on line 73 column 12                                                                                                                                                                                                                                                                 @typescript-eslint/no-shadow
  535:25  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “LoginScreen” and pass data as props  react/no-unstable-nested-components
  552:16  warning  Inline style: {
  marginTop: 20,
  fontSize: 16,
  color: '#333',
  textAlign: 'center',
  fontWeight: '500'
}                                                                                                                                                                                                                         react-native/no-inline-styles
  563:16  warning  Inline style: { marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' }                                                                                                                                                                                                                                                       react-native/no-inline-styles
  576:14  warning  Inline style: {
  flex: 1,
  backgroundColor: '#fff',
  paddingTop: "Platform.OS === 'ios' ? 0 : 20"
}                                                                                                                                                                                                                                 react-native/no-inline-styles
  591:24  warning  Inline style: { paddingVertical: 15, marginHorizontal: 15 }                                                                                                                                                                                                                                                                            react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/HomeScreen/BalanceCarousal.tsx
  34:24  warning  Inline style: { margin: 10 }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/HomeScreen/CryptoMarketCard.tsx
   2:52  error    'ImageSourcePropType' is defined but never used                              @typescript-eslint/no-unused-vars
  25:3   error    'chartData' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
  27:3   error    'growth' is defined but never used. Allowed unused args must match /^_/u     @typescript-eslint/no-unused-vars
  28:3   error    'dip' is defined but never used. Allowed unused args must match /^_/u        @typescript-eslint/no-unused-vars
  29:3   error    'loading' is defined but never used. Allowed unused args must match /^_/u    @typescript-eslint/no-unused-vars
  31:3   error    'coinValue' is assigned a value but never used                               @typescript-eslint/no-unused-vars
  34:9   error    'height' is assigned a value but never used                                  @typescript-eslint/no-unused-vars
  35:9   error    'width' is assigned a value but never used                                   @typescript-eslint/no-unused-vars
  96:22  warning  Inline style: { alignItems: 'flex-end' }                                     react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/HomeScreen/CryptoMarketPlace.tsx
   13:22  error    'refreshBalance' is assigned a value but never used      @typescript-eslint/no-unused-vars
   13:38  error    'isBalanceLoading' is assigned a value but never used    @typescript-eslint/no-unused-vars
   13:56  error    'refreshAllBalances' is assigned a value but never used  @typescript-eslint/no-unused-vars
  168:59  warning  Inline style: { marginLeft: 10 }                         react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/HomeScreen/PieChart.tsx
  51:14  warning  Inline style: { position: 'relative' }                                                                                                                                                                     react-native/no-inline-styles
  59:14  error    'slice' is defined but never used. Allowed unused args must match /^_/u                                                                                                                                    @typescript-eslint/no-unused-vars
  67:16  warning  Inline style: {
  position: 'absolute',
  top: '50%',
  left: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3
}  react-native/no-inline-styles
  91:18  warning  Inline style: { fontSize: 15, textAlign: 'center' }                                                                                                                                                        react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/HomeScreen/StakingActivities.tsx
   51:20  warning  Inline style: { width: 18, height: 18, marginRight: 21 }                                                                  react-native/no-inline-styles
   60:16  warning  Inline style: {
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center'
}       react-native/no-inline-styles
   68:20  warning  Inline style: {
  width: '100%',
  height: 150,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 15
}  react-native/no-inline-styles
   95:49  warning  Inline style: { marginTop: 10 }                                                                                           react-native/no-inline-styles
  107:20  warning  Inline style: {
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 15
}                 react-native/no-inline-styles
  142:49  warning  Inline style: { marginTop: 10 }                                                                                           react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/HomeScreen/index.tsx
    4:3   error    'Button' is defined but never used                                                                                              @typescript-eslint/no-unused-vars
    7:3   error    'SafeAreaView' is defined but never used                                                                                        @typescript-eslint/no-unused-vars
   23:9   error    'useNftsForAddress' is defined but never used                                                                                   @typescript-eslint/no-unused-vars
   34:17  warning  Expected { after 'if' condition                                                                                                 curly
   44:23  warning  Inline style: { borderBottomWidth: 0 }                                                                                          react-native/no-inline-styles
   59:22  warning  Inline style: { height: 20, width: 20 }                                                                                         react-native/no-inline-styles
   69:18  warning  Inline style: { flexDirection: 'row' }                                                                                          react-native/no-inline-styles
   90:37  error    'navigation' is defined but never used. Allowed unused args must match /^_/u                                                    @typescript-eslint/no-unused-vars
   92:10  error    'playSuccessSound' is assigned a value but never used                                                                           @typescript-eslint/no-unused-vars
   94:9   error    'account' is assigned a value but never used                                                                                    @typescript-eslint/no-unused-vars
   96:5   error    'nfts' is assigned a value but never used                                                                                       @typescript-eslint/no-unused-vars
  102:10  error    'updateKycStatus' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
  102:28  error    'loading' is assigned a value but never used                                                                                    @typescript-eslint/no-unused-vars
  102:37  error    'error' is assigned a value but never used                                                                                      @typescript-eslint/no-unused-vars
  102:44  error    'data' is assigned a value but never used                                                                                       @typescript-eslint/no-unused-vars
  105:20  error    'data' is defined but never used. Allowed unused args must match /^_/u                                                          @typescript-eslint/no-unused-vars
  105:20  warning  'data' is already declared in the upper scope on line 102 column 44                                                             @typescript-eslint/no-shadow
  108:16  warning  'error' is already declared in the upper scope on line 102 column 37                                                            @typescript-eslint/no-shadow
  148:8   error    React Hook useCallback has a missing dependency: 'refreshAllBalances'. Either include it or remove the dependency array         react-hooks/exhaustive-deps
  177:22  warning  Inline style: { marginTop: 30, marginHorizontal: 20 }                                                                           react-native/no-inline-styles
  179:20  warning  Inline style: { color: '#000000', fontSize: 12, lineHeight: 22, letterSpacing: 2 }                                              react-native/no-inline-styles
  190:18  warning  Inline style: {
  flexDirection: 'row',
  alignSelf: 'center',
  alignItems: 'center',
  margin: 10,
  paddingBottom: 40
}      react-native/no-inline-styles
  199:20  warning  Inline style: { color: '#009D94', lineHeight: 22, fontSize: 14, marginRight: 11 }                                               react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Intro/OnboardingItem.tsx
  136:31  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Intro/index.tsx
    3:14  warning  Trailing spaces not allowed                                                   no-trailing-spaces
    4:14  warning  Trailing spaces not allowed                                                   no-trailing-spaces
    5:8   warning  Trailing spaces not allowed                                                   no-trailing-spaces
    6:12  warning  Trailing spaces not allowed                                                   no-trailing-spaces
   37:49  error    'navigation' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
  190:27  warning  Newline required at end of file but not found                                 eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/BuyNFT/ApproveAndConfirmStage.tsx
  343:39  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/BuyNFT/TransactionConfirmed.tsx
  62:6  error  React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/BuyNFT/index.tsx
  113:6   error    React Hook useEffect has a missing dependency: 'refreshBalance'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                          react-hooks/exhaustive-deps
  118:19  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “BuyNFTScreen” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components
  124:20  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “BuyNFTScreen” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components
  131:6   error    React Hook useEffect has missing dependencies: 'handleClose' and 'handleGoBack'. Either include them or remove the dependency array                                                                                                                                                                                                                                                                                        react-hooks/exhaustive-deps
  150:33  error    'receipt' is defined but never used. Allowed unused args must match /^_/u                                                                                                                                                                                                                                                                                                                                                  @typescript-eslint/no-unused-vars
  170:11  warning  Strings must use singlequote                                                                                                                                                                                                                                                                                                                                                                                               quotes
  263:25  warning  Inline style: { backgroundColor: '#f9fafa' }                                                                                                                                                                                                                                                                                                                                                                               react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/CollectionDetailsPage/index.tsx
   13:8   error    'Spinner' is defined but never used                                                                          @typescript-eslint/no-unused-vars
   56:6   error    React Hook useEffect has a missing dependency: 'fadeAnim'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
   78:25  warning  Inline style: { backgroundColor: '#f8fafc' }                                                                 react-native/no-inline-styles
   81:20  warning  Inline style: { flex: 1 }                                                                                    react-native/no-inline-styles
  159:33  warning  Expected { after 'if' condition                                                                              curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/NFTDetailsPage/index.tsx
    7:3   error    'ActivityIndicator' is defined but never used                                                                                         @typescript-eslint/no-unused-vars
   17:8   error    'BuyModal' is defined but never used                                                                                                  @typescript-eslint/no-unused-vars
   18:8   error    'SellModal' is defined but never used                                                                                                 @typescript-eslint/no-unused-vars
   19:9   error    'NftToken' is defined but never used                                                                                                  @typescript-eslint/no-unused-vars
   29:10  error    'isBuyModalVisible' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u      @typescript-eslint/no-unused-vars
   29:29  error    'setIsBuyModalVisible' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u   @typescript-eslint/no-unused-vars
   30:10  error    'isSellModalVisible' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u     @typescript-eslint/no-unused-vars
   30:30  error    'setIsSellModalVisible' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
   56:6   error    React Hook useEffect has a missing dependency: 'refetch'. Either include it or remove the dependency array                            react-hooks/exhaustive-deps
   62:6   error    React Hook useEffect has a missing dependency: 'refetchActivity'. Either include it or remove the dependency array                    react-hooks/exhaustive-deps
  112:25  warning  Inline style: { backgroundColor: '#f9fafa' }                                                                                          react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/OffsetScreen/index.tsx
    8:3   error    'ActivityIndicator' is defined but never used                                                                                      @typescript-eslint/no-unused-vars
   53:27  error    'setCurrentQuantity' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
   60:10  error    'dateFieldEditing' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u    @typescript-eslint/no-unused-vars
   76:5   error    'isLoadingOffset' is assigned a value but never used                                                                               @typescript-eslint/no-unused-vars
   84:5   error    'resetOffsetState' is assigned a value but never used                                                                              @typescript-eslint/no-unused-vars
  132:6   error    React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array                react-hooks/exhaustive-deps
  247:25  warning  Expected { after 'if' condition                                                                                                    curly
  276:28  warning  Expected { after 'if' condition                                                                                                    curly
  365:30  warning  Inline style: { flexGrow: 1 }                                                                                                      react-native/no-inline-styles
  434:24  warning  Inline style: { position: 'relative' }                                                                                             react-native/no-inline-styles
  445:22  warning  Inline style: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1
}                                react-native/no-inline-styles
  468:24  warning  Inline style: { position: 'relative' }                                                                                             react-native/no-inline-styles
  479:22  warning  Inline style: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1
}                                react-native/no-inline-styles
  691:25  warning  Inline style: { borderBottomWidth: 0 }                                                                                             react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/SellNFT/ConfirmStage.tsx
   21:13  warning  Strings must use singlequote                   quotes
   22:19  warning  Strings must use singlequote                   quotes
   23:18  warning  Strings must use singlequote                   quotes
  114:27  warning  Strings must use singlequote                   quotes
  115:27  warning  Strings must use singlequote                   quotes
  335:29  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/SellNFT/RemoveStage.tsx
  226:28  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/SellNFT/SellStage.tsx
  23:3  error  'lowestPrice' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/SellNFT/SetPriceStage.tsx
  151:41  warning  Inline style: { paddingLeft: 16 }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/SellNFT/TransactionConfirmed.tsx
  47:6  error  React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/SellNFT/TransferStage.tsx
  32:3   error  'lowestPrice' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
  64:49  error  'contact' is defined but never used. Allowed unused args must match /^_/u      @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/SellNFT/index.tsx
   19:18  error    'isAddress' is defined but never used                                                                                                 @typescript-eslint/no-unused-vars
   19:29  error    'MaxUint256' is defined but never used                                                                                                @typescript-eslint/no-unused-vars
  180:6   error    React Hook useEffect has a missing dependency: 'nftToSell?.marketData?.activeAsks'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  186:6   error    React Hook useEffect has a missing dependency: 'setActiveNetwork'. Either include it or remove the dependency array                   react-hooks/exhaustive-deps
  259:23  warning  Expected { after 'if' condition                                                                                                       curly
  261:17  warning  'isApproved' is already declared in the upper scope on line 256 column 23                                                             @typescript-eslint/no-shadow
  279:33  error    'receipt' is defined but never used. Allowed unused args must match /^_/u                                                             @typescript-eslint/no-unused-vars
  281:11  warning  Strings must use singlequote                                                                                                          quotes
  332:23  warning  Expected { after 'if' condition                                                                                                       curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/UserNFTsScreen/index.tsx
   8:3   error    'ActivityIndicator' is defined but never used  @typescript-eslint/no-unused-vars
  24:27  error    'error' is assigned a value but never used     @typescript-eslint/no-unused-vars
  54:25  warning  Inline style: { backgroundColor: '#f9fafa' }   react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/WalletNFTDetailsPage/NFTDetailHistory.tsx
  33:24  error    'formattedTransactions' is assigned a value but never used                                                                 @typescript-eslint/no-unused-vars
  43:19  error    'setFilters' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
  72:49  warning  Expected { after 'if' condition                                                                                            curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/WalletNFTDetailsPage/NFTHistory/EnergyCertificateList.tsx
   19:8   error    'width' is assigned a value but never used                                                                                                                                       @typescript-eslint/no-unused-vars
   85:21  warning  Expected { after 'if' condition                                                                                                                                                  curly
   92:16  warning  Expected { after 'if' condition                                                                                                                                                  curly
  165:11  warning  'date' is already declared in the upper scope on line 162 column 55                                                                                                              @typescript-eslint/no-shadow
  169:25  warning  Expected { after 'if' condition                                                                                                                                                  curly
  170:25  warning  Expected { after 'if' condition                                                                                                                                                  curly
  187:14  warning  Expected { after 'if' condition                                                                                                                                                  curly
  191:21  warning  Expected { after 'if' condition                                                                                                                                                  curly
  210:19  warning  Expected { after 'if' condition                                                                                                                                                  curly
  254:17  warning  Inline style: {
  color: "item.status === 'Success' || item.status === 'Completed'\n" +
    "                      ? '#4CAF50'\n" +
    '                      : THEME_COLOR'
}  react-native/no-inline-styles
  307:49  warning  Inline style: { marginBottom: 20 }                                                                                                                                               react-native/no-inline-styles
  335:28  warning  'data' is already declared in the upper scope on line 327 column 3                                                                                                               @typescript-eslint/no-shadow
  579:41  warning  Newline required at end of file but not found                                                                                                                                    eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/WalletNFTDetailsPage/index.tsx
    4:3   error    'ImageBackground' is defined but never used                                                                                                                                                                  @typescript-eslint/no-unused-vars
   10:3   error    'ActivityIndicator' is defined but never used                                                                                                                                                                @typescript-eslint/no-unused-vars
   16:9   error    'DText' is defined but never used                                                                                                                                                                            @typescript-eslint/no-unused-vars
   38:7   error    'width' is assigned a value but never used                                                                                                                                                                   @typescript-eslint/no-unused-vars
  124:10  error    'userDetails' is assigned a value but never used                                                                                                                                                             @typescript-eslint/no-unused-vars
  132:10  error    'metadataLoading' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u                                                                               @typescript-eslint/no-unused-vars
  134:36  error    'isKycSkipped' is assigned a value but never used                                                                                                                                                            @typescript-eslint/no-unused-vars
  202:6   error    React Hook useEffect has missing dependencies: 'fetchNftMetadata', 'magic.rpcProvider', 'nft.collectionAddress', 'nft?.tokenId', and 'setActiveNetwork'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  251:18  error    'error' is defined but never used. Allowed unused args must match /^_/u                                                                                                                                      @typescript-eslint/no-unused-vars
  290:14  error    'activityLoading' is assigned a value but never used                                                                                                                                                         @typescript-eslint/no-unused-vars
  291:12  error    'activityError' is assigned a value but never used                                                                                                                                                           @typescript-eslint/no-unused-vars
  307:35  warning  Expected { after 'if' condition                                                                                                                                                                              curly
  334:27  warning  Inline style: { borderBottomWidth: 0 }                                                                                                                                                                       react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/WalletNFTDetailsPage/useNFTTransactionHistory.ts
   2:8   error    'moment' is defined but never used                                   @typescript-eslint/no-unused-vars
  61:9   error    'queryParams' is assigned a value but never used                     @typescript-eslint/no-unused-vars
  62:11  warning  'params' is already declared in the upper scope on line 43 column 3  @typescript-eslint/no-shadow
  67:16  warning  Expected { after 'if' condition                                      curly
  68:28  warning  Expected { after 'if' condition                                      curly
  69:24  warning  Expected { after 'if' condition                                      curly
  70:15  warning  Expected { after 'if' condition                                      curly
  71:20  warning  Expected { after 'if' condition                                      curly
  72:18  warning  Expected { after 'if' condition                                      curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/MarketPlace/index.tsx
    3:3   error    'SafeAreaView' is defined but never used                                                                             @typescript-eslint/no-unused-vars
    9:3   error    'ActivityIndicator' is defined but never used                                                                        @typescript-eslint/no-unused-vars
   40:6   error    React Hook useEffect has a missing dependency: 'setActiveNetwork'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
   93:23  warning  Expected { after 'if' condition                                                                                      curly
  153:31  warning  Expected { after 'if' condition                                                                                      curly
  154:28  warning  Expected { after 'if' condition                                                                                      curly
  155:28  warning  Expected { after 'if' condition                                                                                      curly
  271:36  warning  Inline style: { paddingBottom: 20 }                                                                                  react-native/no-inline-styles
  351:49  warning  Expected { after 'if' condition                                                                                      curly
  352:46  warning  Expected { after 'if' condition                                                                                      curly
  353:46  warning  Expected { after 'if' condition                                                                                      curly
  475:29  warning  Inline style: { borderBottomWidth: 0 }                                                                               react-native/no-inline-styles
  499:26  warning  Inline style: { marginBottom: 'index === processedCollections.length - 1 ? 150 : 0' }                                react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/NewsScreens/News/index.tsx
   54:15  error    'props' is defined but never used. Allowed unused args must match /^_/u                                                                                                                                                                                                                                                                                                                                            @typescript-eslint/no-unused-vars
  125:35  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “News” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/NewsScreens/NewsDetail/index.tsx
  103:48  warning  Inline style: { width: '60%' }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/RootScreen/index.tsx
  32:10  warning  Empty components are self-closing  react/self-closing-comp

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Send/SendCoin/index.tsx
  140:6   error    React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  269:17  warning  Expected { after 'if' condition                                                                                      curly
  322:65  warning  Expected { after 'if' condition                                                                                      curly
  517:16  warning  Expected { after 'if' condition                                                                                      curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Send/VerifyAdress/index.tsx
  57:49  error  'contact' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Send/VerifyAdress/styles.ts
    2:9  error    'ScreenWidth' is defined but never used        @typescript-eslint/no-unused-vars
  140:4  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/CategoryTab.tsx
    2:22  error    'Tab' is defined but never used                                                  @typescript-eslint/no-unused-vars
   17:51  error    'onSelectPress' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
   17:66  error    'onCancelPress' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
   31:9   error    'renderText' is assigned a value but never used                                  @typescript-eslint/no-unused-vars
  226:28  warning  Newline required at end of file but not found                                    eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/Hooks/useNFTStaking.ts
  146:15  warning  'magic' is already declared in the upper scope on line 66 column 10                                                                                    @typescript-eslint/no-shadow
  189:5   error    React Hook useCallback has an unnecessary dependency: 'magic'. Either exclude it or remove the dependency array                                        react-hooks/exhaustive-deps
  222:13  warning  'magic' is already declared in the upper scope on line 66 column 10                                                                                    @typescript-eslint/no-shadow
  243:15  warning  'isApproved' is already declared in the upper scope on line 63 column 10                                                                               @typescript-eslint/no-shadow
  347:5   error    React Hook useCallback has unnecessary dependencies: 'magic', 'refreshBalance', and 'userDetails'. Either exclude them or remove the dependency array  react-hooks/exhaustive-deps
  491:5   error    React Hook useCallback has unnecessary dependencies: 'refreshBalance' and 'userDetails'. Either exclude them or remove the dependency array            react-hooks/exhaustive-deps
  536:17  warning  'validatorAddress' is already declared in the upper scope on line 60 column 31                                                                         @typescript-eslint/no-shadow
  577:17  warning  'validatorAddress' is already declared in the upper scope on line 60 column 31                                                                         @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/Hooks/useWATTStaking.ts
   64:26  error    'getBalance' is assigned a value but never used                                                                        @typescript-eslint/no-unused-vars
  119:19  warning  Strings must use singlequote                                                                                           quotes
  220:5   error    React Hook useCallback has an unnecessary dependency: 'userDetails'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps
  250:19  warning  Strings must use singlequote                                                                                           quotes
  359:5   error    React Hook useCallback has an unnecessary dependency: 'userDetails'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps
  375:38  warning  'validatorAddress' is already declared in the upper scope on line 52 column 32                                         @typescript-eslint/no-shadow
  448:17  warning  'validatorAddress' is already declared in the upper scope on line 52 column 32                                         @typescript-eslint/no-shadow
  482:17  warning  'validatorAddress' is already declared in the upper scope on line 52 column 32                                         @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/Portfolio.tsx
   1:16  error    'useEffect' is defined but never used          @typescript-eslint/no-unused-vars
   1:27  error    'useState' is defined but never used           @typescript-eslint/no-unused-vars
   2:15  error    'Text' is defined but never used               @typescript-eslint/no-unused-vars
   2:21  error    'Image' is defined but never used              @typescript-eslint/no-unused-vars
  70:26  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/Result.tsx
   2:16  error    'useContext' is defined but never used         @typescript-eslint/no-unused-vars
   3:15  error    'FlatList' is defined but never used           @typescript-eslint/no-unused-vars
   4:8   error    'StakeContext' is defined but never used       @typescript-eslint/no-unused-vars
   5:9   error    'DText' is defined but never used              @typescript-eslint/no-unused-vars
  98:23  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/StakeListItem.tsx
    6:3   error    'Touchable' is defined but never used          @typescript-eslint/no-unused-vars
   10:8   error    'images' is defined but never used             @typescript-eslint/no-unused-vars
   10:17  error    'technologyGroup' is defined but never used    @typescript-eslint/no-unused-vars
   11:8   error    'color' is defined but never used              @typescript-eslint/no-unused-vars
   14:9   error    'Path' is defined but never used               @typescript-eslint/no-unused-vars
   14:15  error    'Svg' is defined but never used                @typescript-eslint/no-unused-vars
   49:1   warning  Trailing spaces not allowed                    no-trailing-spaces
   51:1   warning  Trailing spaces not allowed                    no-trailing-spaces
   82:13  warning  Empty components are self-closing              react/self-closing-comp
  202:30  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/StakeListingScreen.tsx
    1:26  error    'useCallback' is defined but never used                      @typescript-eslint/no-unused-vars
  138:9   error    'toggleAddressExpansion' is assigned a value but never used  @typescript-eslint/no-unused-vars
  146:9   error    'formatAddress' is assigned a value but never used           @typescript-eslint/no-unused-vars
  494:25  warning  Missing radix parameter                                      radix
  508:25  warning  Missing radix parameter                                      radix

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/StakeScreen/NFTStakeComponent.tsx
    8:3   error    'Pressable' is defined but never used                                                                                                                  @typescript-eslint/no-unused-vars
    9:3   error    'Image' is defined but never used                                                                                                                      @typescript-eslint/no-unused-vars
   10:3   error    'ActivityIndicator' is defined but never used                                                                                                          @typescript-eslint/no-unused-vars
   16:9   error    'Colors' is defined but never used                                                                                                                     @typescript-eslint/no-unused-vars
   16:17  error    'fontsFamily' is defined but never used                                                                                                                @typescript-eslint/no-unused-vars
   19:8   error    'images' is defined but never used                                                                                                                     @typescript-eslint/no-unused-vars
   22:9   error    'useNftsForAddress' is defined but never used                                                                                                          @typescript-eslint/no-unused-vars
   40:12  error    'nftStakingError' is assigned a value but never used                                                                                                   @typescript-eslint/no-unused-vars
   56:10  error    'txHash' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u                                  @typescript-eslint/no-unused-vars
   64:6   error    React Hook useEffect has missing dependencies: 'activeNetwork', 'refresh', and 'setActiveNetwork'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  116:19  warning  Expected { after 'if' condition                                                                                                                        curly
  172:41  warning  Strings must use singlequote                                                                                                                           quotes
  267:15  warning  Inline style: { padding: 4 }                                                                                                                           react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/StakeScreen/WATTStakeComponent.tsx
   4:9   error  'Colors' is defined but never used                                                                                           @typescript-eslint/no-unused-vars
   4:17  error  'fontsFamily' is defined but never used                                                                                      @typescript-eslint/no-unused-vars
  20:10  error  'userDetails' is assigned a value but never used                                                                             @typescript-eslint/no-unused-vars
  22:10  error  'getBalance' is assigned a value but never used                                                                              @typescript-eslint/no-unused-vars
  38:21  error  'setIsLoading' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/StakeScreen/index.tsx
  338:16  error    'useEffect' is defined but never used                                                                                                                                                                                                                                                                                                  @typescript-eslint/no-unused-vars
  341:3   error    'Text' is defined but never used                                                                                                                                                                                                                                                                                                       @typescript-eslint/no-unused-vars
  343:3   error    'Pressable' is defined but never used                                                                                                                                                                                                                                                                                                  @typescript-eslint/no-unused-vars
  344:3   error    'Image' is defined but never used                                                                                                                                                                                                                                                                                                      @typescript-eslint/no-unused-vars
  348:9   error    'Colors' is defined but never used                                                                                                                                                                                                                                                                                                     @typescript-eslint/no-unused-vars
  356:9   error    'formatQuantityMWh' is defined but never used                                                                                                                                                                                                                                                                                          @typescript-eslint/no-unused-vars
  379:5   error    'nfts' is assigned a value but never used                                                                                                                                                                                                                                                                                              @typescript-eslint/no-unused-vars
  380:16  error    'isNFTLoading' is assigned a value but never used                                                                                                                                                                                                                                                                                      @typescript-eslint/no-unused-vars
  381:5   error    'error' is assigned a value but never used                                                                                                                                                                                                                                                                                             @typescript-eslint/no-unused-vars
  382:5   error    'refresh' is assigned a value but never used                                                                                                                                                                                                                                                                                           @typescript-eslint/no-unused-vars
  390:16  error    'isNFTStakingLoading' is assigned a value but never used                                                                                                                                                                                                                                                                               @typescript-eslint/no-unused-vars
  391:12  error    'nftStakingError' is assigned a value but never used                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unused-vars
  395:10  error    'setActiveNetwork' is assigned a value but never used                                                                                                                                                                                                                                                                                  @typescript-eslint/no-unused-vars
  407:29  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “StakeScreen” and pass data as props  react/no-unstable-nested-components
  413:30  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “StakeScreen” and pass data as props  react/no-unstable-nested-components
  436:9   error    'handleStake' is assigned a value but never used                                                                                                                                                                                                                                                                                       @typescript-eslint/no-unused-vars
  471:37  warning  Strings must use singlequote                                                                                                                                                                                                                                                                                                           quotes
  501:31  warning  Inline style: { backgroundColor: 'transparent' }                                                                                                                                                                                                                                                                                       react-native/no-inline-styles
  504:22  warning  Inline style: { backgroundColor: 'transparent' }                                                                                                                                                                                                                                                                                       react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/UnstakeScreen/index.tsx
   24:10  error    'userDetails' is assigned a value but never used                                                                       @typescript-eslint/no-unused-vars
   27:12  error    'nftStakingError' is assigned a value but never used                                                                   @typescript-eslint/no-unused-vars
   40:10  error    'txHash' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
   45:6   error    React Hook useEffect has a missing dependency: 'setActiveNetwork'. Either include it or remove the dependency array    react-hooks/exhaustive-deps
   99:19  warning  Expected { after 'if' condition                                                                                        curly
  150:39  warning  Strings must use singlequote                                                                                           quotes
  168:50  warning  Inline style: { width: 20, height: 20 }                                                                                react-native/no-inline-styles
  185:21  warning  Inline style: {
  backgroundColor: "stakingData.status === 'active' ? '#D4F5E9' : '#F5F5F5'"
}                         react-native/no-inline-styles
  193:23  warning  Inline style: { color: "stakingData.status === 'active' ? '#28A745' : '#666'" }                                        react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/UnstakeScreen/styles.ts
  239:3  error  Duplicate key 'iconContainer'  no-dupe-keys

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/ValidatorDetailsScreen.tsx
   10:3   error    'ActivityIndicator' is defined but never used                                                                       @typescript-eslint/no-unused-vars
   57:36  error    'isKycSkipped' is assigned a value but never used                                                                   @typescript-eslint/no-unused-vars
  111:6   error    React Hook useEffect has a missing dependency: 'singleValidator'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  147:18  error    'error' is defined but never used. Allowed unused args must match /^_/u                                             @typescript-eslint/no-unused-vars
  147:18  warning  'error' is already declared in the upper scope on line 56 column 10                                                 @typescript-eslint/no-shadow
  166:48  warning  Inline style: { width: 20, height: 20 }                                                                             react-native/no-inline-styles
  193:48  warning  Inline style: { width: 20, height: 20 }                                                                             react-native/no-inline-styles
  221:46  warning  Inline style: { width: 20, height: 20 }                                                                             react-native/no-inline-styles
  305:41  error    'index' is defined but never used. Allowed unused args must match /^_/u                                             @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/Stake/ValidatorsScreen.tsx
    9:3   error    'ActivityIndicator' is defined but never used                                                                                                                                                  @typescript-eslint/no-unused-vars
   64:6   error    React Hook useEffect has a missing dependency: 'fetchValidators'. Either include it or remove the dependency array                                                                             react-hooks/exhaustive-deps
   75:35  warning  Expected { after 'if' condition                                                                                                                                                                curly
  143:9   error    'getFilteredCount' is assigned a value but never used                                                                                                                                          @typescript-eslint/no-unused-vars
  144:9   error    'getTotalCount' is assigned a value but never used                                                                                                                                             @typescript-eslint/no-unused-vars
  224:19  warning  Inline style: { marginBottom: "index === validators.length - 1 ? '22%' : 16" }                                                                                                                 react-native/no-inline-styles
  238:27  warning  Inline style: {
  backgroundColor: "formattedStatus.toLowerCase() === 'active'\n" +
    "                                ? '#4CAF50'\n" +
    "                                : '#F44336'"
}  react-native/no-inline-styles
  249:27  warning  Inline style: {
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
   11:23  error    'RNTouchableOpacity' is defined but never used                                                                                                                                                                                                                                                                                                                                                                     @typescript-eslint/no-unused-vars
   35:9   error    'SnackBarMessage' is defined but never used                                                                                                                                                                                                                                                                                                                                                                        @typescript-eslint/no-unused-vars
   60:5   error    'account' is assigned a value but never used                                                                                                                                                                                                                                                                                                                                                                       @typescript-eslint/no-unused-vars
   73:5   error    'usdvalue' is assigned a value but never used                                                                                                                                                                                                                                                                                                                                                                      @typescript-eslint/no-unused-vars
  101:5   error    'getOutputToken' is assigned a value but never used                                                                                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unused-vars
  136:6   error    React Hook useEffect has a missing dependency: 'setActiveNetwork'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                react-hooks/exhaustive-deps
  159:6   error    React Hook useEffect has a missing dependency: 'TOKENS'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                          react-hooks/exhaustive-deps
  189:6   error    React Hook useEffect has a missing dependency: 'playSuccessSound'. Either include it or remove the dependency array                                                                                                                                                                                                                                                                                                react-hooks/exhaustive-deps
  268:16  warning  Expected { after 'if' condition                                                                                                                                                                                                                                                                                                                                                                                    curly
  439:28  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Swap” and pass data as props                                                                                     react/no-unstable-nested-components
  471:29  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Swap” and pass data as props                                                                                     react/no-unstable-nested-components
  472:20  warning  Expected { after 'if' condition                                                                                                                                                                                                                                                                                                                                                                                    curly
  717:19  warning  Inline style: { color: "quote.priceImpact > 3 ? '#FF3B30' : '#34C759'" }                                                                                                                                                                                                                                                                                                                                           react-native/no-inline-styles
  836:25  warning  Do not define components during render. React will see a new component type on every render and destroy the entire subtree’s DOM nodes and state (https://reactjs.org/docs/reconciliation.html#elements-of-different-types). Instead, move this component definition out of the parent component “Swap” and pass data as props. If you want to allow component creation in props, set allowAsProps option to true  react/no-unstable-nested-components

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/wallet/AreaChart.tsx
   3:9   error    'Svg' is defined but never used              @typescript-eslint/no-unused-vars
   4:9   error    'Text' is defined but never used             @typescript-eslint/no-unused-vars
   6:7   error    'height' is assigned a value but never used  @typescript-eslint/no-unused-vars
   7:7   error    'width' is assigned a value but never used   @typescript-eslint/no-unused-vars
  11:18  warning  Inline style: { width: 100, height: 120 }    react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/wallet/ListItem.js
  6:9  warning  'navigateTo' is defined but never used           no-unused-vars
  9:9  warning  'navigation' is assigned a value but never used  no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/wallet/MyCryptoCard.tsx
    4:9   error    'Svg' is defined but never used              @typescript-eslint/no-unused-vars
    8:9   error    'SCREEN_CONSTANT' is defined but never used  @typescript-eslint/no-unused-vars
    9:9   error    'fontsFamily' is defined but never used      @typescript-eslint/no-unused-vars
   76:54  warning  Inline style: { backgroundColor: '#fff' }    react-native/no-inline-styles
  104:22  warning  Inline style: { alignItems: 'flex-end' }     react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/wallet/index.tsx
    1:16  error    'useContext' is defined but never used                                                                                @typescript-eslint/no-unused-vars
    5:3   error    'StatusBar' is defined but never used                                                                                 @typescript-eslint/no-unused-vars
    7:3   error    'FlatList' is defined but never used                                                                                  @typescript-eslint/no-unused-vars
   10:9   error    'SafeAreaView' is defined but never used                                                                              @typescript-eslint/no-unused-vars
   15:8   error    'ListItem' is defined but never used                                                                                  @typescript-eslint/no-unused-vars
   17:8   error    'MyCryptoCard' is defined but never used                                                                              @typescript-eslint/no-unused-vars
   21:9   error    'useNftsForAddress' is defined but never used                                                                         @typescript-eslint/no-unused-vars
   54:11  error    'Balance' is defined but never used                                                                                   @typescript-eslint/no-unused-vars
   78:10  error    'items' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u  @typescript-eslint/no-unused-vars
   84:9   error    'account' is assigned a value but never used                                                                          @typescript-eslint/no-unused-vars
  231:6   error    React Hook useEffect has a missing dependency: 'init'. Either include it or remove the dependency array               react-hooks/exhaustive-deps
  236:18  warning  Inline style: { backgroundColor: '#fff', flex: 1 }                                                                    react-native/no-inline-styles
  239:32  warning  Inline style: { paddingBottom: 50 }                                                                                   react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Screens/wallet/style.js
    2:9  warning  'Colors' is defined but never used  no-unused-vars
  129:3  error    Duplicate key 'divider'             no-dupe-keys
  135:3  error    Duplicate key 'contentText'         no-dupe-keys

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/Theme/animations.ts
  7:65  warning  Missing trailing comma                         comma-dangle
  8:2   warning  Newline required at end of file but not found  eol-last
  8:2   warning  Missing semicolon                              semi

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
  425:17  warning  Expected { after 'if' condition                                          curly
  531:7   error    'fetchWalletMarketData' is assigned a value but never used               @typescript-eslint/no-unused-vars
  552:31  warning  Expected { after 'if' condition                                          curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketplace/reject.ts
  2:90  warning  Missing semicolon  semi
  3:2   warning  Missing semicolon  semi

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketplace/requiresApproval.ts
  12:27  warning  Expected { after 'if' condition                                                 curly
  44:27  warning  Expected { after 'if' condition                                                 curly
  52:11  warning  'isApprovedForAll' is already declared in the upper scope on line 37 column 14  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketplace/useCallWithGasPrice.ts
   1:22  error  'useMemo' is defined but never used                                                                                                                                                                                                         @typescript-eslint/no-unused-vars
   5:3   error  'JsonRpcProvider' is defined but never used                                                                                                                                                                                                 @typescript-eslint/no-unused-vars
   9:9   error  'useGasPrice' is defined but never used                                                                                                                                                                                                     @typescript-eslint/no-unused-vars
  23:9   error  The 'provider' object construction makes the dependencies of useCallback Hook (at line 72) change on every render. Move it inside the useCallback callback. Alternatively, wrap the initialization of 'provider' in its own useMemo() Hook  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketplace/useCatchTxError.tsx
   2:9   error    'ethers' is defined but never used                                          @typescript-eslint/no-unused-vars
  16:9   error    'waitForTxReceipt' is assigned a value but never used                       @typescript-eslint/no-unused-vars
  24:7   error    'provider' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
  31:18  warning  Expected { after 'if' condition                                             curly
  35:27  warning  Strings must use singlequote                                                quotes
  51:35  warning  Expected { after 'if' condition                                             curly
  70:18  warning  Expected { after 'if' condition                                             curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketplace/useContracts.ts
  23:27  warning  Expected { after 'if' condition  curly
  40:19  warning  Expected { after 'if' condition  curly
  55:29  warning  Expected { after 'if' condition  curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/marketplace/useGasPrice.ts
   4:9  error  'logMissingFieldErrors' is defined but never used                                                          @typescript-eslint/no-unused-vars
  37:6  error  React Hook useEffect has a missing dependency: 'signer'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useApi.ts
  22:50  error  React Hook useMemo has a missing dependency: 'options'. Either include it or remove the dependency array                                react-hooks/exhaustive-deps
  22:51  error  React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useBridge.ts
   64:35  error  'newMagic' is assigned a value but never used                                                                                                                          @typescript-eslint/no-unused-vars
   64:45  error  'activeNetwork' is assigned a value but never used                                                                                                                     @typescript-eslint/no-unused-vars
  180:17  error  'balance' is assigned a value but never used                                                                                                                           @typescript-eslint/no-unused-vars
  251:5   error  React Hook useCallback has missing dependencies: 'refreshBalance', 'setActiveNetwork', and 'updateProcessingStep'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  289:17  error  'balance' is assigned a value but never used                                                                                                                           @typescript-eslint/no-unused-vars
  304:15  error  'approvalReceipt' is assigned a value but never used                                                                                                                   @typescript-eslint/no-unused-vars
  356:5   error  React Hook useCallback has missing dependencies: 'refreshBalance', 'setActiveNetwork', and 'updateProcessingStep'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  380:15  error  'usdcAddress' is assigned a value but never used                                                                                                                       @typescript-eslint/no-unused-vars
  398:17  error  'balance' is assigned a value but never used                                                                                                                           @typescript-eslint/no-unused-vars
  413:15  error  'approvalReceipt' is assigned a value but never used                                                                                                                   @typescript-eslint/no-unused-vars
  468:5   error  React Hook useCallback has missing dependencies: 'refreshBalance', 'setActiveNetwork', and 'updateProcessingStep'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  493:15  error  'eurcAddress' is assigned a value but never used                                                                                                                       @typescript-eslint/no-unused-vars
  526:15  error  'approvalReceipt' is assigned a value but never used                                                                                                                   @typescript-eslint/no-unused-vars
  579:5   error  React Hook useCallback has missing dependencies: 'refreshBalance', 'setActiveNetwork', and 'updateProcessingStep'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useCollections.ts
  61:31  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useCompleteNft.ts
  33:7   warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  33:14  warning  'error' is already declared in the upper scope on line 22 column 10  @typescript-eslint/no-shadow
  61:13  warning  'nft' is already declared in the upper scope on line 20 column 10    @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useNftActivity.ts
  11:41  warning  Expected { after 'if' condition  curly
  32:1   warning  Trailing spaces not allowed      no-trailing-spaces
  34:58  warning  Expected { after 'if' condition  curly
  44:1   warning  Trailing spaces not allowed      no-trailing-spaces
  61:1   warning  Trailing spaces not allowed      no-trailing-spaces

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useNfts.ts
  32:7   warning  Value of 'error' may be overwritten in IE 8 and earlier                                                       no-catch-shadow
  32:14  warning  'error' is already declared in the upper scope on line 23 column 10                                           @typescript-eslint/no-shadow
  76:6   error    React Hook useEffect has a missing dependency: 'fetchNfts'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useNftsForAddress.ts
  17:9  error  The 'collectionsRes' logical expression could make the dependencies of useCallback Hook (at line 41) change on every render. To fix this, wrap the initialization of 'collectionsRes' in its own useMemo() Hook  react-hooks/exhaustive-deps
  17:9  error  The 'collectionsRes' logical expression could make the dependencies of useEffect Hook (at line 51) change on every render. To fix this, wrap the initialization of 'collectionsRes' in its own useMemo() Hook    react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useOffsetNft.ts
   14:56  error    'walletAddress' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
   43:10  error    'loading' is assigned a value but never used                                     @typescript-eslint/no-unused-vars
   43:19  error    'error' is assigned a value but never used                                       @typescript-eslint/no-unused-vars
   43:32  error    'refetch' is assigned a value but never used                                     @typescript-eslint/no-unused-vars
  107:7   warning  Value of 'error' may be overwritten in IE 8 and earlier                          no-catch-shadow
  107:14  warning  'error' is already declared in the upper scope on line 43 column 19              @typescript-eslint/no-shadow
  132:7   warning  Value of 'error' may be overwritten in IE 8 and earlier                          no-catch-shadow
  132:14  warning  'error' is already declared in the upper scope on line 43 column 19              @typescript-eslint/no-shadow
  248:13  warning  'data' is already declared in the upper scope on line 43 column 26               @typescript-eslint/no-shadow
  263:15  error    'newBalance' is assigned a value but never used                                  @typescript-eslint/no-unused-vars
  278:7   warning  Value of 'error' may be overwritten in IE 8 and earlier                          no-catch-shadow
  278:14  warning  'error' is already declared in the upper scope on line 43 column 19              @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSendDenergyUSDCAndEURC.ts
  147:1  warning  Trailing spaces not allowed  no-trailing-spaces

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSendEth.ts
   94:16  error    'data' is assigned a value but never used                            @typescript-eslint/no-unused-vars
  109:9   warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  109:16  warning  'error' is already declared in the upper scope on line 38 column 10  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSendUSDCANDEURC.ts
  145:16  error  'data' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSendWATT.ts
    3:3   error    'BrowserProvider' is defined but never used                          @typescript-eslint/no-unused-vars
    7:3   error    'TransactionReceipt' is defined but never used                       @typescript-eslint/no-unused-vars
   41:3   error    'customRpcUrl' is assigned a value but never used                    @typescript-eslint/no-unused-vars
  102:18  error    'data' is assigned a value but never used                            @typescript-eslint/no-unused-vars
  117:11  warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  117:18  warning  'error' is already declared in the upper scope on line 44 column 10  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSuccessSound.ts
   1:8   error    'React' is defined but never used                                   @typescript-eslint/no-unused-vars
  19:60  warning  'error' is already declared in the upper scope on line 7 column 10  @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useSwap.ts
  263:20  error    'setTxStatus' is assigned a value but never used. Allowed unused elements of array destructuring patterns must match /^_/u                 @typescript-eslint/no-unused-vars
  339:50  warning  Expected { after 'if' condition                                                                                                            curly
  343:21  warning  Expected { after 'if' condition                                                                                                            curly
  348:17  warning  'balance' is already declared in the upper scope on line 267 column 10                                                                     @typescript-eslint/no-shadow
  368:17  warning  'balance' is already declared in the upper scope on line 267 column 10                                                                     @typescript-eslint/no-shadow
  392:7   warning  Expected { after 'if' condition                                                                                                            curly
  414:13  warning  'allowance' is already declared in the upper scope on line 268 column 10                                                                   @typescript-eslint/no-shadow
  424:6   error    React Hook useCallback has a missing dependency: 'getInputToken'. Either include it or remove the dependency array                         react-hooks/exhaustive-deps
  603:6   error    React Hook useCallback has missing dependencies: 'getInputToken' and 'getOutputToken'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  649:28  warning  Expected { after 'if' condition                                                                                                            curly
  650:36  warning  Expected { after 'if' condition                                                                                                            curly
  851:11  warning  'errorMessage' is already declared in the upper scope on line 262 column 10                                                                @typescript-eslint/no-shadow

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useTransactionHistory.ts
   37:54  warning  Missing radix parameter                                                                                                 radix
   38:29  warning  Missing radix parameter                                                                                                 radix
   51:31  warning  Missing radix parameter                                                                                                 radix
   52:13  error    'timeDiff' is assigned a value but never used                                                                           @typescript-eslint/no-unused-vars
  107:20  warning  Expected { after 'if' condition                                                                                         curly
  108:24  warning  Expected { after 'if' condition                                                                                         curly
  109:26  warning  Expected { after 'if' condition                                                                                         curly
  110:36  warning  Expected { after 'if' condition                                                                                         curly
  231:6   error    React Hook useCallback has a missing dependency: 'fetchTransactions'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  242:6   error    React Hook useCallback has a missing dependency: 'fetchTransactions'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  252:35  warning  Expected { after 'if' condition                                                                                         curly
  278:18  warning  Expected { after 'if' condition                                                                                         curly
  288:1   warning  Trailing spaces not allowed                                                                                             no-trailing-spaces
  297:1   warning  Trailing spaces not allowed                                                                                             no-trailing-spaces
  303:1   warning  Trailing spaces not allowed                                                                                             no-trailing-spaces
  310:1   warning  Trailing spaces not allowed                                                                                             no-trailing-spaces
  314:6   error    React Hook useEffect has a missing dependency: 'fetchTransactions'. Either include it or remove the dependency array    react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/hooks/useWalletBalance.ts
   66:10  error    'userDetails' is assigned a value but never used                     @typescript-eslint/no-unused-vars
  130:45  warning  Expected { after 'if' condition                                      curly
  157:11  warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  157:18  warning  'error' is already declared in the upper scope on line 84 column 10  @typescript-eslint/no-shadow
  179:11  warning  Value of 'error' may be overwritten in IE 8 and earlier              no-catch-shadow
  179:18  warning  'error' is already declared in the upper scope on line 84 column 10  @typescript-eslint/no-shadow
  216:1   warning  Trailing spaces not allowed                                          no-trailing-spaces
  233:1   warning  Trailing spaces not allowed                                          no-trailing-spaces
  363:1   warning  Trailing spaces not allowed                                          no-trailing-spaces
  378:1   warning  Trailing spaces not allowed                                          no-trailing-spaces

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/services/blockchain/contracts.ts
   26:27  warning  Trailing spaces not allowed                    no-trailing-spaces
   59:1   warning  Trailing spaces not allowed                    no-trailing-spaces
   80:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  167:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  187:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  193:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  210:32  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/services/blockchain/index.ts
    2:43  error    'CUSTOM_NETWORK' is defined but never used     @typescript-eslint/no-unused-vars
   59:1   warning  Trailing spaces not allowed                    no-trailing-spaces
   97:14  warning  Missing trailing comma                         comma-dangle
  157:34  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/services/blockchain/providers.ts
  108:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  126:32  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/services/blockchain/walletOperations.ts
   67:1   warning  Trailing spaces not allowed                    no-trailing-spaces
   71:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  112:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  125:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  156:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  191:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  193:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  227:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  255:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  262:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  282:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  301:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  303:1   warning  Trailing spaces not allowed                    no-trailing-spaces
  313:20  warning  Expected { after 'if' condition                curly
  314:21  warning  Expected { after 'if' condition                curly
  328:33  warning  Newline required at end of file but not found  eol-last

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/utils/explorer.ts
  41:24  warning  Expected { after 'if' condition  curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/utils/index.ts
  15:46  warning  Expected { after 'if' condition  curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/Src/utils/shortenAddress.ts
  2:17  warning  Expected { after 'if' condition  curly

/Users/jeminramani/Documents/projects/denergy/d_wallet/components/StyledText.tsx
  4:48  warning  Inline style: { fontFamily: 'space-mono' }  react-native/no-inline-styles

/Users/jeminramani/Documents/projects/denergy/d_wallet/navigation/HeaderDropdown.tsx
   1:19  warning  Strings must use singlequote  quotes
   2:65  warning  Strings must use singlequote  quotes
   3:58  warning  Missing semicolon             semi
  19:57  warning  Missing trailing comma        comma-dangle
  22:10  warning  Missing semicolon             semi
  23:6   warning  Missing semicolon             semi
  27:6   warning  Missing semicolon             semi
  45:6   warning  Missing semicolon             semi
  52:29  warning  Missing trailing comma        comma-dangle
  59:27  warning  Missing trailing comma        comma-dangle
  63:22  warning  Missing trailing comma        comma-dangle
  64:6   warning  Missing trailing comma        comma-dangle
  65:3   warning  Missing semicolon             semi

/Users/jeminramani/Documents/projects/denergy/d_wallet/navigation/constant.js
  99:3  error  Duplicate key 'STAKE'  no-dupe-keys

/Users/jeminramani/Documents/projects/denergy/d_wallet/screens/Provider/GraphQLProvider.tsx
  126:17  warning  Expected { after 'if' condition                        curly
  130:11  error    'handleAuthChange' is assigned a value but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/screens/Provider/NftProvider.tsx
   62:9  error  The 'collectionsRes' logical expression could make the dependencies of useCallback Hook (at line 103) change on every render. To fix this, wrap the initialization of 'collectionsRes' in its own useMemo() Hook  react-hooks/exhaustive-deps
   62:9  error  The 'collectionsRes' logical expression could make the dependencies of useEffect Hook (at line 114) change on every render. To fix this, wrap the initialization of 'collectionsRes' in its own useMemo() Hook    react-hooks/exhaustive-deps
  127:6  error  React Hook useCallback has an unnecessary dependency: 'account'. Either exclude it or remove the dependency array                                                                                                 react-hooks/exhaustive-deps

/Users/jeminramani/Documents/projects/denergy/d_wallet/screens/Provider/WalletProvider.tsx
  81:1  warning  Trailing spaces not allowed  no-trailing-spaces
  87:1  warning  Trailing spaces not allowed  no-trailing-spaces
  89:1  warning  Trailing spaces not allowed  no-trailing-spaces

/Users/jeminramani/Documents/projects/denergy/d_wallet/screens/Provider/authProvider.tsx
  5:9  error  'Alert' is defined but never used  @typescript-eslint/no-unused-vars

/Users/jeminramani/Documents/projects/denergy/d_wallet/screens/styles.ts
  13:19  warning  Missing trailing comma  comma-dangle
  20:26  warning  Missing trailing comma  comma-dangle
  39:24  warning  Missing trailing comma  comma-dangle
  43:18  warning  Missing trailing comma  comma-dangle
  63:15  warning  Missing trailing comma  comma-dangle
  64:4   warning  Missing trailing comma  comma-dangle

/Users/jeminramani/Documents/projects/denergy/d_wallet/shim.js
   1:39  warning  Expected { after 'if' condition                 curly
   1:61  warning  Missing semicolon                               semi
   2:40  warning  Expected { after 'if' condition                 curly
   2:62  warning  Missing semicolon                               semi
   4:38  warning  Missing semicolon                               semi
   6:38  warning  Missing semicolon                               semi
   9:31  warning  Missing semicolon                               semi
  14:24  warning  Missing semicolon                               semi
  15:36  warning  Expected { after 'if' condition                 curly
  15:76  warning  Missing semicolon                               semi
  18:54  warning  Missing semicolon                               semi
  19:13  warning  ["NODE_ENV"] is better written in dot notation  dot-notation
  19:63  warning  Missing semicolon                               semi
  21:3   error    'localStorage' is not defined                   no-undef
  21:40  warning  Missing semicolon                               semi
  26:18  warning  Missing semicolon                               semi

✖ 766 problems (337 errors, 429 warnings)
  0 errors and 235 warnings potentially fixable with the `--fix` option.

info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
