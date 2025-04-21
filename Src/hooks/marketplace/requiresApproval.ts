import {BrowserProvider, Contract} from 'ethers';
import {ERC20_ABI, TOKEN_CONTRACTS} from '../../constants';
import {useMagic} from '../../../screens/Provider/MagicProvider';

export const requiresApproval = async (
  contractAddress: any,
  account: `0x${string}`,
  spenderAddress: `0x${string}`,
  minimumRequired = 0n,
  network: any,
) => {
  try {
    alert(111);
    if (!contractAddress) return true;
    const provider = new BrowserProvider(network.rpcProvider as any);
    const signer = await provider.getSigner();
    const onChainTokenContract = new Contract(
      contractAddress,
      ERC20_ABI,
      signer,
    );
    const currentAllowance = await onChainTokenContract.allowance(
      account,
      spenderAddress,
    );

    const hasMinimumRequired =
      typeof minimumRequired !== 'undefined' && minimumRequired > 0n;
    if (hasMinimumRequired) {
      return currentAllowance < minimumRequired;
    }
    return currentAllowance <= 0;
  } catch (error) {
    console.log('error', error);

    return true;
  }
};
