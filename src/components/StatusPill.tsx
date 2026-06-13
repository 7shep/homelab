import { StyleSheet, Text, View } from 'react-native';
import type { HealthState } from '../../shared/types';
import { monoStack, statusStyles } from '../theme';

export function StatusDot({ status }: { status: HealthState }) {
  return <View style={[styles.statusDot, { backgroundColor: statusStyles[status].color }]} />;
}

export function StatusPill({ status }: { status: HealthState }) {
  const style = statusStyles[status];

  return (
    <View
      style={[
        styles.statusPill,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor
        }
      ]}
    >
      <Text style={[styles.statusText, { color: style.color }]}>{style.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusPill: {
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    minWidth: 84,
    paddingBlock: 5,
    paddingInline: 10
  },
  statusText: {
    fontFamily: monoStack,
    fontSize: 12,
    fontWeight: '900'
  },
  statusDot: {
    borderRadius: 999,
    height: 10,
    width: 10
  }
});
