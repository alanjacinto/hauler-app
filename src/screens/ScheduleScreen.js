import { FlatList, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import ScheduleCard from '../components/ScheduleCard';
import ScreenHeader from '../components/ScreenHeader';
import SectionTitle from '../components/SectionTitle';
import SummaryCard from '../components/SummaryCard';
import { useAppData } from '../context/AppContext';
import { JOB_STATUS } from '../utils/constants';
import colors from '../theme/colors';
import { formatDateLabel, getLocalDateValue } from '../utils/formatters';

function groupJobsByWarehouse(jobs) {
  return jobs.reduce((accumulator, job) => {
    const warehouseName = job.warehouse?.name || 'Unassigned warehouse';
    const existingGroup = accumulator.find((group) => group.key === warehouseName);

    if (existingGroup) {
      existingGroup.jobs.push(job);
      return accumulator;
    }

    accumulator.push({
      key: warehouseName,
      label: warehouseName,
      jobs: [job],
    });

    return accumulator;
  }, []);
}

export default function ScheduleScreen({ navigation }) {
  const { completeJobWorkflow, jobs, scheduleDays, updateJobStatus } = useAppData();
  const todayValue = getLocalDateValue();

  const todaysJobs = jobs.filter((job) => job.scheduledDate === todayValue).length;
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
        renderItem={({ item }) => {
          const warehouseGroups = groupJobsByWarehouse(item.jobs);

          return (
            <View style={styles.daySection}>
              <SectionTitle title={formatDateLabel(item.date)} />
              <View style={styles.dayMeta}>
                <Text style={styles.dayMetaText}>{item.jobs.length} jobs planned</Text>
              </View>

              <View style={styles.warehouseGroups}>
                {warehouseGroups.map((group) => (
                  <View key={`${item.date}-${group.key}`} style={styles.warehouseSection}>
                    <View style={styles.warehouseHeader}>
                      <Text style={styles.warehouseTitle}>{group.label}</Text>
                      <Text style={styles.warehouseMeta}>{group.jobs.length} jobs</Text>
                    </View>

                    <View style={styles.dayCards}>
                      {group.jobs.map((job) => (
                        <ScheduleCard
                          key={job.id}
                          job={job}
                          onPress={() => navigation.navigate('TruckDetail', { truckId: job.truck?.id })}
                          onPressWorkflow={() => {
                            if (job.status === JOB_STATUS.SCHEDULED) {
                              updateJobStatus(job.id, JOB_STATUS.IN_PROGRESS);
                              return;
                            }

                            if (job.status === JOB_STATUS.IN_PROGRESS) {
                              completeJobWorkflow(job.id);
                            }
                          }}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        }}
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
  warehouseGroups: {
    gap: 16,
  },
  warehouseSection: {
    gap: 10,
  },
  warehouseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  warehouseTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  warehouseMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  dayCards: {
    gap: 12,
  },
});
