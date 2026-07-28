import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { useUser } from '../../../context/UserContext';
import { CREATE_SERVICE, UPDATE_SERVICE } from '../../../graphql/queries';
import ServiceCategory from './ServiceCategory';
import styles from './styles';

type Service = {
    serviceId?: string;
    salonId?: string;

    name: string;
    category: string;
    description?: string;

    duration: number;
    price: number;

    gender: 'MEN' | 'WOMEN' | 'UNISEX';

    active: boolean;
    popular: boolean;

    createdAt?: string;
    updatedAt?: string;
};

type Props = {
    visible: boolean;
    categories: string[];
    onClose: () => void;
    onSave?: (service: Service) => void;
    initialData?: Service | null;
};

export default function AddServiceModal({
    visible,
    categories,
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
    const [category, setCategory] = useState(
        categories[0] || 'Hair',
    );

    const [description, setDescription] =
        useState('');

    const [duration, setDuration] = useState('');

    const [price, setPrice] = useState('');

    const [gender, setGender] =
        useState<'MEN' | 'WOMEN' | 'UNISEX'>(
            'UNISEX',
        );

    const [popular, setPopular] =
        useState(false);

    const [active, setActive] =
        useState(true);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCategory(initialData.category);

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
        } else {
            setName('');

            setCategory(
                categories[0] || 'Hair',
            );

            setDescription('');

            setDuration('');

            setPrice('');

            setGender('UNISEX');

            setPopular(false);

            setActive(true);
        }
    }, [initialData, visible, categories]);

    const handleSave = async () => {
        if (!currentUser?.salonId) {
            Alert.alert(
                'Error',
                'Salon not found',
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

        if (Number(duration) <= 0) {
            Alert.alert(
                'Validation',
                'Duration must be greater than 0',
            );
            return;
        }

        if (Number(price) <= 0) {
            Alert.alert(
                'Validation',
                'Price must be greater than 0',
            );
            return;
        }

        const service: Service = {
            salonId: currentUser.salonId,

            name: name.trim(),

            category,

            description: description.trim(),

            duration: Number(duration),

            price: Number(price),

            gender,

            popular,

            active,
        };

        try {
            const input = {
                salonId: currentUser.salonId,
                name: name.trim(),
                category,
                description: description.trim(),
                duration: Number(duration),
                price: Number(price),
                gender,
                popular,
                active,
            };

            if (initialData) {
                const { data } = await updateService({
                    variables: {
                        input: {
                            serviceId: initialData.serviceId,
                            ...input,
                        },
                    },
                });

                if (data?.updateService?.success) {
                    Alert.alert(
                        'Success',
                        'Service updated successfully',
                    );

                    await onSave?.(data.updateService.service);
                    onClose();
                } else {
                    Alert.alert(
                        'Error',
                        data?.updateService?.message ??
                        'Unable to update service',
                    );
                }
            } else {
                const { data } = await createService({
                    variables: {
                        input,
                    },
                });

                if (data?.createService?.success) {
                    Alert.alert(
                        'Success',
                        'Service added successfully',
                    );

                    await onSave?.(data.createService.service);
                    onClose();
                } else {
                    Alert.alert(
                        'Error',
                        data?.createService?.message ??
                        'Unable to save service',
                    );
                }
            }
        } catch (error) {
            console.log(error);

            Alert.alert(
                'Error',
                'Something went wrong',
            );
        }

        // try {
        //     const { data } =
        //         await createService({
        //             variables: {
        //                 input: service,
        //             },
        //         });

        //     if (
        //         data?.createService?.success
        //     ) {
        //         Alert.alert(
        //             'Success',
        //             initialData
        //                 ? 'Service updated successfully'
        //                 : 'Service added successfully',
        //         );

        //         onSave?.(
        //             data.createService
        //                 .service,
        //         );

        //         onClose();
        //     } else {
        //         Alert.alert(
        //             'Error',
        //             data?.createService
        //                 ?.message ??
        //             'Unable to save service',
        //         );
        //     }
        // } catch (error) {
        //     console.log(error);

        //     Alert.alert(
        //         'Error',
        //         'Something went wrong',
        //     );
        // }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                        {initialData
                            ? 'Edit Service'
                            : 'Add Service'}
                    </Text>

                    <TextInput
                        placeholder="Service Name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />

                    <ServiceCategory
                        value={category}
                        categories={categories}
                        onChange={setCategory}
                    />

                    <TextInput
                        placeholder="Description (Optional)"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        style={[
                            styles.input,
                            {
                                height: 80,
                                textAlignVertical: 'top',
                            },
                        ]}
                    />

                    <Text style={styles.modalLabel}>
                        Gender
                    </Text>

                    <View style={styles.genderRow}>
                        {(['MEN', 'WOMEN', 'UNISEX'] as const).map(item => (
                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.genderButton,
                                    gender === item && styles.genderButtonSelected,
                                ]}
                                onPress={() => setGender(item)}>
                                <Text
                                    style={[
                                        styles.genderButtonText,
                                        gender === item &&
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
                        onChangeText={setDuration}
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Price"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        style={styles.input}
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
                            value={popular}
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
                            value={active}
                            onValueChange={
                                setActive
                            }
                        />
                    </View>
                    <View
                        style={
                            styles.modalButtonRow
                        }>
                        <TouchableOpacity
                            style={
                                styles.cancelButton
                            }
                            onPress={onClose}>
                            <Text style={styles.cancelButtonText}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                styles.saveButton
                            }
                            disabled={loading}
                            onPress={handleSave}>
                            <Text
                                style={
                                    styles.modalButtonText
                                }>
                                {loading
                                    ? 'Saving...'
                                    : initialData
                                        ? 'Update'
                                        : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}