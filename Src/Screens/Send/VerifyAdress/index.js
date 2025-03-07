import React, {useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import style from './styles';
import {Header} from '@rneui/base';
import Images from '../../../Theme/images';
import {DText} from '../../../Componants/DText';
import {CustomImageButton} from '../../../Componants';
import {navigateBack} from '../../../Navigation/NavigationFunctions';

export const VerifyAddress = props => {
  const [senderAddress, setSenderAddress] = useState('');

  function isValidEthereumAddress(address) {}

  return (
    <View style={style.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={{borderBottomWidth: 0}}
        leftComponent={
          <TouchableOpacity
            onPress={() => navigateBack()}
            style={style.backContainer}>
            <Image source={Images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={style.nameContainer}>
            <DText style={style.title} fontStyle="fontSemiBold">
              wUSDC
            </DText>
          </View>
        }
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={style.scrollViewContainer}>
        <TouchableOpacity style={style.addressInputWrap}>
          <TextInput
            onChangeText={data => {
              setSenderAddress(data);
            }}
            value={senderAddress}
            placeholderTextColor={'#000'}
            placeholder="Enter wallet Address"
            style={style.addressInput}></TextInput>
          <Pressable style={{right: 10}} onPress={() => ''}>
            <Image source={Images.qrCodeIcon} style={{height: 25, width: 25}} />
          </Pressable>
        </TouchableOpacity>
      </ScrollView>
      <CustomImageButton
        backgroundImage={Images.buttonBg}
        label="Send"
        labelStyle={style.textStyle}
        onPress={() => isValidEthereumAddress(senderAddress)}
        containerWrapper={style.bottomButton}
        bgImg={style.buttonImage}
      />
    </View>
  );
};
