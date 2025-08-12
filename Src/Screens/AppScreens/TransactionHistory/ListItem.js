import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import styles from './styles';
import moment from 'moment';
import {Circle, Path, Svg} from 'react-native-svg';

class ListItem extends React.PureComponent {
  render() {
    const {item, name, setSelectedItems} = this.props;
    console.log('item', item);

    const receiveImg = (
      <Svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Circle cx="16" cy="16" r="16" fill={'#99DDB420'} />
        <Path
          opacity="0.4"
          d="M16.2061 21.8125V10.5625"
          stroke="#00AB44"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M20.7242 17.2754L16.2063 21.8129L11.6875 17.2754"
          stroke="#00AB44"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Svg>
    );

    const sentImg = (
      <Svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Circle cx="16" cy="16" r="16" fill={'#F8BD6820'} />
        <Path
          opacity="0.4"
          d="M15.7939 10.1875L15.7939 21.4375"
          stroke="#FF9B1B"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M11.2757 14.7246L15.7937 10.1871L20.3125 14.7246"
          stroke="#FF9B1B"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Svg>
    );

    const pendingImg = (
      <Svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Circle cx="16" cy="16" r="16" fill={'#F8BD6820'} />
        <Path
          d="M20.0421 18.7525L17.0121 16H14.9796L11.9496 18.7525C11.1021 19.5175 10.8246 20.695 11.2371 21.76C11.6496 22.8175 12.6546 23.5 13.7871 23.5H18.2046C19.3446 23.5 20.3421 22.8175 20.7546 21.76C21.1671 20.695 20.8896 19.5175 20.0421 18.7525ZM17.3646 20.605H14.6346C14.3496 20.605 14.1246 20.3725 14.1246 20.095C14.1246 19.8175 14.3571 19.585 14.6346 19.585H17.3646C17.6496 19.585 17.8746 19.8175 17.8746 20.095C17.8746 20.3725 17.6421 20.605 17.3646 20.605Z"
          fill="#F7931A"
        />
        <Path
          d="M20.763 10.24C20.3505 9.1825 19.3455 8.5 18.213 8.5H13.788C12.6555 8.5 11.6505 9.1825 11.238 10.24C10.833 11.305 11.1105 12.4825 11.958 13.2475L14.988 16H17.0205L20.0505 13.2475C20.8905 12.4825 21.168 11.305 20.763 10.24ZM17.3655 12.4225H14.6355C14.3505 12.4225 14.1255 12.19 14.1255 11.9125C14.1255 11.635 14.358 11.4025 14.6355 11.4025H17.3655C17.6505 11.4025 17.8755 11.635 17.8755 11.9125C17.8755 12.19 17.643 12.4225 17.3655 12.4225Z"
          fill="#F7931A"
        />
      </Svg>
    );

    const swapImg = (
      <Svg
        width="32"
        height="32"
        viewBox="0 0 46 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Circle cx="23" cy="23" r="23" fill={'#E0F0EF'} />
        <Path
          d="M26.15 23.3411L30 26.9749L26.15 30.6087L25.0502 29.5707L27.0227 27.7082L16.7778 27.709V26.2408H27.0227L25.0502 24.3791L26.15 23.3411ZM19.85 16L20.9498 17.038L18.9773 18.8997H29.2222V20.3679H18.9773L20.9498 22.2296L19.85 23.2676L16 19.6338L19.85 16Z"
          fill="#009D94"
        />
      </Svg>
    );

    const buyImg = (
      <Svg
        width="32"
        height="32"
        viewBox="0 0 46 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Circle cx="23" cy="23" r="23" fill={'#E0F0EF'} />
        <Path
          d="M23 30C19.1339 30 16 26.8661 16 23C16 19.1339 19.1339 16 23 16C26.8661 16 30 19.1339 30 23C30 26.8661 26.8661 30 23 30ZM23 28.6C24.4852 28.6 25.9096 28.01 26.9598 26.9598C28.01 25.9096 28.6 24.4852 28.6 23C28.6 21.5148 28.01 20.0904 26.9598 19.0402C25.9096 17.99 24.4852 17.4 23 17.4C21.5148 17.4 20.0904 17.99 19.0402 19.0402C17.99 20.0904 17.4 21.5148 17.4 23C17.4 24.4852 17.99 25.9096 19.0402 26.9598C20.0904 28.01 21.5148 28.6 23 28.6ZM23 19.535L26.465 23L23 26.465L19.535 23L23 19.535ZM23 21.5153L21.5153 23L23 24.4847L24.4847 23L23 21.5153Z"
          fill="#009D94"
        />
      </Svg>
    );

    let color = item.type === 'Deposit' ? '#007E32' : '#DB0A0A';
    let status;

    switch (item.type) {
      case 'Deposit':
        status = receiveImg;
        break;
      case 'Transfer':
        status = sentImg;
        break;
      case 'Withdrawal':
        status = sentImg;
        break;
      case 'Swap':
        status = swapImg;
        break;
      case 'Bridge Deposit':
        status = swapImg;
        break;
      case 'Bridge Withdraw':
        status = swapImg;
        break;
      case 'Buy':
        status = buyImg;
        break;
      case 'Sell':
        status = sentImg;
        break;
      default:
        console.log('[list] unhandled type', item.type);
        status = pendingImg;
        break;
    }

    let statusColor;

    switch (item.status) {
      case 'failed':
        statusColor = '#DB0A0A';
        break;
      case 'pending':
        statusColor = '#F7931A';
        break;
      default:
        statusColor = '#007E32';
        break;
    }

    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          setSelectedItems(item);
        }}
        style={styles.itemContainer}>
        <View
          style={{flexDirection: 'row', alignItems: 'center', width: '60%'}}>
          <View
            style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.statusImgContainer}>{status}</View>
            <View style={{width: '80%', paddingRight: 10}}>
              <Text
                style={{
                  ...styles.transationType,
                  textTransform: 'capitalize',
                }}>
                {item.type}
              </Text>
              <Text style={styles.username}>
                {item.type === 'received' || item.type === 'send'
                  ? item.userName
                  : name}
              </Text>
              <Text
                style={{
                  ...styles.status,
                  color: statusColor,
                }}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            width: '40%',
            alignSelf: 'flex-end',
            alignItems: 'flex-end',
            paddingLeft: 10,
          }}>
          <Text
            style={{
              ...styles.amount,
              color: color,
            }}>
            {item.change && item.change}{' '}
            {item.amount >= 0
              ? parseFloat(item.amount)
              : parseFloat(item.tokenAmount)}{' '}
            {item.coinCode}
          </Text>
          <Text style={styles.time}>
            {moment.unix(parseInt(item.timestamp)).fromNow()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

export default ListItem;
