import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';
import StatusBadge from './StatusBadge';

export default function TruckCard({ truck, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text style={styles.unit}>Truck {truck.unitNumber}</Text>
          <Text style={styles.subtext}>{truck.company?.name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>VIN</Text>
        <Text style={styles.metaValue}>{truck.vin}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Warehouse</Text>
        <Text style={styles.metaValue}>{truck.warehouse?.name}</Text>
      </View>

      {truck.latestIssue ? (
        <View style={styles.alertBox}>
          <Text style={styles.alertLabel}>Current issue</Text>
          <Text style={styles.alertText} numberOfLines={2}>
            {truck.latestIssue.description}
          </Text>
        </View>
      ) : null}

      <StatusBadge status={truck.status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  identity: {
    flex: 1,
    gap: 4,
  },
  unit: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  subtext: {
    color: colors.textMuted,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  metaLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    textAlign: 'right',
  },
  alertBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  alertLabel: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
