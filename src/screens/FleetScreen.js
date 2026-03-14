import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import FilterChips from '../components/FilterChips';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import SummaryCard from '../components/SummaryCard';
import TruckCard from '../components/TruckCard';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import { TRUCK_STATUS_OPTIONS } from '../utils/constants';

export default function FleetScreen({ navigation }) {
  const { fleetSummary, trucks } = useAppData();
  const [query, setQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredTrucks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return trucks
      .filter((truck) => {
        const matchesQuery =
          truck.unitNumber.toLowerCase().includes(normalizedQuery) ||
          truck.vin.toLowerCase().includes(normalizedQuery) ||
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
            <ScreenHeader
              title="Fleet"
              subtitle="One place to see which trucks need immediate attention, who is working them, and when they are expected back."
            />

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
                placeholder="Search by truck, VIN, company, or warehouse"
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
            icon="search-outline"
            title="No trucks found"
            description="Try another truck number, VIN, warehouse, or status filter."
          />
        }
        renderItem={({ item }) => (
          <TruckCard
            truck={item}
            onPress={() => navigation.navigate('TruckDetail', { truckId: item.id })}
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
