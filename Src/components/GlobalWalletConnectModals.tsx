import React from 'react';
// import {useWalletConnect} from '../providers';
// import {useMagic} from '../providers';
// import {useAuth} from '../providers';
// import SpendingCapRequestModal from '../Screens/WalletConnect/SpendingCapRequestModal';

/**
 * GlobalWalletConnectModals
 *
 * This component renders WalletConnect request modals globally across the app.
 * It listens to the WalletConnect provider for pending requests and shows
 * the appropriate modal regardless of which screen the user is on.
 *
 * This allows users to see and respond to dApp requests (transaction approvals,
 * signature requests, etc.) even when they're not on the WalletConnect screen.
 */
const GlobalWalletConnectModals: React.FC = () => {
  // const {
  //   pendingRequest,
  //   approveRequest,
  //   rejectRequest,
  //   activeSessions,
  // } = useWalletConnect();

  // const {activeNetwork} = useMagic();
  // const {userDetails} = useAuth();

  // Don't render anything if there's no pending request
  // if (!pendingRequest) {
  //   return null;
  // }

  // // Get dApp metadata from the active session that matches this request
  // const dappMetadata = activeSessions.find(
  //   session => session.topic === pendingRequest?.topic,
  // )?.peer?.metadata;

  return (
    // <SpendingCapRequestModal
    //   visible="true"
    //   request={pendingRequest}
    //   accountAddress={userDetails?.userWallet || ''}
    //   networkName={activeNetwork === 'denergy' ? 'D-Energy' : 'Sepolia'}
    //   networkSymbol={activeNetwork === 'denergy' ? 'D-Energy' : 'SepoliaETH'}
    //   dappMetadata={dappMetadata}
    //   onApprove={approveRequest}
    //   onReject={rejectRequest}
    // />
    <></>
  );
};

export default GlobalWalletConnectModals;
