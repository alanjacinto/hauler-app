import { StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function SummaryCard({ label, value, tone = 'neutral' }) {
  const toneStyles = {
    neutral: {
      valueColor: colors.text,
      accentColor: colors.info,
    },
    danger: {
      valueColor: colors.danger,
      accentColor: colors.danger,
    },
    warning: {
      valueColor: colors.warning,
      accentColor: colors.warning,
    },
    success: {
      valueColor: colors.success,
      accentColor: colors.success,
    },
  };

  const currentTone = toneStyles[tone] || toneStyles.neutral;

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: currentTone.accentColor }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: currentTone.valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    minHeight: 96,
  },
  accent: {
    width: 28,
    height: 4,
    borderRadius: 999,
    marginBottom: 14,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 10,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
});
