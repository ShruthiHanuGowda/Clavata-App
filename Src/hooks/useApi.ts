import {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {errorService, ApiError} from '../services/errorService';
interface UseApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
  [key: string]: any;
}

interface UseApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}
const useApi = <T>(
  url: string,
  options: UseApiOptions = {},
): UseApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const optionsStringified = JSON.stringify(options);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedOptions = useMemo(() => options, [optionsStringified]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const response = await fetch(url, {
        ...memoizedOptions,
        signal: controller.signal,
      });
      if (!response.ok) {
        const apiError = errorService.handleApiError(
          {status: response.status, statusText: response.statusText},
          url,
          'useApi',
        );
        setError(apiError);
        return;
      }
      const result: T = await response.json();
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const apiError = errorService.handleApiError(err, url, 'useApi');
        setError(apiError);
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
