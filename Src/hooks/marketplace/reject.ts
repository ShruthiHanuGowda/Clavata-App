export const isUserRejected = (err: unknown) => {
  return (
    typeof err === 'object' &&
    err !== null &&
    err.toString().includes('User rejected the request.')
  );
};
