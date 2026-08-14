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
} from 'react-native';

import {
    useNavigation,
} from '@react-navigation/native';

import {
    COLORS,
    FONT_SIZES,
    SPACING,
    RADIUS,
} from '../../../constants/constants';


// ============================================================
// TYPES
// ============================================================

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


// ============================================================
// SAMPLE OFFERS
// ============================================================
// Replace this later with your GraphQL GET_OFFERS query.
// ============================================================

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


// ============================================================
// CATEGORIES
// ============================================================

const CATEGORIES = [
    'All',
    'Hair',
    'Skin',
    'Nails',
    'Spa',
    'Makeup',
];


// ============================================================
// OFFERS SCREEN
// ============================================================

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


    // ========================================================
    // FILTER OFFERS
    // ========================================================

    const filteredOffers =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return OFFERS.filter(
                offer => {

                    const matchesCategory =
                        selectedCategory === 'All' ||
                        offer.category === selectedCategory;


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
                            .includes(query) ||
                        offer.discount
                            .toLowerCase()
                            .includes(query) ||
                        offer.code
                            ?.toLowerCase()
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


    // ========================================================
    // OFFER CLICK
    // ========================================================

    const handleOfferPress =
        (offer: Offer) => {

            navigation.navigate(
                'OfferDetails',
                {
                    offerId: offer.id,
                    offer,
                },
            );

        };


    // ========================================================
    // FEATURED OFFERS
    // ========================================================

    const featuredOffers =
        filteredOffers.filter(
            offer => offer.featured,
        );


    // ========================================================
    // OTHER OFFERS
    // ========================================================

    const otherOffers =
        filteredOffers.filter(
            offer => !offer.featured,
        );


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <SafeAreaView
            style={styles.safeArea}
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor={
                    COLORS.background
                }
            />


            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.scrollContent
                }
                keyboardShouldPersistTaps="handled"
            >

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <View
                    style={styles.header}
                >

                    <View
                        style={styles.headerTextContainer}
                    >

                        <Text
                            style={styles.headerTitle}
                        >
                            Offers
                        </Text>


                        <Text
                            style={styles.headerSubtitle}
                        >
                            Exclusive beauty deals near you
                        </Text>

                    </View>


                    <View
                        style={styles.offerIcon}
                    >

                        <Text
                            style={styles.offerIconText}
                        >
                            %
                        </Text>

                    </View>

                </View>


                {/* ================================================= */}
                {/* SEARCH */}
                {/* ================================================= */}

                <View
                    style={styles.searchContainer}
                >

                    <Text
                        style={styles.searchIcon}
                    >
                        ⌕
                    </Text>


                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search offers"
                        placeholderTextColor={
                            COLORS.textMuted
                        }
                        style={styles.searchInput}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />

                    {search.length > 0 && (

                        <TouchableOpacity
                            onPress={() =>
                                setSearch('')
                            }
                            activeOpacity={0.7}
                            style={
                                styles.clearButton
                            }
                        >

                            <Text
                                style={
                                    styles.clearText
                                }
                            >
                                ×
                            </Text>

                        </TouchableOpacity>

                    )}

                </View>


                {/* ================================================= */}
                {/* CATEGORIES */}
                {/* ================================================= */}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
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
                                    key={category}
                                    activeOpacity={0.8}
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
                {/* POPULAR */}
                {/* ================================================= */}

                {featuredOffers.length > 0 && (

                    <>

                        <SectionHeader
                            title="Popular near you"
                            action="View all"
                            onPress={() => {
                                setSelectedCategory('All');
                            }}
                        />


                        {featuredOffers.map(
                            offer => (

                                <OfferCard
                                    key={offer.id}
                                    offer={offer}
                                    onPress={() =>
                                        handleOfferPress(
                                            offer,
                                        )
                                    }
                                />

                            ),
                        )}

                    </>

                )}


                {/* ================================================= */}
                {/* FOR YOU */}
                {/* ================================================= */}

                {otherOffers.length > 0 && (

                    <>

                        <SectionHeader
                            title="For you"
                            action=""
                            onPress={() => { }}
                        />


                        {otherOffers.map(
                            offer => (

                                <OfferCard
                                    key={offer.id}
                                    offer={offer}
                                    onPress={() =>
                                        handleOfferPress(
                                            offer,
                                        )
                                    }
                                />

                            ),
                        )}

                    </>

                )}


                {/* ================================================= */}
                {/* EMPTY */}
                {/* ================================================= */}

                {filteredOffers.length === 0 && (

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


                        {(search.length > 0 ||
                            selectedCategory !== 'All') && (

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        setSearch('');
                                        setSelectedCategory(
                                            'All',
                                        );
                                    }}
                                    style={
                                        styles.resetButton
                                    }
                                >

                                    <Text
                                        style={
                                            styles.resetButtonText
                                        }
                                    >
                                        Clear filters
                                    </Text>

                                </TouchableOpacity>

                            )}

                    </View>

                )}


                {/* ================================================= */}
                {/* FOOTER */}
                {/* ================================================= */}

                <Text
                    style={styles.footer}
                >
                    New offers are added regularly.
                    Check back soon for more savings.
                </Text>


            </ScrollView>

        </SafeAreaView>

    );
}


// ============================================================
// SECTION HEADER
// ============================================================

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
                        activeOpacity={0.7}
                        onPress={onPress}
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


// ============================================================
// OFFER CARD
// ============================================================

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
                activeOpacity={0.92}
                onPress={onPress}
                style={
                    styles.offerCard
                }
            >

                {/* ================================================= */}
                {/* DISCOUNT BADGE */}
                {/* ================================================= */}

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


                {/* ================================================= */}
                {/* CONTENT */}
                {/* ================================================= */}

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
                            numberOfLines={1}
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
                        numberOfLines={2}
                    >
                        {offer.description}
                    </Text>


                    {/* ================================================= */}
                    {/* CODE */}
                    {/* ================================================= */}

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


                    {/* ================================================= */}
                    {/* BOTTOM */}
                    {/* ================================================= */}

                    <View
                        style={
                            styles.offerBottom
                        }
                    >

                        {offer.minimum ? (

                            <Text
                                style={
                                    styles.minimum
                                }
                                numberOfLines={1}
                            >
                                {offer.minimum}
                            </Text>

                        ) : (

                            <View />

                        )}


                        {offer.expires ? (

                            <Text
                                style={
                                    styles.expires
                                }
                                numberOfLines={1}
                            >
                                {offer.expires}
                            </Text>

                        ) : null}

                    </View>

                </View>


                {/* ================================================= */}
                {/* ARROW */}
                {/* ================================================= */}

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


// ============================================================
// STYLES
// ============================================================

const styles =
    StyleSheet.create({

        // ========================================================
        // SCREEN
        // ========================================================

        safeArea: {
            flex: 1,
            backgroundColor:
                COLORS.background,
        },

        scrollContent: {
            paddingHorizontal:
                SPACING.xl,

            paddingTop:
                SPACING.large,

            paddingBottom:
                SPACING.huge,
        },


        // ========================================================
        // HEADER
        // ========================================================

        header: {
            flexDirection: 'row',

            alignItems: 'center',

            justifyContent:
                'space-between',

            marginBottom:
                SPACING.xl,
        },

        headerTextContainer: {
            flex: 1,
            minWidth: 0,
        },

        headerTitle: {
            fontSize:
                FONT_SIZES.heading,

            fontWeight: '800',

            color:
                COLORS.text,

            letterSpacing: -0.5,
        },

        headerSubtitle: {
            marginTop:
                SPACING.xs,

            fontSize:
                FONT_SIZES.small,

            color:
                COLORS.textSecondary,
        },

        offerIcon: {
            width: 46,

            height: 46,

            borderRadius: 23,

            backgroundColor:
                COLORS.badgeColor,

            alignItems: 'center',

            justifyContent: 'center',

            marginLeft:
                SPACING.medium,
        },

        offerIconText: {
            fontSize: 21,

            fontWeight: '800',

            color:
                COLORS.primary,
        },


        // ========================================================
        // SEARCH
        // ========================================================

        searchContainer: {
            height: 50,

            backgroundColor:
                COLORS.surface,

            borderRadius:
                RADIUS.medium,

            borderWidth: 1,

            borderColor:
                COLORS.border,

            flexDirection: 'row',

            alignItems: 'center',

            paddingHorizontal:
                SPACING.medium,

            marginBottom:
                SPACING.medium,
        },

        searchIcon: {
            fontSize: 23,

            color:
                COLORS.textMuted,

            marginRight:
                SPACING.small,
        },

        searchInput: {
            flex: 1,

            height: '100%',

            fontSize:
                FONT_SIZES.small,

            color:
                COLORS.text,

            paddingVertical: 0,
        },

        clearButton: {
            width: 28,

            height: 28,

            alignItems: 'center',

            justifyContent: 'center',
        },

        clearText: {
            fontSize: 23,

            lineHeight: 25,

            color:
                COLORS.textMuted,

            fontWeight: '400',
        },


        // ========================================================
        // CATEGORIES
        // ========================================================

        categories: {
            paddingBottom:
                SPACING.small,

            gap:
                SPACING.small,
        },

        categoryChip: {
            paddingHorizontal: 16,

            height: 36,

            borderRadius:
                RADIUS.round,

            backgroundColor:
                COLORS.surface,

            borderWidth: 1,

            borderColor:
                COLORS.border,

            alignItems: 'center',

            justifyContent: 'center',
        },

        categoryChipSelected: {
            backgroundColor:
                COLORS.primary,

            borderColor:
                COLORS.primary,
        },

        categoryText: {
            fontSize:
                FONT_SIZES.xs,

            fontWeight: '600',

            color:
                COLORS.textSecondary,
        },

        categoryTextSelected: {
            color:
                COLORS.white,
        },


        // ========================================================
        // SECTION
        // ========================================================

        sectionHeader: {
            flexDirection: 'row',

            alignItems: 'center',

            justifyContent:
                'space-between',

            marginTop:
                SPACING.xl,

            marginBottom:
                SPACING.medium,
        },

        sectionTitle: {
            fontSize:
                FONT_SIZES.title,

            fontWeight: '700',

            color:
                COLORS.text,
        },

        sectionAction: {
            fontSize:
                FONT_SIZES.xs,

            fontWeight: '600',

            color:
                COLORS.primary,
        },


        // ========================================================
        // OFFER CARD
        // ========================================================

        offerCard: {
            backgroundColor:
                COLORS.surface,

            borderRadius:
                RADIUS.large,

            padding:
                SPACING.medium,

            marginBottom:
                SPACING.medium,

            flexDirection: 'row',

            alignItems: 'center',

            borderWidth: 1,

            borderColor:
                COLORS.border,

            shadowColor: '#000',

            shadowOffset: {
                width: 0,
                height: 2,
            },

            shadowOpacity: 0.04,

            shadowRadius: 7,

            elevation: 2,
        },


        // ========================================================
        // DISCOUNT BADGE
        // ========================================================

        offerBadgeContainer: {
            width: 72,

            height: 72,

            borderRadius:
                RADIUS.medium,

            backgroundColor:
                COLORS.badgeColor,

            alignItems: 'center',

            justifyContent: 'center',

            marginRight:
                SPACING.medium,
        },

        offerBadgeText: {
            fontSize: 15,

            fontWeight: '900',

            color:
                COLORS.primary,

            textAlign: 'center',
        },

        offerBadgeSmall: {
            fontSize: 8,

            fontWeight: '800',

            letterSpacing: 1,

            color:
                COLORS.textSecondary,

            marginTop: 3,
        },


        // ========================================================
        // OFFER CONTENT
        // ========================================================

        offerContent: {
            flex: 1,

            minWidth: 0,
        },

        offerTopRow: {
            flexDirection: 'row',

            alignItems: 'center',

            justifyContent:
                'space-between',

            gap:
                SPACING.small,
        },

        offerTitle: {
            flex: 1,

            fontSize:
                FONT_SIZES.small,

            fontWeight: '700',

            color:
                COLORS.text,
        },

        categoryBadge: {
            paddingHorizontal: 7,

            paddingVertical: 3,

            borderRadius:
                RADIUS.small,

            backgroundColor:
                COLORS.badgeColor,
        },

        categoryBadgeText: {
            fontSize: 9,

            fontWeight: '700',

            color:
                COLORS.primary,
        },

        offerDescription: {
            fontSize:
                FONT_SIZES.xs,

            lineHeight: 17,

            color:
                COLORS.textSecondary,

            marginTop:
                SPACING.xs,

            marginBottom: 7,
        },


        // ========================================================
        // CODE
        // ========================================================

        codeRow: {
            flexDirection: 'row',

            alignItems: 'center',

            marginBottom: 7,
        },

        codeLabel: {
            fontSize: 10,

            color:
                COLORS.textMuted,

            marginRight: 6,
        },

        codeBadge: {
            paddingHorizontal: 7,

            paddingVertical: 3,

            borderRadius: 5,

            borderWidth: 1,

            borderStyle: 'dashed',

            borderColor:
                COLORS.borderStrong,

            backgroundColor:
                COLORS.background,
        },

        codeText: {
            fontSize: 10,

            fontWeight: '800',

            color:
                COLORS.primary,

            letterSpacing: 0.4,
        },


        // ========================================================
        // OFFER BOTTOM
        // ========================================================

        offerBottom: {
            flexDirection: 'row',

            alignItems: 'center',

            justifyContent:
                'space-between',

            gap: SPACING.small,
        },

        minimum: {
            flex: 1,

            fontSize: 10,

            color:
                COLORS.textMuted,
        },

        expires: {
            fontSize: 10,

            color:
                COLORS.textSecondary,

            fontWeight: '600',

            maxWidth: '45%',
        },


        // ========================================================
        // ARROW
        // ========================================================

        arrowContainer: {
            width: 25,

            alignItems: 'flex-end',

            justifyContent: 'center',

            marginLeft:
                SPACING.xs,
        },

        arrow: {
            fontSize: 25,

            fontWeight: '300',

            color:
                COLORS.textMuted,
        },


        // ========================================================
        // EMPTY
        // ========================================================

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
                COLORS.badgeColor,

            alignItems: 'center',

            justifyContent: 'center',

            marginBottom:
                SPACING.medium,
        },

        emptyIconText: {
            fontSize: 25,

            fontWeight: '800',

            color:
                COLORS.primary,
        },

        emptyTitle: {
            fontSize:
                FONT_SIZES.medium,

            fontWeight: '700',

            color:
                COLORS.text,
        },

        emptyText: {
            marginTop:
                SPACING.xs,

            fontSize:
                FONT_SIZES.xs,

            color:
                COLORS.textSecondary,

            textAlign: 'center',

            maxWidth: 280,
        },

        resetButton: {
            marginTop:
                SPACING.large,

            paddingHorizontal:
                SPACING.xl,

            paddingVertical:
                SPACING.small,

            borderRadius:
                RADIUS.round,

            backgroundColor:
                COLORS.primary,
        },

        resetButtonText: {
            color:
                COLORS.white,

            fontSize:
                FONT_SIZES.xs,

            fontWeight: '700',
        },


        // ========================================================
        // FOOTER
        // ========================================================

        footer: {
            marginTop:
                SPACING.xl,

            textAlign: 'center',

            fontSize:
                FONT_SIZES.xs,

            lineHeight: 18,

            color:
                COLORS.textMuted,

            paddingHorizontal:
                SPACING.xl,
        },

    });