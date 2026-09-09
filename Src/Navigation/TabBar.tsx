
import React, { useReducer } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle, Path, Svg } from 'react-native-svg';
import images from '../Theme/images';
import fontsFamily from '../Theme/fontsFamily';

type TabIconKeys = 'Clavata' | 'Home' | 'Bookings' | 'Offers' | 'Profile';

const tabIconsActive: {
  Bookings: {};
  Home: {};
  Offers: {};
  Clavata: {};
  Profile: {};
} = {
  Clavata: images?.homeActive,
  Home: images?.homeActive,
  Bookings: images?.bookingActive,
  Offers: images?.offerActive,
  Profile: images?.profileActive,
};

const tabIcons: {
  Bookings: {};
  Home: {};
  Offers: {};
  Clavata: {};
  Profile: {};
} = {
  Clavata: images?.home,
  Home: images?.home,
  Bookings: images?.booking,
  Offers: images?.offer,
  Profile: images?.profile,
};

interface NavigationIconProps {
  isFocused: boolean;
  route: TabIconKeys;
}

const NavigationIcon: React.FC<NavigationIconProps> = ({
  isFocused,
  route,
}) => {
  return (
    <Image
      source={isFocused ? tabIconsActive[route] : tabIcons[route]}
      style={styles.icon}
      resizeMode="contain"
    />
  );
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
  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      style={styles.component}>
      
      <View
        style={[
          styles.componentCircle,
          active
            ? styles.componentCircleActive
            : styles.componentCircleInactive,
        ]}
      />

      <View
        style={[
          styles.iconContainer,
          active
            ? styles.iconContainerActive
            : styles.iconContainerInactive,
        ]}>
        
        <NavigationIcon
          route={name}
          isFocused={active}
        />

        {/* Tab label */}
        <Text
          style={[
            styles.text,
            active
              ? styles.textActive
              : styles.textInactive,
          ]}>
          {options.tabBarLabel || name}
        </Text>

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
  state: { index: activeIndex, routes },
  navigation,
  descriptors,
}) => {
  const { bottom } = useSafeAreaInsets();

  const reducer = (
    state: LayoutState[],
    action: LayoutAction,
  ): LayoutState[] => {
    return [
      ...state,
      {
        x: action.x,
        index: action.index,
      },
    ];
  };

  const [layout, dispatch] = useReducer(reducer, []);

  const handleLayout = (
    event: LayoutChangeEvent,
    index: number,
  ) => {
    dispatch({
      x: event?.nativeEvent?.layout?.x,
      index,
    });
  };

  let xOffset = 0;

  const item = [...layout].find(
    ({ index }) => index === activeIndex,
  );

  if (!item) {
    xOffset = -25;
  } else {
    xOffset = item.x - 25;
  }

  const width = 100;
  const height = 100;

  const size =
    width < height
      ? width - 32
      : height - 16;

  const strokeWidth = 25;

  const radius =
    (size - strokeWidth) / 2;

  const circumference =
    radius * 2 * Math.PI;

  return (
    <View
      style={[
        styles.tabBar,
        Platform.OS === 'android'
          ? { paddingBottom: bottom }
          : styles.tabBarIOS,
      ]}>

      <Svg
        width={110}
        height={70}
        viewBox="0 0 110 70"
        style={[
          styles.activeBackground,
          styles.svgPositioning,
          {
            transform: [
              {
                translateX:
                  typeof xOffset === 'number'
                    ? xOffset
                    : 1,
              },
            ],
          },
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

        <Path
          fill="#FFF"
          d="M4 24H6080V110H4z"
        />

      </Svg>

      <View style={styles.tabBarContainer}>
        {routes.map((route, index) => {
          const active =
            index === activeIndex;

          const { options } =
            descriptors[route.key];

          return (
            <TabBarComponent
              key={route.key}
              name={route.name}
              active={active}
              options={options}
              onLayout={e =>
                handleLayout(e, index)
              }
              onPress={() =>
                navigation.navigate(route.name)
              }
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

  componentCircleActive: {
    transform: [{ scale: 1 }],
  },

  componentCircleInactive: {
    transform: [{ scale: 0 }],
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

  iconContainerActive: {
    opacity: 1,
  },

  iconContainerInactive: {
    opacity: 1,
  },

  icon: {
    height: 26,
    width: 26,
  },

  text: {
    fontSize: 12,
    width: 80,
    textAlign: 'center',
    fontFamily: fontsFamily.MulishSemiBold,
  },

  // ACTIVE TAB TEXT
  textActive: {
    color: '#000000',
  },

  // INACTIVE TAB TEXT
  textInactive: {
    color: '#000000',
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
