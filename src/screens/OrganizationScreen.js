import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import FilterChips from '../components/FilterChips';
import FormField from '../components/FormField';
import FormSheet from '../components/FormSheet';
import ScreenHeader from '../components/ScreenHeader';
import SessionBar from '../components/SessionBar';
import StatusBadge from '../components/StatusBadge';
import SummaryCard from '../components/SummaryCard';
import { useAppData } from '../context/AppContext';
import colors from '../theme/colors';
import { FUEL_TYPES, LINK_STATUS, ROLES } from '../utils/constants';
import { getFuelTypeLabel, getLinkStatusLabel } from '../utils/formatters';

const STAFF_ROLE_OPTIONS = [
  { label: 'Mechanic', value: ROLES.MECHANIC },
  { label: 'Secretary', value: ROLES.SECRETARY },
];

const FUEL_OPTIONS = [
  { label: 'Diesel', value: FUEL_TYPES.DIESEL },
  { label: 'Electric', value: FUEL_TYPES.ELECTRIC },
  { label: 'Hybrid', value: FUEL_TYPES.HYBRID },
];

function ActionButton({ label, onPress, primary = false }) {
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

function StatCard({ label, value, tone = 'neutral' }) {
  return <SummaryCard label={label} value={value} tone={tone} />;
}

function ListCard({ title, subtitle, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function RowItem({ title, subtitle, meta, right }) {
  return (
    <View style={styles.rowItem}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rowRight}>
        {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
        {right}
      </View>
    </View>
  );
}

function SelectCard({ label, description, selected, onPress }) {
  return (
    <Pressable
      style={[styles.selectCard, selected && styles.selectCardSelected]}
      onPress={onPress}
    >
      <Text style={styles.selectLabel}>{label}</Text>
      {description ? <Text style={styles.selectDescription}>{description}</Text> : null}
    </Pressable>
  );
}

function SetupChecklist({ setup }) {
  if (!setup) {
    return null;
  }

  return (
    <View style={styles.setupChecklist}>
      {setup.checklist.map((item) => (
        <View key={item.id} style={styles.setupItem}>
          <View
            style={[
              styles.setupDot,
              item.complete ? styles.setupDotComplete : styles.setupDotPending,
            ]}
          />
          <Text
            style={[
              styles.setupItemText,
              item.complete ? styles.setupItemTextComplete : styles.setupItemTextPending,
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function OrganizationScreen() {
  const {
    addTruck,
    addWarehouse,
    addWorkshopStaff,
    availableCompaniesForInvite,
    acceptCompanyLink,
    createCompanyLinkRequest,
    currentCompany,
    currentCompanyInvitations,
    currentCompanyLinkedWorkshops,
    currentCompanySetup,
    currentCompanyTrucks,
    currentCompanyWarehouses,
    currentWorkshop,
    currentWorkshopLinkedCompanies,
    currentWorkshopLinks,
    currentWorkshopSetup,
    currentWorkshopStaff,
    isManager,
    updateCompanyProfile,
    updateWorkshopProfile,
  } = useAppData();

  const [activeSheet, setActiveSheet] = useState(null);
  const [companyDraft, setCompanyDraft] = useState({
    name: currentCompany?.name || '',
    address: currentCompany?.address || '',
    contactName: currentCompany?.contactName || '',
    contactPhone: currentCompany?.contactPhone || '',
  });
  const [warehouseDraft, setWarehouseDraft] = useState({
    name: '',
    address: '',
  });
  const [truckDraft, setTruckDraft] = useState({
    unitNumber: '',
    vin: '',
    licensePlate: '',
    make: '',
    fuelType: FUEL_TYPES.DIESEL,
    warehouseId: currentCompanyWarehouses[0]?.id || '',
    notes: '',
  });
  const [workshopDraft, setWorkshopDraft] = useState({
    name: currentWorkshop?.name || '',
    address: currentWorkshop?.address || '',
  });
  const [staffDraft, setStaffDraft] = useState({
    name: '',
    role: ROLES.MECHANIC,
  });
  const [inviteCompanyId, setInviteCompanyId] = useState(availableCompaniesForInvite[0]?.id || '');

  const companyLinkSummary = useMemo(
    () => ({
      active: currentWorkshopLinks.filter((link) => link.status === LINK_STATUS.ACTIVE).length,
      invited: currentWorkshopLinks.filter((link) => link.status === LINK_STATUS.INVITED).length,
    }),
    [currentWorkshopLinks]
  );

  const openCompanySheet = (sheetName) => {
    setCompanyDraft({
      name: currentCompany?.name || '',
      address: currentCompany?.address || '',
      contactName: currentCompany?.contactName || '',
      contactPhone: currentCompany?.contactPhone || '',
    });
    setWarehouseDraft({
      name: '',
      address: '',
    });
    setTruckDraft({
      unitNumber: '',
      vin: '',
      licensePlate: '',
      make: '',
      fuelType: FUEL_TYPES.DIESEL,
      warehouseId: currentCompanyWarehouses[0]?.id || '',
      notes: '',
    });
    setActiveSheet(sheetName);
  };

  const openWorkshopSheet = (sheetName) => {
    setWorkshopDraft({
      name: currentWorkshop?.name || '',
      address: currentWorkshop?.address || '',
    });
    setStaffDraft({
      name: '',
      role: ROLES.MECHANIC,
    });
    setInviteCompanyId(availableCompaniesForInvite[0]?.id || '');
    setActiveSheet(sheetName);
  };

  const closeSheet = () => {
    setActiveSheet(null);
  };

  const hasCompanyProfile = Boolean(
    currentCompany?.address && currentCompany?.contactName && currentCompany?.contactPhone
  );
  const hasWorkshopProfile = Boolean(currentWorkshop?.name && currentWorkshop?.address);
  const setup = isManager ? currentCompanySetup : currentWorkshopSetup;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <SessionBar />

      <ScreenHeader
        title={isManager ? 'Company Setup' : 'Workshop Setup'}
        subtitle={
          isManager
            ? 'Own the company record, fleet setup, warehouse bases, and workshop access for your trucks.'
            : 'Manage your workshop profile, internal staff, and private company relationships.'
        }
      />

      <ListCard
        title={isManager ? 'Beta readiness' : 'Workshop readiness'}
        subtitle={
          setup?.isComplete
            ? 'This organization is configured for internal beta testing and repeatable demos.'
            : setup?.nextStep || 'Finish the remaining setup steps to make this organization test-ready.'
        }
      >
        <View style={styles.readinessHeader}>
          <View>
            <Text style={styles.readinessTitle}>
              {setup?.completedCount || 0}/{setup?.totalCount || 0} steps complete
            </Text>
            <Text style={styles.readinessCopy}>
              {isManager
                ? 'Company setup controls what the fleet can report and which workshop can act on it.'
                : 'Workshop setup controls which companies are visible and which staff can operate the queue.'}
            </Text>
          </View>
          <View
            style={[
              styles.readinessBadge,
              setup?.isComplete ? styles.readinessBadgeReady : styles.readinessBadgePending,
            ]}
          >
            <Text style={styles.readinessBadgeText}>
              {setup?.isComplete ? 'Ready' : 'In setup'}
            </Text>
          </View>
        </View>
        <SetupChecklist setup={setup} />
      </ListCard>

      {isManager ? (
        <>
          <View style={styles.summaryRow}>
            <StatCard label="Warehouses" value={currentCompanyWarehouses.length} tone="neutral" />
            <StatCard label="Fleet trucks" value={currentCompanyTrucks.length} tone="success" />
            <StatCard
              label="Workshop links"
              value={currentCompanyLinkedWorkshops.length}
              tone="warning"
            />
          </View>

          <ListCard
            title={currentCompany?.name || 'Company profile'}
            subtitle={
              hasCompanyProfile
                ? 'Company record is configured and ready for fleet operations.'
                : 'Complete the company profile so workshop access and fleet setup are credible.'
            }
          >
            <View style={styles.buttonRow}>
              <ActionButton label="Edit profile" primary onPress={() => openCompanySheet('company')} />
              <ActionButton label="Add warehouse" onPress={() => openCompanySheet('warehouse')} />
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLine}>{currentCompany?.address || 'Address not set yet'}</Text>
              <Text style={styles.metaLine}>
                {currentCompany?.contactName || 'Primary contact not set'}
                {' • '}
                {currentCompany?.contactPhone || 'Phone not set'}
              </Text>
            </View>
          </ListCard>

          <ListCard
            title="Fleet setup"
            subtitle="Add bases and trucks with realistic fields so workshop operations run on company-owned assets."
          >
            <View style={styles.buttonRow}>
              <ActionButton label="Add truck" primary onPress={() => openCompanySheet('truck')} />
            </View>
            {currentCompanyWarehouses.length ? null : (
              <View style={styles.inlineHint}>
                <Text style={styles.inlineHintText}>
                  Add a warehouse first so trucks can be assigned to a real operating base.
                </Text>
              </View>
            )}
            {currentCompanyTrucks.length ? (
              <View style={styles.listGroup}>
                {currentCompanyTrucks.map((truck) => (
                  <RowItem
                    key={truck.id}
                    title={`Truck ${truck.unitNumber}`}
                    subtitle={`${truck.make} • ${truck.licensePlate}`}
                    meta={getFuelTypeLabel(truck.fuelType)}
                    right={<StatusBadge status={truck.status} />}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="bus-outline"
                title="No trucks added yet"
                description="Add your first truck to start using fleet reporting and workshop coordination."
              />
            )}
          </ListCard>

          <ListCard
            title="Warehouses"
            subtitle="Your trucks must belong to one of your company bases."
          >
            {currentCompanyWarehouses.length ? (
              <View style={styles.listGroup}>
                {currentCompanyWarehouses.map((warehouse) => (
                  <RowItem key={warehouse.id} title={warehouse.name} subtitle={warehouse.address} />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="home-outline"
                title="No warehouses configured"
                description="Add a warehouse or yard before building out the fleet."
              />
            )}
          </ListCard>

          <ListCard
            title="Workshop access"
            subtitle="Access is private and relationship-based. Only accepted workshop links can see your fleet."
          >
            {currentCompanyInvitations.length ? (
              <View style={styles.listGroup}>
                {currentCompanyInvitations.map((link) => (
                  <View key={link.id} style={styles.inviteCard}>
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle}>{link.workshop?.name}</Text>
                      <Text style={styles.rowSubtitle}>
                        {link.workshop?.address || 'Workshop invite pending acceptance'}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.inlinePrimaryButton}
                      onPress={() => acceptCompanyLink(link.id)}
                    >
                      <Text style={styles.inlinePrimaryButtonText}>Accept</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            {currentCompanyLinkedWorkshops.length ? (
              <View style={styles.listGroup}>
                {currentCompanyLinkedWorkshops.map((workshop) => (
                  <RowItem
                    key={workshop.id}
                    title={workshop.name}
                    subtitle={workshop.address}
                    meta="Active link"
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="link-outline"
                title="No active workshop access"
                description="Once you accept a workshop invitation, that workshop can coordinate repairs for your fleet."
              />
            )}
          </ListCard>
        </>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <StatCard label="Workshop staff" value={currentWorkshopStaff.length} tone="neutral" />
            <StatCard label="Active companies" value={companyLinkSummary.active} tone="success" />
            <StatCard label="Pending invites" value={companyLinkSummary.invited} tone="warning" />
          </View>

          <ListCard
            title={currentWorkshop?.name || 'Workshop profile'}
            subtitle={
              hasWorkshopProfile
                ? 'Workshop identity is ready for internal coordination and private company access.'
                : 'Complete the workshop identity so new staff and company links feel operationally credible.'
            }
          >
            <View style={styles.buttonRow}>
              <ActionButton label="Edit workshop" primary onPress={() => openWorkshopSheet('workshop')} />
              <ActionButton label="Add staff" onPress={() => openWorkshopSheet('staff')} />
            </View>
            <Text style={styles.metaLine}>{currentWorkshop?.address || 'Workshop address not set'}</Text>
          </ListCard>

          <ListCard
            title="Workshop staff"
            subtitle="Only internal workshop members belong to this shop and can run operational actions."
          >
            {currentWorkshopStaff.length ? (
              <View style={styles.listGroup}>
                {currentWorkshopStaff.map((user) => (
                  <RowItem
                    key={user.id}
                    title={user.name}
                    subtitle={
                      user.id === currentWorkshop?.ownerUserId
                        ? 'Workshop owner'
                        : 'Internal workshop staff'
                    }
                    meta={user.role}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="people-outline"
                title="No staff added"
                description="Add mechanics or coordinators so the workshop account feels like a real operating team."
              />
            )}
          </ListCard>

          <ListCard
            title="Company network"
            subtitle="Only linked companies can be seen by this workshop. Invitations stay private until accepted."
          >
            <View style={styles.buttonRow}>
              <ActionButton label="Invite company" primary onPress={() => openWorkshopSheet('invite')} />
            </View>

            {currentWorkshopLinkedCompanies.length ? (
              <View style={styles.listGroup}>
                {currentWorkshopLinkedCompanies.map((company) => (
                  <RowItem
                    key={company.id}
                    title={company.name}
                    subtitle={`${company.trucks.length} trucks • ${company.warehouses.length} bases`}
                    meta="Active"
                  />
                ))}
              </View>
            ) : null}

            {currentWorkshopLinks.filter((link) => link.status === LINK_STATUS.INVITED).length ? (
              <View style={styles.listGroup}>
                {currentWorkshopLinks
                  .filter((link) => link.status === LINK_STATUS.INVITED)
                  .map((link) => (
                    <RowItem
                      key={link.id}
                      title={link.company?.name || 'Pending contractor'}
                      subtitle="Invite sent and waiting for company acceptance"
                      meta={getLinkStatusLabel(link.status)}
                    />
                  ))}
              </View>
            ) : currentWorkshopLinkedCompanies.length ? null : (
              <EmptyState
                icon="business-outline"
                title="No companies linked yet"
                description="Invite a company to create a private relationship. Fleet data becomes visible only after acceptance."
              />
            )}
          </ListCard>
        </>
      )}

      <FormSheet
        visible={activeSheet === 'company'}
        title="Company profile"
        subtitle="Complete the contractor/company record so fleet setup and workshop relationships are scoped correctly."
        onClose={closeSheet}
        onSubmit={() => {
          updateCompanyProfile(companyDraft);
          closeSheet();
        }}
        submitLabel="Save company"
        submitDisabled={
          !companyDraft.name.trim() ||
          !companyDraft.address.trim() ||
          !companyDraft.contactName.trim() ||
          !companyDraft.contactPhone.trim()
        }
      >
        <FormField
          label="Company name"
          value={companyDraft.name}
          onChangeText={(value) => setCompanyDraft((current) => ({ ...current, name: value }))}
          placeholder="Canyon Materials"
        />
        <FormField
          label="Address"
          value={companyDraft.address}
          onChangeText={(value) => setCompanyDraft((current) => ({ ...current, address: value }))}
          placeholder="Company HQ or dispatch address"
        />
        <FormField
          label="Primary contact"
          value={companyDraft.contactName}
          onChangeText={(value) =>
            setCompanyDraft((current) => ({ ...current, contactName: value }))
          }
          placeholder="Owner or fleet manager"
        />
        <FormField
          label="Contact phone"
          value={companyDraft.contactPhone}
          onChangeText={(value) =>
            setCompanyDraft((current) => ({ ...current, contactPhone: value }))
          }
          placeholder="(555) 555-0111"
        />
      </FormSheet>

      <FormSheet
        visible={activeSheet === 'warehouse'}
        title="Add warehouse"
        subtitle="Create a company base or yard so trucks can be assigned to a real operating location."
        onClose={closeSheet}
        onSubmit={() => {
          addWarehouse(warehouseDraft);
          closeSheet();
        }}
        submitLabel="Add warehouse"
        submitDisabled={!warehouseDraft.name.trim() || !warehouseDraft.address.trim()}
      >
        <FormField
          label="Warehouse name"
          value={warehouseDraft.name}
          onChangeText={(value) => setWarehouseDraft((current) => ({ ...current, name: value }))}
          placeholder="North Yard"
        />
        <FormField
          label="Address"
          value={warehouseDraft.address}
          onChangeText={(value) => setWarehouseDraft((current) => ({ ...current, address: value }))}
          placeholder="Base or yard location"
        />
      </FormSheet>

      <FormSheet
        visible={activeSheet === 'truck'}
        title="Add truck"
        subtitle="Create a fleet asset owned by the company. This truck becomes available for issue reporting and workshop tracking."
        onClose={closeSheet}
        onSubmit={() => {
          addTruck(truckDraft);
          closeSheet();
        }}
        submitLabel="Add truck"
        submitDisabled={
          !truckDraft.unitNumber.trim() ||
          !truckDraft.vin.trim() ||
          !truckDraft.licensePlate.trim() ||
          !truckDraft.make.trim() ||
          !truckDraft.warehouseId
        }
      >
        <FormField
          label="Unit number"
          value={truckDraft.unitNumber}
          onChangeText={(value) => setTruckDraft((current) => ({ ...current, unitNumber: value }))}
          placeholder="815"
        />
        <FormField
          label="VIN"
          value={truckDraft.vin}
          onChangeText={(value) => setTruckDraft((current) => ({ ...current, vin: value }))}
          placeholder="Vehicle identification number"
        />
        <FormField
          label="License plate"
          value={truckDraft.licensePlate}
          onChangeText={(value) =>
            setTruckDraft((current) => ({ ...current, licensePlate: value }))
          }
          placeholder="8ABC123"
        />
        <FormField
          label="Truck make / brand"
          value={truckDraft.make}
          onChangeText={(value) => setTruckDraft((current) => ({ ...current, make: value }))}
          placeholder="Freightliner Cascadia"
        />

        <View style={styles.fieldSection}>
          <Text style={styles.sectionLabel}>Fuel type</Text>
          <FilterChips
            options={FUEL_OPTIONS}
            selectedValue={truckDraft.fuelType}
            onSelect={(value) => setTruckDraft((current) => ({ ...current, fuelType: value }))}
          />
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.sectionLabel}>Assigned warehouse</Text>
          <View style={styles.optionList}>
            {currentCompanyWarehouses.map((warehouse) => (
              <SelectCard
                key={warehouse.id}
                label={warehouse.name}
                description={warehouse.address}
                selected={truckDraft.warehouseId === warehouse.id}
                onPress={() =>
                  setTruckDraft((current) => ({ ...current, warehouseId: warehouse.id }))
                }
              />
            ))}
          </View>
        </View>

        <FormField
          label="Notes"
          value={truckDraft.notes}
          onChangeText={(value) => setTruckDraft((current) => ({ ...current, notes: value }))}
          placeholder="Optional operating notes"
          multiline
        />
      </FormSheet>

      <FormSheet
        visible={activeSheet === 'workshop'}
        title="Workshop profile"
        subtitle="Set the workshop identity that anchors staff access and linked contractor relationships."
        onClose={closeSheet}
        onSubmit={() => {
          updateWorkshopProfile(workshopDraft);
          closeSheet();
        }}
        submitLabel="Save workshop"
        submitDisabled={!workshopDraft.name.trim() || !workshopDraft.address.trim()}
      >
        <FormField
          label="Workshop name"
          value={workshopDraft.name}
          onChangeText={(value) => setWorkshopDraft((current) => ({ ...current, name: value }))}
          placeholder="BlueLine Diesel Service"
        />
        <FormField
          label="Workshop address"
          value={workshopDraft.address}
          onChangeText={(value) => setWorkshopDraft((current) => ({ ...current, address: value }))}
          placeholder="Shop address"
        />
      </FormSheet>

      <FormSheet
        visible={activeSheet === 'staff'}
        title="Add staff member"
        subtitle="Create an internal workshop account. New staff appear as their own mock login sessions in this demo."
        onClose={closeSheet}
        onSubmit={() => {
          addWorkshopStaff(staffDraft);
          closeSheet();
        }}
        submitLabel="Add staff"
        submitDisabled={!staffDraft.name.trim()}
      >
        <FormField
          label="Staff name"
          value={staffDraft.name}
          onChangeText={(value) => setStaffDraft((current) => ({ ...current, name: value }))}
          placeholder="New staff member"
        />

        <View style={styles.fieldSection}>
          <Text style={styles.sectionLabel}>Role</Text>
          <FilterChips
            options={STAFF_ROLE_OPTIONS}
            selectedValue={staffDraft.role}
            onSelect={(value) => setStaffDraft((current) => ({ ...current, role: value }))}
          />
        </View>
      </FormSheet>

      <FormSheet
        visible={activeSheet === 'invite'}
        title="Invite contractor company"
        subtitle="Create a private workshop-company access request. The contractor must accept before fleet data becomes visible."
        onClose={closeSheet}
        onSubmit={() => {
          createCompanyLinkRequest({ companyId: inviteCompanyId });
          closeSheet();
        }}
        submitLabel="Send invite"
        submitDisabled={!inviteCompanyId}
      >
        {availableCompaniesForInvite.length ? (
          <View style={styles.optionList}>
            {availableCompaniesForInvite.map((company) => (
              <SelectCard
                key={company.id}
                label={company.name}
                description={
                  company.contactName
                    ? `${company.contactName} • ${company.contactPhone || 'No phone set'}`
                    : 'Company profile still needs setup'
                }
                selected={inviteCompanyId === company.id}
                onPress={() => setInviteCompanyId(company.id)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="mail-outline"
            title="No companies available to invite"
            description="All known company accounts in this demo are already linked or pending invitation."
          />
        )}
      </FormSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 28,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  cardHeader: {
    gap: 4,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  readinessTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  readinessCopy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 260,
  },
  readinessBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },
  readinessBadgeReady: {
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
  },
  readinessBadgePending: {
    backgroundColor: colors.warningMuted,
    borderColor: colors.warning,
  },
  readinessBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setupChecklist: {
    gap: 10,
  },
  setupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  setupDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  setupDotComplete: {
    backgroundColor: colors.success,
  },
  setupDotPending: {
    backgroundColor: colors.warning,
  },
  setupItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  setupItemTextComplete: {
    color: colors.text,
  },
  setupItemTextPending: {
    color: colors.textMuted,
  },
  buttonRow: {
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
  },
  inlineHint: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.overlay,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inlineHintText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  metaBlock: {
    gap: 4,
  },
  metaLine: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  listGroup: {
    gap: 10,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  rowSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rowMeta: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  inviteCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  inlinePrimaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inlinePrimaryButtonText: {
    color: colors.overlay,
    fontSize: 12,
    fontWeight: '800',
  },
  fieldSection: {
    gap: 10,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  optionList: {
    gap: 10,
  },
  selectCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 14,
    gap: 4,
  },
  selectCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  selectLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
