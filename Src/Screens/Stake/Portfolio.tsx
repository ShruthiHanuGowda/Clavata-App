import React from 'react';
import {View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {DText} from '../../components/DText';

interface PortfolioProps {
  // Add any props if needed in the future
}

const Portfolio: React.FC<PortfolioProps> = ({}) => {
  return (
    <LinearGradient
      colors={['#dcf2f1', '#FFFFFF']}
      start={{x: 0, y: 1}}
      end={{x: 1, y: 1}}
      useAngle={true}
      angle={30}
      locations={[0, 0.35, 0.6]}>
      <View style={styles.portfolio}>
        <View style={styles.section}>
          <DText fontStyle="fontBold" style={styles.count}>
            0
          </DText>
          <DText fontStyle="fontSemiBold" style={styles.type}>
            Total Pools
          </DText>
        </View>
        <View style={styles.section}>
          <DText fontStyle="fontBold" style={styles.count}>
            0
          </DText>
          <DText fontStyle="fontSemiBold" style={styles.type}>
            Staked Pools
          </DText>
        </View>
        <View style={styles.section}>
          <DText fontStyle="fontBold" style={styles.count}>
            0
          </DText>
          <DText fontStyle="fontSemiBold" style={styles.type}>
            Staked EACs
          </DText>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  portfolio: {
    height: 60,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginRight: 36,
  },
  count: {
    color: '#2F2F2F',
    fontSize: 14,
  },
  type: {
    color: '#2F2F2F',
    opacity: 0.4,
    fontSize: 12,
  },
});

export default Portfolio;
