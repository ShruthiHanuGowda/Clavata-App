import React, {useEffect, useReducer, useRef} from 'react';
import {
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Circle, Path, Svg} from 'react-native-svg';
import images from '../Theme/images';
import fontsFamily from '../Theme/fontsFamily';

type TabIconKeys = 'D.Energy' | 'Wallet' | 'Marketplace' | 'dApps' | 'Stake';

const tabIconsActive: {
  Marketplace: {};
  Wallet: {};
  dApps: {};
  'D.Energy': {};
  Stake: {};
} = {
  'D.Energy': images?.homeActive,
  Wallet: images?.walletActive,
  Marketplace: images?.shopActive,
  dApps: images?.categoryActive,
  Stake: images?.stakeActive,
};

const tabIcons: {
  Marketplace: {};
  Wallet: {};
  dApps: {};
  'D.Energy': {};
  Stake: {};
} = {
  'D.Energy': images?.home,
  Wallet: images?.wallet,
  Marketplace: images?.shop,
  dApps: images?.category,
  Stake: images?.stake,
};

interface NavigationIconProps {
  isFocused: boolean;
  route: TabIconKeys;
}

const NavigationIcon: React.FC<NavigationIconProps> = ({isFocused, route}) => {
  return <Image source={isFocused ? tabIconsActive[route] : tabIcons[route]} />;
};

interface TabBarComponentProps {
  name: TabIconKeys;
  active: boolean;
  options: {
    tabBarLabel?: string;
  };
  onLayout: (event: LayoutChangeEvent) => void;
  onPress: () => void;
}

interface LayoutState {
  x: number;
  index: number;
}

type LayoutAction = {
  x: number;
  index: number;
};

const TabBarComponent: React.FC<TabBarComponentProps> = ({
  name,
  active,
  options,
  onLayout,
  onPress,
}) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (active && ref?.current) {
      ref.current.play();
    }
  }, [active]);

  return (
    <Pressable onPress={onPress} onLayout={onLayout} style={styles.component}>
      <View
        style={[styles.componentCircle, active ? styles.componentCircleActive : styles.componentCircleInactive]}
      />
      <View style={[styles.iconContainer, active ? styles.iconContainerActive : styles.iconContainerInactive]}>
        <NavigationIcon route={name} isFocused={active} />
        {active && (
          <>
            <Text style={styles.text}>
              {options.tabBarLabel || name}
            </Text>
            <View style={styles.dot} />
          </>
        )}
      </View>
    </Pressable>
  );
};

interface Route {
  key: string;
  name: TabIconKeys;
}

interface TabBarProps {
  state: {
    index: number;
    routes: Route[];
  };
  navigation: {
    navigate: (name: string) => void;
  };
  descriptors: {
    [key: string]: {
      options: {
        tabBarLabel?: string;
      };
    };
  };
}

const TabBar: React.FC<TabBarProps> = ({
  state: {index: activeIndex, routes},
  navigation,
  descriptors,
}) => {
  const {bottom} = useSafeAreaInsets();

  const reducer = (
    state: LayoutState[],
    action: LayoutAction,
  ): LayoutState[] => {
    return [...state, {x: action.x, index: action.index}];
  };

  const [layout, dispatch] = useReducer(reducer, []);

  const handleLayout = (event: LayoutChangeEvent, index: number) => {
    dispatch({x: event?.nativeEvent?.layout?.x, index});
  };

  let xOffset = 0;
  const item = [...layout].find(({index}) => index === activeIndex);
  if (!item) {
    xOffset = -25;
  } else {
    xOffset = item.x - 25;
  }

  const width = 100;
  const height = 100;
  const size = width < height ? width - 32 : height - 16;
  const strokeWidth = 25;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <View
      style={[
        styles.tabBar,
        Platform.OS === 'android' ? {paddingBottom: bottom} : styles.tabBarIOS,
      ]}>
      <Svg
        width={110}
        height={70}
        viewBox="0 0 110 70"
        style={[
          styles.activeBackground,
          styles.svgPositioning,
          {transform: [{translateX: typeof xOffset === 'number' ? xOffset : 1}]},
        ]}>
        <Circle
          translateY={-12}
          translateX={-3}
          fill="#fff"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#C4C4C4"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeWidth={0.5}
        />
        <Path fill="#FFF" d="M4 24H6080V110H4z" />
      </Svg>

      <View style={styles.tabBarContainer}>
        {routes.map((route, index) => {
          const active = index === activeIndex;
          const {options} = descriptors[route.key];

          return (
            <TabBarComponent
              key={route.key}
              name={route.name}
              active={active}
              options={options}
              onLayout={e => handleLayout(e, index)}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderTopColor: '#C4C4C4',
    borderTopWidth: 0.35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    // height: 53,
  },
  activeBackground: {
    position: 'absolute',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  component: {
    height: 60,
    width: 60,
    marginTop: -5,
  },
  componentCircle: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 36,
    width: 36,
  },
  dot: {
    backgroundColor: '#008060',
    height: 5,
    width: 5,
    borderRadius: 3,
    marginTop: 3,
    marginBottom: 31,
  },
  text: {
    color: '#008060',
    fontSize: 12,
    width: 80,
    textAlign: 'center',
    fontFamily: fontsFamily.MulishSemiBold,
  },
  componentCircleActive: {
    transform: [{scale: 1}],
  },
  componentCircleInactive: {
    transform: [{scale: 0}],
  },
  iconContainerActive: {
    opacity: 1,
  },
  iconContainerInactive: {
    opacity: 0.5,
  },
  tabBarIOS: {
    paddingBottom: 10,
  },
  svgPositioning: {
    top: -24,
    left: 16,
  },
});

export default TabBar;
