import {useState, useEffect, useCallback} from 'react';

interface UseApiOptions {
  method?: string;
  headers?: HeadersInit;
  body?: string | FormData;
  [key: string]: any;
}

interface UseApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useApi = <T>(
  url: string,
  options: UseApiOptions = {},
): UseApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const result: T = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, []);

  return {data, isLoading, error, refetch: fetchData};
};

export default useApi;
