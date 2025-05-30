import { createContext } from 'react';

const StakeContext = createContext({
    count: 0,
    data: [],
    filters: {},
    setFilters: () => { },
    reloadData: () => { },
    resetData: () => { },
    loading: false,
    lastUpdated: new Date(),
});

export default StakeContext;
