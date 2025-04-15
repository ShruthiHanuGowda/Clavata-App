import {StyleSheet} from 'react-native';
import {Colors, fontsFamily} from '../../../theme';
import { lineHeight } from '../../../theme/fonts';
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header:{
      fontFamily:fontsFamily.MulishBold,
      fontSize:14,
      lineHeight:17,
      color:'#000'
  },
  payText:{
      fontFamily:fontsFamily.MulishSemiBold,
      fontSize:12,
      lineHeight:15,
      color: "#5E5E5E"
  },
  payValue:{
      fontFamily:fontsFamily.MulishBold,
      fontSize:12,
      lineHeight:15,
      color:'#000'
  },
  textStyle:{
    fontFamily:fontsFamily.MulishBold
},
errorSec:{
  marginTop:10,
  padding:5,
  borderWidth:1,
  borderWidth: 1,
  borderColor: 'red',
  backgroundColor: '#FFFFFF',
  width: '95%',
  borderRadius: 10,
  alignItems:'center'
},
errorText:{
  fontFamily:fontsFamily.Mulish,
  fontSize:12,
  color:"red",
  letterSpacing:1
},
})