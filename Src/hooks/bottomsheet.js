// import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import {useCallback, useEffect, useMemo, useRef} from 'react';
import {BackHandler} from 'react-native';

export default function useBottomSheet(
  visible,
  sizes = [400],
  closeOnIndex = 0,
) {
  // ref
  const ref = useRef(null);
  // variables
  const snapPoints = useMemo(() => sizes, []);
  useEffect(() => {
    if (visible) {
      return ref.current?.present();
    }
    ref.current?.dismiss();
  }, [visible]);

  useEffect(() => {
    const backAction = () => {
      ref.current?.close();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const onChange = useCallback(index => {
    if (index === closeOnIndex) {
      ref.current?.dismiss();
    }
  }, []);

  // renders
  const backdropComponent = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        onPress={() => {
          ref.current?.dismiss();
        }}
        appearsOnIndex={1}
        disappearsOnIndex={0}
      />
    ),
    [],
  );

  return {
    index: 1,
    ref,
    snapPoints,
    backdropComponent,
    onChange,
  };
}
