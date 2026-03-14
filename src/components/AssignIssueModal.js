import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import colors from '../theme/colors';
import { formatDateLabel } from '../utils/formatters';

function getLocalDateValue(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addDays(dateValue, daysToAdd) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const nextDate = new Date(year, month - 1, day);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return getLocalDateValue(nextDate);
}

function OptionCard({ label, description, selected, onPress }) {
  return (
    <Pressable
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onPress}
    >
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
      {description ? (
        <Text style={[styles.optionDescription, selected && styles.optionDescriptionSelected]}>
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function AssignIssueModal({
  visible,
  issue,
  mechanics,
  warehouses,
  onClose,
  onSubmit,
}) {
  const defaultScheduledDate = useMemo(() => getLocalDateValue(new Date()), []);
  const [selectedMechanicId, setSelectedMechanicId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(defaultScheduledDate);
  const [estimatedReturnDate, setEstimatedReturnDate] = useState(defaultScheduledDate);

  const scheduleDateOptions = useMemo(
    () => Array.from({ length: 5 }, (_, index) => addDays(defaultScheduledDate, index)),
    [defaultScheduledDate]
  );

  const returnDateOptions = useMemo(
    () => Array.from({ length: 4 }, (_, index) => addDays(scheduledDate, index)),
    [scheduledDate]
  );

  useEffect(() => {
    if (!issue || !visible) {
      return;
    }

    setSelectedMechanicId(mechanics[0]?.id || '');
    setSelectedWarehouseId(issue.truck?.warehouse?.id || warehouses[0]?.id || '');
    setScheduledDate(defaultScheduledDate);
    setEstimatedReturnDate(defaultScheduledDate);
  }, [defaultScheduledDate, issue, mechanics, visible, warehouses]);

  useEffect(() => {
    if (!returnDateOptions.includes(estimatedReturnDate)) {
      setEstimatedReturnDate(returnDateOptions[0]);
    }
  }, [estimatedReturnDate, returnDateOptions]);

  if (!issue) {
    return null;
  }

  const canSubmit =
    Boolean(selectedMechanicId) &&
    Boolean(selectedWarehouseId) &&
    Boolean(scheduledDate) &&
    Boolean(estimatedReturnDate);

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      assignedMechanicId: selectedMechanicId,
      warehouseId: selectedWarehouseId,
      scheduledDate,
      estimatedReturnDate,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Assign issue</Text>
              <Text style={styles.subtitle}>
                Truck {issue.truck?.unitNumber} enters the workshop workflow once you confirm.
              </Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Issue</Text>
              <Text style={styles.summaryText}>{issue.description}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mechanic</Text>
              <View style={styles.optionGrid}>
                {mechanics.map((mechanic) => (
                  <OptionCard
                    key={mechanic.id}
                    label={mechanic.name}
                    description="Workshop mechanic"
                    selected={selectedMechanicId === mechanic.id}
                    onPress={() => setSelectedMechanicId(mechanic.id)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Warehouse</Text>
              <View style={styles.optionGrid}>
                {warehouses.map((warehouse) => (
                  <OptionCard
                    key={warehouse.id}
                    label={warehouse.name}
                    description={warehouse.address}
                    selected={selectedWarehouseId === warehouse.id}
                    onPress={() => setSelectedWarehouseId(warehouse.id)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scheduled date</Text>
              <View style={styles.optionGrid}>
                {scheduleDateOptions.map((dateValue) => (
                  <OptionCard
                    key={dateValue}
                    label={formatDateLabel(dateValue)}
                    selected={scheduledDate === dateValue}
                    onPress={() => setScheduledDate(dateValue)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estimated return</Text>
              <View style={styles.optionGrid}>
                {returnDateOptions.map((dateValue) => (
                  <OptionCard
                    key={dateValue}
                    label={formatDateLabel(dateValue)}
                    selected={estimatedReturnDate === dateValue}
                    onPress={() => setEstimatedReturnDate(dateValue)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.primaryButtonText}>Create job</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 20, 0.82)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: 18,
    paddingBottom: 12,
  },
  summaryCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  summaryLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  optionGrid: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 4,
  },
  optionCardSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  optionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  optionLabelSelected: {
    color: colors.text,
  },
  optionDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  optionDescriptionSelected: {
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: colors.overlay,
    fontSize: 14,
    fontWeight: '800',
  },
});
