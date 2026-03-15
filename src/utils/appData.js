import { createMockState } from '../data/mockData';
import { LINK_STATUS, ROLES } from './constants';

const REQUIRED_ARRAY_KEYS = [
  'workshops',
  'companies',
  'companyWorkshopLinks',
  'warehouses',
  'users',
  'trucks',
  'issues',
  'jobs',
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function dedupeLinks(links) {
  const latestLinkByPair = links.reduce((accumulator, link) => {
    if (!link?.id || !link.workshopId || !link.companyId) {
      return accumulator;
    }

    const key = `${link.workshopId}:${link.companyId}`;
    const existingLink = accumulator[key];

    if (!existingLink) {
      accumulator[key] = link;
      return accumulator;
    }

    const existingTime = new Date(existingLink.createdAt || 0).getTime();
    const nextTime = new Date(link.createdAt || 0).getTime();

    accumulator[key] = nextTime >= existingTime ? link : existingLink;
    return accumulator;
  }, {});

  return Object.values(latestLinkByPair);
}

function stripRelationshipFields(item) {
  if (!item) {
    return item;
  }

  const {
    linkedWorkshopIds,
    linkedCompanyIds,
    linkedWorkshops,
    linkedCompanies,
    links,
    ...rest
  } = item;

  return rest;
}

export function createSeededAppState() {
  return createMockState();
}

export function normalizeAppState(inputState) {
  const seedState = createSeededAppState();

  if (!inputState) {
    return seedState;
  }

  const normalizedState = {
    ...seedState,
    ...clone(inputState),
  };

  REQUIRED_ARRAY_KEYS.forEach((key) => {
    normalizedState[key] = Array.isArray(normalizedState[key]) ? normalizedState[key] : seedState[key];
  });

  normalizedState.workshops = normalizedState.workshops.map(stripRelationshipFields);
  normalizedState.companies = normalizedState.companies.map(stripRelationshipFields);
  normalizedState.companyWorkshopLinks = dedupeLinks(normalizedState.companyWorkshopLinks);

  const userIds = new Set(normalizedState.users.map((user) => user.id));
  normalizedState.currentUserId = userIds.has(normalizedState.currentUserId)
    ? normalizedState.currentUserId
    : null;

  return normalizedState;
}

export function getVisibleCompanyIds({ currentUser, currentWorkshop, companyWorkshopLinks }) {
  if (!currentUser) {
    return [];
  }

  if (currentUser.role === ROLES.MANAGER) {
    return currentUser.companyId ? [currentUser.companyId] : [];
  }

  if (!currentWorkshop) {
    return [];
  }

  return companyWorkshopLinks
    .filter(
      (link) =>
        link.workshopId === currentWorkshop.id &&
        link.status === LINK_STATUS.ACTIVE
    )
    .map((link) => link.companyId);
}

export function getCompanySetupStatus(company, warehouses, trucks, activeLinks) {
  const checklist = [
    {
      id: 'profile',
      label: 'Complete company profile',
      complete: Boolean(
        company?.name?.trim() &&
          company?.address?.trim() &&
          company?.contactName?.trim() &&
          company?.contactPhone?.trim()
      ),
    },
    {
      id: 'warehouse',
      label: 'Add at least one warehouse',
      complete: warehouses.length > 0,
    },
    {
      id: 'truck',
      label: 'Add at least one fleet truck',
      complete: trucks.length > 0,
    },
    {
      id: 'link',
      label: 'Accept a workshop link',
      complete: activeLinks.length > 0,
    },
  ];

  const completedCount = checklist.filter((item) => item.complete).length;
  const nextStep = checklist.find((item) => !item.complete)?.label || 'Company setup is ready for beta use.';

  return {
    checklist,
    completedCount,
    totalCount: checklist.length,
    isComplete: completedCount === checklist.length,
    nextStep,
  };
}

export function getWorkshopSetupStatus(workshop, staffUsers, links) {
  const activeLinks = links.filter((link) => link.status === LINK_STATUS.ACTIVE);
  const invitedLinks = links.filter((link) => link.status === LINK_STATUS.INVITED);

  const checklist = [
    {
      id: 'profile',
      label: 'Complete workshop profile',
      complete: Boolean(workshop?.name?.trim() && workshop?.address?.trim()),
    },
    {
      id: 'staff',
      label: 'Add at least one additional staff member',
      complete: staffUsers.length > 1,
    },
    {
      id: 'invite',
      label: 'Send a company invite',
      complete: invitedLinks.length > 0 || activeLinks.length > 0,
    },
    {
      id: 'active-link',
      label: 'Activate a company relationship',
      complete: activeLinks.length > 0,
    },
  ];

  const completedCount = checklist.filter((item) => item.complete).length;
  const nextStep = checklist.find((item) => !item.complete)?.label || 'Workshop setup is ready for beta use.';

  return {
    checklist,
    completedCount,
    totalCount: checklist.length,
    isComplete: completedCount === checklist.length,
    nextStep,
  };
}
