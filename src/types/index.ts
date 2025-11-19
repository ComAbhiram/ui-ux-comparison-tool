export type UserRole = 'Admin' | 'QA' | 'Developer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'Active' | 'Inactive';
  lastActive?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  startDate: string;
  endDate: string;
  members: User[];
  issueCount: number;
  progress: number;
}

export type IssueType = 'Bug' | 'Enhancement' | 'Correction';
export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus = 'Open' | 'In Progress' | 'Fixed' | 'Closed' | 'Reopen';
export type IssuePriority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface Issue {
  id: string;
  projectId: string;
  projectName?: string;
  bugId: string;
  moduleName: string;
  type: IssueType;
  severity: IssueSeverity;
  status: IssueStatus;
  priority: IssuePriority;
  assignedTo: User;
  reportedBy: User;
  description: string;
  labels?: string[];
  epicId?: string;
  sprintId?: string;
  storyPoints?: number;
  timeEstimate?: number; // minutes
  timeSpent?: number; // minutes
  dueDate?: string;
  resolution?: string;
  resolvedAt?: string;
  screenshots?: string[];
  attachments?: Array<{ id: string; name: string; url: string; uploadedAt: string }>;
  watchers?: User[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  user: User;
  action: string;
  details: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  issueId: string;
  user: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type SprintStatus = 'Planning' | 'Active' | 'Completed';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  issues?: Issue[];
  createdAt: string;
  updatedAt: string;
}

export type EpicStatus = 'Open' | 'In Progress' | 'Done' | 'Cancelled';

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: EpicStatus;
  color: string;
  startDate?: string;
  targetDate?: string;
  createdBy?: string;
  issues?: Issue[];
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedFilter {
  id: string;
  userId: string;
  name: string;
  description?: string;
  filterQuery: any;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TimeLog {
  id: string;
  issueId: string;
  user: User;
  timeSpent: number; // minutes
  workDate: string;
  description?: string;
  createdAt: string;
}
