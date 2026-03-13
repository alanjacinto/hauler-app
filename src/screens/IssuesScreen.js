import { FlatList, StyleSheet, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import IssueCard from '../components/IssueCard';
import ScreenHeader from '../components/ScreenHeader';
import SummaryCard from '../components/SummaryCard';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import { JOB_STATUS, PRIORITY } from '../utils/constants';

export default function IssuesScreen({ navigation }) {
  const { issues } = useAppData();

  const urgentCount = issues.filter((issue) => issue.priority === PRIORITY.URGENT).length;
  const scheduledCount = issues.filter((issue) => issue.status === JOB_STATUS.SCHEDULED).length;
  const inProgressCount = issues.filter((issue) => issue.status === JOB_STATUS.IN_PROGRESS).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <ScreenHeader
              title="Issues"
              subtitle="Reported problems flow into one queue so the workshop can schedule, assign, and follow every truck."
            />

            <View style={styles.summaryRow}>
              <SummaryCard label="Urgent issues" value={urgentCount} tone="danger" />
              <SummaryCard label="Scheduled" value={scheduledCount} tone="neutral" />
              <SummaryCard label="In progress" value={inProgressCount} tone="warning" />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="alert-circle-outline"
            title="No reported issues"
            description="Once managers report problems, the workshop queue will appear here."
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <IssueCard
            issue={item}
            onPressTruck={() => navigation.navigate('TruckDetail', { truckId: item.truck?.id })}
            onPressSchedule={() => navigation.navigate('Schedule')}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
  },
  headerBlock: {
    gap: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  separator: {
    height: 12,
  },
});
