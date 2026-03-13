import { createContext, useContext } from 'react';
import { companies, issues, jobs, trucks, users, warehouses } from '../data/mockData';

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

export function AppProvider({ children }) {
  const companiesById = mapById(companies);
  const warehousesById = mapById(warehouses);
  const usersById = mapById(users);
  const issuesById = mapById(issues);

  const issuesByTruckId = issues.reduce((accumulator, issue) => {
    if (!accumulator[issue.truckId]) {
      accumulator[issue.truckId] = [];
    }

    accumulator[issue.truckId].push(issue);
    return accumulator;
  }, {});

  const jobsByTruckId = jobs.reduce((accumulator, job) => {
    if (!accumulator[job.truckId]) {
      accumulator[job.truckId] = [];
    }

    accumulator[job.truckId].push(job);
    return accumulator;
  }, {});

  const trucksDetailed = trucks.map((truck) => {
    const company = companiesById[truck.companyId];
    const warehouse = warehousesById[truck.warehouseId];
    const truckIssues = sortByDateDescending(issuesByTruckId[truck.id] || [], 'createdAt');
    const truckJobs = sortByDateDescending(jobsByTruckId[truck.id] || [], 'scheduledDate');

    return {
      ...truck,
      company,
      warehouse,
      latestIssue: truckIssues[0] || null,
      latestJob: truckJobs[0] || null,
    };
  });

  const issuesDetailed = sortByDateDescending(issues, 'createdAt').map((issue) => {
    const truck = trucksDetailed.find((item) => item.id === issue.truckId);
    const reporter = usersById[issue.reportedBy] || null;
    const relatedJob = jobs.find((job) => job.issueId === issue.id) || null;

    return {
      ...issue,
      truck,
      reporter,
      company: truck?.company || null,
      warehouse: truck?.warehouse || null,
      job: relatedJob,
    };
  });

  const jobsDetailed = sortByDateAscending(jobs, 'scheduledDate').map((job) => {
    const truck = trucksDetailed.find((item) => item.id === job.truckId);
    const issue = issuesById[job.issueId] || null;
    const warehouse = warehousesById[job.warehouseId] || null;
    const mechanic = usersById[job.assignedMechanicId] || null;

    return {
      ...job,
      truck,
      issue,
      warehouse,
      mechanic,
    };
  });

  const scheduleDays = jobsDetailed.reduce((accumulator, job) => {
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

  const value = {
    companies,
    warehouses,
    users,
    trucks: trucksDetailed,
    issues: issuesDetailed,
    jobs: jobsDetailed,
    scheduleDays,
    getTruckById: (truckId) => trucksDetailed.find((truck) => truck.id === truckId) || null,
    getIssueById: (issueId) => issuesDetailed.find((issue) => issue.id === issueId) || null,
    getJobById: (jobId) => jobsDetailed.find((job) => job.id === jobId) || null,
    getJobsForDate: (date) => jobsDetailed.filter((job) => job.scheduledDate === date),
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
