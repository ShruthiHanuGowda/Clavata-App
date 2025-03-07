import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import images from '../../Theme/images';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import {DText} from '../../Componants/DText';
import {DButton} from '../../Componants';

export default function DAppsScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: '#fff', flex: 0}}>
        <View style={styles.pageTitleContainer}>
          <DText style={styles.pageTitle} fontStyle="fontBold">
            dApps
          </DText>
        </View>
        <View style={styles.banner}>
          <View style={styles.downloadNowDescContainer}>
            <DText style={styles.bannerTitle} fontStyle="fontExtraBold">
              METABEATS
            </DText>
            <DText style={styles.bannerDesc} fontStyle="fontSemiBold">
              It is a long established fact that a reader..
            </DText>
            <DButton style={styles.downloadNowBtn} type="primary">
              <DText fontStyle="fontSemiBold" style={styles.downloadNowBtnText}>
                Download now {'>>'}
              </DText>
            </DButton>
          </View>
          <Image
            style={styles.downloadNowImage}
            source={images.downloadNow}></Image>
        </View>
        <View
          style={{
            height: ScreenHeight / 2,
            width: ScreenWidth,
            marginLeft: -20,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <DText
            style={{
              fontSize: 20,
            }}>
            Coming Soon
          </DText>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  listItemContent: {},
  listItemTitle: {
    fontSize: 14,
  },
  listItemDesc: {
    fontSize: 10,
    color: '#666666',
  },
  listItem: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginLeft: 2,
    marginBottom: 2,
    alignItems: 'center',
    padding: 12,
  },
  listItemImage: {
    marginVertical: 18,
  },
  pageTitle: {
    flex: 1,
    fontSize: 18,
    color: '#1F1F1F',
    lineHeight: 22,
  },
  pageTitleContainer: {
    flexDirection: 'row',
    marginVertical: 36,
  },
  banner: {
    flexDirection: 'row',
    height: 145,
    marginBottom: 12,
  },
  bannerTitle: {
    letterSpacing: 3,
  },
  bannerDesc: {
    lineHeight: 22,
    fontSize: 14,
    marginTop: 7,
    fontWeight: 600,
  },
  downloadNowDescContainer: {
    width: ScreenWidth - 180,
  },
  downloadNowImage: {
    marginTop: -21,
  },
  downloadNowBtn: {
    marginTop: 18,
    height: 30,
    width: 138,
    padding: 5,
    paddingLeft: 19,
  },
  downloadNowBtnText: {
    color: '#FFF',
    fontSize: 12,
    lineHeight: 19,
  },
});
