import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import colors from '../theme/colors';
import { PRIORITY } from '../utils/constants';

const PRIORITY_OPTIONS = [
  { label: 'Urgent', value: PRIORITY.URGENT },
  { label: 'Normal', value: PRIORITY.NORMAL },
  { label: 'Low', value: PRIORITY.LOW },
];

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

export default function ReportIssueModal({
  visible,
  trucks,
  initialTruck,
  onClose,
  onSubmit,
}) {
  const [selectedTruckId, setSelectedTruckId] = useState(initialTruck?.id || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(PRIORITY.NORMAL);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSelectedTruckId(initialTruck?.id || trucks[0]?.id || '');
    setDescription('');
    setPriority(PRIORITY.NORMAL);
  }, [initialTruck, trucks, visible]);

  const selectedTruck =
    trucks.find((truck) => truck.id === selectedTruckId) || initialTruck || null;

  const canSubmit = Boolean(selectedTruckId) && description.trim().length >= 10;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      truckId: selectedTruckId,
      description: description.trim(),
      priority,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Report new issue</Text>
              <Text style={styles.subtitle}>
                Create a manager-side issue report so the workshop can pick it up and schedule work.
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Truck</Text>
              {initialTruck ? (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Selected truck</Text>
                  <Text style={styles.summaryTitle}>Truck {initialTruck.unitNumber}</Text>
                  <Text style={styles.summaryText}>
                    {initialTruck.company?.name} • {initialTruck.warehouse?.name}
                  </Text>
                </View>
              ) : (
                <View style={styles.optionGrid}>
                  {trucks.map((truck) => (
                    <OptionCard
                      key={truck.id}
                      label={`Truck ${truck.unitNumber}`}
                      description={`${truck.company?.name} • ${truck.warehouse?.name}`}
                      selected={selectedTruckId === truck.id}
                      onPress={() => setSelectedTruckId(truck.id)}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Issue description</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe the truck problem the driver or manager observed"
                  placeholderTextColor={colors.textSoft}
                  multiline
                  textAlignVertical="top"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.optionGrid}>
                {PRIORITY_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={priority === option.value}
                    onPress={() => setPriority(option.value)}
                  />
                ))}
              </View>
            </View>

            {selectedTruck ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>What happens next</Text>
                <Text style={styles.summaryText}>
                  The issue will be created as REPORTED, the truck will move to Out of Service, and
                  the workshop will see it in the Issues queue.
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
              disabled={!canSubmit}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryButtonText}>Submit issue</Text>
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
  inputWrap: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  input: {
    minHeight: 120,
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
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
  summaryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  summaryText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
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
