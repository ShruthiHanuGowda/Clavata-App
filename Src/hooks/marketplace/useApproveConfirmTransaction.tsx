import {useCallback, useReducer, useRef, useEffect} from 'react';
import noop from 'lodash/noop';
import useCatchTxError from './useCatchTxError';
import {useAuth} from '../../../screens/Provider/authProvider';
import {TransactionReceipt} from 'ethers';

// Types for state
type LoadingState = 'idle' | 'loading' | 'success' | 'fail';

type Action =
  | {type: 'approve_sending'}
  | {type: 'approve_receipt'}
  | {type: 'approve_error'}
  | {type: 'confirm_sending'}
  | {type: 'confirm_receipt'}
  | {type: 'confirm_error'};

interface State {
  approvalState: LoadingState;
  confirmState: LoadingState;
}

const initialState: State = {
  approvalState: 'idle',
  confirmState: 'idle',
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'approve_sending':
      return {...state, approvalState: 'loading'};
    case 'approve_receipt':
      return {...state, approvalState: 'success'};
    case 'approve_error':
      return {...state, approvalState: 'fail'};
    case 'confirm_sending':
      return {...state, confirmState: 'loading'};
    case 'confirm_receipt':
      return {...state, confirmState: 'success'};
    case 'confirm_error':
      return {...state, confirmState: 'fail'};
    default:
      return state;
  }
};

// Shared prop types
interface OnSuccessProps {
  state: State;
  receipt: any;
}

type CustomApproveProps = {
  onRequiresApproval: () => Promise<boolean>;
  onApprove: () => Promise<TransactionReceipt | undefined>;
};

type ApproveConfirmTransaction = {
  onConfirm: (params?: any) => Promise<TransactionReceipt | undefined>;
  onSuccess: ({state, receipt}: OnSuccessProps) => void;
  onApproveSuccess?: ({state, receipt}: OnSuccessProps) => void;
} & CustomApproveProps;

const useApproveConfirmTransaction = ({
  onConfirm,
  onSuccess = noop,
  onApproveSuccess = noop,
  onRequiresApproval,
  onApprove,
}: ApproveConfirmTransaction) => {
  const {userDetails} = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const handlePreApprove = useRef(onRequiresApproval);
  const {fetchWithCatchTxError} = useCatchTxError();

  // Handle approval process
  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(async () => {
      dispatch({type: 'approve_sending'});
      return onApprove();
    });

    if (receipt?.hash) {
      dispatch({type: 'approve_receipt'});
      onApproveSuccess({state, receipt});
    } else {
      dispatch({type: 'approve_error'});
    }
  }, [fetchWithCatchTxError, onApprove, onApproveSuccess, state]);

  // Handle confirmation process
  const handleConfirm = useCallback(
    async (params = {}) => {
      const receipt = await fetchWithCatchTxError(async () => {
        dispatch({type: 'confirm_sending'});
        return onConfirm(params);
      });

      if (receipt?.hash) {
        dispatch({type: 'confirm_receipt'});
        onSuccess({state, receipt});
      } else {
        dispatch({type: 'confirm_error'});
      }
    },
    [fetchWithCatchTxError, onConfirm, onSuccess, state],
  );

  useEffect(() => {
    if (userDetails && handlePreApprove.current) {
      handlePreApprove.current().then(requiresApproval => {
        if (!requiresApproval) {
          dispatch({type: 'approve_receipt'});
        }
      });
    }
  }, [userDetails, handlePreApprove, dispatch]);

  return {
    isApproving: state.approvalState === 'loading',
    isApproved: state.approvalState === 'success',
    isConfirming: state.confirmState === 'loading',
    isConfirmed: state.confirmState === 'success',
    hasApproveFailed: state.approvalState === 'fail',
    hasConfirmFailed: state.confirmState === 'fail',
    handleApprove,
    handleConfirm,
  };
};

export default useApproveConfirmTransaction;
