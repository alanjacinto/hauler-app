import { ScrollView, StyleSheet, Text, View } from 'react-native';
import DetailRow from '../components/DetailRow';
import ScreenHeader from '../components/ScreenHeader';
import SectionTitle from '../components/SectionTitle';
import StatusBadge from '../components/StatusBadge';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import { formatDateLabel, formatDateTime } from '../utils/formatters';

function DetailCard({ children }) {
  return <View style={styles.card}>{children}</View>;
}

export default function TruckDetailScreen({ route }) {
  const { getTruckById, getCurrentIssueForTruck, getCurrentJobForTruck } = useAppData();
  const truckId = route.params?.truckId;
  const truck = getTruckById(truckId);

  if (!truck) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Truck data not found.</Text>
      </View>
    );
  }

  const currentIssue = getCurrentIssueForTruck(truck.id);
  const currentJob = getCurrentJobForTruck(truck.id);

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
        {currentIssue ? (
          <View style={styles.stack}>
            <View style={styles.badgeRow}>
              <StatusBadge status={currentIssue.priority} />
              <StatusBadge status={currentIssue.status} />
            </View>
            <DetailRow label="Reported by" value={currentIssue.reporter?.name} />
            <DetailRow label="Reported at" value={formatDateTime(currentIssue.createdAt)} />
            <DetailRow label="Description" value={currentIssue.description} />
          </View>
        ) : (
          <Text style={styles.emptyCardText}>No active issue recorded for this truck.</Text>
        )}
      </DetailCard>

      <DetailCard>
        <SectionTitle title="Current job" />
        {currentJob ? (
          <View style={styles.stack}>
            <View style={styles.badgeRow}>
              <StatusBadge status={currentJob.status} />
            </View>
            <DetailRow label="Mechanic" value={currentJob.mechanic?.name} />
            <DetailRow label="Warehouse visit" value={currentJob.warehouse?.name} />
            <DetailRow label="Scheduled date" value={formatDateLabel(currentJob.scheduledDate)} />
            <DetailRow
              label="Estimated return"
              value={formatDateLabel(currentJob.estimatedReturnDate)}
            />
          </View>
        ) : (
          <Text style={styles.emptyCardText}>No scheduled job linked to this truck yet.</Text>
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
});
