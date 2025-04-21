import React from 'react';
import {Text} from 'react-native';
import {MarketEvent} from '../../../../types/types';

interface ActivityEventTextProps {
  marketEvent: MarketEvent;
}

const ActivityEventText: React.FC<ActivityEventTextProps> = ({marketEvent}) => {
  const events = {
    [MarketEvent.NEW]: {text: 'Listed', color: '#555'},
    [MarketEvent.CANCEL]: {text: 'Delisted', color: '#999'},
    [MarketEvent.MODIFY]: {text: 'Modified', color: '#777'},
    [MarketEvent.BUY]: {text: 'Bought', color: 'green'},
    [MarketEvent.SELL]: {text: 'Sold', color: 'red'},
  };

  return (
    <Text
      style={{color: events[marketEvent]?.color || '#000', fontWeight: '600'}}>
      {events[marketEvent]?.text || 'Unknown'}
    </Text>
  );
};

export default ActivityEventText;
