import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useUser } from '../../../context/UserContext';
const PRIMARY = '#008060';
type Props = {
  location: string;
  onPressLocation: () => void;
};
export default function HomeHeader({
  location,
  onPressLocation,
}: Props) {
   const { currentUser, setCurrentUser } = useUser();
   console.log('currentUser?.providerStatus', currentUser?.fullName);
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>
          Hello, {currentUser?.fullName || 'there'}
        </Text>
        <Text style={styles.small}>
          Delivering Near
        </Text>
        <TouchableOpacity
          onPress={onPressLocation}
          activeOpacity={0.8}
        >
          <Text style={styles.location}>
            📍 {location} ▼
          </Text>
        </TouchableOpacity>
      </View>
      {/* <TouchableOpacity style={styles.avatar}>
        <Text style={{ fontSize: 20 }}>👤</Text>
      </TouchableOpacity> */}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  small: {
    marginTop: 10,
    color: '#888',
    fontSize: 13,
  },
  location: {
    marginTop: 5,
    color: PRIMARY,
    fontWeight: '700',
    fontSize: 16,
  },
  avatar: {
    height: 45,
    width: 45,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});