import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import FilterChips from '../components/FilterChips';
import ScheduleCard from '../components/ScheduleCard';
import ScreenHeader from '../components/ScreenHeader';
import SectionTitle from '../components/SectionTitle';
import SummaryCard from '../components/SummaryCard';
import { useAppData } from '../context/AppContext';
import { JOB_STATUS } from '../utils/constants';
import colors from '../theme/colors';
import { formatDateLabel, getLocalDateValue } from '../utils/formatters';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Scheduled', value: JOB_STATUS.SCHEDULED },
  { label: 'In Progress', value: JOB_STATUS.IN_PROGRESS },
  { label: 'Done', value: JOB_STATUS.DONE },
];

function groupJobsByDateAndWarehouse(jobs) {
  return jobs.reduce((accumulator, job) => {
    const existingDay = accumulator.find((item) => item.date === job.scheduledDate);
    const warehouseName = job.warehouse?.name || 'Unassigned warehouse';

    if (existingDay) {
      const existingWarehouse = existingDay.warehouses.find(
        (warehouse) => warehouse.key === warehouseName
      );

      if (existingWarehouse) {
        existingWarehouse.jobs.push(job);
      } else {
        existingDay.warehouses.push({
          key: warehouseName,
          label: warehouseName,
          jobs: [job],
        });
      }

      existingDay.jobs.push(job);
      return accumulator;
    }

    accumulator.push({
      date: job.scheduledDate,
      jobs: [job],
      warehouses: [
        {
          key: warehouseName,
          label: warehouseName,
          jobs: [job],
        },
      ],
    });

    return accumulator;
  }, []);
}

export default function ScheduleScreen({ navigation }) {
  const {
    completeJobWorkflow,
    currentUser,
    isWorkshopUser,
    jobs,
    updateJobStatus,
  } = useAppData();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [mechanicFilter, setMechanicFilter] = useState('ALL');
  const todayValue = getLocalDateValue();

  const warehouseOptions = useMemo(() => {
    const uniqueWarehouses = [...new Set(jobs.map((job) => job.warehouse?.name).filter(Boolean))];

    return [{ label: 'All warehouses', value: 'ALL' }].concat(
      uniqueWarehouses.map((warehouse) => ({
        label: warehouse,
        value: warehouse,
      }))
    );
  }, [jobs]);

  const mechanicOptions = useMemo(() => {
    const uniqueMechanics = [...new Set(jobs.map((job) => job.mechanic?.name).filter(Boolean))];

    return [{ label: 'All mechanics', value: 'ALL' }].concat(
      uniqueMechanics.map((mechanic) => ({
        label: mechanic,
        value: mechanic,
      }))
    );
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
      const matchesWarehouse =
        warehouseFilter === 'ALL' || job.warehouse?.name === warehouseFilter;
      const matchesMechanic =
        mechanicFilter === 'ALL' || job.mechanic?.name === mechanicFilter;

      return matchesStatus && matchesWarehouse && matchesMechanic;
    });
  }, [jobs, mechanicFilter, statusFilter, warehouseFilter]);

  const scheduleDays = useMemo(
    () => groupJobsByDateAndWarehouse(filteredJobs),
    [filteredJobs]
  );

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
              subtitle={`Logged in as ${currentUser?.name}. Manage today’s queue, track repairs in progress, and close completed work.`}
            />

            <View style={styles.summaryRow}>
              <SummaryCard label="Today" value={todaysJobs} tone="neutral" />
              <SummaryCard label="In progress" value={activeJobs} tone="warning" />
              <SummaryCard label="Upcoming" value={scheduledJobs} tone="success" />
            </View>

            <View style={styles.filterPanel}>
              <FilterChips
                options={STATUS_FILTERS}
                selectedValue={statusFilter}
                onSelect={setStatusFilter}
              />
              <FilterChips
                options={warehouseOptions}
                selectedValue={warehouseFilter}
                onSelect={setWarehouseFilter}
              />
              <FilterChips
                options={mechanicOptions}
                selectedValue={mechanicFilter}
                onSelect={setMechanicFilter}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No jobs match this view"
            description="Try clearing one of the filters to bring scheduled work back into view."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.daySection}>
            <SectionTitle title={formatDateLabel(item.date)} />
            <View style={styles.dayMeta}>
              <Text style={styles.dayMetaText}>{item.jobs.length} jobs planned</Text>
            </View>

            <View style={styles.warehouseGroups}>
              {item.warehouses.map((group) => (
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
                        onPress={() =>
                          navigation.navigate('TruckDetail', { truckId: job.truck?.id })
                        }
                        showWorkflowAction={isWorkshopUser}
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
  filterPanel: {
    gap: 12,
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
