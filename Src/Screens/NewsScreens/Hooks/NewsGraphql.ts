import {useState, useEffect, useCallback} from 'react';
import {GET_BLOG_BY_ID, LIST_BLOGS} from './NewsQueries';
import {ListBlogsData, Blog} from './type';
import {useApolloClientContext} from '../../../providers';

// Custom hook
export const useBlogs = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Blog[] | null>(null);
  const [error, setError] = useState<any>(null);
  const {client} = useApolloClientContext();

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.query<ListBlogsData>({
        query: LIST_BLOGS,
        fetchPolicy: 'network-only',
      });

      setData(result.data.listBlogs?.items || []);
    } catch (err) {
      console.error('Failed to fetch blogs', err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const refetch = useCallback(() => {
    return fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return {
    loading,
    data,
    error,
    refetch,
  };
};

// Custom hook for fetching a single blog by ID
export const useBlogById = (id: string | null) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Blog | null>(null);
  const [error, setError] = useState<any>(null);
  const {client} = useApolloClientContext();

  const fetchBlog = useCallback(
    async (blogId: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await client.query({
          query: GET_BLOG_BY_ID,
          variables: {id: blogId},
          fetchPolicy: 'network-only',
        });

        setData(result.data.getBlogs || null);
      } catch (err) {
        console.error('Failed to fetch blog by ID', err);
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  const refetch = useCallback(() => {
    if (id) {
      return fetchBlog(id);
    }
    return Promise.resolve();
  }, [fetchBlog, id]);

  useEffect(() => {
    if (id) {
      fetchBlog(id);
    } else {
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, [fetchBlog, id]);

  return {
    loading,
    data,
    error,
    refetch,
  };
};
