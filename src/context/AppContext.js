import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  companies,
  issues as initialIssues,
  jobs as initialJobs,
  trucks as initialTrucks,
  users,
  warehouses,
} from '../data/mockData';
import { ISSUE_STATUS, JOB_STATUS, PRIORITY, ROLES, TRUCK_STATUS } from '../utils/constants';

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
  return `${prefix}-${Date.now()}`;
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
        description: `${job.mechanic?.name || 'Workshop mechanic'} assigned at ${job.warehouse?.name || 'workshop'}.`,
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

function getVisibleEntities(currentUser, trucks, issues, jobs) {
  if (!currentUser) {
    return {
      trucks: [],
      issues: [],
      jobs: [],
    };
  }

  if (currentUser.role !== ROLES.MANAGER) {
    return {
      trucks,
      issues,
      jobs,
    };
  }

  const visibleTrucks = trucks.filter((truck) => truck.companyId === currentUser.companyId);
  const visibleTruckIds = new Set(visibleTrucks.map((truck) => truck.id));

  return {
    trucks: visibleTrucks,
    issues: issues.filter((issue) => visibleTruckIds.has(issue.truckId)),
    jobs: jobs.filter((job) => visibleTruckIds.has(job.truckId)),
  };
}

export function AppProvider({ children }) {
  const [trucksState, setTrucksState] = useState(initialTrucks);
  const [issuesState, setIssuesState] = useState(initialIssues);
  const [jobsState, setJobsState] = useState(initialJobs);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const currentUser = users.find((user) => user.id === currentUserId) || null;
  const currentCompany = companies.find((company) => company.id === currentUser?.companyId) || null;
  const isManager = currentUser?.role === ROLES.MANAGER;
  const isWorkshopUser = Boolean(currentUser) && currentUser.role !== ROLES.MANAGER;
  const mechanics = users.filter((user) => user.role === ROLES.MECHANIC);
  const sessionUsers = users.filter(
    (user) => user.role === ROLES.MANAGER || user.role === ROLES.SECRETARY || user.role === ROLES.MECHANIC
  );

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setFeedback(null);
    }, 2600);

    return () => clearTimeout(timeoutId);
  }, [feedback]);

  const derivedData = useMemo(() => {
    const companiesById = mapById(companies);
    const warehousesById = mapById(warehouses);
    const usersById = mapById(users);

    const issuesByTruckId = issuesState.reduce((accumulator, issue) => {
      if (!accumulator[issue.truckId]) {
        accumulator[issue.truckId] = [];
      }

      accumulator[issue.truckId].push(issue);
      return accumulator;
    }, {});

    const jobsByTruckId = jobsState.reduce((accumulator, job) => {
      if (!accumulator[job.truckId]) {
        accumulator[job.truckId] = [];
      }

      accumulator[job.truckId].push(job);
      return accumulator;
    }, {});

    const rawJobsByIssueId = jobsState.reduce((accumulator, job) => {
      if (!accumulator[job.issueId]) {
        accumulator[job.issueId] = [];
      }

      accumulator[job.issueId].push(job);
      return accumulator;
    }, {});

    const trucksDetailed = trucksState.map((truck) => {
      const company = companiesById[truck.companyId] || null;
      const warehouse = warehousesById[truck.warehouseId] || null;
      const truckIssues = sortByDateDescending(issuesByTruckId[truck.id] || [], 'createdAt');
      const truckJobs = sortByDateDescending(jobsByTruckId[truck.id] || [], 'scheduledDate');
      const currentIssue = getCurrentIssue(truckIssues);
      const currentJob = getCurrentJob(truckJobs);
      const activeIssue =
        truckIssues.find((issue) => issue.status !== ISSUE_STATUS.RESOLVED) || null;
      const activeJob = truckJobs.find((job) => job.status !== JOB_STATUS.DONE) || null;

      return {
        ...truck,
        company,
        warehouse,
        issues: truckIssues,
        jobs: truckJobs,
        currentIssue,
        currentJob,
        activeIssue,
        activeJob,
        latestIssue: truckIssues[0] || null,
        latestJob: truckJobs[0] || null,
      };
    });

    const trucksById = mapById(trucksDetailed);

    const jobsDetailed = sortByDateAscending(jobsState, 'scheduledDate').map((job) => {
      const truck = trucksById[job.truckId] || null;
      const warehouse = warehousesById[job.warehouseId] || null;
      const mechanic = usersById[job.assignedMechanicId] || null;

      return {
        ...job,
        truck,
        issue: null,
        warehouse,
        mechanic,
      };
    });

    const jobsDetailedById = mapById(jobsDetailed);

    const issuesDetailed = sortByDateDescending(issuesState, 'createdAt').map((issue) => {
      const truck = trucksById[issue.truckId] || null;
      const reporter = usersById[issue.reportedBy] || null;
      const issueJobs = sortByDateDescending(rawJobsByIssueId[issue.id] || [], 'scheduledDate');
      const currentJob = getCurrentJob(issueJobs);

      return {
        ...issue,
        truck,
        reporter,
        company: truck?.company || null,
        warehouse: truck?.warehouse || null,
        jobs: issueJobs.map((job) => jobsDetailedById[job.id] || job),
        job: currentJob ? jobsDetailedById[currentJob.id] || currentJob : null,
        currentJob: currentJob ? jobsDetailedById[currentJob.id] || currentJob : null,
      };
    });

    const issuesDetailedById = mapById(issuesDetailed);

    const jobsWithIssueDetails = jobsDetailed.map((job) => ({
      ...job,
      issue: issuesDetailedById[job.issueId] || null,
    }));

    const jobsById = mapById(jobsWithIssueDetails);

    const trucksWithResolvedRelations = trucksDetailed.map((truck) => {
      const issues = (truck.issues || []).map((issue) => issuesDetailedById[issue.id] || issue);
      const jobs = (truck.jobs || []).map((job) => jobsById[job.id] || job);
      const currentIssue = truck.currentIssue
        ? issuesDetailedById[truck.currentIssue.id] || truck.currentIssue
        : null;
      const currentJob = truck.currentJob ? jobsById[truck.currentJob.id] || truck.currentJob : null;
      const activeIssue = truck.activeIssue
        ? issuesDetailedById[truck.activeIssue.id] || truck.activeIssue
        : null;
      const activeJob = truck.activeJob ? jobsById[truck.activeJob.id] || truck.activeJob : null;
      const activity = getTruckActivity(truck, issues, jobs);

      return {
        ...truck,
        issues,
        jobs,
        currentIssue,
        currentJob,
        activeIssue,
        activeJob,
        latestIssue: truck.latestIssue
          ? issuesDetailedById[truck.latestIssue.id] || truck.latestIssue
          : null,
        latestJob: truck.latestJob ? jobsById[truck.latestJob.id] || truck.latestJob : null,
        recentIssues: issues.slice(0, 3),
        recentJobs: sortByDateDescending(jobs, 'scheduledDate').slice(0, 3),
        activity,
      };
    });

    const allTrucksById = mapById(trucksWithResolvedRelations);
    const visibleEntities = getVisibleEntities(
      currentUser,
      trucksWithResolvedRelations,
      issuesDetailed,
      jobsWithIssueDetails
    );
    const visibleTrucksById = mapById(visibleEntities.trucks);
    const visibleIssuesById = mapById(visibleEntities.issues);
    const visibleJobsById = mapById(visibleEntities.jobs);

    const scheduleDays = visibleEntities.jobs.reduce((accumulator, job) => {
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

    const fleetSummary = {
      total: visibleEntities.trucks.length,
      outOfService: visibleEntities.trucks.filter(
        (truck) => truck.status === TRUCK_STATUS.OUT_OF_SERVICE
      ).length,
      inRepair: visibleEntities.trucks.filter(
        (truck) => truck.status === TRUCK_STATUS.IN_REPAIR
      ).length,
      backInService: visibleEntities.trucks.filter(
        (truck) => truck.status === TRUCK_STATUS.BACK_IN_SERVICE
      ).length,
      attentionNow: visibleEntities.trucks.filter(
        (truck) => truck.activeIssue || truck.activeJob
      ).length,
    };

    return {
      allTrucksById,
      trucks: visibleEntities.trucks,
      issues: visibleEntities.issues,
      jobs: visibleEntities.jobs,
      scheduleDays,
      fleetSummary,
      visibleTrucksById,
      visibleIssuesById,
      visibleJobsById,
    };
  }, [currentUser, issuesState, jobsState, trucksState]);

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
    setCurrentUserId(userId);
  };

  const logout = () => {
    setCurrentUserId(null);
    dismissFeedback();
  };

  const reportIssue = ({ truckId, description, priority = PRIORITY.NORMAL, photoUrl = null }) => {
    if (!currentUser || currentUser.role !== ROLES.MANAGER) {
      return null;
    }

    const truck = trucksState.find((item) => item.id === truckId);

    if (!truck) {
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

    setIssuesState((currentIssues) => [newIssue, ...currentIssues]);
    setTrucksState((currentTrucks) =>
      currentTrucks.map((currentTruck) =>
        currentTruck.id === truckId
          ? {
              ...currentTruck,
              status: TRUCK_STATUS.OUT_OF_SERVICE,
            }
          : currentTruck
      )
    );
    showFeedback({
      message: `Issue reported for Truck ${truck.unitNumber}. Workshop queue updated.`,
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
    const issue = issuesState.find((item) => item.id === issueId);
    const truck = trucksState.find((item) => item.id === issue?.truckId);

    if (!issue || issue.status !== ISSUE_STATUS.REPORTED || !isWorkshopUser) {
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

    setJobsState((currentJobs) => [...currentJobs, newJob]);
    setIssuesState((currentIssues) =>
      currentIssues.map((currentIssue) =>
        currentIssue.id === issueId
          ? {
              ...currentIssue,
              status: ISSUE_STATUS.ASSIGNED,
            }
          : currentIssue
      )
    );
    setTrucksState((currentTrucks) =>
      currentTrucks.map((currentTruck) =>
        currentTruck.id === issue.truckId
          ? {
              ...currentTruck,
              warehouseId,
              status: TRUCK_STATUS.OUT_OF_SERVICE,
            }
          : currentTruck
      )
    );
    showFeedback({
      message: `Truck ${truck?.unitNumber || ''} assigned to workshop schedule.`,
    });

    return newJob.id;
  };

  const updateTruckStatus = (truckId, status) => {
    setTrucksState((currentTrucks) =>
      currentTrucks.map((truck) =>
        truck.id === truckId
          ? {
              ...truck,
              status,
            }
          : truck
      )
    );
  };

  const updateJobStatus = (jobId, status) => {
    const targetJob = jobsState.find((job) => job.id === jobId);
    const targetTruck = trucksState.find((truck) => truck.id === targetJob?.truckId);

    if (!targetJob || !isWorkshopUser) {
      return;
    }

    setJobsState((currentJobs) =>
      currentJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status,
            }
          : job
      )
    );

    if (status === JOB_STATUS.IN_PROGRESS) {
      updateTruckStatus(targetJob.truckId, TRUCK_STATUS.IN_REPAIR);
      showFeedback({
        message: `Repair started for Truck ${targetTruck?.unitNumber || ''}.`,
      });
    }

    if (status === JOB_STATUS.DONE) {
      updateTruckStatus(targetJob.truckId, TRUCK_STATUS.BACK_IN_SERVICE);
    }
  };

  const resolveIssue = (issueId) => {
    const targetIssue = issuesState.find((issue) => issue.id === issueId);
    const targetTruck = trucksState.find((truck) => truck.id === targetIssue?.truckId);

    if (!targetIssue || !isWorkshopUser) {
      return;
    }

    setIssuesState((currentIssues) =>
      currentIssues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status: ISSUE_STATUS.RESOLVED,
            }
          : issue
      )
    );
    setJobsState((currentJobs) =>
      currentJobs.map((job) =>
        job.issueId === issueId
          ? {
              ...job,
              status: JOB_STATUS.DONE,
            }
          : job
      )
    );
    updateTruckStatus(targetIssue.truckId, TRUCK_STATUS.BACK_IN_SERVICE);
    showFeedback({
      message: `Repair completed for Truck ${targetTruck?.unitNumber || ''}. Back in service.`,
    });
  };

  const completeJobWorkflow = (jobId) => {
    const targetJob = jobsState.find((job) => job.id === jobId);

    if (!targetJob || !isWorkshopUser) {
      return;
    }

    resolveIssue(targetJob.issueId);
  };

  const value = {
    companies,
    warehouses,
    users,
    mechanics,
    sessionUsers,
    currentUser,
    currentCompany,
    currentRole: currentUser?.role || null,
    isAuthenticated: Boolean(currentUser),
    isManager,
    isWorkshopUser,
    feedback,
    dismissFeedback,
    showFeedback,
    trucks: derivedData.trucks,
    issues: derivedData.issues,
    jobs: derivedData.jobs,
    scheduleDays: derivedData.scheduleDays,
    fleetSummary: derivedData.fleetSummary,
    loginAsUser,
    logout,
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
    getTruckActivity: (truckId) => derivedData.allTrucksById[truckId]?.activity || [],
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
