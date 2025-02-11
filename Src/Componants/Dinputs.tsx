import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  TextInput,
} from 'react-native';
import images from '../Theme/images';
import {Colors} from '../Theme';

interface DTextInputProps {
  value: string;
  placeholder: string;
  setValue: (text: string) => void;
  setValid: (isValid: boolean) => void;
  style?: object;
  containerStyle?: object;
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'decimal-pad'
    | 'numeric'
    | 'url';
}

export function DTextInput({
  value,
  placeholder,
  setValue = () => {},
  setValid = () => {},
  style,
  containerStyle,
  keyboardType = 'default',
}: DTextInputProps) {
  const handleOnChange = (text: string) => {
    setValue(text);
    setValid(text.trim().length > 0);
  };

  return (
    <View style={[styles.wrapperInput, containerStyle]}>
      <TextInput
        placeholderTextColor={'#BCBCBC'}
        style={[styles.input, style]}
        placeholder={placeholder}
        value={value}
        onChangeText={handleOnChange}
        keyboardType={keyboardType}
      />
    </View>
  );
}

interface DEmailInputProps {
  value: string;
  placeholder?: string;
  setValue: (text: string) => void;
  setValid: (isValid: boolean) => void;
  inputAccessoryViewID?: string;
}

export function DEmailInput({
  value,
  placeholder = 'example@drexs.com',
  setValue,
  setValid,
  inputAccessoryViewID,
}: DEmailInputProps) {
  const handleOnChange = (text: string) => {
    let re = /\S+@\S+\.\S+/;
    let regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    setValue(text);
    setValid(re.test(text) || regex.test(text));
  };

  return (
    <View style={styles.wrapperInput}>
      <TextInput
        keyboardType="email-address"
        autoCorrect={false}
        placeholderTextColor={Colors.placeholder}
        inputAccessoryViewID={inputAccessoryViewID}
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={handleOnChange}
      />
      <View style={styles.wrapperIcon}>
        <Image source={images.email} style={styles.icon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperInput: {
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: Colors.gray,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    padding: 10,
    fontSize: 14,
    width: '100%',
    height: 50,
    color: Colors.textInput,
  },
  wrapperIcon: {
    position: 'absolute',
    right: 0,
    padding: 10,
  },
  icon: {},
});
