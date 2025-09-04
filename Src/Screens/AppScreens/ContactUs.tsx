import React, {useState} from 'react';
import {View, Image, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {Header, ScreenHeight, ScreenWidth} from '@rneui/base';
import {DTextInput} from '../../Componants/Dinputs';
import DButton from '../../Componants/Dbutton';
import {DText} from '../../Componants/DText';
import images from '../../Theme/images';
import {navigateBack} from '../../Navigation/NavigationFunctions';

interface FormData {
  name: string;
  subject: string;
  message: string;
}

interface ValidationState {
  name: boolean;
  subject: boolean;
  message: boolean;
}

interface ContactUsProps {
  // Add any props if needed in the future
}

const initialValue: FormData = {
  name: '',
  subject: '',
  message: '',
};

const validation: ValidationState = {
  name: false,
  subject: false,
  message: false,
};

const ContactUs: React.FC<ContactUsProps> = () => {
  const [data, setData] = useState<FormData>(initialValue);
  const [validationState, setValidationState] = useState<ValidationState>(validation);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check if form is valid
  const isFormValid: boolean =
    validationState.name && validationState.subject && validationState.message;

  const handleBackPress = (): void => {
    navigateBack();
  };

  const validateField = (field: keyof FormData, value: string): boolean => {
    console.log('validateField', field, value);

    switch (field) {
      case 'name':
        return value?.trim().length >= 2;
      case 'subject':
        return value?.trim().length >= 5;
      case 'message':
        return value?.trim().length >= 10;
      default:
        return false;
    }
  };

  const updateField = (field: keyof FormData, value: string): void => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));

    setValidationState(prev => ({
      ...prev,
      [field]: validateField(field, value),
    }));
  };

  const handleSendPress = async (): Promise<void> => {
    if (!isFormValid) {
      Alert.alert('Validation Error', 'Please fill all fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      await sendContactEmail(data);

      Alert.alert('Success', 'Your message has been sent successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setData(initialValue);
            setValidationState(validation);
            navigateBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendContactEmail = async (formData: FormData): Promise<void> => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Sending email with data:', formData);
        resolve();
      }, 1000);
    });
  };

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
            placeholder="Name *"
            value={data.name}
            setValue={(value: string) => updateField('name', value)}
            setValid={() => validateField('name', data.name)}
          />

          <DTextInput
            containerStyle={styles.inputSpacing}
            value={data.subject}
            placeholder="Subject *"
            setValue={(value: string) => updateField('subject', value)}
            setValid={() => validateField('subject', data.subject)}
          />

          <DTextInput
            containerStyle={styles.inputSpacing}
            style={styles.messageInput}
            numberOfLines={10}
            multiline
            placeholder="Message *"
            value={data.message}
            setValue={(value: string) => updateField('message', value)}
            setValid={() => validateField('message', data.message)}
          />
        </View>

        <View style={styles.buttonContainer}>
          <DButton
            onPress={handleSendPress}
            type="primary"
            disabled={!isFormValid || isSubmitting}
            style={styles.applyBtn}>
            <DText fontStyle="fontRegular" style={styles.btnText}>
              {isSubmitting ? 'Sending...' : 'Send Email'}
            </DText>
          </DButton>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    width: ScreenWidth - 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    color: '#000',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  inputSpacing: {
    marginTop: 24,
  },
  messageInput: {
    height: ScreenHeight / 4,
    paddingTop: 16,
  },
  buttonContainer: {
    marginBottom: 30,
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

export default ContactUs;
