import React, {
    useMemo,
    useState,
} from 'react';

import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Dimensions,
} from 'react-native';

import {
    useNavigation,
} from '@react-navigation/native';


const { width } =
    Dimensions.get('window');


/*
 * ==========================================================
 * CLAVATA COLORS
 * ==========================================================
 */

const PRIMARY = '#5B21F4';
const PRIMARY_LIGHT = '#F3EEFF';

const TEXT = '#111827';
const SECONDARY = '#6B7280';
const MUTED = '#9CA3AF';

const BORDER = '#E5E7EB';
const BACKGROUND = '#F8F9FC';
const WHITE = '#FFFFFF';

const SUCCESS = '#059669';
const SUCCESS_LIGHT = '#ECFDF5';

const ORANGE = '#EA580C';
const ORANGE_LIGHT = '#FFF7ED';


/*
 * ==========================================================
 * TYPES
 * ==========================================================
 */

type Offer = {
    id: string;
    discount: string;
    title: string;
    description: string;
    code?: string;
    minimum?: string;
    category: string;
    expires?: string;
    featured?: boolean;
};


/*
 * ==========================================================
 * SAMPLE OFFERS
 * ==========================================================
 *
 * Replace this later with your GraphQL GET_OFFERS query.
 */

const OFFERS: Offer[] = [

    {
        id: '1',
        discount: '20% OFF',
        title: 'Hair & Beauty',
        description:
            'Save on selected hair and beauty services.',
        code: 'CLAVATA20',
        minimum: 'Min. booking ₹999',
        category: 'Hair',
        expires: 'Ends Sunday',
        featured: true,
    },

    {
        id: '2',
        discount: '₹200 OFF',
        title: 'Your Next Glow',
        description:
            'Get ₹200 off your next beauty booking.',
        code: 'GLOW200',
        minimum: 'Min. booking ₹799',
        category: 'Skin',
        expires: 'Limited time',
        featured: true,
    },

    {
        id: '3',
        discount: '15% OFF',
        title: 'Nail Care',
        description:
            'Special savings on manicure and pedicure.',
        code: 'NAIL15',
        minimum: 'Min. booking ₹599',
        category: 'Nails',
        expires: 'Ends Friday',
    },

    {
        id: '4',
        discount: '₹300 OFF',
        title: 'Relax & Unwind',
        description:
            'Save on selected spa services near you.',
        code: 'RELAX300',
        minimum: 'Min. booking ₹1,299',
        category: 'Spa',
        expires: 'Limited time',
    },

    {
        id: '5',
        discount: '10% OFF',
        title: 'Makeup Services',
        description:
            'Enjoy exclusive savings on makeup services.',
        code: 'MAKEUP10',
        minimum: 'Min. booking ₹999',
        category: 'Makeup',
        expires: 'Ends soon',
    },

];


/*
 * ==========================================================
 * CATEGORIES
 * ==========================================================
 */

const CATEGORIES = [
    'All',
    'Hair',
    'Skin',
    'Nails',
    'Spa',
    'Makeup',
];


/*
 * ==========================================================
 * OFFERS SCREEN
 * ==========================================================
 */

export default function OffersScreen() {

    const navigation =
        useNavigation<any>();


    const [
        search,
        setSearch,
    ] = useState('');


    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState('All');


    /*
     * ========================================================
     * FILTER
     * ========================================================
     */

    const filteredOffers =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return OFFERS.filter(
                offer => {

                    const matchesCategory =
                        selectedCategory ===
                        'All' ||
                        offer.category ===
                        selectedCategory;


                    const matchesSearch =
                        !query ||
                        offer.title
                            .toLowerCase()
                            .includes(query) ||
                        offer.description
                            .toLowerCase()
                            .includes(query) ||
                        offer.category
                            .toLowerCase()
                            .includes(query);


                    return (
                        matchesCategory &&
                        matchesSearch
                    );

                },
            );

        }, [
            search,
            selectedCategory,
        ]);


    /*
     * ========================================================
     * OFFER CLICK
     * ========================================================
     */

    const handleOfferPress =
        (offer: Offer) => {

            /*
             * Later you can navigate to:
             *
             * OfferDetails
             *
             * and pass:
             *
             * offerId
             */

            navigation.navigate(
                'OfferDetails',
                {
                    offerId:
                        offer.id,
                },
            );

        };


    /*
     * ========================================================
     * RENDER
     * ========================================================
     */

    return (

        <SafeAreaView
            style={
                styles.safeArea
            }
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor={
                    BACKGROUND
                }
            />


            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.scrollContent
                }
            >


                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <View
                    style={
                        styles.header
                    }
                >

                    <View>

                        <Text
                            style={
                                styles.headerTitle
                            }
                        >
                            Offers
                        </Text>


                        <Text
                            style={
                                styles.headerSubtitle
                            }
                        >
                            Exclusive beauty deals near you
                        </Text>

                    </View>


                    <View
                        style={
                            styles.offerIcon
                        }
                    >

                        <Text
                            style={
                                styles.offerIconText
                            }
                        >
                            %
                        </Text>

                    </View>

                </View>


                {/* ================================================= */}
                {/* SEARCH */}
                {/* ================================================= */}

                <View
                    style={
                        styles.searchContainer
                    }
                >

                    <Text
                        style={
                            styles.searchIcon
                        }
                    >
                        ⌕
                    </Text>


                    <TextInput
                        value={
                            search
                        }
                        onChangeText={
                            setSearch
                        }
                        placeholder="Search offers"
                        placeholderTextColor={
                            MUTED
                        }
                        style={
                            styles.searchInput
                        }
                        autoCorrect={
                            false
                        }
                    />

                </View>


                {/* ================================================= */}
                {/* CATEGORIES */}
                {/* ================================================= */}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.categories
                    }
                >

                    {CATEGORIES.map(
                        category => {

                            const selected =
                                selectedCategory ===
                                category;


                            return (

                                <TouchableOpacity
                                    key={
                                        category
                                    }
                                    activeOpacity={
                                        0.8
                                    }
                                    onPress={() =>
                                        setSelectedCategory(
                                            category,
                                        )
                                    }
                                    style={[
                                        styles.categoryChip,

                                        selected &&
                                        styles.categoryChipSelected,
                                    ]}
                                >

                                    <Text
                                        style={[
                                            styles.categoryText,

                                            selected &&
                                            styles.categoryTextSelected,
                                        ]}
                                    >
                                        {category}
                                    </Text>

                                </TouchableOpacity>

                            );

                        },
                    )}

                </ScrollView>


                {/* ================================================= */}
                {/* FEATURED */}
                {/* ================================================= */}

                <SectionHeader
                    title="Popular near you"
                    action="View all"
                    onPress={() => { }}
                />


                {filteredOffers
                    .filter(
                        offer =>
                            offer.featured,
                    )
                    .map(
                        offer => (

                            <OfferCard
                                key={
                                    offer.id
                                }
                                offer={
                                    offer
                                }
                                onPress={() =>
                                    handleOfferPress(
                                        offer,
                                    )
                                }
                            />

                        ),
                    )}


                {/* ================================================= */}
                {/* FOR YOU */}
                {/* ================================================= */}

                <SectionHeader
                    title="For you"
                    action=""
                    onPress={() => { }}
                />


                {filteredOffers
                    .filter(
                        offer =>
                            !offer.featured,
                    )
                    .map(
                        offer => (

                            <OfferCard
                                key={
                                    offer.id
                                }
                                offer={
                                    offer
                                }
                                onPress={() =>
                                    handleOfferPress(
                                        offer,
                                    )
                                }
                            />

                        ),
                    )}


                {/* ================================================= */}
                {/* EMPTY */}
                {/* ================================================= */}

                {filteredOffers.length ===
                    0 && (

                        <View
                            style={
                                styles.emptyContainer
                            }
                        >

                            <View
                                style={
                                    styles.emptyIcon
                                }
                            >

                                <Text
                                    style={
                                        styles.emptyIconText
                                    }
                                >
                                    %
                                </Text>

                            </View>


                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No offers found
                            </Text>


                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Try another category or search
                                for a different offer.
                            </Text>

                        </View>

                    )}


                {/* ================================================= */}
                {/* FOOTER */}
                {/* ================================================= */}

                <Text
                    style={
                        styles.footer
                    }
                >
                    New offers are added regularly.
                    Check back soon for more savings.
                </Text>


            </ScrollView>

        </SafeAreaView>

    );
}


/*
 * ==========================================================
 * SECTION HEADER
 * ==========================================================
 */

type SectionHeaderProps = {
    title: string;
    action: string;
    onPress: () => void;
};


const SectionHeader =
    ({
        title,
        action,
        onPress,
    }: SectionHeaderProps) => {

        return (

            <View
                style={
                    styles.sectionHeader
                }
            >

                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    {title}
                </Text>


                {action ? (

                    <TouchableOpacity
                        onPress={
                            onPress
                        }
                    >

                        <Text
                            style={
                                styles.sectionAction
                            }
                        >
                            {action}
                        </Text>

                    </TouchableOpacity>

                ) : null}

            </View>

        );

    };


/*
 * ==========================================================
 * OFFER CARD
 * ==========================================================
 */

type OfferCardProps = {
    offer: Offer;
    onPress: () => void;
};


const OfferCard =
    ({
        offer,
        onPress,
    }: OfferCardProps) => {

        return (

            <TouchableOpacity
                activeOpacity={
                    0.92
                }
                onPress={
                    onPress
                }
                style={
                    styles.offerCard
                }
            >

                {/* LEFT OFFER */}

                <View
                    style={
                        styles.offerBadgeContainer
                    }
                >

                    <Text
                        style={
                            styles.offerBadgeText
                        }
                    >
                        {offer.discount}
                    </Text>


                    <Text
                        style={
                            styles.offerBadgeSmall
                        }
                    >
                        OFFER
                    </Text>

                </View>


                {/* CENTER */}

                <View
                    style={
                        styles.offerContent
                    }
                >

                    <View
                        style={
                            styles.offerTopRow
                        }
                    >

                        <Text
                            style={
                                styles.offerTitle
                            }
                        >
                            {offer.title}
                        </Text>


                        <View
                            style={
                                styles.categoryBadge
                            }
                        >

                            <Text
                                style={
                                    styles.categoryBadgeText
                                }
                            >
                                {offer.category}
                            </Text>

                        </View>

                    </View>


                    <Text
                        style={
                            styles.offerDescription
                        }
                    >
                        {offer.description}
                    </Text>


                    {offer.code ? (

                        <View
                            style={
                                styles.codeRow
                            }
                        >

                            <Text
                                style={
                                    styles.codeLabel
                                }
                            >
                                Use code
                            </Text>


                            <View
                                style={
                                    styles.codeBadge
                                }
                            >

                                <Text
                                    style={
                                        styles.codeText
                                    }
                                >
                                    {offer.code}
                                </Text>

                            </View>

                        </View>

                    ) : null}


                    <View
                        style={
                            styles.offerBottom
                        }
                    >

                        <Text
                            style={
                                styles.minimum
                            }
                        >
                            {offer.minimum}
                        </Text>


                        <Text
                            style={
                                styles.expires
                            }
                        >
                            {offer.expires}
                        </Text>

                    </View>

                </View>


                {/* ARROW */}

                <View
                    style={
                        styles.arrowContainer
                    }
                >

                    <Text
                        style={
                            styles.arrow
                        }
                    >
                        ›
                    </Text>

                </View>

            </TouchableOpacity>

        );

    };


/*
 * ==========================================================
 * STYLES
 * ==========================================================
 */

const styles =
    StyleSheet.create({

        safeArea: {
            flex: 1,

            backgroundColor:
                BACKGROUND,
        },


        scrollContent: {
            paddingHorizontal: 18,

            paddingTop: 18,

            paddingBottom: 40,
        },


        /*
         * HEADER
         */

        header: {
            flexDirection: 'row',

            alignItems: 'center',

            justifyContent:
                'space-between',

            marginBottom: 20,
        },

        headerTitle: {
            fontSize: 28,

            fontWeight: '800',

            color: TEXT,

            letterSpacing: -0.5,
        },

        headerSubtitle: {
            marginTop: 4,

            fontSize: 14,

            color: SECONDARY,
        },


        offerIcon: {
            width: 46,
            height: 46,

            borderRadius: 23,

            backgroundColor:
                PRIMARY_LIGHT,

            alignItems: 'center',

            justifyContent: 'center',
        },

        offerIconText: {
            fontSize: 22,

            fontWeight: '800',

            color: PRIMARY,
        },


        /*
         * SEARCH
         */

        searchContainer: {
            height: 50,

            backgroundColor:
                WHITE,

            borderRadius: 14,

            borderWidth: 1,

            borderColor:
                BORDER,

            flexDirection: 'row',

            alignItems: 'center',

            paddingHorizontal: 14,

            marginBottom: 16,
        },

        searchIcon: {
            fontSize: 24,

            color: MUTED,

            marginRight: 8,
        },

        searchInput: {
            flex: 1,

            height: '100%',

            fontSize: 15,

            color: TEXT,
        },


        /*
         * CATEGORIES
         */

        categories: {
            paddingBottom: 8,

            gap: 8,
        },

        categoryChip: {
            paddingHorizontal: 17,

            height: 38,

            borderRadius: 20,

            backgroundColor:
                WHITE,

            borderWidth: 1,

            borderColor:
                BORDER,

            alignItems: 'center',

            justifyContent: 'center',
        },

        categoryChipSelected: {
            backgroundColor:
                PRIMARY,

            borderColor:
                PRIMARY,
        },

        categoryText: {
            fontSize: 13,

            fontWeight: '600',

            color: SECONDARY,
        },

        categoryTextSelected: {
            color: WHITE,
        },


        /*
         * SECTION
         */

        sectionHeader: {
            flexDirection: 'row',

            alignItems: 'center',

            justifyContent:
                'space-between',

            marginTop: 25,

            marginBottom: 12,
        },

        sectionTitle: {
            fontSize: 18,

            fontWeight: '700',

            color: TEXT,
        },

        sectionAction: {
            fontSize: 13,

            fontWeight: '600',

            color: PRIMARY,
        },


        /*
         * OFFER CARD
         */

        offerCard: {
            backgroundColor:
                WHITE,

            borderRadius: 18,

            padding: 15,

            marginBottom: 12,

            flexDirection: 'row',

            alignItems: 'center',

            borderWidth: 1,

            borderColor:
                '#ECEEF2',

            shadowColor: '#000',

            shadowOffset: {
                width: 0,
                height: 2,
            },

            shadowOpacity: 0.035,

            shadowRadius: 8,

            elevation: 2,
        },


        /*
         * OFFER BADGE
         */

        offerBadgeContainer: {
            width: 76,

            height: 76,

            borderRadius: 16,

            backgroundColor:
                PRIMARY_LIGHT,

            alignItems: 'center',

            justifyContent: 'center',

            marginRight: 13,
        },

        offerBadgeText: {
            fontSize: 16,

            fontWeight: '900',

            color: PRIMARY,

            textAlign: 'center',
        },

        offerBadgeSmall: {
            fontSize: 9,

            fontWeight: '800',

            letterSpacing: 1,

            color: PRIMARY,

            marginTop: 3,
        },


        /*
         * OFFER CONTENT
         */

        offerContent: {
            flex: 1,

            minWidth: 0,
        },

        offerTopRow: {
            flexDirection: 'row',

            alignItems: 'center',

            justifyContent:
                'space-between',

            gap: 6,
        },

        offerTitle: {
            flex: 1,

            fontSize: 15,

            fontWeight: '700',

            color: TEXT,
        },

        categoryBadge: {
            paddingHorizontal: 7,

            paddingVertical: 3,

            borderRadius: 6,

            backgroundColor:
                SUCCESS_LIGHT,
        },

        categoryBadgeText: {
            fontSize: 9,

            fontWeight: '700',

            color: SUCCESS,
        },

        offerDescription: {
            fontSize: 12,

            lineHeight: 17,

            color: SECONDARY,

            marginTop: 4,

            marginBottom: 7,
        },


        /*
         * CODE
         */

        codeRow: {
            flexDirection: 'row',

            alignItems: 'center',

            marginBottom: 7,
        },

        codeLabel: {
            fontSize: 10,

            color: MUTED,

            marginRight: 6,
        },

        codeBadge: {
            paddingHorizontal: 7,

            paddingVertical: 3,

            borderRadius: 5,

            borderWidth: 1,

            borderStyle: 'dashed',

            borderColor:
                '#C4B5FD',

            backgroundColor:
                '#FAF8FF',
        },

        codeText: {
            fontSize: 10,

            fontWeight: '800',

            color: PRIMARY,

            letterSpacing: 0.4,
        },


        /*
         * BOTTOM
         */

        offerBottom: {
            flexDirection: 'row',

            alignItems: 'center',

            justifyContent:
                'space-between',
        },

        minimum: {
            fontSize: 10,

            color: MUTED,
        },

        expires: {
            fontSize: 10,

            color: ORANGE,

            fontWeight: '600',
        },


        /*
         * ARROW
         */

        arrowContainer: {
            width: 25,

            alignItems: 'flex-end',

            justifyContent: 'center',

            marginLeft: 4,
        },

        arrow: {
            fontSize: 26,

            fontWeight: '300',

            color: '#CBD5E1',
        },


        /*
         * EMPTY
         */

        emptyContainer: {
            alignItems: 'center',

            justifyContent: 'center',

            paddingVertical: 60,
        },

        emptyIcon: {
            width: 60,
            height: 60,

            borderRadius: 30,

            backgroundColor:
                PRIMARY_LIGHT,

            alignItems: 'center',

            justifyContent: 'center',

            marginBottom: 15,
        },

        emptyIconText: {
            fontSize: 25,

            fontWeight: '800',

            color: PRIMARY,
        },

        emptyTitle: {
            fontSize: 17,

            fontWeight: '700',

            color: TEXT,
        },

        emptyText: {
            marginTop: 6,

            fontSize: 13,

            color: SECONDARY,

            textAlign: 'center',

            maxWidth: 280,
        },


        /*
         * FOOTER
         */

        footer: {
            marginTop: 28,

            textAlign: 'center',

            fontSize: 12,

            lineHeight: 18,

            color: MUTED,

            paddingHorizontal: 20,
        },

    });