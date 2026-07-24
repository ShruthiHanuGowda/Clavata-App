import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { Header, DButton } from '../../components';

export default function SalonRejectedScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Verification Rejected" />

      <View style={styles.content}>
        <Text style={styles.icon}>❌</Text>

        <Text style={styles.title}>
          Verification Failed
        </Text>

        <Text style={styles.description}>
          Unfortunately your salon registration couldn't be approved.
        </Text>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>
            Reason
          </Text>

          <Text style={styles.reason}>
            Business documents could not be verified.
          </Text>
        </View>

        <Text style={styles.description}>
          Please correct the information and submit again.
        </Text>
      </View>

      <DButton
        type="primary"
        style={styles.button}
        onPress={() => navigation.navigate('BecomePartner')}>
        <Text style={styles.buttonText}>
          Resubmit Registration
        </Text>
      </DButton>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#FFF'},

  content:{
    flex:1,
    padding:24,
    justifyContent:'center',
    alignItems:'center'
  },

  icon:{fontSize:70},

  title:{
    marginTop:20,
    fontSize:26,
    fontWeight:'700'
  },

  description:{
    marginTop:15,
    textAlign:'center',
    color:'#666',
    fontSize:16,
    lineHeight:24
  },

  reasonBox:{
    marginTop:30,
    width:'100%',
    backgroundColor:'#FFF4F4',
    borderRadius:10,
    padding:18
  },

  reasonTitle:{
    fontWeight:'700',
    color:'#D32F2F'
  },

  reason:{
    marginTop:8,
    color:'#555'
  },

  button:{
    width:240,
    alignSelf:'center',
    marginBottom:30
  },

  buttonText:{
    color:'#FFF',
    alignSelf:'center'
  }
});