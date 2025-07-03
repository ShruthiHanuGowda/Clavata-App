// @ts-ignore
import React, {useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  TextInput,
} from 'react-native';
import images from '../Theme/images';
import Colors from '../Theme/Colors';

// import {DatePickerModal} from 'react-native-paper-dates';

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
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
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
    setValue(text.trim());
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

export function DSearchInput({
  value,
  placeholder = 'example@drexs.com',
  setValue,
  onEndEditing,
}) {
  const handleOnChange = text => {
    setValue(text);
  };

  return (
    <View style={styles.wrapperInput}>
      <TouchableOpacity style={[styles.wrapperIconLeft]}>
        <Image source={images.search} style={styles.icon} />
      </TouchableOpacity>
      <TextInput
        autoCorrect={false}
        placeholderTextColor={'#BCBCBC'}
        onEndEditing={onEndEditing}
        onBlur={onEndEditing}
        style={[styles.input, styles.inputLeftPad]}
        placeholder={placeholder}
        value={value}
        onChangeText={handleOnChange}
      />
    </View>
  );
}

// export function DRangeInput({range, placeholder, setRange}) {
//   const [open, setOpen] = useState(false);
//
//   const onOpen = () => {
//     setOpen(true);
//   };
//
//   const onDismiss = () => {
//     setOpen(false);
//   };
//
//   const onConfirm = data => {
//     onDismiss();
//     if (setRange) {
//       setRange(data);
//     }
//   };
//
//   const handleOnChange = text => {};
//
//   return (
//     <View style={styles.wrapperRange}>
//       <DatePickerModal
//         locale="en"
//         mode="range"
//         visible={open}
//         onDismiss={onDismiss}
//         startDate={range?.startDate}
//         endDate={range?.endDate}
//         onConfirm={onConfirm}
//         closeIcon={images.back}
//         editIcon={images.edit}
//         calendarIcon={images.date}
//       />
//       <TouchableOpacity onPress={onOpen} style={styles.wrapperRangeInput}>
//         {range?.startDate ? (
//           <DText style={styles.placeHolder} fontStyle="fontRegular">
//             {format(range.startDate, 'P')}
//           </DText>
//         ) : (
//           <DText style={styles.placeHolder} fontStyle="fontRegular">
//             From
//           </DText>
//         )}
//         <Image source={images.date} />
//       </TouchableOpacity>
//       <View style={styles.range} />
//       <TouchableOpacity onPress={onOpen} style={styles.wrapperRangeInput}>
//         {range?.endDate ? (
//           <DText style={styles.placeHolder} fontStyle="fontRegular">
//             {format(range.endDate, 'P')}
//           </DText>
//         ) : (
//           <DText style={styles.placeHolder} fontStyle="fontRegular">
//             To
//           </DText>
//         )}
//         <Image source={images.date} />
//       </TouchableOpacity>
//     </View>
//   );
// }

export function DTextInput({
  value,
  placeholder,
  setValue,
  setValid,
  style,
  containerStyle,
  keyboardType = 'default',
  ...props
}: DTextInputProps) {
  const handleOnChange = (text: string) => {
    setValue(text);
    setValid?.(text?.trim().length > 0);
  };

  return (
    <View style={[styles.wrapperInput, containerStyle]}>
      <TextInput
        placeholderTextColor={'#BCBCBC'}
        style={[styles.input, style]}
        placeholder={placeholder}
        value={value}
        onChangeText={handleOnChange}
        {...props}
        keyboardType={keyboardType}
      />
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
  wrapperIconLeft: {
    position: 'absolute',
    left: 0,
    padding: 16,
  },
  inputLeftPad: {
    paddingLeft: 39,
    height: 42,
  },
});
