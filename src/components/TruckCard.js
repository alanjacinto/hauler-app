import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';
import {
  formatDateLabel,
  getFuelTypeLabel,
  getJobStatusLabel,
  getIssueStatusLabel,
} from '../utils/formatters';
import StatusBadge from './StatusBadge';

function MetaStat({ label, value }) {
  return (
    <View style={styles.metaStat}>
      <Text style={styles.metaStatLabel}>{label}</Text>
      <Text style={styles.metaStatValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function TruckCard({
  truck,
  onPress,
  onQuickAction,
  quickActionLabel,
  showQuickAction = false,
}) {
  const activeIssue = truck.activeIssue;
  const activeJob = truck.activeJob;
  const needsAttention = Boolean(activeIssue || activeJob);

  return (
    <Pressable style={[styles.card, needsAttention && styles.cardAttention]} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text style={styles.unit}>Truck {truck.unitNumber}</Text>
          <Text style={styles.subtext}>
            {truck.make} • {truck.licensePlate}
          </Text>
          <Text style={styles.subtextSecondary}>
            {truck.company?.name} • {truck.warehouse?.name}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
      </View>

      <View style={styles.statusRow}>
        <StatusBadge status={truck.status} />
        {activeIssue ? <StatusBadge status={activeIssue.status} /> : null}
        {activeJob ? <StatusBadge status={activeJob.status} /> : null}
      </View>

      <View style={styles.metaGrid}>
        <MetaStat label="Fuel" value={getFuelTypeLabel(truck.fuelType)} />
        <MetaStat label="VIN" value={truck.vin} />
        <MetaStat label="Mechanic" value={activeJob?.mechanic?.name || 'Not assigned'} />
      </View>

      {activeIssue ? (
        <View style={styles.signalBox}>
          <View style={styles.signalHeader}>
            <Text style={styles.signalTitle}>Active issue</Text>
            <Text style={styles.signalMeta}>{getIssueStatusLabel(activeIssue.status)}</Text>
          </View>
          <Text style={styles.signalText} numberOfLines={2}>
            {activeIssue.description}
          </Text>
        </View>
      ) : (
        <View style={[styles.signalBox, styles.healthyBox]}>
          <Text style={styles.healthyTitle}>Healthy status</Text>
          <Text style={styles.healthyText}>No active issue blocking service right now.</Text>
        </View>
      )}

      {activeJob ? (
        <View style={styles.jobPanel}>
          <View style={styles.jobPanelHeader}>
            <Text style={styles.jobPanelTitle}>Current job</Text>
            <Text style={styles.jobPanelMeta}>{getJobStatusLabel(activeJob.status)}</Text>
          </View>
          <View style={styles.jobPanelGrid}>
            <MetaStat label="Warehouse" value={activeJob.warehouse?.name || 'Unassigned'} />
            <MetaStat label="Return ETA" value={formatDateLabel(activeJob.estimatedReturnDate)} />
          </View>
        </View>
      ) : null}

      {showQuickAction ? (
        <Pressable style={styles.quickActionButton} onPress={onQuickAction}>
          <Text style={styles.quickActionText}>{quickActionLabel}</Text>
        </Pressable>
      ) : null}
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
    gap: 14,
  },
  cardAttention: {
    borderColor: colors.warning,
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
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  subtextSecondary: {
    color: colors.textMuted,
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metaStat: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  metaStatLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaStatValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  signalBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  signalTitle: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signalMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  signalText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  healthyBox: {
    backgroundColor: colors.successMuted,
  },
  healthyTitle: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthyText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  jobPanel: {
    backgroundColor: colors.chip,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  jobPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  jobPanelTitle: {
    color: colors.info,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobPanelMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  jobPanelGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickActionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
});
