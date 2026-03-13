import { FlatList, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import ScheduleCard from '../components/ScheduleCard';
import ScreenHeader from '../components/ScreenHeader';
import SectionTitle from '../components/SectionTitle';
import SummaryCard from '../components/SummaryCard';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import { JOB_STATUS } from '../utils/constants';
import { formatDateLabel } from '../utils/formatters';

export default function ScheduleScreen({ navigation }) {
  const { jobs, scheduleDays } = useAppData();

  const todaysJobs = jobs.filter((job) => job.scheduledDate === '2026-03-13').length;
  const activeJobs = jobs.filter((job) => job.status === JOB_STATUS.IN_PROGRESS).length;
  const scheduledJobs = jobs.filter((job) => job.status === JOB_STATUS.SCHEDULED).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={scheduleDays}
        keyExtractor={(item) => item.date}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <ScreenHeader
              title="Schedule"
              subtitle="Daily workshop planning organized by visit date so managers and mechanics know what gets worked on next."
            />

            <View style={styles.summaryRow}>
              <SummaryCard label="Today" value={todaysJobs} tone="neutral" />
              <SummaryCard label="In progress" value={activeJobs} tone="warning" />
              <SummaryCard label="Upcoming" value={scheduledJobs} tone="success" />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No jobs scheduled"
            description="Once the workshop starts assigning work, the repair schedule will appear here."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.daySection}>
            <SectionTitle title={formatDateLabel(item.date)} />
            <View style={styles.dayMeta}>
              <Text style={styles.dayMetaText}>{item.jobs.length} jobs planned</Text>
            </View>

            <View style={styles.dayCards}>
              {item.jobs.map((job) => (
                <ScheduleCard
                  key={job.id}
                  job={job}
                  onPress={() => navigation.navigate('TruckDetail', { truckId: job.truck?.id })}
                />
              ))}
            </View>
          </View>
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
  daySection: {
    marginBottom: 22,
  },
  dayMeta: {
    marginBottom: 12,
  },
  dayMetaText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  dayCards: {
    gap: 12,
  },
});
