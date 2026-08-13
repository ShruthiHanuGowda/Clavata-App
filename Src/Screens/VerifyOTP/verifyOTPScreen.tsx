// import React, { useEffect, useRef, useState } from 'react';
// import {
//   SafeAreaView,
//   View,
//   Text,
//   TextInput,
//   Alert,
//   StyleSheet,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';

// import { useMutation } from '@apollo/client';
// import {
//   useNavigation,
//   useRoute,
// } from '@react-navigation/native';

// import { VERIFY_OTP } from '../../graphql/queries';
// import { DButton } from '../../components';
// import { useUser } from '../../context/UserContext';

// type VerifyOTPRouteParams = {
//   phoneNumber: string;
//   purpose?: 'LOGIN' | 'REAUTH' | 'CHANGE_PHONE' | 'REGISTRATION';
// };

// export default function VerifyOTPScreen() {
//   const navigation = useNavigation<any>();
//   const route = useRoute<any>();

//   const {
//     phoneNumber,
//     purpose = 'LOGIN',
//   } = route.params as VerifyOTPRouteParams;

//   const { setCurrentUser } = useUser();

//   const [otp, setOtp] = useState('');
//   const [resendLoading, setResendLoading] = useState(false);

//   const inputRef = useRef<TextInput>(null);

//   const [verifyOTP, { loading }] = useMutation(VERIFY_OTP);

//   /*
//    * Automatically focus OTP input
//    */
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       inputRef.current?.focus();
//     }, 400);

//     return () => clearTimeout(timer);
//   }, []);

//   /*
//    * Verify OTP
//    */
//   const onVerifyOTP = async () => {
//     if (otp.length !== 6) {
//       return;
//     }

//     try {
//       const { data } = await verifyOTP({
//         variables: {
//           phoneNumber,
//           otp,
//         },
//       });

//       const result = data?.verifyOTP;

//       if (!result?.success) {
//         Alert.alert(
//           'Verification failed',
//           result?.message || 'Invalid OTP. Please try again.',
//         );

//         setOtp('');
//         inputRef.current?.focus();

//         return;
//       }

//       console.log(
//         'Verify OTP Response:',
//         JSON.stringify(result, null, 2),
//       );

//       /*
//        * LOGIN FLOW
//        */
//       if (purpose === 'LOGIN') {
//         if (result.isExistingUser) {
//           setCurrentUser(result.user);

//           navigation.reset({
//             index: 0,
//             routes: [
//               {
//                 name: 'appScreens',
//               },
//             ],
//           });
//         } else {
//           navigation.navigate('RegisterUser', {
//             phoneNumber,
//           });
//         }

//         return;
//       }

//       /*
//        * OTHER OTP FLOWS
//        *
//        * Later you can add:
//        *
//        * REAUTH
//        * CHANGE_PHONE
//        * REGISTRATION
//        */

//       if (purpose === 'REAUTH') {
//         navigation.goBack();
//         return;
//       }

//       if (purpose === 'CHANGE_PHONE') {
//         navigation.goBack();
//         return;
//       }

//       if (purpose === 'REGISTRATION') {
//         navigation.goBack();
//         return;
//       }

//     } catch (error) {
//       console.error('OTP verification error:', error);

//       Alert.alert(
//         'Something went wrong',
//         'Unable to verify the OTP. Please try again.',
//       );
//     }
//   };

//   /*
//    * Resend OTP
//    *
//    * Keep this function ready.
//    * Connect it to SEND_OTP when you want resend functionality.
//    */
//   const resendOTP = async () => {
//     if (resendLoading) {
//       return;
//     }

//     try {
//       setResendLoading(true);

//       // TODO:
//       // Call SEND_OTP here.

//       Alert.alert(
//         'OTP sent',
//         'A new verification code has been sent to your mobile number.',
//       );

//     } catch (error) {
//       console.error('Resend OTP error:', error);

//       Alert.alert(
//         'Unable to resend',
//         'Please try again.',
//       );
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         style={styles.keyboardContainer}
//         behavior={
//           Platform.OS === 'ios'
//             ? 'padding'
//             : undefined
//         }
//       >

//         {/* Header */}

//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backButton}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.backIcon}>
//               ‹
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Content */}

//         <View style={styles.content}>

//           <View style={styles.iconContainer}>
//             <Text style={styles.icon}>
//               ✉
//             </Text>
//           </View>

//           <Text style={styles.title}>
//             Verify your number
//           </Text>

//           <Text style={styles.subtitle}>
//             Enter the 6-digit code we sent to
//           </Text>

//           <Text style={styles.phoneNumber}>
//             {phoneNumber}
//           </Text>

//           {/* OTP */}

//           <TextInput
//             ref={inputRef}
//             value={otp}
//             onChangeText={(value) => {
//               const numericValue =
//                 value.replace(/[^0-9]/g, '');

//               setOtp(numericValue);
//             }}
//             keyboardType="number-pad"
//             maxLength={6}
//             style={styles.otpInput}
//             placeholder="000000"
//             placeholderTextColor="#B8BCC7"
//             textContentType="oneTimeCode"
//             autoComplete="sms-otp"
//             returnKeyType="done"
//             onSubmitEditing={onVerifyOTP}
//           />

//           <Text style={styles.helperText}>
//             Enter the code to continue securely.
//           </Text>

//           {/* Verify */}

//           <DButton
//             type="primary"
//             style={[
//               styles.button,
//               otp.length !== 6 && styles.buttonDisabled,
//             ]}
//             disabled={
//               loading ||
//               otp.length !== 6
//             }
//             onPress={onVerifyOTP}
//           >
//             <Text style={styles.buttonText}>
//               {loading
//                 ? 'Verifying...'
//                 : 'Verify'}
//             </Text>
//           </DButton>

//           {/* Resend */}

//           <View style={styles.resendContainer}>
//             <Text style={styles.resendText}>
//               Didn't receive the code?
//             </Text>

//             <TouchableOpacity
//               onPress={resendOTP}
//               disabled={resendLoading}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.resendLink}>
//                 {resendLoading
//                   ? ' Sending...'
//                   : ' Resend OTP'}
//               </Text>
//             </TouchableOpacity>
//           </View>

//         </View>

//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// VerifyOTPScreen.navigationOptions = {
//   header: null,
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },

//   keyboardContainer: {
//     flex: 1,
//   },

//   header: {
//     height: 70,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },

//   backButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#F5F3FF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   backIcon: {
//     fontSize: 34,
//     lineHeight: 38,
//     color: '#18122B',
//     marginTop: -3,
//   },

//   content: {
//     flex: 1,
//     paddingHorizontal: 28,
//     alignItems: 'center',
//     paddingTop: 45,
//   },

//   iconContainer: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: '#F5EFFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 24,
//   },

//   icon: {
//     fontSize: 30,
//   },

//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#18122B',
//     textAlign: 'center',
//     marginBottom: 10,
//   },

//   subtitle: {
//     fontSize: 15,
//     color: '#777487',
//     textAlign: 'center',
//     lineHeight: 22,
//   },

//   phoneNumber: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#18122B',
//     marginTop: 6,
//     marginBottom: 32,
//   },

//   otpInput: {
//     width: '100%',
//     height: 64,
//     borderWidth: 1.5,
//     borderColor: '#DDD8EA',
//     borderRadius: 16,
//     backgroundColor: '#FAF9FC',
//     textAlign: 'center',
//     fontSize: 27,
//     fontWeight: '600',
//     letterSpacing: 10,
//     color: '#18122B',
//     paddingLeft: 10,
//   },

//   helperText: {
//     fontSize: 13,
//     color: '#92909C',
//     marginTop: 12,
//     marginBottom: 26,
//   },

//   button: {
//     width: '100%',
//     height: 56,
//     borderRadius: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   buttonDisabled: {
//     opacity: 0.5,
//   },

//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//     textAlign: 'center',
//   },

//   resendContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 25,
//   },

//   resendText: {
//     fontSize: 14,
//     color: '#777487',
//   },

//   resendLink: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#8B3DFF',
//   },
// });