import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { JOB_STATUS } from '../utils/constants';
import colors from '../theme/colors';
import { formatDateLabel } from '../utils/formatters';
import StatusBadge from './StatusBadge';

export default function ScheduleCard({
  job,
  onPress,
  onPressWorkflow,
  showWorkflowAction = true,
}) {
  const canRunWorkflow =
    showWorkflowAction &&
    (job.status === JOB_STATUS.SCHEDULED || job.status === JOB_STATUS.IN_PROGRESS);

  return (
    <View style={styles.card}>
      <Pressable style={styles.cardMain} onPress={onPress}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <Text style={styles.unit}>Truck {job.truck?.unitNumber}</Text>
            <Text style={styles.meta}>{job.warehouse?.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {job.issue?.description}
        </Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Mechanic</Text>
            <Text style={styles.metaValue}>{job.mechanic?.name}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Return ETA</Text>
            <Text style={styles.metaValue}>{formatDateLabel(job.estimatedReturnDate)}</Text>
          </View>
        </View>

        <View style={styles.badges}>
          <StatusBadge status={job.status} />
          <StatusBadge status={job.truck?.status} />
        </View>
      </Pressable>

      {canRunWorkflow ? (
        <Pressable style={styles.workflowButton} onPress={onPressWorkflow}>
          <Ionicons
            name={job.status === JOB_STATUS.SCHEDULED ? 'play-outline' : 'checkmark-circle-outline'}
            size={16}
            color={colors.text}
          />
          <Text style={styles.workflowButtonText}>
            {job.status === JOB_STATUS.SCHEDULED ? 'Start repair' : 'Complete repair'}
          </Text>
        </Pressable>
      ) : null}
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
  cardMain: {
    gap: 14,
  },
  header: {
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
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  description: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  metaLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workflowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
  },
  workflowButtonText: {
    color: colors.overlay,
    fontSize: 14,
    fontWeight: '800',
  },
});
