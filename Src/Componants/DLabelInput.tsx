import React from 'react';
import {StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import {View} from 'react-native';
import {DText} from './DText';
import validation from '../constant/validation';
// import {BottomSheetTextInput} from '@gorhom/bottom-sheet';

export function DLabelInput({
  label,
  value,
  placeholder,
  setValue = () => {},
  setValid = () => {},
  style,
  containerStyle,
  rightStyle,
  labelStyle,
  normalInput = false,
  onLabelPress = () => {},
  ...props
}) {
  const handleOnChange = text => {
    const test = validation.numberAndFloatingNumber.test(text);
    setValid(test);
    if (test) {
      setValue(text);
    } else {
      setValue('');
    }
  };

  // let CustomInput = BottomSheetTextInput;

  if (normalInput) {
    // CustomInput = TextInput;
  }

  return (
    <View style={[styles.wrapperInput, containerStyle]}>
      <DText style={[styles.currencyInput, style]}>{value}</DText>

      {/* // <CustomInput
        //   style={[styles.currencyInput, style]}
        //   placeholder={placeholder}
        //   value={value}
        //   keyboardType={'decimal-pad'}
        //   onChangeText={handleOnChange}
        //   {...props}
        // /> */}

      <TouchableOpacity
        onPress={onLabelPress}
        style={[styles.currency, rightStyle]}>
        <DText style={[styles.currencyText, labelStyle]}>{label}</DText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperInput: {
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: '#B5B5B5',
    marginTop: 10,
    padding: 7,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
  },
  currencyInput: {
    paddingLeft: 10,
    width: '100%',
    height: 38,
  },
  currency: {
    position: 'absolute',
    right: 0,
    borderRadius: 5,
    padding: 10,
    width: 73,
    backgroundColor: '#E9E9E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyText: {},
});
