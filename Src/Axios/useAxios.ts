import {useState, useEffect, useCallback, useRef} from 'react';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

interface UseAxiosOptions extends AxiosRequestConfig {
  [key: string]: any;
}

interface UseAxiosResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useAxios = <T>(
  url: string,
  options: UseAxiosOptions = {},
): UseAxiosResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use useRef to store the options object to prevent re-renders
  const optionsRef = useRef(options);

  // Setup a counter for manual refetches
  const refetchCounter = useRef(0);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: AxiosResponse<T> = await axios({
        url,
        ...optionsRef.current,
      });
      setData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Something went wrong!',
      );
    } finally {
      setIsLoading(false);
    }
  }, [url, refetchCounter.current]); // Only depend on url and refetch counter

  // Manual refetch function that increments counter to trigger useEffect
  const refetch = useCallback(() => {
    refetchCounter.current += 1;
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {data, isLoading, error, refetch};
};

export default useAxios;
