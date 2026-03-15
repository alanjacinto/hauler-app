import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import { ROLES } from '../utils/constants';

const ROLE_COPY = {
  [ROLES.MANAGER]: {
    title: 'Contractor Manager',
    description:
      'Own the company profile, add fleet assets, report truck issues, and control workshop access.',
  },
  [ROLES.SECRETARY]: {
    title: 'Workshop Coordinator',
    description:
      'Run workshop operations, manage company links, assign jobs, and organize the repair queue.',
  },
  [ROLES.MECHANIC]: {
    title: 'Mechanic',
    description:
      'Handle active workshop jobs, track the repair schedule, and update execution progress.',
  },
};

export default function SessionSelectionScreen() {
  const { companies, loginAsUser, resetDemoData, sessionUsers, workshops } = useAppData();

  const companiesById = companies.reduce((accumulator, company) => {
    accumulator[company.id] = company;
    return accumulator;
  }, {});

  const workshopsById = workshops.reduce((accumulator, workshop) => {
    accumulator[workshop.id] = workshop;
    return accumulator;
  }, {});

  const confirmReset = () => {
    Alert.alert(
      'Reset demo data?',
      'This clears saved local progress and returns the app to the original seeded beta state.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetDemoData();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Hauler Private Beta</Text>
          <Text style={styles.title}>Choose a demo session</Text>
          <Text style={styles.subtitle}>
            This build now restores local progress, keeps workshop links private, and carries the
            organization setup state forward between launches.
          </Text>
        </View>

        <View style={styles.heroMeta}>
          <View style={styles.infoChip}>
            <Text style={styles.infoChipText}>Persistent local beta state</Text>
          </View>
          <Pressable style={styles.resetButton} onPress={confirmReset}>
            <Text style={styles.resetButtonText}>Reset demo data</Text>
          </Pressable>
        </View>

        <View style={styles.cards}>
          {sessionUsers.map((user) => {
            const roleCopy = ROLE_COPY[user.role];
            const company = user.companyId ? companiesById[user.companyId] : null;
            const workshop = user.workshopId ? workshopsById[user.workshopId] : null;
            const setup = company?.setup || workshop?.setup || null;
            const orgMeta = company
              ? `${company.name} • ${company.trucks.length} trucks`
              : workshop
                ? `${workshop.name} • ${workshop.linkedCompanies.length} linked companies`
                : 'No organization assigned';

            return (
              <Pressable
                key={user.id}
                style={styles.card}
                onPress={() => loginAsUser(user.id)}
              >
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.roleTitle}>{roleCopy.title}</Text>
                    <Text style={styles.userName}>{user.name}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{user.role}</Text>
                  </View>
                </View>

                <Text style={styles.cardDescription}>{roleCopy.description}</Text>

                <View style={styles.orgCard}>
                  <Text style={styles.orgLabel}>Organization context</Text>
                  <Text style={styles.orgText}>{orgMeta}</Text>
                </View>

                {setup ? (
                  <View style={styles.setupCard}>
                    <View style={styles.setupTop}>
                      <Text style={styles.setupLabel}>
                        Setup {setup.completedCount}/{setup.totalCount}
                      </Text>
                      <Text
                        style={[
                          styles.setupState,
                          setup.isComplete ? styles.setupStateReady : styles.setupStatePending,
                        ]}
                      >
                        {setup.isComplete ? 'Ready' : 'Needs setup'}
                      </Text>
                    </View>
                    <Text style={styles.setupCopy}>{setup.nextStep}</Text>
                  </View>
                ) : null}

                <View style={styles.footerRow}>
                  <Text style={styles.footerLabel}>
                    {company ? 'Company-owned fleet session' : 'Workshop operational session'}
                  </Text>
                  <Text style={styles.footerAction}>Enter</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 22,
    paddingBottom: 32,
  },
  hero: {
    gap: 10,
    marginTop: 8,
  },
  eyebrow: {
    color: colors.info,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  heroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  infoChip: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoChipText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resetButtonText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '800',
  },
  cards: {
    gap: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 18,
    gap: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  roleTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  userName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  cardDescription: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  orgCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: 14,
    gap: 5,
  },
  orgLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orgText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  setupCard: {
    backgroundColor: colors.overlay,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  setupTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  setupLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  setupState: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setupStateReady: {
    color: colors.success,
  },
  setupStatePending: {
    color: colors.warning,
  },
  setupCopy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  footerLabel: {
    color: colors.textSoft,
    fontSize: 12,
  },
  footerAction: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
