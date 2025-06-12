import {HttpLink, InMemoryCache} from '@apollo/client';
import {ApolloClient} from '@apollo/client';
import {useState, useEffect, useCallback} from 'react';
import {ADDRESS_BOOK_API_KEY, ADDRESS_BOOK_API_URL} from '../../../constants'; // Update these constants as needed
import {CREATE_ADDRESS_BOOK, LIST_ADDRESS_BOOKS} from './AddressBookQueries';
import {
  ListAddressBooksData,
  AddressBook,
  CreateAddressBookInput,
  CreateAddressBookData,
} from './type';

const client = new ApolloClient({
  link: new HttpLink({
    uri: ADDRESS_BOOK_API_URL, // Update this to your address book API URL
    headers: {
      'x-api-key': ADDRESS_BOOK_API_KEY, // Update this to your address book API key
    },
    includeExtensions: true,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
  },
});

// Custom hook for listing address books
export const useAddressBooks = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<AddressBook[] | null>(null);
  const [error, setError] = useState<any>(null);

  const fetchAddressBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.query<ListAddressBooksData>({
        query: LIST_ADDRESS_BOOKS,
        fetchPolicy: 'network-only',
      });

      setData(result.data.listAddressBooks?.items || []);
    } catch (err) {
      console.error('Failed to fetch address books', err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchAddressBooks();
  }, [fetchAddressBooks]);

  useEffect(() => {
    fetchAddressBooks();
  }, [fetchAddressBooks]);

  return {
    loading,
    data,
    error,
    refetch,
  };
};

// Custom hook for creating address books
export const useCreateAddressBook = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

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
    [],
  );

  return {
    loading,
    error,
    createAddressBook,
  };
};

// Custom hook for finding address book by wallet address
export const useAddressBookByWallet = (walletAddress: string | null) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AddressBook | null>(null);
  const [error, setError] = useState<any>(null);

  const fetchAddressBookByWallet = useCallback(async (wallet: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.query<ListAddressBooksData>({
        query: LIST_ADDRESS_BOOKS,
        fetchPolicy: 'network-only',
      });

      const addressBooks = result.data.listAddressBooks?.items || [];
      const foundAddressBook = addressBooks.find(
        book => book.walletAddress === wallet,
      );

      setData(foundAddressBook || null);
    } catch (err) {
      console.error('Failed to fetch address book by wallet', err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (walletAddress) {
      return fetchAddressBookByWallet(walletAddress);
    }
    return Promise.resolve();
  }, [fetchAddressBookByWallet, walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchAddressBookByWallet(walletAddress);
    } else {
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, [fetchAddressBookByWallet, walletAddress]);

  return {
    loading,
    data,
    error,
    refetch,
  };
};
