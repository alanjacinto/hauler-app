import { useMemo, useState } from 'react';
import { Pressable, FlatList, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import FilterChips from '../components/FilterChips';
import ReportIssueModal from '../components/ReportIssueModal';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import SessionBar from '../components/SessionBar';
import SummaryCard from '../components/SummaryCard';
import TruckCard from '../components/TruckCard';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import { TRUCK_STATUS_OPTIONS } from '../utils/constants';

function HeaderAction({ label, onPress, primary = false }) {
  return (
    <Pressable
      style={[styles.actionButton, primary && styles.actionButtonPrimary]}
      onPress={onPress}
    >
      <Text style={[styles.actionButtonText, primary && styles.actionButtonTextPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function FleetScreen({ navigation }) {
  const { fleetSummary, isManager, reportIssue, trucks } = useAppData();
  const [query, setQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isReportIssueVisible, setIsReportIssueVisible] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);

  const filteredTrucks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return trucks
      .filter((truck) => {
        const matchesQuery =
          truck.unitNumber.toLowerCase().includes(normalizedQuery) ||
          truck.vin.toLowerCase().includes(normalizedQuery) ||
          truck.licensePlate.toLowerCase().includes(normalizedQuery) ||
          truck.make.toLowerCase().includes(normalizedQuery) ||
          truck.company?.name?.toLowerCase().includes(normalizedQuery) ||
          truck.warehouse?.name?.toLowerCase().includes(normalizedQuery);

        const matchesStatus = selectedStatus === 'ALL' || truck.status === selectedStatus;

        return matchesQuery && matchesStatus;
      })
      .sort((left, right) => {
        const leftNeedsAttention = Number(Boolean(left.activeIssue || left.activeJob));
        const rightNeedsAttention = Number(Boolean(right.activeIssue || right.activeJob));

        if (leftNeedsAttention !== rightNeedsAttention) {
          return rightNeedsAttention - leftNeedsAttention;
        }

        return left.unitNumber.localeCompare(right.unitNumber);
      });
  }, [query, selectedStatus, trucks]);

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTrucks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <SessionBar />

            <ScreenHeader
              title="Fleet"
              subtitle={
                isManager
                  ? 'Monitor company-owned fleet assets, report new issues, and keep truck setup current.'
                  : 'Inspect the linked contractor fleet while managing workshop execution and field repairs.'
              }
            />

            <View style={styles.actionRow}>
              {isManager ? (
                <>
                  <HeaderAction
                    label="Add truck"
                    onPress={() => navigation.navigate('Workspace')}
                  />
                  {trucks.length ? (
                    <HeaderAction
                      label="Report issue"
                      onPress={() => {
                        setSelectedTruck(null);
                        setIsReportIssueVisible(true);
                      }}
                      primary
                    />
                  ) : null}
                </>
              ) : null}
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryRow}>
                <SummaryCard label="Total trucks" value={fleetSummary.total} tone="neutral" />
                <SummaryCard
                  label="Needs attention"
                  value={fleetSummary.attentionNow}
                  tone="warning"
                />
              </View>
              <View style={styles.summaryRow}>
                <SummaryCard
                  label="Out of service"
                  value={fleetSummary.outOfService}
                  tone="danger"
                />
                <SummaryCard label="In repair" value={fleetSummary.inRepair} tone="warning" />
                <SummaryCard
                  label="Back in service"
                  value={fleetSummary.backInService}
                  tone="success"
                />
              </View>
            </View>

            <View style={styles.controlPanel}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Search by truck, plate, make, VIN, company, or warehouse"
              />

              <FilterChips
                options={TRUCK_STATUS_OPTIONS}
                selectedValue={selectedStatus}
                onSelect={setSelectedStatus}
              />
            </View>

            <View style={styles.resultsRow}>
              <Text style={styles.resultsText}>{filteredTrucks.length} trucks visible</Text>
              <Text style={styles.resultsHint}>Priority trucks are surfaced first</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="bus-outline"
            title={isManager ? 'No fleet trucks yet' : 'No linked fleet trucks'}
            description={
              isManager
                ? 'Set up your company fleet in the Company tab to start reporting issues and tracking repair work.'
                : 'Workshop fleet visibility only appears after a company is actively linked to this workshop.'
            }
          />
        }
        renderItem={({ item }) => (
          <TruckCard
            truck={item}
            onPress={() => navigation.navigate('TruckDetail', { truckId: item.id })}
            quickActionLabel="Report issue"
            showQuickAction={isManager && !item.activeIssue && !item.activeJob}
            onQuickAction={() => {
              setSelectedTruck(item);
              setIsReportIssueVisible(true);
            }}
          />
        )}
      />

      <ReportIssueModal
        visible={isReportIssueVisible}
        trucks={trucks}
        initialTruck={selectedTruck}
        onClose={() => setIsReportIssueVisible(false)}
        onSubmit={(payload) => {
          reportIssue(payload);
          setSelectedTruck(null);
          setIsReportIssueVisible(false);
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
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    paddingVertical: 12,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonTextPrimary: {
    color: colors.overlay,
    fontWeight: '800',
  },
  summaryGrid: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlPanel: {
    gap: 12,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  resultsText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  resultsHint: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
