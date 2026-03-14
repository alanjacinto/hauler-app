import { ScrollView, StyleSheet, Text, View } from 'react-native';
import DetailRow from '../components/DetailRow';
import ScreenHeader from '../components/ScreenHeader';
import SectionTitle from '../components/SectionTitle';
import StatusBadge from '../components/StatusBadge';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import {
  formatDateLabel,
  formatDateTime,
  getJobStatusLabel,
  getIssueStatusLabel,
} from '../utils/formatters';
import { TRUCK_STATUS } from '../utils/constants';

function DetailCard({ children, tone = 'default' }) {
  return (
    <View
      style={[
        styles.card,
        tone === 'healthy' && styles.healthyCard,
        tone === 'attention' && styles.attentionCard,
      ]}
    >
      {children}
    </View>
  );
}

function TimelineItem({ item }) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineDot} />
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>{item.title}</Text>
          <Text style={styles.timelineDate}>
            {item.occurredAt?.includes('T')
              ? formatDateTime(item.occurredAt)
              : formatDateLabel(item.occurredAt)}
          </Text>
        </View>
        <Text style={styles.timelineDescription}>{item.description}</Text>
      </View>
    </View>
  );
}

function HistoryItem({ title, description, meta, badges }) {
  return (
    <View style={styles.historyItem}>
      <View style={styles.historyTop}>
        <Text style={styles.historyTitle}>{title}</Text>
        <Text style={styles.historyMeta}>{meta}</Text>
      </View>
      <Text style={styles.historyDescription} numberOfLines={2}>
        {description}
      </Text>
      <View style={styles.historyBadges}>{badges}</View>
    </View>
  );
}

export default function TruckDetailScreen({ route }) {
  const {
    getActiveIssueForTruck,
    getActiveJobForTruck,
    getRecentIssuesForTruck,
    getRecentJobsForTruck,
    getTruckActivity,
    getTruckById,
  } = useAppData();
  const truckId = route.params?.truckId;
  const truck = getTruckById(truckId);

  if (!truck) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Truck data not found.</Text>
      </View>
    );
  }

  const activeIssue = getActiveIssueForTruck(truck.id);
  const activeJob = getActiveJobForTruck(truck.id);
  const recentIssues = getRecentIssuesForTruck(truck.id);
  const recentJobs = getRecentJobsForTruck(truck.id);
  const activity = getTruckActivity(truck.id).slice(0, 6);

  const overviewTone =
    truck.status === TRUCK_STATUS.BACK_IN_SERVICE && !activeIssue && !activeJob
      ? 'healthy'
      : 'attention';

  const overviewTitle =
    truck.status === TRUCK_STATUS.BACK_IN_SERVICE && !activeIssue && !activeJob
      ? 'Truck is healthy and available'
      : 'Truck needs operational attention';

  const overviewCopy =
    truck.status === TRUCK_STATUS.BACK_IN_SERVICE && !activeIssue && !activeJob
      ? 'No active issue or open repair job is blocking service for this unit.'
      : activeJob
        ? `${activeJob.mechanic?.name || 'Assigned mechanic'} is handling the current repair workflow.`
        : 'An issue is active and the truck should be monitored until the workshop closes it.';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title={`Truck ${truck.unitNumber}`}
        subtitle={`${truck.company?.name} • ${truck.warehouse?.name}`}
        right={<StatusBadge status={truck.status} />}
      />

      <DetailCard tone={overviewTone}>
        <View style={styles.commandTop}>
          <Text style={styles.commandTitle}>{overviewTitle}</Text>
          <View style={styles.commandBadges}>
            <StatusBadge status={truck.status} />
            {activeIssue ? <StatusBadge status={activeIssue.status} /> : null}
            {activeJob ? <StatusBadge status={activeJob.status} /> : null}
          </View>
        </View>
        <Text style={styles.commandCopy}>{overviewCopy}</Text>

        <View style={styles.commandGrid}>
          <View style={styles.commandStat}>
            <Text style={styles.commandStatLabel}>Active issue</Text>
            <Text style={styles.commandStatValue}>
              {activeIssue ? getIssueStatusLabel(activeIssue.status) : 'None'}
            </Text>
          </View>
          <View style={styles.commandStat}>
            <Text style={styles.commandStatLabel}>Active job</Text>
            <Text style={styles.commandStatValue}>
              {activeJob ? getJobStatusLabel(activeJob.status) : 'None'}
            </Text>
          </View>
          <View style={styles.commandStat}>
            <Text style={styles.commandStatLabel}>Assigned mechanic</Text>
            <Text style={styles.commandStatValue}>
              {activeJob?.mechanic?.name || 'Not assigned'}
            </Text>
          </View>
          <View style={styles.commandStat}>
            <Text style={styles.commandStatLabel}>Return ETA</Text>
            <Text style={styles.commandStatValue}>
              {activeJob ? formatDateLabel(activeJob.estimatedReturnDate) : 'Not scheduled'}
            </Text>
          </View>
        </View>
      </DetailCard>

      <DetailCard>
        <SectionTitle title="Truck profile" />
        <View style={styles.stack}>
          <DetailRow label="Unit number" value={truck.unitNumber} />
          <DetailRow label="VIN" value={truck.vin} />
          <DetailRow label="Company" value={truck.company?.name} />
          <DetailRow label="Warehouse" value={truck.warehouse?.name} />
          <DetailRow label="Warehouse address" value={truck.warehouse?.address} />
        </View>
      </DetailCard>

      <DetailCard>
        <SectionTitle title="Current issue" />
        {activeIssue ? (
          <View style={styles.stack}>
            <View style={styles.badgeRow}>
              <StatusBadge status={activeIssue.priority} />
              <StatusBadge status={activeIssue.status} />
            </View>
            <DetailRow label="Reported by" value={activeIssue.reporter?.name} />
            <DetailRow label="Reported at" value={formatDateTime(activeIssue.createdAt)} />
            <DetailRow label="Description" value={activeIssue.description} />
          </View>
        ) : (
          <Text style={styles.emptyCardText}>No active issue recorded for this truck.</Text>
        )}
      </DetailCard>

      <DetailCard>
        <SectionTitle title="Current job" />
        {activeJob ? (
          <View style={styles.stack}>
            <View style={styles.badgeRow}>
              <StatusBadge status={activeJob.status} />
            </View>
            <DetailRow label="Mechanic" value={activeJob.mechanic?.name} />
            <DetailRow label="Warehouse visit" value={activeJob.warehouse?.name} />
            <DetailRow label="Scheduled date" value={formatDateLabel(activeJob.scheduledDate)} />
            <DetailRow
              label="Estimated return"
              value={formatDateLabel(activeJob.estimatedReturnDate)}
            />
          </View>
        ) : (
          <Text style={styles.emptyCardText}>No active repair job is open for this truck.</Text>
        )}
      </DetailCard>

      <DetailCard>
        <SectionTitle title="Recent activity" />
        {activity.length ? (
          <View style={styles.timelineList}>
            {activity.map((item) => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyCardText}>No activity logged for this truck yet.</Text>
        )}
      </DetailCard>

      <DetailCard>
        <SectionTitle title="Recent issues" />
        {recentIssues.length ? (
          <View style={styles.historyList}>
            {recentIssues.map((issue) => (
              <HistoryItem
                key={issue.id}
                title={formatDateTime(issue.createdAt)}
                meta={getIssueStatusLabel(issue.status)}
                description={issue.description}
                badges={
                  <>
                    <StatusBadge status={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </>
                }
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyCardText}>No issue history recorded for this truck.</Text>
        )}
      </DetailCard>

      <DetailCard>
        <SectionTitle title="Recent jobs" />
        {recentJobs.length ? (
          <View style={styles.historyList}>
            {recentJobs.map((job) => (
              <HistoryItem
                key={job.id}
                title={formatDateLabel(job.scheduledDate)}
                meta={job.mechanic?.name || 'Unassigned'}
                description={`Estimated return ${formatDateLabel(job.estimatedReturnDate)}`}
                badges={<StatusBadge status={job.status} />}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyCardText}>No repair history recorded for this truck.</Text>
        )}
      </DetailCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 28,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  healthyCard: {
    borderColor: colors.success,
  },
  attentionCard: {
    borderColor: colors.warning,
  },
  commandTop: {
    gap: 10,
    marginBottom: 10,
  },
  commandTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  commandBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  commandCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  commandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  commandStat: {
    width: '48%',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  commandStatLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commandStatValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  stack: {
    gap: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyCardText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  timelineList: {
    gap: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timelineTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  timelineDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
  timelineDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  historyMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  historyDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  historyBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
