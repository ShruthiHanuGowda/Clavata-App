import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 175;

const PRIMARY = '#008060';

type Ad = {
    id: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    buttonText: string;
    image: string;
};

const ADS: Ad[] = [
    {
        id: '1',
        eyebrow: 'NEX EXCLUSIVE',
        title: 'Your next beauty appointment, made easy.',
        subtitle:
            'Discover trusted salons and book your favourite services in just a few taps.',
        buttonText: 'Explore now',
        image:
            'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: '2',
        eyebrow: 'WELCOME TO NEX',
        title: 'Discover salons made for you.',
        subtitle:
            'Find highly rated salons and explore services near your location.',
        buttonText: 'Find salons',
        image:
            'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: '3',
        eyebrow: 'BEAUTY • WELLNESS • STYLE',
        title: 'One app for your beauty needs.',
        subtitle:
            'Hair, facial, spa, nails and more — discover it all with Clavata.',
        buttonText: 'Explore services',
        image:
            'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80',
    },
];

type Props = {
    onAdPress?: (ad: Ad) => void;
};

export default function HomeAdCarousel({
    onAdPress,
}: Props) {
    const [activeIndex, setActiveIndex] = useState(0);

    const flatListRef =
        useRef<FlatList<Ad>>(null);

    const currentIndexRef =
        useRef(0);

    /*
     * AUTO SLIDE
     *
     * Changes advertisement every
     * 4.5 seconds.
     */
    useEffect(() => {
        const interval = setInterval(() => {
            let nextIndex =
                currentIndexRef.current + 1;

            if (nextIndex >= ADS.length) {
                nextIndex = 0;
            }

            currentIndexRef.current =
                nextIndex;

            setActiveIndex(nextIndex);

            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
        }, 4500);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const handleScroll = (
        event: any,
    ) => {
        const offsetX =
            event.nativeEvent.contentOffset.x;

        const index = Math.round(
            offsetX / CARD_WIDTH,
        );

        if (
            index >= 0 &&
            index < ADS.length
        ) {
            currentIndexRef.current =
                index;

            setActiveIndex(index);
        }
    };

    const renderItem = ({
        item,
    }: {
        item: Ad;
    }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.94}
                style={styles.card}
                onPress={() => {
                    onAdPress?.(item);
                }}
            >
                <Image
                    source={{
                        uri: item.image,
                    }}
                    style={styles.image}
                />

                {/* Dark image overlay */}
                <View
                    style={
                        styles.overlay
                    }
                />

                {/* Content */}
                <View
                    style={
                        styles.content
                    }
                >
                    <Text
                        style={
                            styles.eyebrow
                        }
                    >
                        {item.eyebrow}
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                        numberOfLines={2}
                    >
                        {item.title}
                    </Text>

                    <Text
                        style={
                            styles.subtitle
                        }
                        numberOfLines={2}
                    >
                        {item.subtitle}
                    </Text>

                    <View
                        style={
                            styles.button
                        }
                    >
                        <Text
                            style={
                                styles.buttonText
                            }
                        >
                            {item.buttonText}
                        </Text>

                        <Text
                            style={
                                styles.arrow
                            }
                        >
                            →
                        </Text>
                    </View>
                </View>

                {/* Clavata badge */}
                <View
                    style={
                        styles.nexBadge
                    }
                >
                    <Text
                        style={
                            styles.nexBadgeText
                        }
                    >
                        NEX
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View
            style={
                styles.container
            }
        >
            <FlatList
                ref={flatListRef}
                data={ADS}
                horizontal
                pagingEnabled={false}
                showsHorizontalScrollIndicator={
                    false
                }
                snapToInterval={
                    CARD_WIDTH + 12
                }
                decelerationRate="fast"
                contentContainerStyle={
                    styles.listContent
                }
                keyExtractor={item =>
                    item.id
                }
                renderItem={
                    renderItem
                }
                onScroll={
                    handleScroll
                }
                scrollEventThrottle={
                    16
                }
                getItemLayout={(
                    _data,
                    index,
                ) => ({
                    length:
                        CARD_WIDTH + 12,
                    offset:
                        (CARD_WIDTH +
                            12) *
                        index,
                    index,
                })}
            />

            {/* Pagination dots */}
            <View
                style={
                    styles.pagination
                }
            >
                {ADS.map(
                    (ad, index) => (
                        <View
                            key={ad.id}
                            style={[
                                styles.dot,
                                index ===
                                    activeIndex &&
                                    styles.activeDot,
                            ]}
                        />
                    ),
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 14,
        marginBottom: 8,
    },

    listContent: {
        paddingHorizontal: 16,
        paddingRight: 16,
    },

    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginRight: 12,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#222',
    },

    image: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor:
            'rgba(0,0,0,0.42)',
    },

    content: {
        flex: 1,
        paddingHorizontal: 18,
        paddingVertical: 16,
        justifyContent: 'center',
        width: '78%',
    },

    eyebrow: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.2,
        color: '#BFF5E8',
        marginBottom: 5,
    },

    title: {
        fontSize: 19,
        lineHeight: 24,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    subtitle: {
        marginTop: 5,
        fontSize: 11,
        lineHeight: 16,
        color: '#F2F2F2',
    },

    button: {
        alignSelf: 'flex-start',
        marginTop: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
    },

    buttonText: {
        fontSize: 11,
        fontWeight: '800',
        color: PRIMARY,
    },

    arrow: {
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '800',
        color: PRIMARY,
    },

    nexBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 38,
        height: 28,
        borderRadius: 14,
        backgroundColor:
            'rgba(255,255,255,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    nexBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: PRIMARY,
        letterSpacing: 0.8,
    },

    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 9,
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D0D0D0',
        marginHorizontal: 3,
    },

    activeDot: {
        width: 18,
        backgroundColor: PRIMARY,
    },
});

