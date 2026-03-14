import { createContext, useContext, useMemo, useState } from 'react';
import {
  companies,
  issues as initialIssues,
  jobs as initialJobs,
  trucks as initialTrucks,
  users,
  warehouses,
} from '../data/mockData';
import {
  ISSUE_STATUS,
  JOB_STATUS,
  ROLES,
  TRUCK_STATUS,
} from '../utils/constants';

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

function createJobId() {
  return `job-${Date.now()}`;
}

export function AppProvider({ children }) {
  const [trucksState, setTrucksState] = useState(initialTrucks);
  const [issuesState, setIssuesState] = useState(initialIssues);
  const [jobsState, setJobsState] = useState(initialJobs);

  const mechanics = users.filter((user) => user.role === ROLES.MECHANIC);

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

      return {
        ...truck,
        company,
        warehouse,
        issues: truckIssues,
        jobs: truckJobs,
        currentIssue: getCurrentIssue(truckIssues),
        currentJob: getCurrentJob(truckJobs),
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

    const trucksWithResolvedRelations = trucksDetailed.map((truck) => ({
      ...truck,
      issues: (truck.issues || []).map((issue) => issuesDetailedById[issue.id] || issue),
      jobs: (truck.jobs || []).map((job) => jobsById[job.id] || job),
      currentIssue: truck.currentIssue
        ? issuesDetailedById[truck.currentIssue.id] || truck.currentIssue
        : null,
      currentJob: truck.currentJob ? jobsById[truck.currentJob.id] || truck.currentJob : null,
      latestIssue: truck.latestIssue ? issuesDetailedById[truck.latestIssue.id] || truck.latestIssue : null,
      latestJob: truck.latestJob ? jobsById[truck.latestJob.id] || truck.latestJob : null,
    }));

    const trucksResolvedById = mapById(trucksWithResolvedRelations);

    const scheduleDays = jobsWithIssueDetails.reduce((accumulator, job) => {
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

    return {
      trucks: trucksWithResolvedRelations,
      issues: issuesDetailed,
      jobs: jobsWithIssueDetails,
      scheduleDays,
      trucksResolvedById,
      issuesDetailedById,
      jobsById,
    };
  }, [issuesState, jobsState, trucksState]);

  const assignIssueToJob = ({
    issueId,
    warehouseId,
    assignedMechanicId,
    scheduledDate,
    estimatedReturnDate,
  }) => {
    const issue = issuesState.find((item) => item.id === issueId);

    if (!issue || issue.status !== ISSUE_STATUS.REPORTED) {
      return null;
    }

    const newJob = {
      id: createJobId(),
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
      currentTrucks.map((truck) =>
        truck.id === issue.truckId
          ? {
              ...truck,
              warehouseId,
              status: TRUCK_STATUS.OUT_OF_SERVICE,
            }
          : truck
      )
    );

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

    if (!targetJob) {
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
    }
  };

  const resolveIssue = (issueId) => {
    const targetIssue = issuesState.find((issue) => issue.id === issueId);

    if (!targetIssue) {
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
  };

  const value = {
    companies,
    warehouses,
    users,
    mechanics,
    trucks: derivedData.trucks,
    issues: derivedData.issues,
    jobs: derivedData.jobs,
    scheduleDays: derivedData.scheduleDays,
    assignIssueToJob,
    updateJobStatus,
    resolveIssue,
    updateTruckStatus,
    getTruckById: (truckId) => derivedData.trucksResolvedById[truckId] || null,
    getIssueById: (issueId) => derivedData.issuesDetailedById[issueId] || null,
    getJobById: (jobId) => derivedData.jobsById[jobId] || null,
    getJobsForDate: (date) => derivedData.jobs.filter((job) => job.scheduledDate === date),
    getIssuesForTruck: (truckId) => derivedData.trucksResolvedById[truckId]?.issues || [],
    getJobsForTruck: (truckId) => derivedData.trucksResolvedById[truckId]?.jobs || [],
    getCurrentIssueForTruck: (truckId) =>
      derivedData.trucksResolvedById[truckId]?.currentIssue || null,
    getCurrentJobForTruck: (truckId) => derivedData.trucksResolvedById[truckId]?.currentJob || null,
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
