import {StyleSheet} from 'react-native';
import { Colors,fontsFamily } from '../../../theme';
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentStyle:{
    fontFamily:fontsFamily.MulishSemiBold,
    fontSize:14,
    color:'#747474'
  },
  passwordTip:{
    fontFamily:fontsFamily.MulishBold,
    fontSize:12,
    color:'#000'
  },
  tipContent:{
    fontFamily:fontsFamily.Mulish,
    fontSize:10,
  },
  page2Content:{
    fontFamily:fontsFamily.Mulish,
    fontSize:14,
    color:'#747474'
  },
  content:{
    fontFamily:fontsFamily.MulishSemiBold,
    fontSize:14,
    color:'#747474'
  },
  forgot:{
      fontFamily:fontsFamily.MulishBold,
      fontSize:14,
      lineHeight:22,
      color:'#000',
      textAlign:'center'
  },
  page2Content:{
    fontFamily:fontsFamily.Mulish,
    fontSize:14,
    color:'#747474'
  }
});
