import { StyleSheet, Text, View } from 'react-native';
import { ISSUE_STATUS, JOB_STATUS, PRIORITY, TRUCK_STATUS } from '../utils/constants';
import {
  getIssueStatusLabel,
  getJobStatusLabel,
  getPriorityLabel,
  getTruckStatusLabel,
} from '../utils/formatters';
import colors from '../theme/colors';

const BADGE_CONFIG = {
  [TRUCK_STATUS.OUT_OF_SERVICE]: {
    label: getTruckStatusLabel(TRUCK_STATUS.OUT_OF_SERVICE),
    backgroundColor: colors.dangerMuted,
    borderColor: colors.danger,
    textColor: colors.danger,
  },
  [TRUCK_STATUS.IN_REPAIR]: {
    label: getTruckStatusLabel(TRUCK_STATUS.IN_REPAIR),
    backgroundColor: colors.warningMuted,
    borderColor: colors.warning,
    textColor: colors.warning,
  },
  [TRUCK_STATUS.BACK_IN_SERVICE]: {
    label: getTruckStatusLabel(TRUCK_STATUS.BACK_IN_SERVICE),
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
    textColor: colors.success,
  },
  [ISSUE_STATUS.REPORTED]: {
    label: getIssueStatusLabel(ISSUE_STATUS.REPORTED),
    backgroundColor: colors.dangerMuted,
    borderColor: colors.danger,
    textColor: colors.danger,
  },
  [ISSUE_STATUS.ASSIGNED]: {
    label: getIssueStatusLabel(ISSUE_STATUS.ASSIGNED),
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
    textColor: colors.primary,
  },
  [ISSUE_STATUS.RESOLVED]: {
    label: getIssueStatusLabel(ISSUE_STATUS.RESOLVED),
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
    textColor: colors.success,
  },
  [JOB_STATUS.SCHEDULED]: {
    label: getJobStatusLabel(JOB_STATUS.SCHEDULED),
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
    textColor: colors.primary,
  },
  [JOB_STATUS.IN_PROGRESS]: {
    label: getJobStatusLabel(JOB_STATUS.IN_PROGRESS),
    backgroundColor: colors.warningMuted,
    borderColor: colors.warning,
    textColor: colors.warning,
  },
  [JOB_STATUS.DONE]: {
    label: getJobStatusLabel(JOB_STATUS.DONE),
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
    textColor: colors.success,
  },
  [PRIORITY.URGENT]: {
    label: getPriorityLabel(PRIORITY.URGENT),
    backgroundColor: colors.dangerMuted,
    borderColor: colors.danger,
    textColor: colors.danger,
  },
  [PRIORITY.NORMAL]: {
    label: getPriorityLabel(PRIORITY.NORMAL),
    backgroundColor: colors.warningMuted,
    borderColor: colors.warning,
    textColor: colors.warning,
  },
  [PRIORITY.LOW]: {
    label: getPriorityLabel(PRIORITY.LOW),
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    textColor: colors.textMuted,
  },
};

export default function StatusBadge({ status }) {
  const current = BADGE_CONFIG[status] || {
    label: status,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    textColor: colors.text,
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: current.backgroundColor,
          borderColor: current.borderColor,
        },
      ]}
    >
      <Text style={[styles.text, { color: current.textColor }]}>{current.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
});
