import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import FilterChips from '../components/FilterChips';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import SummaryCard from '../components/SummaryCard';
import TruckCard from '../components/TruckCard';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import { TRUCK_STATUS, TRUCK_STATUS_OPTIONS } from '../utils/constants';

export default function FleetScreen({ navigation }) {
  const { trucks } = useAppData();
  const [query, setQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredTrucks = useMemo(() => {
    return trucks.filter((truck) => {
      const matchesQuery =
        truck.unitNumber.toLowerCase().includes(query.trim().toLowerCase()) ||
        truck.vin.toLowerCase().includes(query.trim().toLowerCase());

      const matchesStatus = selectedStatus === 'ALL' || truck.status === selectedStatus;

      return matchesQuery && matchesStatus;
    });
  }, [query, selectedStatus, trucks]);

  const outOfServiceCount = trucks.filter(
    (truck) => truck.status === TRUCK_STATUS.OUT_OF_SERVICE
  ).length;
  const inRepairCount = trucks.filter((truck) => truck.status === TRUCK_STATUS.IN_REPAIR).length;
  const backInServiceCount = trucks.filter(
    (truck) => truck.status === TRUCK_STATUS.BACK_IN_SERVICE
  ).length;

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
              subtitle="Search trucks, monitor service status, and drill into the active issue or repair plan."
            />

            <View style={styles.summaryRow}>
              <SummaryCard label="Out of service" value={outOfServiceCount} tone="danger" />
              <SummaryCard label="In repair" value={inRepairCount} tone="warning" />
              <SummaryCard label="Back in service" value={backInServiceCount} tone="success" />
            </View>

            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search by truck number or VIN"
            />

            <FilterChips
              options={TRUCK_STATUS_OPTIONS}
              selectedValue={selectedStatus}
              onSelect={setSelectedStatus}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No trucks found"
            description="Try another truck number, VIN, or status filter."
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
    gap: 12,
  },
  headerBlock: {
    gap: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
