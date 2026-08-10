import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView,
    Image,
} from 'react-native';

// ============================================================
// SERVICE IMAGES
// ============================================================

const services = [
    {
        name: 'Hair',
        image: require('../../../assets/3d/hair.png'),
    },
    {
        name: 'Face',
        image: require('../../../assets/3d/face.png'),
    },
    {
        name: 'Skin',
        image: require('../../../assets/3d/skin.png'),
    },
    {
        name: 'Nails',
        image: require('../../../assets/3d/nails.png'),
    },
    {
        name: 'Makeup',
        image: require('../../../assets/3d/makeup.png'),
    },
    {
        name: 'Beard',
        image: require('../../../assets/3d/beard.png'),
    },
    {
        name: 'Spa',
        image: require('../../../assets/3d/spa.png'),
    },
    {
        name: 'Massage',
        image: require('../../../assets/3d/massage.png'),
    },
    {
        name: 'Waxing',
        image: require('../../../assets/3d/waxing.png'),
    },
    {
        name: 'Threading',
        image: require('../../../assets/3d/threading.png'),
    },
    {
        name: 'Bridal',
        image: require('../../../assets/3d/bridal.png'),
    },
    {
        name: "Men's Grooming",
        image: require('../../../assets/3d/mens_grooming.png'),
    },
];

type Props = {
    onSelect: (category: string) => void;
    selectedCategory?: string;
};

export default function ServiceChips({
    onSelect,
    selectedCategory = '',
}: Props) {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {services.map((item) => {
                    const isSelected =
                        selectedCategory === item.name;

                    return (
                        <TouchableOpacity
                            key={item.name}
                            activeOpacity={0.8}
                            style={[
                                styles.chip,
                                isSelected && styles.selectedChip,
                            ]}
                            onPress={() => {
                                console.log(
                                    'Category chip pressed:',
                                    item.name,
                                );

                                onSelect(item.name);
                            }}
                        >
                            {/* ==================================================
                  REALISTIC TRANSPARENT IMAGE
                 ================================================== */}

                            <View
                                style={[
                                    styles.imageContainer,
                                    isSelected &&
                                    styles.selectedImageContainer,
                                ]}
                            >
                                <Image
                                    source={item.image}
                                    style={styles.serviceImage}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* ==================================================
                  CATEGORY NAME
                 ================================================== */}

                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={[
                                    styles.text,
                                    isSelected &&
                                    styles.selectedText,
                                ]}
                            >
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 18,
    },

    container: {
        paddingHorizontal: 20,
        paddingVertical: 6,
    },

    // ============================================================
    // CARD
    // ============================================================

    chip: {
        width: 80,
        height: 80,

        backgroundColor: '#FFFFFF',

        borderRadius: 18,

        borderWidth: 1,
        borderColor: '#E8E8E8',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 12,

        paddingHorizontal: 7,

        // subtle elevation
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 5,

        elevation: 2,
    },

    // ============================================================
    // SELECTED CARD
    // ============================================================

    selectedChip: {
        borderColor: '#009D94',
        borderWidth: 1.5,

        backgroundColor: '#F0FAF9',

        shadowOpacity: 0.08,
    },

    // ============================================================
    // IMAGE AREA
    // ============================================================

    imageContainer: {
        width: 50,
        height: 50,

        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: 5,
    },

    selectedImageContainer: {
        transform: [
            {
                scale: 1.05,
            },
        ],
    },

    serviceImage: {
        width: 50,
        height: 50,
    },

    // ============================================================
    // TEXT
    // ============================================================

    text: {
        fontSize: 12,
        fontWeight: '600',

        color: '#303030',

        textAlign: 'center',

        maxWidth: 82,
    },

    selectedText: {
        color: '#009D94',
        fontWeight: '700',
    },
});