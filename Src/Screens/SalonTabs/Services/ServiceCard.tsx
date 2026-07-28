import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
} from 'react-native';

import styles from './styles';

type Props = {
    serviceId: string;
    salonId: string;

    name: string;
    category: string;

    description?: string;

    duration: number;

    price: number;

    gender: 'MEN' | 'WOMEN' | 'UNISEX';

    active: boolean;

    popular: boolean;

    createdAt: string;

    updatedAt?: string;

    onEdit: () => void;
    onDelete: () => void;
};

export default function ServiceCard({
    name,
    category,
    description,
    duration,
    price,
    gender,
    active,
    popular,
    onEdit,
    onDelete,
}: Props) {
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.serviceName}>
                        {name}
                    </Text>

                    <Text style={styles.duration}>
                        {category} • {duration} min
                    </Text>

                    {!!description && (
                        <Text
                            style={{
                                color: '#6B7280',
                                marginTop: 6,
                                fontSize: 13,
                            }}
                            numberOfLines={2}>
                            {description}
                        </Text>
                    )}

                    <Text
                        style={{
                            marginTop: 8,
                            fontSize: 13,
                            color: '#009D94',
                            fontWeight: '600',
                        }}>
                        {gender}
                    </Text>
                </View>

                <Text style={styles.price}>
                    ₹{price}
                </Text>
            </View>

            {popular && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        Popular
                    </Text>
                </View>
            )}

            <View style={styles.switchRow}>
                <Text
                    style={{
                        fontWeight: '600',
                        color: active
                            ? '#16A34A'
                            : '#EF4444',
                    }}>
                    {active
                        ? 'Active'
                        : 'Inactive'}
                </Text>

                <Switch
                    value={active}
                    disabled
                />
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={onEdit}>
                    <Text style={styles.buttonText}>
                        Edit
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={onDelete}>
                    <Text style={styles.buttonText}>
                        Delete
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}