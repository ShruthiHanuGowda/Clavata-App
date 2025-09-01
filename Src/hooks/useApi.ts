import {useState, useEffect, useCallback, useMemo, useRef} from 'react';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Memoize options to prevent re-renders due to object reference changes
  const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    abortControllerRef.current?.abort(); // Cancel any previous request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const response = await fetch(url, {
        ...memoizedOptions,
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const result: T = await response.json();
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong!');
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, memoizedOptions]);
  useEffect(() => {
    fetchData();
    return () => {
      // Cleanup any ongoing fetch when component unmounts
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);
  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
export default useApi;
