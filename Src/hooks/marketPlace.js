import {useState} from 'react';
import {
  delistNftApi,
  editNftPriceApi,
  filterMarketPlaceApi,
  listNftApi,
  orderAdminWalletApi,
  orderApi,
  orderFeeApi,
  redeemNftApi,
} from '../appRedux/services/marketPlace';
import clearParams from '../appRedux/services/utils/cleanParams';
import {SnackBarMessage} from '../utils';

export default function useMarketPlace() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date().getTime());

  async function resetData() {
    setData({});
  }

  async function getAll(params) {
    setLoading(true);
    params = clearParams(params);
    const [error, result] = await filterMarketPlaceApi(params);
    if (error) {
      setLoading(false);
      return setError('failed to get data');
    }
    if (params?.page > 1) {
      setData(data.concat(result.data));
    } else {
      setData(result.data);
    }
    setCount(Number(result.count));
    setLastUpdated(new Date().getTime());
    setLoading(false);
    return [error, result];
  }

  async function editNftPrice(nftIds, price) {
    setLoading(true);
    const [error, data] = await editNftPriceApi({
      nftIds,
      listingPrice: price,
    });
    if (!error) {
      setData({
        ...data,
        data: data.data,
      });
      SnackBarMessage('Listing Price Updated for selected DRECs', 'success');
    }
    setLoading(false);
    return [error, data];
  }

  async function listNft(nftIds, price) {
    setLoading(true);
    const [error, data] = await listNftApi({
      nftIds,
      listingPrice: price,
    });
    if (!error) {
      setData({
        ...data,
        data: data.data,
      });
      // SnackBarMessage('Listed selected DRECs', "success")
    }
    setLoading(false);
    return [error, data];
  }

  async function orderFee(coinCode) {
    setLoading(true);
    const [adminWalletError, adminWalletResult] = await orderAdminWalletApi();
    const [error, data] = await orderFeeApi({coinCode});
    setLoading(false);
    return [error, {...data, ...adminWalletResult.data}];
  }

  async function placeOrder(body) {
    setLoading(true);
    const [error, data] = await orderApi(body);
    if (!error) {
      // setData({
      //     ...data,
      //     data: data.data
      // })
      SnackBarMessage('Order Placed Successfully', 'success');
    }
    setLoading(false);
    return [error, data];
  }

  async function deListNft(nftIds) {
    setLoading(true);
    const [error, data] = await delistNftApi({
      nftIds,
    });
    if (!error) {
      setData({
        ...data,
        data: data.data,
      });
      SnackBarMessage('Delisted Selected DRECs', 'success');
    }
    setLoading(false);
    return [error, data];
  }

  async function redeemNft(_id, selectedQuantity) {
    setLoading(true);
    const [error, data] = await redeemNftApi({
      nftId: [
        {
          _id,
          selectedQuantity,
        },
      ],
    });
    if (!error) {
      setData({
        ...data,
        data: data.data,
      });
      SnackBarMessage('Redeemed Selected DRECs', 'success');
    }
    setLoading(false);
    return [error, data];
  }
  return {
    error,
    resetData,
    loading,
    count,
    data,
    getAll,
    editNftPrice,
    deListNft,
    redeemNft,
    listNft,
    lastUpdated,
    placeOrder,
    orderFee,
  };
}
