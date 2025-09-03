import React from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  View,
  ImageSourcePropType,
  StyleSheet,
} from 'react-native';
import {fontsFamily, Images} from '../../../Theme';
import {ReactElement} from 'react';
import {navigateTo} from '../../../utils/navigationService';
import {SCREEN_CONSTANT} from '../../../Navigation/constant';

// Type definitions
interface OperationButtonProps {
  name: string;
  image: ImageSourcePropType;
  onPress: () => void;
}

interface Images {
  buyIcon: ImageSourcePropType;
  sendIcon: ImageSourcePropType;
  receiveIcon: ImageSourcePropType;
  swapcoin: ImageSourcePropType;
  [key: string]: ImageSourcePropType;
}

const OperationButton: React.FC<OperationButtonProps> = props => {
  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={() => props.onPress()}>
      <View style={styles.iconContainer}>
        <Image style={styles.icon} source={props.image} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.buttonText}>{props.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Image mapping for operation types
const getOperationImage = (operation: string): ImageSourcePropType => {
  const operationsMap: Record<string, ImageSourcePropType> = {
    trade: Images.buyIcon,
    send: Images.sendIcon,
    receive: Images.receiveIcon,
    swap: Images.swapcoin,
    bridge: Images.swapcoin,
  };
  return operationsMap[operation.toLowerCase()] || Images.sendIcon; // Default fallback
};

// Get navigation destination for operation
const getOperationDestination = (operation: string): string => {
  const destinationsMap: Record<string, string> = {
    trade: 'trade',
    send: SCREEN_CONSTANT?.VERIFYADDRESS,
    receive: SCREEN_CONSTANT.RECIEVESCREEN,
    swap: 'swap',
    bridge: SCREEN_CONSTANT.TRANSFERCOIN,
  };
  return destinationsMap[operation.toLowerCase()] || operation.toLowerCase(); // Default fallback
};

// Function to render multiple operation buttons
export const renderOperationButtons = (
  operations: string[],
  coinCode: string = '',
): ReactElement[] => {
  if (!operations || operations.length === 0) {
    return [];
  }

  return operations.map((operation, index) => {
    const operationKey = operation.toLowerCase();
    const image = getOperationImage(operationKey);
    const destination = getOperationDestination(operationKey);

    // Handle navigation params based on operation type
    let onPressHandler: () => void;
    // if (coinCode === 'USDC' && operationKey === 'bridge') {
    onPressHandler = () =>
      navigateTo(destination, {
        coinCode: coinCode,
      });
    // } else if (
    //   coinCode === 'USDC' &&
    //   (operationKey === 'send' || operationKey === 'receive')
    // ) {
    //   // Add specific navigation for USDC send/receive if needed
    //   onPressHandler = () =>
    //     navigateTo(destination, {
    //       coinCode: coinCode,
    //     });
    // } else {
    //   onPressHandler = () => navigateTo(destination);
    // }

    return (
      <OperationButton
        key={`${operationKey}-${index}`}
        name={operation.charAt(0).toUpperCase() + operation.slice(1)}
        image={image}
        onPress={onPressHandler}
      />
    );
  });
};

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 30,
    backgroundColor: '#E0F0EF',
    padding: 18,
  },
  icon: {
    width: 14,
    height: 14,
  },
  textContainer: {
    marginVertical: 5,
  },
  buttonText: {
    fontFamily: fontsFamily.MulishExtraBold,
    fontSize: 12,
    color: '#00201B',
  },
});

export default OperationButton;
