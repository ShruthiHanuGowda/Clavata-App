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

type TabIconKeys =
    | 'Clavata'
    | 'Home'
    | 'Bookings'
    | 'Offers'
    | 'Profile';

const tabIconsActive: Record<TabIconKeys, any> = {
    Clavata: images?.homeActive,
    Home: images?.walletActive,
    Bookings: images?.shopActive,
    Offers: images?.categoryActive,
    Profile: images?.stakeActive,
};

const tabIcons: Record<TabIconKeys, any> = {
    Clavata: images?.home,
    Home: images?.wallet,
    Bookings: images?.shop,
    Offers: images?.category,
    Profile: images?.stake,
};

// ============================================================
// NAVIGATION ICON
// ============================================================

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
        />
    );
};

// ============================================================
// TAB COMPONENT
// ============================================================

interface TabBarComponentProps {
    name: TabIconKeys;
    active: boolean;
    options: {
        tabBarLabel?: string;
    };
    onLayout: (event: LayoutChangeEvent) => void;
    onPress: () => void;
}

const TabBarComponent: React.FC<
    TabBarComponentProps
> = ({
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

                {/* Circle behind tab */}
                <View
                    style={[
                        styles.componentCircle,
                        active
                            ? styles.componentCircleActive
                            : styles.componentCircleInactive,
                    ]}
                />

                {/* Icon + label */}
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

// ============================================================
// TYPES
// ============================================================

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

interface LayoutState {
    x: number;
    index: number;
}

interface LayoutAction {
    x: number;
    index: number;
}

// ============================================================
// TAB BAR
// ============================================================

const TabBar: React.FC<TabBarProps> = ({
    state: {
        index: activeIndex,
        routes,
    },
    navigation,
    descriptors,
}) => {
    const { bottom } = useSafeAreaInsets();

    // ==========================================================
    // LAYOUT REDUCER
    // ==========================================================

    const reducer = (
        state: LayoutState[],
        action: LayoutAction,
    ): LayoutState[] => {
        const existingIndex = state.findIndex(
            item => item.index === action.index,
        );

        // Update existing tab position
        if (existingIndex !== -1) {
            const updatedState = [...state];

            updatedState[existingIndex] = {
                x: action.x,
                index: action.index,
            };

            return updatedState;
        }

        // Add new tab position
        return [
            ...state,
            {
                x: action.x,
                index: action.index,
            },
        ];
    };

    const [layout, dispatch] = useReducer(
        reducer,
        [],
    );

    // ==========================================================
    // HANDLE TAB LAYOUT
    // ==========================================================

    const handleLayout = (
        event: LayoutChangeEvent,
        index: number,
    ) => {
        dispatch({
            x: event.nativeEvent.layout.x,
            index,
        });
    };

    // ==========================================================
    // ACTIVE TAB POSITION
    // ==========================================================

    const activeItem = layout.find(
        item => item.index === activeIndex,
    );

    let xOffset = -25;

    if (activeItem) {
        xOffset = activeItem.x - 25;
    }

    // ==========================================================
    // SVG CALCULATIONS
    // ==========================================================

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

    // ==========================================================
    // RENDER
    // ==========================================================

    return (
        <View
            style={[
                styles.tabBar,

                Platform.OS === 'android'
                    ? {
                        paddingBottom: bottom,
                    }
                    : styles.tabBarIOS,
            ]}>

            {/* ====================================================
          ACTIVE TAB BACKGROUND
      ==================================================== */}

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

                {/* ==================================================
            IMPORTANT WEB FIX

            Do NOT use:

            translateX={}
            translateY={}

            directly on Circle.

            React Native Web converts those props to DOM
            attributes, which causes:

            React does not recognize the translateY prop
        ================================================== */}

                <Circle
                    fill="#fff"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#C4C4C4"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeWidth={0.5}
                    transform="translate(-3 -12)"
                />

                <Path
                    fill="#FFF"
                    d="M4 24H6080V110H4z"
                />
            </Svg>

            {/* ====================================================
          TAB BUTTONS
      ==================================================== */}

            <View style={styles.tabBarContainer}>
                {routes.map((route, index) => {
                    const active =
                        index === activeIndex;

                    const descriptor =
                        descriptors[route.key];

                    const options =
                        descriptor?.options || {};

                    return (
                        <TabBarComponent
                            key={route.key}
                            name={route.name}
                            active={active}
                            options={options}
                            onLayout={event =>
                                handleLayout(
                                    event,
                                    index,
                                )
                            }
                            onPress={() =>
                                navigation.navigate(
                                    route.name,
                                )
                            }
                        />
                    );
                })}
            </View>
        </View>
    );
};

// ============================================================
// STYLES
// ============================================================

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

    // ==========================================================
    // ACTIVE SVG
    // ==========================================================

    activeBackground: {
        position: 'absolute',
    },

    svgPositioning: {
        top: -24,
        left: 16,
    },

    // ==========================================================
    // TAB CONTAINER
    // ==========================================================

    tabBarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },

    // ==========================================================
    // TAB
    // ==========================================================

    component: {
        height: 60,
        width: 60,
        marginTop: -5,
    },

    // ==========================================================
    // TAB CIRCLE
    // ==========================================================

    componentCircle: {
        flex: 1,

        borderRadius: 30,

        backgroundColor: 'white',
    },

    componentCircleActive: {
        transform: [
            {
                scale: 1,
            },
        ],
    },

    componentCircleInactive: {
        transform: [
            {
                scale: 0,
            },
        ],
    },

    // ==========================================================
    // ICON CONTAINER
    // ==========================================================

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
        opacity: 0.5,
    },

    // ==========================================================
    // ICON
    // ==========================================================

    icon: {
        height: 36,
        width: 36,
    },

    // ==========================================================
    // LABEL
    // ==========================================================

    text: {
        color: '#008060',

        fontSize: 12,

        width: 80,

        textAlign: 'center',

        fontFamily:
            fontsFamily.MulishSemiBold,
    },

    // ==========================================================
    // ACTIVE DOT
    // ==========================================================

    dot: {
        backgroundColor: '#008060',

        height: 5,
        width: 5,

        borderRadius: 3,

        marginTop: 3,
        marginBottom: 31,
    },

    // ==========================================================
    // IOS / WEB BOTTOM SPACE
    // ==========================================================

    tabBarIOS: {
        paddingBottom: 10,
    },
});

export default TabBar;

