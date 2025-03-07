import {BottomSheet} from '@rneui/base';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import DButton from './Dbutton';
import {DText} from './DText';
// import useBottomSheet from '../hooks/bottomsheet';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
// import images from '../../images';

export default function DConfirmBottomSheet({
  title = '',
  description = '',
  showConfirm,
  onCancel,
  onConfirm,
  imagePreview,
  confirm = "Yes, I'm sure",
  cancel = 'No, Go Back',
  height = 230,
}) {
  const bottomSheetProps = useBottomSheet(showConfirm, [
    10,
    imagePreview ? 350 : height,
  ]);

  const handleClose = () => {
    onCancel();
  };

  return (
    <BottomSheetModal
      //   {...bottomSheetProps}
      onDismiss={() => {
        if (showConfirm) {
          handleClose();
        }
      }}>
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetTitle}>
          <DText fontStyle="fontBold" style={styles.title}>
            {title}
          </DText>
        </View>
        {/* {imagePreview && (
          <Image
            style={styles.bottomSheetImage}
            source={images[imagePreview]}
          />
        )} */}
        <View style={styles.bottomSheetInfo}>
          <DText style={styles.infoText} fontStyle="fontRegular">
            {description}
          </DText>
        </View>
        <View style={styles.action}>
          <DButton onPress={onCancel} type="secondary" style={styles.resetBtn}>
            <DText fontStyle="fontRegular" style={styles.btnSecondaryText}>
              {cancel}
            </DText>
          </DButton>
          <DButton onPress={onConfirm} type="primary" style={styles.applyBtn}>
            <DText fontStyle="fontRegular" style={styles.btnText}>
              {confirm}
            </DText>
          </DButton>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  bottomSheetImage: {
    margin: 19,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333333',
  },
  bottomSheetInfo: {
    alignItems: 'center',
    marginLeft: 21,
    marginRight: 11,
    marginTop: 19,
  },
  actionBtn: {
    marginRight: 27,
    alignSelf: 'center',
  },
  btnText: {
    textAlign: 'center',
    color: '#FFF',
  },

  btnSecondaryText: {
    color: '#000',
    textAlign: 'center',
  },
  infoText: {
    color: '#747474',
    textAlign: 'center',
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  resetBtn: {},
  applyBtn: {},
  bottomSheetTitle: {
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderColor: '#DEDEDE',
    borderBottomWidth: 75 / 100,
    fontSize: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 13,
    borderBottomColor: '#DEDEDE',
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetItem: {
    padding: 20,
    width: '100%',
    borderBottomWidth: 75 / 100,
    borderBottomColor: '#DEDEDE',
  },
});
