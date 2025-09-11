import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface ListingHeaderProps {
  title: string;
}

const ListingHeader: React.FC<ListingHeaderProps> = ({title}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ListingHeader;
