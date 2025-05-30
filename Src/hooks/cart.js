import {useState} from 'react';
// import {
//   addMultiplToCartNftApi,
//   addToCartNftApi,
//   clearCartApi,
//   listCartApi,
//   removeFromCartNftApi,
// } from '../appRedux/services/marketPlace';
import {addMultipleToCartNft} from '../config/axios/apiEndpointConstant';
import {SnackBarMessage} from '../utils';

export default function useCart() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);

  async function getAll(params) {
    setLoading(true);
    const [error, result] = await listCartApi(params);
    if (error) {
      return setError('failed to get data');
    }
    if (result.data?.length > 0) {
      if (params?.page > 1) {
        const updated = [...data.data];
        result.data = updated.concat(result.data);
        setData(result);
      } else {
        setData(result);
      }
    }
    setSelected(result?.data?.map(val => val.nftId));
    setLoading(false);
    return [error, result];
  }

  async function removeFromCart(nftId) {
    setLoading(true);
    const [error, data] = await removeFromCartNftApi(nftId);
    if (!error) {
      SnackBarMessage('DREC Removed from Cart');
      setData(data);
    }
    setLoading(false);
    return [error, data];
  }

  async function addMultipleToCart(params) {
    setLoading(true);
    const [error, data] = await addMultiplToCartNftApi(params);
    if (!error) {
      SnackBarMessage('DREC Added to Cart', 'success');
      setData(data);
    }
    setLoading(false);
    return [error, data];
  }

  async function addToCart(nftId) {
    const [error, data] = await addToCartNftApi(nftId);
    if (!error) {
      SnackBarMessage(' DREC added to Cart', 'success');
      setData(data);
    }
    return [error, data];
  }

  async function clearCart(nftId, price) {
    setLoading(true);
    const [error, data] = await clearCartApi();
    if (!error) {
      SnackBarMessage('Cart cleared');
      setData(data);
    }
    setLoading(false);
    return [error, data];
  }

  return {
    error,
    loading,
    setLoading,
    data,
    getAll,
    selected,
    setSelected,
    addToCart,
    clearCart,
    removeFromCart,
    addMultipleToCart,
  };
}
