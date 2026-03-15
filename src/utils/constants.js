export const ROLES = {
  MANAGER: 'MANAGER',
  SECRETARY: 'SECRETARY',
  MECHANIC: 'MECHANIC',
};

export const TRUCK_STATUS = {
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
  IN_REPAIR: 'IN_REPAIR',
  BACK_IN_SERVICE: 'BACK_IN_SERVICE',
};

export const ISSUE_STATUS = {
  REPORTED: 'REPORTED',
  ASSIGNED: 'ASSIGNED',
  RESOLVED: 'RESOLVED',
};

export const JOB_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
};

export const LINK_STATUS = {
  INVITED: 'INVITED',
  ACTIVE: 'ACTIVE',
  REMOVED: 'REMOVED',
};

export const PRIORITY = {
  URGENT: 'URGENT',
  NORMAL: 'NORMAL',
  LOW: 'LOW',
};

export const FUEL_TYPES = {
  DIESEL: 'DIESEL',
  ELECTRIC: 'ELECTRIC',
  HYBRID: 'HYBRID',
};

export const TRUCK_STATUS_OPTIONS = [
  {
    label: 'All',
    value: 'ALL',
  },
  {
    label: 'Out of Service',
    value: TRUCK_STATUS.OUT_OF_SERVICE,
  },
  {
    label: 'In Repair',
    value: TRUCK_STATUS.IN_REPAIR,
  },
  {
    label: 'Back in Service',
    value: TRUCK_STATUS.BACK_IN_SERVICE,
  },
];

export const ISSUE_STATUS_LABELS = {
  [ISSUE_STATUS.REPORTED]: 'Reported',
  [ISSUE_STATUS.ASSIGNED]: 'Assigned',
  [ISSUE_STATUS.RESOLVED]: 'Resolved',
};

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.SCHEDULED]: 'Scheduled',
  [JOB_STATUS.IN_PROGRESS]: 'In Progress',
  [JOB_STATUS.DONE]: 'Done',
};

export const LINK_STATUS_LABELS = {
  [LINK_STATUS.INVITED]: 'Invited',
  [LINK_STATUS.ACTIVE]: 'Active',
  [LINK_STATUS.REMOVED]: 'Removed',
};

export const PRIORITY_LABELS = {
  [PRIORITY.URGENT]: 'Urgent',
  [PRIORITY.NORMAL]: 'Normal',
  [PRIORITY.LOW]: 'Low',
};

export const FUEL_TYPE_LABELS = {
  [FUEL_TYPES.DIESEL]: 'Diesel',
  [FUEL_TYPES.ELECTRIC]: 'Electric',
  [FUEL_TYPES.HYBRID]: 'Hybrid',
};

export const TRUCK_STATUS_LABELS = {
  [TRUCK_STATUS.OUT_OF_SERVICE]: 'Out of Service',
  [TRUCK_STATUS.IN_REPAIR]: 'In Repair',
  [TRUCK_STATUS.BACK_IN_SERVICE]: 'Back in Service',
};
