import {
  ISSUE_STATUS_LABELS,
  JOB_STATUS_LABELS,
  PRIORITY_LABELS,
  TRUCK_STATUS_LABELS,
} from './constants';

export function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateLabel(value) {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getTruckStatusLabel(status) {
  return TRUCK_STATUS_LABELS[status] || status;
}

export function getIssueStatusLabel(status) {
  return ISSUE_STATUS_LABELS[status] || status;
}

export function getJobStatusLabel(status) {
  return JOB_STATUS_LABELS[status] || status;
}

export function getPriorityLabel(priority) {
  return PRIORITY_LABELS[priority] || priority;
}
