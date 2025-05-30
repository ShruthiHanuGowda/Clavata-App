import React from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  View,
  ImageSourcePropType,
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

interface CoinData {
  [key: string]: any;
}

type OperationType = 'trade' | 'send' | 'receive' | 'swap' | 'bridge';

// Single operation button component
const OperationButton: React.FC<OperationButtonProps> = props => {
  return (
    <TouchableOpacity
      style={{justifyContent: 'center', alignItems: 'center'}}
      onPress={() => props.onPress()}>
      <View style={{borderRadius: 30, backgroundColor: '#E0F0EF', padding: 18}}>
        <Image style={{width: 14, height: 14}} source={props.image} />
      </View>
      <View style={{marginVertical: 5}}>
        <Text
          style={{
            fontFamily: fontsFamily.MulishExtraBold,
            fontSize: 12,
            color: '#00201B',
          }}>
          {props.name}
        </Text>
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
    swap: 'bridge', // As per your FIXME comment
    bridge: SCREEN_CONSTANT.TRANSFERCOIN,
  };
  return destinationsMap[operation.toLowerCase()] || operation.toLowerCase(); // Default fallback
};

// Function to render multiple operation buttons
export const renderOperationButtons = (
  operations: string[],
  coinCode: string = '',
  coinData: CoinData = {},
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

export default OperationButton;
