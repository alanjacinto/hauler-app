import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import { ROLES } from '../utils/constants';

const ROLE_COPY = {
  [ROLES.MANAGER]: {
    title: 'Fleet Manager',
    description: 'Report truck issues, track fleet health, and monitor repair progress.',
  },
  [ROLES.SECRETARY]: {
    title: 'Workshop Coordinator',
    description: 'Triage new issues, assign mechanics, and organize the repair queue.',
  },
  [ROLES.MECHANIC]: {
    title: 'Mechanic',
    description: 'See today’s jobs, start repairs, and complete work in the field.',
  },
};

export default function SessionSelectionScreen() {
  const { loginAsUser, sessionUsers } = useAppData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Hauler MVP</Text>
          <Text style={styles.title}>Choose a demo session</Text>
          <Text style={styles.subtitle}>
            Switch between manager and workshop roles to show the full end-to-end operational flow.
          </Text>
        </View>

        <View style={styles.cards}>
          {sessionUsers.map((user) => {
            const roleCopy = ROLE_COPY[user.role];

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

                <View style={styles.footerRow}>
                  <Text style={styles.footerLabel}>
                    {user.companyId ? 'Company scoped session' : 'Workshop operational session'}
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
