import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import AssignIssueModal from '../components/AssignIssueModal';
import EmptyState from '../components/EmptyState';
import IssueCard from '../components/IssueCard';
import ScreenHeader from '../components/ScreenHeader';
import SummaryCard from '../components/SummaryCard';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import { ISSUE_STATUS, PRIORITY } from '../utils/constants';

export default function IssuesScreen({ navigation }) {
  const { assignIssueToJob, issues, mechanics, warehouses } = useAppData();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);

  const urgentCount = issues.filter((issue) => issue.priority === PRIORITY.URGENT).length;
  const reportedCount = issues.filter((issue) => issue.status === ISSUE_STATUS.REPORTED).length;
  const assignedCount = issues.filter((issue) => issue.status === ISSUE_STATUS.ASSIGNED).length;

  const openAssignModal = (issue) => {
    setSelectedIssue(issue);
    setIsAssignModalVisible(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalVisible(false);
    setSelectedIssue(null);
  };

  const handleAssignIssue = (assignmentData) => {
    if (!selectedIssue) {
      return;
    }

    assignIssueToJob({
      issueId: selectedIssue.id,
      ...assignmentData,
    });

    closeAssignModal();
  };

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
              subtitle="Managers report problems here first. The workshop then assigns work and moves the repair through schedule and execution."
            />

            <View style={styles.summaryRow}>
              <SummaryCard label="Urgent issues" value={urgentCount} tone="danger" />
              <SummaryCard label="Reported" value={reportedCount} tone="warning" />
              <SummaryCard label="Assigned" value={assignedCount} tone="neutral" />
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
        renderItem={({ item }) => {
          const canAssign = item.status === ISSUE_STATUS.REPORTED;
          const canViewSchedule = item.status !== ISSUE_STATUS.REPORTED && Boolean(item.currentJob);

          return (
            <IssueCard
              issue={item}
              onPressTruck={() => navigation.navigate('TruckDetail', { truckId: item.truck?.id })}
              onPressPrimary={() => {
                if (canAssign) {
                  openAssignModal(item);
                  return;
                }

                if (canViewSchedule) {
                  navigation.navigate('Schedule');
                }
              }}
              primaryLabel={canAssign ? 'Assign' : 'View schedule'}
              showPrimaryAction={canAssign || canViewSchedule}
            />
          );
        }}
      />

      <AssignIssueModal
        visible={isAssignModalVisible}
        issue={selectedIssue}
        mechanics={mechanics}
        warehouses={warehouses}
        onClose={closeAssignModal}
        onSubmit={handleAssignIssue}
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
