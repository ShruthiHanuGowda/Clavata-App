import {BrowserProvider, Contract} from 'ethers';
import {ERC1155_ABI, ERC20_ABI} from '../../utils/Contracts';

export const requiresApproval = async (
  contractAddress: any,
  account: `0x${string}`,
  spenderAddress: `0x${string}`,
  minimumRequired = 0n,
  network: any,
) => {
  try {
    if (!contractAddress) {return true;}
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
export const isApprovedForAll = async (
  contractAddress: any,
  account: `0x${string}`,
  spenderAddress: `0x${string}`,
  network: any,
) => {
  try {
    if (!contractAddress) {return true;}
    const provider = new BrowserProvider(network.rpcProvider as any);
    const signer = await provider.getSigner();
    const onChainTokenContract = new Contract(
      contractAddress,
      ERC1155_ABI,
      signer,
    );
    const isApprovedForAll = await onChainTokenContract.isApprovedForAll(
      account,
      spenderAddress,
    );

    return isApprovedForAll;
  } catch (error) {
    console.log('error', error);

    return true;
  }
};
