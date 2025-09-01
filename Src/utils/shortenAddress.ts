export const shortenAddress = (address: string, chars = 6) => {
  if (!address) {return '';}
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
