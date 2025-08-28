import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity, Image
} from 'react-native';
import style from './styles';
import { Header } from '@rneui/base';
import { navigateBack } from '../../../Navigation/NavigationFunctions';
import images from '../../../Theme/images';
import CustomImageButton from '../../../Componants/rc_imageButton';
import { DText } from '../../../Componants/DText';
import { fontsFamily } from '../../../Theme';


export default function AccountBeneficary(props) {
  const capitalize = str => {
    return str.charAt(0).toUpperCase();
  };

  const ListItem = ({item}) => {
    return (
      <View style={{marginHorizontal: 20, marginVertical: 5}}>
        <View
          style={{
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            onPress={() => ''}
            style={{width: '80%', flexDirection: 'row', alignItems: 'center'}}
            disabled={props?.route?.params?.fromScreen !== 'send'}>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 30,
                width: 60,
                height: 60,
                borderColor: '#fff',
                backgroundColor: item?.colorCode
                  ? item.colorCode
                  : 'rgb(' +
                    Math.floor(Math.random() * 256) +
                    ',' +
                    Math.floor(Math.random() * 256) +
                    ',' +
                    Math.floor(Math.random() * 256) +
                    ')',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={style.fontStyle}>{capitalize(item.name)}</Text>
            </View>
            <View style={{marginHorizontal: 10, width: '80%'}}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>
                {item.coinCode} - {item.beneficiaryAddress}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => ''}>
            {/* <Icon name="close-circle-outline" size={28} color="#C7C7C7" /> */}
            <Image source={images.closeIcon} style={styles.closeIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ListEmpty = () => {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={styles.noData}>No Beneficiaries Added</Text>
      </View>
    );
  };
  const handleBackPress = () => {
    navigateBack();
  };

  return (
    <View style={{backgroundColor: '#fff', flex: 1}}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={{borderBottomWidth: 0}}
        leftComponent={
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backContainer}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={styles.nameContainer}>
            <DText style={styles.title} fontStyle="fontBold">
              Beneficiaries
            </DText>
          </View>
        }
      />
      {/* <Loader isShow={loading} /> */}
      <View style={{flex: 1}}>
        <View style={{marginHorizontal: 20, marginTop: 38}}>
          <Text style={styles.subText}>
            It is a long established fact that a reader will be distracted by
            the readable content of a page{' '}
          </Text>
        </View>
        {/* <FlatList
          data={tempData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => <ListItem item={item} />}
          contentContainerStyle={{flexGrow: 2}}
          ListEmptyComponent={<ListEmpty />}
        /> */}
      </View>
      <View style={styles.btnAlign}>
        <CustomImageButton
          backgroundImage={images.buttonBg}
          label="Add a Beneficiary"
          labelStyle={style.textStyle}
          onPress={() => ''}
          containerWrapper={{
            height: 51,
            borderRadius: 12,
            marginBottom: 20,
            marginHorizontal: 18,
          }}
          bgImg={{height: 51, width: '100%'}}
        />
      </View>
      {/*  <DConfirmBottomSheet
        showConfirm={visible}
        title="Confirm List"
        description="Are you sure you want to delete from your beneficiaries list?"
        onCancel={() => {
          setVisible(false);
        }}
        onConfirm={() => {
          setVisible(false);
          deleteUser(deleteItems?.coinCode, deleteItems?.beneficiaryAddress);
        }}
        cancel="No, Go Back"
        confirm="Confirm Delete"
      /> */}
    </View>
  );
}
const styles = StyleSheet.create({
  backContainer: {
    position: 'relative',
  },
  title: {
    fontSize: 18,
    color: '#2C2C2C',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  subText: {
    color: '#747474',
    fontSize: 14,
    fontFamily: fontsFamily.MulishSemiBold,
    lineHeight: 22.4,
  },
  name: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 15,
    color: '#000',
    // marginTop: 10,
  },
  listAlign: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  address: {
    fontSize: 12,
    color: '#AAAAAA',
    fontFamily: fontsFamily.Mulish,
  },
  btnAlign: {
    justifyContent: 'flex-end',
    flex: 0,
  },
  noData: {
    color: 'grey',
    fontFamily: fontsFamily.Mulish,
    fontSize: 13,
  },
  closeIcon: {
    height: 28,
    width: 28,
  },
});
