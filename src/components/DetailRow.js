import { StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function DetailRow({ label, value, children }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children || <Text style={styles.value}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
  },
  label: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
