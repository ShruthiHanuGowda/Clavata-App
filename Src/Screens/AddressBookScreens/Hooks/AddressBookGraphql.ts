import {useState, useEffect, useCallback} from 'react';
import {useApolloClientContext} from '../../../providers';
import {
  CREATE_ADDRESS_BOOK,
  UPDATE_ADDRESS_BOOK,
  DELETE_ADDRESS_BOOK,
  LIST_ADDRESS_BOOKS_BY_WALLET,
} from './AddressBookQueries';
import {
  ListAddressBooksData,
  ListAddressBooksVariables,
  AddressBook,
  CreateAddressBookInput,
  CreateAddressBookData,
  UpdateAddressBookInput,
  UpdateAddressBookData,
  DeleteAddressBookInput,
  DeleteAddressBookData,
} from './type';

// Custom hook for creating address books
export const useCreateAddressBook = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const {client} = useApolloClientContext();

  const createAddressBook = useCallback(
    async (input: CreateAddressBookInput) => {
      setLoading(true);
      setError(null);

      try {
        const result = await client.mutate<CreateAddressBookData>({
          mutation: CREATE_ADDRESS_BOOK,
          variables: {
            createaddressbookinput: input,
          },
          // Refetch all queries that might be affected by this mutation
          refetchQueries: [
            {
              query: LIST_ADDRESS_BOOKS_BY_WALLET,
              variables: {walletAddress: input.walletAddress},
            },
          ],
          // Also clear the cache for this query to ensure fresh data
          awaitRefetchQueries: true,
        });

        return result.data?.createAddressBook || null;
      } catch (err) {
        console.error('Failed to create address book', err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  return {
    loading,
    error,
    createAddressBook,
  };
};

// Custom hook for updating address books
export const useUpdateAddressBook = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const {client} = useApolloClientContext();

  const updateAddressBook = useCallback(
    async (input: UpdateAddressBookInput) => {
      setLoading(true);
      setError(null);

      try {
        const result = await client.mutate<UpdateAddressBookData>({
          mutation: UPDATE_ADDRESS_BOOK,
          variables: {
            updateaddressbookinput: input,
          },
          // Refetch all queries that might be affected by this mutation
          refetchQueries: [
            {
              query: LIST_ADDRESS_BOOKS_BY_WALLET,
              variables: {walletAddress: input.walletAddress},
            },
          ],
          // Also clear the cache for this query to ensure fresh data
          awaitRefetchQueries: true,
        });

        return result.data?.updateAddressBook || null;
      } catch (err) {
        console.error('Failed to update address book', err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  return {
    loading,
    error,
    updateAddressBook,
  };
};

// Custom hook for deleting address books
export const useDeleteAddressBook = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const {client} = useApolloClientContext();

  const deleteAddressBook = useCallback(
    async (id: string, walletAddress: string) => {
      setLoading(true);
      setError(null);

      try {
        const input: DeleteAddressBookInput = {id};

        const result = await client.mutate<DeleteAddressBookData>({
          mutation: DELETE_ADDRESS_BOOK,
          variables: {
            deleteaddressbookinput: input,
          },
          // Refetch all queries that might be affected by this mutation
          refetchQueries: [
            {
              query: LIST_ADDRESS_BOOKS_BY_WALLET,
              variables: {walletAddress},
            },
          ],
          // Also clear the cache for this query to ensure fresh data
          awaitRefetchQueries: true,
        });

        return result.data?.deleteAddressBook || null;
      } catch (err) {
        console.error('Failed to delete address book', err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  return {
    loading,
    error,
    deleteAddressBook,
  };
};

// Custom hook for finding address books by wallet address
export const useAddressBookByWallet = (walletAddress: string | null) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AddressBook[]>([]);
  const [error, setError] = useState<any>(null);
  const {client} = useApolloClientContext();

  const fetchAddressBooksByWallet = useCallback(
    async (wallet: string) => {
      setLoading(true);
      setError(null);

      try {
        const variables: ListAddressBooksVariables = {
          walletAddress: wallet,
        };

        const result = await client.query<ListAddressBooksData>({
          query: LIST_ADDRESS_BOOKS_BY_WALLET,
          variables,
          fetchPolicy: 'network-only',
        });

        const addressBooks = result.data.listAddressBooks?.items || [];
        setData(addressBooks);
      } catch (err) {
        console.error('Failed to fetch address books by wallet', err);
        setError(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  const refetch = useCallback(() => {
    if (walletAddress) {
      return fetchAddressBooksByWallet(walletAddress);
    }
    return Promise.resolve();
  }, [fetchAddressBooksByWallet, walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchAddressBooksByWallet(walletAddress);
    } else {
      setData([]);
      setError(null);
      setLoading(false);
    }
  }, [fetchAddressBooksByWallet, walletAddress]);

  return {
    loading,
    data,
    error,
    refetch,
  };
};
