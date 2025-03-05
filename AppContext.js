import { createContext } from 'react';

const AppContext = createContext({
    portfolio: {
        data: [],
        drecsData: {},
        balanceData: {},
        get: () => { },
        getDrecs: () => { },
        getBalance: () => { },
        loading: false,
        error: '',
        getProfile: () => { },
        profile: {},
        getPortfolioGraph: () => { },
        graphData: []
    },
});

export default AppContext;
