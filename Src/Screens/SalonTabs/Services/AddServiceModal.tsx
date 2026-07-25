import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
} from 'react-native';

import ServiceCategory from './ServiceCategory';
import styles from './styles';

const PRIMARY = '#009D94';

type Service = {
    id?: string;
    name: string;
    category: string;
    duration: string;
    price: number;
    active: boolean;
    popular: boolean;
};

type Props = {
    visible: boolean;
    categories: string[];
    onClose: () => void;
    onSave: (service: Service) => void;
    initialData?: Service | null;
};

export default function AddServiceModal({
    visible,
    categories,
    onClose,
    onSave,
    initialData,
}: Props) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Hair');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState('');
    const [popular, setPopular] = useState(false);
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCategory(initialData.category);
            setDuration(initialData.duration);
            setPrice(String(initialData.price));
            setPopular(initialData.popular);
            setActive(initialData.active);
        } else {
            setName('');
            setCategory(categories[1] || 'Hair');
            setDuration('');
            setPrice('');
            setPopular(false);
            setActive(true);
        }
    }, [initialData, visible, categories]);

    const handleSave = () => {
        onSave({
            id: initialData?.id,
            name,
            category,
            duration,
            price: Number(price),
            popular,
            active,
        });

        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <View
                style={styles.modalOverlay}>
                <View
                    style={styles.modalContainer}>
                    <Text
                        style={styles.modalTitle}>
                        {initialData ? 'Edit Service' : 'Add Service'}
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
                        placeholder="Duration (e.g. 45 mins)"
                        value={duration}
                        onChangeText={setDuration}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Price"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                      style={styles.input}
                    />

                    <View style={styles.modalSwitchRow}>
                        <Text style={styles.modalLabel}>Popular</Text>
                        <Switch
                            value={popular}
                            onValueChange={setPopular}
                        />
                    </View>

                    <View style={styles.modalSwitchRow}>
                        <Text style={styles.modalLabel}>Active</Text>
                        <Switch
                            value={active}
                            onValueChange={setActive}
                        />
                    </View>

                    <View
                        style={styles.modalButtonRow}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                            onPress={onClose}>
                            <Text style={styles.modalButtonText}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}>
                            <Text style={styles.modalButtonText}>
                                {initialData ? 'Update' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
