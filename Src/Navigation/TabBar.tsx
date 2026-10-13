import React, { useReducer, useCallback } from 'react';

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

type TabIconKeys =
  | 'Clavata'
  | 'Home'
  | 'Bookings'
  | 'Offers'
  | 'Profile';

const tabIconsActive: Record<TabIconKeys, any> = {
  Clavata: images?.homeActive,
  Home: images?.homeActive,
  Bookings: images?.bookingActive,
  Offers: images?.offerActive,
  Profile: images?.profileActive,
};

const tabIcons: Record<TabIconKeys, any> = {
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
      source={
        isFocused
          ? tabIconsActive[route]
          : tabIcons[route]
      }
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

type LayoutAction = LayoutState;

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
      style={styles.component}
    >
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
        ]}
      >
        <NavigationIcon
          route={name}
          isFocused={active}
        />

        <Text
          style={[
            styles.text,
            active
              ? styles.textActive
              : styles.textInactive,
          ]}
        >
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
    const existingIndex = state.findIndex(
      item => item.index === action.index,
    );

    if (existingIndex !== -1) {
      return state.map((item, index) =>
        index === existingIndex
          ? action
          : item,
      );
    }

    return [...state, action];
  };

  const [layout, dispatch] = useReducer(
    reducer,
    [],
  );

  const handleLayout = useCallback(
    (
      event: LayoutChangeEvent,
      index: number,
    ) => {
      const x = event.nativeEvent.layout.x;

      dispatch({
        x: Number.isFinite(x) ? x : 0,
        index,
      });
    },
    [],
  );

  const activeItem = layout.find(
    item => item.index === activeIndex,
  );

  // Keep translateX as a number, never a string or object.
  const xOffset: number =
    activeItem && Number.isFinite(activeItem.x)
      ? activeItem.x - 25
      : -25;

  const width = 100;
  const height = 100;

  const size =
    width < height
      ? width - 32
      : height - 16;

  const strokeWidth = 25;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <View
      style={[
        styles.tabBar,
        Platform.OS === 'android'
          ? { paddingBottom: bottom }
          : styles.tabBarIOS,
      ]}
    >
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
                translateX: xOffset,
              },
            ],
          },
        ]}
      >
        <Circle
          translateY={-12}
          translateX={-3}
          fill="#FFFFFF"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#C4C4C4"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeWidth={0.5}
        />

        <Path
          fill="#FFFFFF"
          d="M4 24H6080V110H4z"
        />
      </Svg>

      <View style={styles.tabBarContainer}>
        {routes.map((route, index) => {
          const active = index === activeIndex;
          const { options } = descriptors[route.key];

          return (
            <TabBarComponent
              key={route.key}
              name={route.name}
              active={active}
              options={options}
              onLayout={event =>
                handleLayout(event, index)
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
    backgroundColor: '#FFFFFF',
    borderTopColor: '#C4C4C4',
    borderTopWidth: 0.35,

    shadowColor: '#000000',
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
    backgroundColor: '#FFFFFF',
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

  textActive: {
    color: '#000000',
  },

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
