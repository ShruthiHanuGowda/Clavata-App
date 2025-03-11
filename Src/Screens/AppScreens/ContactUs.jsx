import React, {useState} from 'react';
import {View, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {Header, ScreenHeight, ScreenWidth} from '@rneui/base';
import {DTextInput} from '../../Componants/Dinputs';
import DButton from '../../Componants/Dbutton';
import {DText} from '../../Componants/DText';
import images from '../../Theme/images';
import {navigateBack} from '../../Navigation/NavigationFunctions';

const initialValue = {
  name: '',
  subject: '',
  message: '',
};

export default function ContactUs(props) {
  const [disabled, setDisabled] = useState(true);
  const [data, setData] = useState(initialValue);

  const handleBackPress = () => {
    navigateBack();
  };

  const handleSendPress = async () => {};

  return (
    <>
      <Header
        centerComponent={
          <View style={styles.nameContainer}>
            <DText style={styles.title} fontStyle="fontBold">
              Contact Us
            </DText>
          </View>
        }
        backgroundColor="#FFF"
        leftComponent={
          <TouchableOpacity onPress={handleBackPress}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <DTextInput
            placeholder="Name"
            value={data.name}
            setValue={name => {
              setData({
                ...data,
                name,
              });
            }}
            inputAccessoryViewID="sendEmail"
          />
          <DTextInput
            containerStyle={{
              marginTop: 33,
            }}
            value={data.subject}
            placeholder="Subject"
            setValue={subject => {
              setData({
                ...data,
                subject,
              });
            }}
            inputAccessoryViewID="sendEmail"
          />
          <DTextInput
            containerStyle={{
              marginTop: 33,
            }}
            style={{
              height: ScreenHeight / 4,
            }}
            numberOfLines={10}
            multiline
            placeholder="Message"
            value={data.message}
            setValue={message => {
              setData({
                ...data,
                message,
              });
            }}
            inputAccessoryViewID="sendEmail"
          />
        </View>
        <View style={{marginBottom: 30}}>
          <DButton
            onPress={handleSendPress}
            type="primary"
            disabled={disabled}
            style={styles.applyBtn}>
            <DText fontStyle="fontRegular" style={styles.btnText}>
              Send Email
            </DText>
          </DButton>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    width: ScreenWidth - 40,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    color: '#000',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  applyBtn: {
    marginTop: 9,
    height: 48,
    padding: 0,
    width: ScreenWidth - 40,
    marginLeft: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    padding: 0,
    textAlign: 'center',
    lineHeight: 20,
    color: '#FFF',
  },
});
