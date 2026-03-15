import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  FUEL_TYPES,
  ISSUE_STATUS,
  JOB_STATUS,
  LINK_STATUS,
  PRIORITY,
  ROLES,
  TRUCK_STATUS,
} from '../utils/constants';
import {
  createSeededAppState,
  getCompanySetupStatus,
  getVisibleCompanyIds,
  getWorkshopSetupStatus,
  normalizeAppState,
} from '../utils/appData';
import {
  loadPersistedAppState,
  resetPersistedAppState,
  savePersistedAppState,
} from '../storage/appStorage';

const AppContext = createContext(null);

function mapById(items) {
  return items.reduce((accumulator, item) => {
    accumulator[item.id] = item;
    return accumulator;
  }, {});
}

function sortByDateDescending(items, field) {
  return [...items].sort(
    (left, right) => new Date(right[field]).getTime() - new Date(left[field]).getTime()
  );
}

function sortByDateAscending(items, field) {
  return [...items].sort(
    (left, right) => new Date(left[field]).getTime() - new Date(right[field]).getTime()
  );
}

function sortByStatusPriority(items, getRank, field) {
  return [...items].sort((left, right) => {
    const rankDifference = getRank(left) - getRank(right);

    if (rankDifference !== 0) {
      return rankDifference;
    }

    return new Date(right[field]).getTime() - new Date(left[field]).getTime();
  });
}

function getJobRank(job) {
  if (job.status === JOB_STATUS.IN_PROGRESS) {
    return 0;
  }

  if (job.status === JOB_STATUS.SCHEDULED) {
    return 1;
  }

  return 2;
}

function getCurrentIssue(issuesForTruck) {
  if (!issuesForTruck.length) {
    return null;
  }

  const activeIssues = sortByDateDescending(
    issuesForTruck.filter((issue) => issue.status !== ISSUE_STATUS.RESOLVED),
    'createdAt'
  );

  if (activeIssues.length) {
    return activeIssues[0];
  }

  return sortByDateDescending(issuesForTruck, 'createdAt')[0];
}

function getCurrentJob(jobsForTruck) {
  if (!jobsForTruck.length) {
    return null;
  }

  const prioritizedJobs = sortByStatusPriority(jobsForTruck, getJobRank, 'scheduledDate');
  const activeJob = prioritizedJobs.find((job) => job.status !== JOB_STATUS.DONE);

  return activeJob || prioritizedJobs[0];
}

function createEntityId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getTruckActivity(truck, issuesForTruck, jobsForTruck) {
  const issueEvents = issuesForTruck.flatMap((issue) => {
    const events = [
      {
        id: `${issue.id}-reported`,
        type: 'ISSUE_REPORTED',
        title: 'Issue reported',
        description: issue.description,
        occurredAt: issue.createdAt,
      },
    ];

    if (issue.status === ISSUE_STATUS.RESOLVED) {
      const relatedJob = jobsForTruck.find((job) => job.issueId === issue.id);

      events.push({
        id: `${issue.id}-resolved`,
        type: 'ISSUE_RESOLVED',
        title: 'Issue resolved',
        description: `Truck ${truck.unitNumber} returned to service.`,
        occurredAt: relatedJob?.estimatedReturnDate || issue.createdAt,
      });
    }

    return events;
  });

  const jobEvents = jobsForTruck.flatMap((job) => {
    const events = [
      {
        id: `${job.id}-scheduled`,
        type: 'JOB_SCHEDULED',
        title: 'Repair scheduled',
        description: `${job.mechanic?.name || 'Workshop mechanic'} assigned at ${job.warehouse?.name || 'fleet warehouse'}.`,
        occurredAt: job.scheduledDate,
      },
    ];

    if (job.status === JOB_STATUS.IN_PROGRESS || job.status === JOB_STATUS.DONE) {
      events.push({
        id: `${job.id}-started`,
        type: 'JOB_STARTED',
        title: 'Repair in progress',
        description: `${job.mechanic?.name || 'Mechanic'} is working on the truck.`,
        occurredAt: job.scheduledDate,
      });
    }

    if (job.status === JOB_STATUS.DONE) {
      events.push({
        id: `${job.id}-completed`,
        type: 'JOB_DONE',
        title: 'Repair completed',
        description: `Estimated return completed for ${job.warehouse?.name || 'assigned warehouse'}.`,
        occurredAt: job.estimatedReturnDate || job.scheduledDate,
      });
    }

    return events;
  });

  return sortByDateDescending([...issueEvents, ...jobEvents], 'occurredAt');
}

export function AppProvider({ children }) {
  const [appState, setAppState] = useState(() => createSeededAppState());
  const [feedback, setFeedback] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function hydrateState() {
      try {
        const persistedState = await loadPersistedAppState();

        if (!isActive) {
          return;
        }

        setAppState(normalizeAppState(persistedState));
      } catch (error) {
        if (__DEV__) {
          console.warn('Failed to hydrate Hauler app state.', error);
        }
      } finally {
        if (isActive) {
          setIsHydrated(true);
        }
      }
    }

    hydrateState();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    savePersistedAppState(appState).catch((error) => {
      if (__DEV__) {
        console.warn('Failed to persist Hauler app state.', error);
      }
    });
  }, [appState, isHydrated]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setFeedback(null);
    }, 2600);

    return () => clearTimeout(timeoutId);
  }, [feedback]);

  const currentUser = appState.users.find((user) => user.id === appState.currentUserId) || null;
  const currentCompany = appState.companies.find((company) => company.id === currentUser?.companyId) || null;
  const currentWorkshop =
    appState.workshops.find((workshop) => workshop.id === currentUser?.workshopId) || null;
  const isManager = currentUser?.role === ROLES.MANAGER;
  const isWorkshopUser = Boolean(currentUser) && currentUser.role !== ROLES.MANAGER;

  const derivedData = useMemo(() => {
    const usersById = mapById(appState.users);
    const workshopsById = mapById(appState.workshops);
    const companiesById = mapById(appState.companies);
    const warehousesById = mapById(appState.warehouses);

    const normalizedLinks = sortByDateDescending(appState.companyWorkshopLinks, 'createdAt').map(
      (link) => ({
        ...link,
        workshop: workshopsById[link.workshopId] || null,
        company: companiesById[link.companyId] || null,
      })
    );

    const trucksBase = appState.trucks.map((truck) => ({
      ...truck,
      company: companiesById[truck.companyId] || null,
      warehouse: warehousesById[truck.warehouseId] || null,
    }));
    const trucksBaseById = mapById(trucksBase);

    const jobsDetailedBase = sortByDateAscending(appState.jobs, 'scheduledDate').map((job) => ({
      ...job,
      truck: trucksBaseById[job.truckId] || null,
      warehouse: warehousesById[job.warehouseId] || null,
      mechanic: usersById[job.assignedMechanicId] || null,
      issue: null,
    }));
    const jobsDetailedBaseById = mapById(jobsDetailedBase);

    const rawJobsByIssueId = appState.jobs.reduce((accumulator, job) => {
      if (!accumulator[job.issueId]) {
        accumulator[job.issueId] = [];
      }

      accumulator[job.issueId].push(job);
      return accumulator;
    }, {});

    const issuesDetailed = sortByDateDescending(appState.issues, 'createdAt').map((issue) => {
      const truck = trucksBaseById[issue.truckId] || null;
      const reporter = usersById[issue.reportedBy] || null;
      const issueJobs = sortByDateDescending(rawJobsByIssueId[issue.id] || [], 'scheduledDate');
      const currentIssueJob = getCurrentJob(issueJobs);

      return {
        ...issue,
        truck,
        reporter,
        company: truck?.company || null,
        warehouse: truck?.warehouse || null,
        jobs: issueJobs.map((job) => jobsDetailedBaseById[job.id] || job),
        currentJob: currentIssueJob ? jobsDetailedBaseById[currentIssueJob.id] || currentIssueJob : null,
      };
    });
    const issuesDetailedById = mapById(issuesDetailed);

    const jobsDetailed = jobsDetailedBase.map((job) => ({
      ...job,
      issue: issuesDetailedById[job.issueId] || null,
    }));

    const issuesByTruckId = issuesDetailed.reduce((accumulator, issue) => {
      if (!accumulator[issue.truckId]) {
        accumulator[issue.truckId] = [];
      }

      accumulator[issue.truckId].push(issue);
      return accumulator;
    }, {});

    const jobsByTruckId = jobsDetailed.reduce((accumulator, job) => {
      if (!accumulator[job.truckId]) {
        accumulator[job.truckId] = [];
      }

      accumulator[job.truckId].push(job);
      return accumulator;
    }, {});

    const trucksDetailed = trucksBase.map((truck) => {
      const truckIssues = sortByDateDescending(issuesByTruckId[truck.id] || [], 'createdAt');
      const truckJobs = sortByDateDescending(jobsByTruckId[truck.id] || [], 'scheduledDate');
      const activeIssue =
        truckIssues.find((issue) => issue.status !== ISSUE_STATUS.RESOLVED) || null;
      const activeJob = truckJobs.find((job) => job.status !== JOB_STATUS.DONE) || null;

      return {
        ...truck,
        issues: truckIssues,
        jobs: truckJobs,
        currentIssue: getCurrentIssue(truckIssues),
        currentJob: getCurrentJob(truckJobs),
        activeIssue,
        activeJob,
        latestIssue: truckIssues[0] || null,
        latestJob: truckJobs[0] || null,
        recentIssues: truckIssues.slice(0, 3),
        recentJobs: truckJobs.slice(0, 3),
      };
    });
    const trucksDetailedById = mapById(trucksDetailed);

    const companiesDetailed = appState.companies.map((company) => {
      const companyWarehouses = appState.warehouses
        .filter((warehouse) => warehouse.companyId === company.id)
        .map((warehouse) => ({
          ...warehouse,
          company,
        }));
      const companyTrucks = trucksDetailed.filter((truck) => truck.companyId === company.id);
      const companyLinks = normalizedLinks.filter((link) => link.companyId === company.id);
      const linkedWorkshops = companyLinks
        .filter((link) => link.status === LINK_STATUS.ACTIVE)
        .map((link) => workshopsById[link.workshopId])
        .filter(Boolean);
      const setup = getCompanySetupStatus(company, companyWarehouses, companyTrucks, companyLinks.filter((link) => link.status === LINK_STATUS.ACTIVE));

      return {
        ...company,
        ownerUsers: (company.ownerUserIds || []).map((userId) => usersById[userId]).filter(Boolean),
        managerUsers: (company.managerUserIds || []).map((userId) => usersById[userId]).filter(Boolean),
        links: companyLinks,
        linkedWorkshopIds: linkedWorkshops.map((workshop) => workshop.id),
        linkedWorkshops,
        warehouses: companyWarehouses,
        trucks: companyTrucks,
        setup,
      };
    });
    const companiesDetailedById = mapById(companiesDetailed);

    const workshopsDetailed = appState.workshops.map((workshop) => {
      const workshopStaff = appState.users.filter((user) => user.workshopId === workshop.id);
      const workshopLinks = normalizedLinks.filter((link) => link.workshopId === workshop.id);
      const linkedCompanies = workshopLinks
        .filter((link) => link.status === LINK_STATUS.ACTIVE)
        .map((link) => companiesDetailedById[link.companyId])
        .filter(Boolean);
      const setup = getWorkshopSetupStatus(workshop, workshopStaff, workshopLinks);

      return {
        ...workshop,
        ownerUser: usersById[workshop.ownerUserId] || null,
        staffUsers: workshopStaff,
        staffUserIds: workshopStaff.map((user) => user.id),
        links: workshopLinks,
        linkedCompanyIds: linkedCompanies.map((company) => company.id),
        linkedCompanies,
        setup,
      };
    });
    const workshopsDetailedById = mapById(workshopsDetailed);

    const currentCompanyDetailed = currentCompany ? companiesDetailedById[currentCompany.id] || null : null;
    const currentWorkshopDetailed = currentWorkshop ? workshopsDetailedById[currentWorkshop.id] || null : null;

    const visibleCompanyIds = getVisibleCompanyIds({
      currentUser,
      currentWorkshop: currentWorkshopDetailed,
      companyWorkshopLinks: appState.companyWorkshopLinks,
    });
    const visibleCompanyIdSet = new Set(visibleCompanyIds);

    const visibleWarehouses = appState.warehouses
      .filter((warehouse) => visibleCompanyIdSet.has(warehouse.companyId))
      .map((warehouse) => ({
        ...warehouse,
        company: companiesDetailedById[warehouse.companyId] || null,
      }));
    const visibleTrucks = trucksDetailed.filter((truck) => visibleCompanyIdSet.has(truck.companyId));
    const visibleTruckIdSet = new Set(visibleTrucks.map((truck) => truck.id));
    const visibleIssues = issuesDetailed.filter((issue) => visibleTruckIdSet.has(issue.truckId));
    const visibleJobs = jobsDetailed.filter((job) => visibleTruckIdSet.has(job.truckId));

    const scheduleDays = visibleJobs.reduce((accumulator, job) => {
      const existingDay = accumulator.find((item) => item.date === job.scheduledDate);

      if (existingDay) {
        existingDay.jobs.push(job);
        return accumulator;
      }

      accumulator.push({
        date: job.scheduledDate,
        jobs: [job],
      });

      return accumulator;
    }, []);

    const currentCompanyInvitations = currentCompanyDetailed
      ? currentCompanyDetailed.links.filter((link) => link.status === LINK_STATUS.INVITED)
      : [];
    const currentWorkshopLinks = currentWorkshopDetailed?.links || [];
    const currentWorkshopStaff = currentWorkshopDetailed?.staffUsers || [];
    const currentWorkshopMechanics = currentWorkshopStaff.filter((user) => user.role === ROLES.MECHANIC);
    const availableCompaniesForInvite = currentWorkshopDetailed
      ? companiesDetailed.filter((company) => {
          const hasExistingLink = currentWorkshopDetailed.links.some(
            (link) =>
              link.companyId === company.id &&
              (link.status === LINK_STATUS.ACTIVE || link.status === LINK_STATUS.INVITED)
          );

          return !hasExistingLink;
        })
      : [];

    const fleetSummary = {
      total: visibleTrucks.length,
      outOfService: visibleTrucks.filter((truck) => truck.status === TRUCK_STATUS.OUT_OF_SERVICE).length,
      inRepair: visibleTrucks.filter((truck) => truck.status === TRUCK_STATUS.IN_REPAIR).length,
      backInService: visibleTrucks.filter((truck) => truck.status === TRUCK_STATUS.BACK_IN_SERVICE).length,
      attentionNow: visibleTrucks.filter((truck) => truck.activeIssue || truck.activeJob).length,
    };

    return {
      users: appState.users,
      usersById,
      companies: companiesDetailed,
      companiesById: companiesDetailedById,
      workshops: workshopsDetailed,
      workshopsById: workshopsDetailedById,
      warehouses: visibleWarehouses,
      allWarehouses: appState.warehouses.map((warehouse) => ({
        ...warehouse,
        company: companiesDetailedById[warehouse.companyId] || null,
      })),
      trucks: visibleTrucks,
      allTrucksById: trucksDetailedById,
      visibleTrucksById: mapById(visibleTrucks),
      issues: visibleIssues,
      visibleIssuesById: mapById(visibleIssues),
      jobs: visibleJobs,
      visibleJobsById: mapById(visibleJobs),
      links: normalizedLinks,
      scheduleDays,
      fleetSummary,
      currentCompany: currentCompanyDetailed,
      currentWorkshop: currentWorkshopDetailed,
      currentCompanyInvitations,
      currentWorkshopLinks,
      currentWorkshopStaff,
      currentWorkshopMechanics,
      availableCompaniesForInvite,
    };
  }, [appState, currentCompany, currentUser, currentWorkshop]);

  const dismissFeedback = () => {
    setFeedback(null);
  };

  const showFeedback = ({ message, tone = 'success' }) => {
    setFeedback({
      id: `${Date.now()}`,
      message,
      tone,
    });
  };

  const loginAsUser = (userId) => {
    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        currentUserId: userId,
      })
    );
  };

  const logout = () => {
    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        currentUserId: null,
      })
    );
    dismissFeedback();
  };

  const resetDemoData = async () => {
    const resetState = createSeededAppState();

    setAppState(resetState);
    dismissFeedback();
    showFeedback({
      message: 'Demo data reset to the seeded beta state.',
      tone: 'info',
    });

    try {
      await resetPersistedAppState();
      await savePersistedAppState(resetState);
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to reset Hauler app state.', error);
      }
    }
  };

  const hasActiveWorkshopAccess = (companyId) => {
    if (!currentWorkshop) {
      return false;
    }

    return appState.companyWorkshopLinks.some(
      (link) =>
        link.workshopId === currentWorkshop.id &&
        link.companyId === companyId &&
        link.status === LINK_STATUS.ACTIVE
    );
  };

  const updateCompanyProfile = ({ name, address, contactName, contactPhone }) => {
    if (!isManager || !currentCompany) {
      return;
    }

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        companies: currentState.companies.map((company) =>
          company.id === currentCompany.id
            ? {
                ...company,
                name: name.trim(),
                address: address.trim(),
                contactName: contactName.trim(),
                contactPhone: contactPhone.trim(),
              }
            : company
        ),
      })
    );

    showFeedback({
      message: 'Company profile updated.',
    });
  };

  const addWarehouse = ({ name, address }) => {
    if (!isManager || !currentCompany) {
      return null;
    }

    const newWarehouse = {
      id: createEntityId('warehouse'),
      companyId: currentCompany.id,
      name: name.trim(),
      address: address.trim(),
    };

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        warehouses: [...currentState.warehouses, newWarehouse],
      })
    );
    showFeedback({
      message: `${newWarehouse.name} added to ${currentCompany.name}.`,
    });

    return newWarehouse.id;
  };

  const addTruck = ({
    unitNumber,
    vin,
    licensePlate,
    make,
    fuelType = FUEL_TYPES.DIESEL,
    warehouseId,
    notes,
  }) => {
    if (!isManager || !currentCompany) {
      return null;
    }

    const warehouse = appState.warehouses.find((item) => item.id === warehouseId);

    if (!warehouse || warehouse.companyId !== currentCompany.id) {
      return null;
    }

    const newTruck = {
      id: createEntityId('truck'),
      unitNumber: unitNumber.trim(),
      vin: vin.trim(),
      licensePlate: licensePlate.trim(),
      make: make.trim(),
      fuelType,
      companyId: currentCompany.id,
      warehouseId,
      status: TRUCK_STATUS.BACK_IN_SERVICE,
      notes: notes.trim(),
    };

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        trucks: [...currentState.trucks, newTruck],
      })
    );
    showFeedback({
      message: `Truck ${newTruck.unitNumber} added to ${currentCompany.name}.`,
    });

    return newTruck.id;
  };

  const updateWorkshopProfile = ({ name, address }) => {
    if (!isWorkshopUser || !currentWorkshop) {
      return;
    }

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        workshops: currentState.workshops.map((workshop) =>
          workshop.id === currentWorkshop.id
            ? {
                ...workshop,
                name: name.trim(),
                address: address.trim(),
              }
            : workshop
        ),
      })
    );

    showFeedback({
      message: 'Workshop profile updated.',
    });
  };

  const addWorkshopStaff = ({ name, role }) => {
    if (!isWorkshopUser || !currentWorkshop) {
      return null;
    }

    const newUser = {
      id: createEntityId('user'),
      role,
      name: name.trim(),
      companyId: null,
      workshopId: currentWorkshop.id,
    };

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        users: [...currentState.users, newUser],
      })
    );
    showFeedback({
      message: `${newUser.name} added to ${currentWorkshop.name}.`,
    });

    return newUser.id;
  };

  const createCompanyLinkRequest = ({ companyId }) => {
    if (!isWorkshopUser || !currentWorkshop) {
      return null;
    }

    const company = appState.companies.find((item) => item.id === companyId);
    const existingLink = appState.companyWorkshopLinks.find(
      (link) =>
        link.workshopId === currentWorkshop.id &&
        link.companyId === companyId &&
        (link.status === LINK_STATUS.ACTIVE || link.status === LINK_STATUS.INVITED)
    );

    if (!company || existingLink) {
      return null;
    }

    const newLink = {
      id: createEntityId('link'),
      workshopId: currentWorkshop.id,
      companyId,
      status: LINK_STATUS.INVITED,
      createdAt: new Date().toISOString(),
    };

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        companyWorkshopLinks: [...currentState.companyWorkshopLinks, newLink],
      })
    );
    showFeedback({
      message: `Private workshop invite created for ${company.name}.`,
    });

    return newLink.id;
  };

  const acceptCompanyLink = (linkId) => {
    if (!isManager || !currentCompany) {
      return;
    }

    const link = appState.companyWorkshopLinks.find((item) => item.id === linkId);
    const workshop = appState.workshops.find((item) => item.id === link?.workshopId);

    if (!link || link.companyId !== currentCompany.id || link.status !== LINK_STATUS.INVITED) {
      return;
    }

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        companyWorkshopLinks: currentState.companyWorkshopLinks.map((currentLink) =>
          currentLink.id === linkId
            ? {
                ...currentLink,
                status: LINK_STATUS.ACTIVE,
              }
            : currentLink
        ),
      })
    );

    showFeedback({
      message: `${currentCompany.name} linked to ${workshop?.name || 'the workshop'}.`,
    });
  };

  const reportIssue = ({ truckId, description, priority = PRIORITY.NORMAL, photoUrl = null }) => {
    if (!currentUser || currentUser.role !== ROLES.MANAGER || !currentCompany) {
      return null;
    }

    const truck = appState.trucks.find((item) => item.id === truckId);

    if (!truck || truck.companyId !== currentCompany.id) {
      return null;
    }

    const newIssue = {
      id: createEntityId('issue'),
      truckId,
      reportedBy: currentUser.id,
      description: description.trim(),
      photoUrl,
      priority,
      createdAt: new Date().toISOString(),
      status: ISSUE_STATUS.REPORTED,
    };

    const activeWorkshopLink = appState.companyWorkshopLinks.find(
      (link) => link.companyId === currentCompany.id && link.status === LINK_STATUS.ACTIVE
    );

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        issues: [newIssue, ...currentState.issues],
        trucks: currentState.trucks.map((currentTruck) =>
          currentTruck.id === truckId
            ? {
                ...currentTruck,
                status: TRUCK_STATUS.OUT_OF_SERVICE,
              }
            : currentTruck
        ),
      })
    );
    showFeedback({
      message: activeWorkshopLink
        ? `Issue reported for Truck ${truck.unitNumber}. Workshop queue updated.`
        : `Issue reported for Truck ${truck.unitNumber}. Link a workshop to dispatch repairs.`,
    });

    return newIssue.id;
  };

  const assignIssueToJob = ({
    issueId,
    warehouseId,
    assignedMechanicId,
    scheduledDate,
    estimatedReturnDate,
  }) => {
    const issue = appState.issues.find((item) => item.id === issueId);
    const truck = appState.trucks.find((item) => item.id === issue?.truckId);
    const assignedMechanic = appState.users.find((user) => user.id === assignedMechanicId);
    const warehouse = appState.warehouses.find((item) => item.id === warehouseId);

    if (!issue || !truck || issue.status !== ISSUE_STATUS.REPORTED || !isWorkshopUser) {
      return null;
    }

    if (!hasActiveWorkshopAccess(truck.companyId)) {
      return null;
    }

    if (!warehouse || warehouse.companyId !== truck.companyId) {
      return null;
    }

    if (!assignedMechanic || assignedMechanic.workshopId !== currentWorkshop?.id) {
      return null;
    }

    const newJob = {
      id: createEntityId('job'),
      issueId,
      truckId: issue.truckId,
      warehouseId,
      assignedMechanicId,
      scheduledDate,
      estimatedReturnDate,
      status: JOB_STATUS.SCHEDULED,
    };

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        jobs: [...currentState.jobs, newJob],
        issues: currentState.issues.map((currentIssue) =>
          currentIssue.id === issueId
            ? {
                ...currentIssue,
                status: ISSUE_STATUS.ASSIGNED,
              }
            : currentIssue
        ),
        trucks: currentState.trucks.map((currentTruck) =>
          currentTruck.id === issue.truckId
            ? {
                ...currentTruck,
                warehouseId,
                status: TRUCK_STATUS.OUT_OF_SERVICE,
              }
            : currentTruck
        ),
      })
    );
    showFeedback({
      message: `Truck ${truck.unitNumber} assigned to workshop schedule.`,
    });

    return newJob.id;
  };

  const updateTruckStatus = (truckId, status) => {
    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        trucks: currentState.trucks.map((truck) =>
          truck.id === truckId
            ? {
                ...truck,
                status,
              }
            : truck
        ),
      })
    );
  };

  const updateJobStatus = (jobId, status) => {
    const targetJob = appState.jobs.find((job) => job.id === jobId);
    const targetTruck = appState.trucks.find((truck) => truck.id === targetJob?.truckId);

    if (!targetJob || !targetTruck || !isWorkshopUser) {
      return;
    }

    if (!hasActiveWorkshopAccess(targetTruck.companyId)) {
      return;
    }

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        jobs: currentState.jobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status,
              }
            : job
        ),
        trucks:
          status === JOB_STATUS.IN_PROGRESS || status === JOB_STATUS.DONE
            ? currentState.trucks.map((truck) =>
                truck.id === targetJob.truckId
                  ? {
                      ...truck,
                      status:
                        status === JOB_STATUS.IN_PROGRESS
                          ? TRUCK_STATUS.IN_REPAIR
                          : TRUCK_STATUS.BACK_IN_SERVICE,
                    }
                  : truck
              )
            : currentState.trucks,
      })
    );

    if (status === JOB_STATUS.IN_PROGRESS) {
      showFeedback({
        message: `Repair started for Truck ${targetTruck.unitNumber}.`,
      });
    }

    if (status === JOB_STATUS.DONE) {
      showFeedback({
        message: `Repair completed for Truck ${targetTruck.unitNumber}.`,
      });
    }
  };

  const resolveIssue = (issueId) => {
    const targetIssue = appState.issues.find((issue) => issue.id === issueId);
    const targetTruck = appState.trucks.find((truck) => truck.id === targetIssue?.truckId);

    if (!targetIssue || !targetTruck || !isWorkshopUser) {
      return;
    }

    if (!hasActiveWorkshopAccess(targetTruck.companyId)) {
      return;
    }

    setAppState((currentState) =>
      normalizeAppState({
        ...currentState,
        issues: currentState.issues.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                status: ISSUE_STATUS.RESOLVED,
              }
            : issue
        ),
        jobs: currentState.jobs.map((job) =>
          job.issueId === issueId
            ? {
                ...job,
                status: JOB_STATUS.DONE,
              }
            : job
        ),
        trucks: currentState.trucks.map((truck) =>
          truck.id === targetIssue.truckId
            ? {
                ...truck,
                status: TRUCK_STATUS.BACK_IN_SERVICE,
              }
            : truck
        ),
      })
    );
    showFeedback({
      message: `Repair completed for Truck ${targetTruck.unitNumber}. Back in service.`,
    });
  };

  const completeJobWorkflow = (jobId) => {
    const targetJob = appState.jobs.find((job) => job.id === jobId);

    if (!targetJob || !isWorkshopUser) {
      return;
    }

    resolveIssue(targetJob.issueId);
  };

  const value = {
    users: derivedData.users,
    companies: derivedData.companies,
    workshops: derivedData.workshops,
    warehouses: derivedData.warehouses,
    allWarehouses: derivedData.allWarehouses,
    trucks: derivedData.trucks,
    issues: derivedData.issues,
    jobs: derivedData.jobs,
    links: derivedData.links,
    scheduleDays: derivedData.scheduleDays,
    fleetSummary: derivedData.fleetSummary,
    sessionUsers: derivedData.users.filter(
      (user) =>
        user.role === ROLES.MANAGER ||
        user.role === ROLES.SECRETARY ||
        user.role === ROLES.MECHANIC
    ),
    currentUser,
    currentCompany: derivedData.currentCompany,
    currentWorkshop: derivedData.currentWorkshop,
    currentRole: currentUser?.role || null,
    currentCompanyInvitations: derivedData.currentCompanyInvitations,
    currentWorkshopLinks: derivedData.currentWorkshopLinks,
    currentWorkshopStaff: derivedData.currentWorkshopStaff,
    currentCompanyTrucks: derivedData.currentCompany?.trucks || [],
    currentCompanyWarehouses: derivedData.currentCompany?.warehouses || [],
    currentCompanyLinkedWorkshops: derivedData.currentCompany?.linkedWorkshops || [],
    currentWorkshopLinkedCompanies: derivedData.currentWorkshop?.linkedCompanies || [],
    currentCompanySetup: derivedData.currentCompany?.setup || null,
    currentWorkshopSetup: derivedData.currentWorkshop?.setup || null,
    availableCompaniesForInvite: derivedData.availableCompaniesForInvite,
    mechanics: derivedData.currentWorkshopMechanics,
    feedback,
    isAuthenticated: Boolean(currentUser),
    isHydrated,
    isManager,
    isWorkshopUser,
    dismissFeedback,
    showFeedback,
    loginAsUser,
    logout,
    resetDemoData,
    updateCompanyProfile,
    addWarehouse,
    addTruck,
    updateWorkshopProfile,
    addWorkshopStaff,
    createCompanyLinkRequest,
    acceptCompanyLink,
    reportIssue,
    assignIssueToJob,
    updateJobStatus,
    resolveIssue,
    updateTruckStatus,
    completeJobWorkflow,
    getTruckById: (truckId) => derivedData.visibleTrucksById[truckId] || null,
    getIssueById: (issueId) => derivedData.visibleIssuesById[issueId] || null,
    getJobById: (jobId) => derivedData.visibleJobsById[jobId] || null,
    getJobsForDate: (date) => derivedData.jobs.filter((job) => job.scheduledDate === date),
    getIssuesForTruck: (truckId) => derivedData.allTrucksById[truckId]?.issues || [],
    getJobsForTruck: (truckId) => derivedData.allTrucksById[truckId]?.jobs || [],
    getCurrentIssueForTruck: (truckId) => derivedData.allTrucksById[truckId]?.currentIssue || null,
    getCurrentJobForTruck: (truckId) => derivedData.allTrucksById[truckId]?.currentJob || null,
    getActiveIssueForTruck: (truckId) => derivedData.allTrucksById[truckId]?.activeIssue || null,
    getActiveJobForTruck: (truckId) => derivedData.allTrucksById[truckId]?.activeJob || null,
    getRecentIssuesForTruck: (truckId) => derivedData.allTrucksById[truckId]?.recentIssues || [],
    getRecentJobsForTruck: (truckId) => derivedData.allTrucksById[truckId]?.recentJobs || [],
    getTruckActivity: (truckId) => {
      const truck = derivedData.allTrucksById[truckId];

      if (!truck) {
        return [];
      }

      return getTruckActivity(truck, truck.issues, truck.jobs);
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppData must be used inside AppProvider');
  }

  return context;
}
