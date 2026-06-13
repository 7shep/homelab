import { StyleSheet, Text, View } from 'react-native';
import { colors, sansStack } from '../theme';

export function Placeholder({ title }: { title: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>This area is coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 30, gap: 8 },
  title: { color: colors.text, fontFamily: sansStack, fontSize: 24, fontWeight: '800' },
  body: { color: colors.muted, fontFamily: sansStack, fontSize: 14 }
});
