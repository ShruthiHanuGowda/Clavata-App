import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {MarketEvent} from '../../../../types/types';

interface ActivityEventTextProps {
  marketEvent: MarketEvent;
}

const ActivityEventText: React.FC<ActivityEventTextProps> = ({marketEvent}) => {
  const events = {
    [MarketEvent.NEW]: {text: 'Listed', style: styles.listed},
    [MarketEvent.CANCEL]: {text: 'Delisted', style: styles.delisted},
    [MarketEvent.MODIFY]: {text: 'Modified', style: styles.modified},
    [MarketEvent.BUY]: {text: 'Bought', style: styles.bought},
    [MarketEvent.SELL]: {text: 'Sold', style: styles.sold},
  };

  const eventInfo = events[marketEvent];

  return (
    <Text style={[styles.baseText, eventInfo?.style || styles.unknown]}>
      {eventInfo?.text || 'Unknown'}
    </Text>
  );
};

const styles = StyleSheet.create({
  baseText: {
    fontWeight: '600',
  },
  listed: {
    color: '#555',
  },
  delisted: {
    color: '#999',
  },
  modified: {
    color: '#777',
  },
  bought: {
    color: 'green',
  },
  sold: {
    color: 'red',
  },
  unknown: {
    color: '#000',
  },
});

export default ActivityEventText;
