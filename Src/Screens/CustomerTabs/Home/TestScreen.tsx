import React from 'react';
import { View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

export default function TestScreen() {
  return (
    <View style={{ flex: 1 }}>
      <BottomSheet
        index={0}
        snapPoints={['50%']}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'red',
          }}
        />
      </BottomSheet>
    </View>
  );
}