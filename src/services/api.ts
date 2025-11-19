import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Authentication ====================

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
    phone?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ==================== Users ====================

export const usersAPI = {
  getAll: async (params?: { role?: string; status?: string; search?: string }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    phone?: string;
    status?: string;
  }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (
    id: string,
    userData: {
      name?: string;
      email?: string;
      role?: string;
      department?: string;
      phone?: string;
      status?: string;
      password?: string;
    }
  ) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  updateProfilePicture: async (id: string, formData: FormData) => {
    const response = await api.put(`/users/${id}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ==================== Projects ====================

export const projectsAPI = {
  getAll: async (params?: { status?: string; search?: string }) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData: {
    name: string;
    description?: string;
    clientName?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    members?: Array<{ userId: string; role?: string }>;
  }) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  update: async (
    id: string,
    projectData: {
      name?: string;
      description?: string;
      clientName?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      progress?: number;
    }
  ) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  addMember: async (projectId: string, userId: string, role?: string) => {
    const response = await api.post(`/projects/${projectId}/members`, { userId, role });
    return response.data;
  },

  removeMember: async (projectId: string, userId: string) => {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },
};

// ==================== Issues ====================

export const issuesAPI = {
  getAll: async (params?: {
    projectId?: string;
    status?: string;
    severity?: string;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  create: async (issueData: {
    projectId: string;
    moduleName: string;
    type: string;
    severity: string;
    status?: string;
    description: string;
    assignedTo?: string;
    relatedLinks?: Array<{ label: string; url: string }>;
    screenshots?: File[];
  }) => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('projectId', issueData.projectId);
    formData.append('moduleName', issueData.moduleName);
    formData.append('type', issueData.type);
    formData.append('severity', issueData.severity);
    formData.append('description', issueData.description);
    
    if (issueData.status) formData.append('status', issueData.status);
    if (issueData.assignedTo) formData.append('assignedTo', issueData.assignedTo);
    if (issueData.relatedLinks) formData.append('relatedLinks', JSON.stringify(issueData.relatedLinks));
    
    // Add screenshot files
    if (issueData.screenshots) {
      issueData.screenshots.forEach((file) => {
        formData.append('screenshots', file);
      });
    }
    
    const response = await api.post('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (
    id: string,
    issueData: {
      moduleName?: string;
      type?: string;
      severity?: string;
      status?: string;
      description?: string;
      assignedTo?: string;
      relatedLinks?: Array<{ label: string; url: string }>;
      screenshots?: File[];
    }
  ) => {
    // If there are file uploads, use FormData
    if (issueData.screenshots && issueData.screenshots.length > 0) {
      const formData = new FormData();
      
      // Add text fields
      if (issueData.moduleName) formData.append('moduleName', issueData.moduleName);
      if (issueData.type) formData.append('type', issueData.type);
      if (issueData.severity) formData.append('severity', issueData.severity);
      if (issueData.status) formData.append('status', issueData.status);
      if (issueData.description) formData.append('description', issueData.description);
      if (issueData.assignedTo) formData.append('assignedTo', issueData.assignedTo);
      if (issueData.relatedLinks) formData.append('relatedLinks', JSON.stringify(issueData.relatedLinks));
      
      // Add screenshot files
      issueData.screenshots.forEach((file) => {
        formData.append('screenshots', file);
      });
      
      const response = await api.put(`/issues/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Regular JSON update without files
      const response = await api.put(`/issues/${id}`, issueData);
      return response.data;
    }
  },

  delete: async (id: string) => {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  },
};

// ==================== Activities ====================

export const activitiesAPI = {
  getByProject: async (projectId: string) => {
    const response = await api.get(`/activities/project/${projectId}`);
    return response.data;
  },

  create: async (activityData: {
    projectId: string;
    action: string;
    details?: string;
  }) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },
};

// ==================== Comments ====================

export const commentsAPI = {
  getByIssue: async (issueId: string) => {
    const response = await api.get(`/comments/issue/${issueId}`);
    return response.data;
  },

  create: async (commentData: {
    issueId: string;
    content: string;
  }) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  update: async (id: string, content: string) => {
    const response = await api.put(`/comments/${id}`, { content });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};

// ==================== Sprints ====================

export const sprintsAPI = {
  getByProject: async (projectId: string) => {
    const response = await api.get(`/sprints/project/${projectId}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/sprints/${id}`);
    return response.data;
  },

  create: async (sprintData: {
    projectId: string;
    name: string;
    goal?: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.post('/sprints', sprintData);
    return response.data;
  },

  update: async (
    id: string,
    sprintData: {
      name?: string;
      goal?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    }
  ) => {
    const response = await api.put(`/sprints/${id}`, sprintData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/sprints/${id}`);
    return response.data;
  },
};

// ==================== Epics ====================

export const epicsAPI = {
  getByProject: async (projectId: string) => {
    const response = await api.get(`/epics/project/${projectId}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/epics/${id}`);
    return response.data;
  },

  create: async (epicData: {
    projectId: string;
    name: string;
    description?: string;
    color?: string;
    startDate?: string;
    targetDate?: string;
  }) => {
    const response = await api.post('/epics', epicData);
    return response.data;
  },

  update: async (
    id: string,
    epicData: {
      name?: string;
      description?: string;
      status?: string;
      color?: string;
      startDate?: string;
      targetDate?: string;
    }
  ) => {
    const response = await api.put(`/epics/${id}`, epicData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/epics/${id}`);
    return response.data;
  },
};

export default api;
