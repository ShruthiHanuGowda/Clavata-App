import React, { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { useUser } from '../../../context/UserContext';
import {
    CREATE_SERVICE,
    UPDATE_SERVICE,
} from '../../../graphql/queries';
import styles from './styles';

type Gender = 'MEN' | 'WOMEN' | 'UNISEX';

export type ServiceSelection = {
    categoryId: string;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
};

export type Service = {
    serviceId: string;
    salonId: string;

    name: string;

    categoryId: string;
    categoryName: string;

    subcategoryId: string;
    subcategoryName: string;

    description?: string;

    duration: number;
    price: number;

    gender: Gender;

    active: boolean;
    popular: boolean;

    createdAt: string;
    updatedAt: string;
    updatedBy: string;
};

type Props = {
    visible: boolean;

    serviceSelections: ServiceSelection[];

    onClose: () => void;

    onSave?: (service: Service) => void;

    initialData?: Service | null;
};

export default function AddServiceModal({
    visible,
    serviceSelections,
    onClose,
    onSave,
    initialData,
}: Props) {
    const { currentUser } = useUser();

    const [createService, { loading: creating }] =
        useMutation(CREATE_SERVICE);

    const [updateService, { loading: updating }] =
        useMutation(UPDATE_SERVICE);

    const loading = creating || updating;

    const [name, setName] = useState('');

    const [selectedCategoryId, setSelectedCategoryId] =
        useState('');

    const [selectedSubcategoryId, setSelectedSubcategoryId] =
        useState('');

    const [description, setDescription] =
        useState('');

    const [duration, setDuration] =
        useState('');

    const [price, setPrice] =
        useState('');

    const [gender, setGender] =
        useState<Gender>('UNISEX');

    const [popular, setPopular] =
        useState(false);

    const [active, setActive] =
        useState(true);

    /*
     * Group registration selections by category.
     */
    const groupedCategories = useMemo(() => {
        const map = new Map<
            string,
            {
                categoryId: string;
                categoryName: string;
                subcategories: ServiceSelection[];
            }
        >();

        serviceSelections.forEach(selection => {
            if (!selection.categoryId || !selection.subcategoryId) {
                return;
            }

            if (!map.has(selection.categoryId)) {
                map.set(selection.categoryId, {
                    categoryId: selection.categoryId,
                    categoryName:
                        selection.categoryName || 'Unknown Category',
                    subcategories: [],
                });
            }

            const category = map.get(selection.categoryId);

            if (
                category &&
                !category.subcategories.some(
                    item =>
                        item.subcategoryId ===
                        selection.subcategoryId,
                )
            ) {
                category.subcategories.push(selection);
            }
        });

        return Array.from(map.values());
    }, [serviceSelections]);

    /*
     * Current selected category.
     */
    const selectedCategory = useMemo(() => {
        return groupedCategories.find(
            category =>
                category.categoryId ===
                selectedCategoryId,
        );
    }, [
        groupedCategories,
        selectedCategoryId,
    ]);

    /*
     * Subcategories available under selected category.
     */
    const availableSubcategories =
        selectedCategory?.subcategories ?? [];

    /*
     * Current selected registration pair.
     */
    const selectedSelection = useMemo(() => {
        return serviceSelections.find(
            selection =>
                selection.categoryId ===
                    selectedCategoryId &&
                selection.subcategoryId ===
                    selectedSubcategoryId,
        );
    }, [
        serviceSelections,
        selectedCategoryId,
        selectedSubcategoryId,
    ]);

    /*
     * Reset / populate form.
     */
    useEffect(() => {
        if (!visible) {
            return;
        }

        if (initialData) {
            setName(initialData.name);

            setSelectedCategoryId(
                initialData.categoryId,
            );

            setSelectedSubcategoryId(
                initialData.subcategoryId,
            );

            setDescription(
                initialData.description ?? '',
            );

            setDuration(
                String(initialData.duration),
            );

            setPrice(
                String(initialData.price),
            );

            setGender(initialData.gender);

            setPopular(initialData.popular);

            setActive(initialData.active);

            return;
        }

        setName('');

        const firstCategory =
            groupedCategories[0];

        setSelectedCategoryId(
            firstCategory?.categoryId ?? '',
        );

        setSelectedSubcategoryId(
            firstCategory?.subcategories?.[0]
                ?.subcategoryId ?? '',
        );

        setDescription('');

        setDuration('');

        setPrice('');

        setGender('UNISEX');

        setPopular(false);

        setActive(true);
    }, [
        initialData,
        visible,
        groupedCategories,
    ]);

    /*
     * When category changes, automatically select
     * the first available subcategory.
     */
    useEffect(() => {
        if (!selectedCategoryId) {
            setSelectedSubcategoryId('');
            return;
        }

        const category =
            groupedCategories.find(
                item =>
                    item.categoryId ===
                    selectedCategoryId,
            );

        if (!category) {
            setSelectedSubcategoryId('');
            return;
        }

        const exists =
            category.subcategories.some(
                item =>
                    item.subcategoryId ===
                    selectedSubcategoryId,
            );

        if (!exists) {
            setSelectedSubcategoryId(
                category.subcategories[0]
                    ?.subcategoryId ?? '',
            );
        }
    }, [
        selectedCategoryId,
        groupedCategories,
    ]);

    const handleCategoryChange = (
        categoryId: string,
    ) => {
        setSelectedCategoryId(categoryId);

        const category =
            groupedCategories.find(
                item =>
                    item.categoryId ===
                    categoryId,
            );

        setSelectedSubcategoryId(
            category?.subcategories?.[0]
                ?.subcategoryId ?? '',
        );
    };

    const handleSave = async () => {
        if (!currentUser?.salonId) {
            Alert.alert(
                'Error',
                'Salon not found',
            );
            return;
        }

        if (!serviceSelections.length) {
            Alert.alert(
                'No Services Available',
                'No service categories or subcategories were selected during salon registration.',
            );
            return;
        }

        if (!selectedCategoryId) {
            Alert.alert(
                'Validation',
                'Please select a service category.',
            );
            return;
        }

        if (!selectedSubcategoryId) {
            Alert.alert(
                'Validation',
                'Please select a service subcategory.',
            );
            return;
        }

        /*
         * Extra protection:
         * Make sure the selected pair actually belongs
         * to the salon's registration selections.
         */
        const validSelection =
            serviceSelections.some(
                selection =>
                    selection.categoryId ===
                        selectedCategoryId &&
                    selection.subcategoryId ===
                        selectedSubcategoryId,
            );

        if (!validSelection) {
            Alert.alert(
                'Invalid Service',
                'This category and subcategory were not selected during salon registration.',
            );
            return;
        }

        if (!name.trim()) {
            Alert.alert(
                'Validation',
                'Please enter service name',
            );
            return;
        }

        if (!duration.trim()) {
            Alert.alert(
                'Validation',
                'Please enter duration',
            );
            return;
        }

        if (!price.trim()) {
            Alert.alert(
                'Validation',
                'Please enter price',
            );
            return;
        }

        const durationNumber =
            Number(duration);

        const priceNumber =
            Number(price);

        if (
            !Number.isFinite(durationNumber) ||
            durationNumber <= 0
        ) {
            Alert.alert(
                'Validation',
                'Duration must be greater than 0',
            );
            return;
        }

        if (
            !Number.isFinite(priceNumber) ||
            priceNumber <= 0
        ) {
            Alert.alert(
                'Validation',
                'Price must be greater than 0',
            );
            return;
        }

        if (!selectedSelection) {
            Alert.alert(
                'Error',
                'Selected service category/subcategory could not be found.',
            );
            return;
        }

        const input = {
            salonId: currentUser.salonId,

            name: name.trim(),

            categoryId:
                selectedSelection.categoryId,

            subcategoryId:
                selectedSelection.subcategoryId,

            description:
                description.trim(),

            duration: durationNumber,

            price: priceNumber,

            gender,

            popular,

            active,
        };

        try {
            if (initialData?.serviceId) {
                const { data } =
                    await updateService({
                        variables: {
                            input: {
                                serviceId:
                                    initialData.serviceId,

                                ...input,
                            },
                        },
                    });

                if (
                    data?.updateService?.success
                ) {
                    Alert.alert(
                        'Success',
                        'Service updated successfully',
                    );

                    await onSave?.(
                        data.updateService.service,
                    );

                    onClose();
                } else {
                    Alert.alert(
                        'Error',
                        data?.updateService
                            ?.message ??
                            'Unable to update service',
                    );
                }

                return;
            }

            const { data } =
                await createService({
                    variables: {
                        input,
                    },
                });

            if (
                data?.createService?.success
            ) {
                Alert.alert(
                    'Success',
                    'Service submitted successfully. It will be available after admin approval.',
                );

                await onSave?.(
                    data.createService.service,
                );

                onClose();
            } else {
                Alert.alert(
                    'Error',
                    data?.createService?.message ??
                        'Unable to save service',
                );
            }
        } catch (error) {
            console.log(
                'SERVICE SAVE ERROR:',
                error,
            );

            Alert.alert(
                'Error',
                'Something went wrong while saving the service.',
            );
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalTitle}>
                            {initialData
                                ? 'Edit Service'
                                : 'Add Service'}
                        </Text>

                        {!serviceSelections.length ? (
                            <View
                                style={{
                                    paddingVertical: 20,
                                }}>
                                <Text
                                    style={{
                                        color: '#DC2626',
                                        fontSize: 14,
                                        lineHeight: 20,
                                    }}>
                                    No service categories or
                                    subcategories were selected
                                    during registration.
                                </Text>
                            </View>
                        ) : (
                            <>
                                <TextInput
                                    placeholder="Service Name"
                                    value={name}
                                    onChangeText={setName}
                                    style={styles.input}
                                    placeholderTextColor="#9CA3AF"
                                />

                                <Text
                                    style={
                                        styles.modalLabel
                                    }>
                                    Service Category
                                </Text>

                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={
                                        false
                                    }
                                    style={{
                                        marginBottom: 12,
                                    }}>
                                    {groupedCategories.map(
                                        category => {
                                            const selected =
                                                category.categoryId ===
                                                selectedCategoryId;

                                            return (
                                                <TouchableOpacity
                                                    key={
                                                        category.categoryId
                                                    }
                                                    onPress={() =>
                                                        handleCategoryChange(
                                                            category.categoryId,
                                                        )
                                                    }
                                                    style={{
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 10,
                                                        borderRadius: 20,
                                                        marginRight: 8,
                                                        backgroundColor:
                                                            selected
                                                                ? '#009D94'
                                                                : '#F3F4F6',
                                                    }}>
                                                    <Text
                                                        style={{
                                                            color:
                                                                selected
                                                                    ? '#FFFFFF'
                                                                    : '#374151',
                                                            fontWeight:
                                                                '600',
                                                        }}>
                                                        {
                                                            category.categoryName
                                                        }
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        },
                                    )}
                                </ScrollView>

                                <Text
                                    style={
                                        styles.modalLabel
                                    }>
                                    Service Subcategory
                                </Text>

                                <View
                                    style={{
                                        flexDirection:
                                            'row',
                                        flexWrap:
                                            'wrap',
                                        marginBottom: 12,
                                    }}>
                                    {availableSubcategories.map(
                                        subcategory => {
                                            const selected =
                                                subcategory.subcategoryId ===
                                                selectedSubcategoryId;

                                            return (
                                                <TouchableOpacity
                                                    key={
                                                        subcategory.subcategoryId
                                                    }
                                                    onPress={() =>
                                                        setSelectedSubcategoryId(
                                                            subcategory.subcategoryId,
                                                        )
                                                    }
                                                    style={{
                                                        paddingHorizontal: 14,
                                                        paddingVertical: 9,
                                                        borderRadius: 18,
                                                        marginRight: 8,
                                                        marginBottom: 8,
                                                        borderWidth: 1,
                                                        borderColor:
                                                            selected
                                                                ? '#009D94'
                                                                : '#D1D5DB',
                                                        backgroundColor:
                                                            selected
                                                                ? '#E6F7F5'
                                                                : '#FFFFFF',
                                                    }}>
                                                    <Text
                                                        style={{
                                                            color:
                                                                selected
                                                                    ? '#007F78'
                                                                    : '#374151',
                                                            fontWeight:
                                                                '500',
                                                        }}>
                                                        {
                                                            subcategory.subcategoryName
                                                        }
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        },
                                    )}
                                </View>

                                <TextInput
                                    placeholder="Description (Optional)"
                                    value={description}
                                    onChangeText={
                                        setDescription
                                    }
                                    multiline
                                    numberOfLines={3}
                                    style={[
                                        styles.input,
                                        {
                                            height: 80,
                                            textAlignVertical:
                                                'top',
                                        },
                                    ]}
                                    placeholderTextColor="#9CA3AF"
                                />

                                <Text
                                    style={
                                        styles.modalLabel
                                    }>
                                    Gender
                                </Text>

                                <View
                                    style={
                                        styles.genderRow
                                    }>
                                    {(
                                        [
                                            'MEN',
                                            'WOMEN',
                                            'UNISEX',
                                        ] as const
                                    ).map(item => (
                                        <TouchableOpacity
                                            key={item}
                                            style={[
                                                styles.genderButton,
                                                gender ===
                                                    item &&
                                                    styles.genderButtonSelected,
                                            ]}
                                            onPress={() =>
                                                setGender(
                                                    item,
                                                )
                                            }>
                                            <Text
                                                style={[
                                                    styles.genderButtonText,
                                                    gender ===
                                                        item &&
                                                        styles.genderButtonTextSelected,
                                                ]}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TextInput
                                    placeholder="Duration (minutes)"
                                    value={duration}
                                    onChangeText={
                                        setDuration
                                    }
                                    keyboardType="numeric"
                                    style={styles.input}
                                    placeholderTextColor="#9CA3AF"
                                />

                                <TextInput
                                    placeholder="Price"
                                    value={price}
                                    onChangeText={
                                        setPrice
                                    }
                                    keyboardType="numeric"
                                    style={styles.input}
                                    placeholderTextColor="#9CA3AF"
                                />

                                <View
                                    style={
                                        styles.modalSwitchRow
                                    }>
                                    <Text
                                        style={
                                            styles.modalLabel
                                        }>
                                        Popular
                                    </Text>

                                    <Switch
                                        value={
                                            popular
                                        }
                                        onValueChange={
                                            setPopular
                                        }
                                    />
                                </View>

                                <View
                                    style={
                                        styles.modalSwitchRow
                                    }>
                                    <Text
                                        style={
                                            styles.modalLabel
                                        }>
                                        Active
                                    </Text>

                                    <Switch
                                        value={
                                            active
                                        }
                                        onValueChange={
                                            setActive
                                        }
                                    />
                                </View>
                            </>
                        )}

                        <View
                            style={
                                styles.modalButtonRow
                            }>
                            <TouchableOpacity
                                style={
                                    styles.cancelButton
                                }
                                onPress={onClose}
                                disabled={
                                    loading
                                }>
                                <Text
                                    style={
                                        styles.cancelButtonText
                                    }>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={
                                    styles.saveButton
                                }
                                disabled={
                                    loading ||
                                    !serviceSelections.length
                                }
                                onPress={
                                    handleSave
                                }>
                                {loading ? (
                                    <ActivityIndicator
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.modalButtonText
                                        }>
                                        {initialData
                                            ? 'Update'
                                            : 'Save'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}