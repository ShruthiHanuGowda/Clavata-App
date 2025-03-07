import {createContext} from 'react';

const MarketPlaceContext = createContext({
  myListingChecked: false,
  selected: [],
  loading: false,
  setSelected: () => {},
  setMyListingChecked: () => {},
  data: [],
  count: 0,
  reloadData: () => {},
  lastUpdated: 0,
  filters: {},
  setFilters: () => {},
  selectedOrg: null,
  resetData: () => {},
  setSelectedOrg: () => {},
  removeFromCart: () => {},
  addToCart: () => {},
  countries: [],
});

export default MarketPlaceContext;
