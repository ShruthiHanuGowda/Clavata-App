import {LinkingOptions} from '@react-navigation/native';

const linking: LinkingOptions<Record<string, any>> = {
  prefixes: ['denergyexample://'],
  config: {
    screens: {
      Root: {
        path: '',
        screens: {
          Login: {
            screens: {
              TabOneScreen: 'Login',
            },
          },
          Web3: {
            screens: {
              TabTwoScreen: 'Web3',
            },
          },
        },
      },
      Modal: 'modal',
      NotFound: '*',
    },
  },
};

export default linking;
