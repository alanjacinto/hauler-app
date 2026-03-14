import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';
import { formatDateTime, getJobStatusLabel } from '../utils/formatters';
import StatusBadge from './StatusBadge';

export default function IssueCard({
  issue,
  onPressTruck,
  onPressPrimary,
  primaryLabel,
  showPrimaryAction = true,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.unit}>Truck {issue.truck?.unitNumber}</Text>
          <Text style={styles.meta}>
            {issue.company?.name} • {issue.warehouse?.name}
          </Text>
        </View>
        <View style={styles.badges}>
          <StatusBadge status={issue.priority} />
          <StatusBadge status={issue.status} />
        </View>
      </View>

      <Text style={styles.description}>{issue.description}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Reported</Text>
        <Text style={styles.infoValue}>{formatDateTime(issue.createdAt)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Manager</Text>
        <Text style={styles.infoValue}>{issue.reporter?.name}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Workshop</Text>
        <Text style={styles.infoValue}>
          {issue.currentJob
            ? `${issue.currentJob.mechanic?.name} • ${getJobStatusLabel(issue.currentJob.status)}`
            : 'Not scheduled yet'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.secondaryButton} onPress={onPressTruck}>
          <Ionicons name="car-outline" size={16} color={colors.text} />
          <Text style={styles.secondaryText}>Truck detail</Text>
        </Pressable>

        {showPrimaryAction ? (
          <Pressable style={styles.primaryButton} onPress={onPressPrimary}>
            <Ionicons
              name={primaryLabel === 'Assign' ? 'construct-outline' : 'calendar-outline'}
              size={16}
              color={colors.text}
            />
            <Text style={styles.primaryText}>{primaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  header: {
    gap: 10,
  },
  headerCopy: {
    gap: 4,
  },
  unit: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  description: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    color: colors.textSoft,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoValue: {
    flex: 1,
    color: colors.textMuted,
    textAlign: 'right',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    paddingVertical: 12,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
  },
  primaryText: {
    color: colors.overlay,
    fontWeight: '800',
    fontSize: 13,
  },
});
