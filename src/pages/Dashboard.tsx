import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, issuesAPI, usersAPI } from '../services/api';
import { Project, Issue, User } from '../types';
import AdminLabelsModal from '../components/AdminLabelsModal';
import AdminIssueTypesModal from '../components/AdminIssueTypesModal';

type SortField = 'name' | 'status' | 'issues' | 'progress';
type SortOrder = 'asc' | 'desc';
type ExportFormat = 'pdf' | 'excel' | 'csv';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Controlled create-project form state
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [projectStatus, setProjectStatus] = useState('Planning');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');

  // Team assignment state
  const [projectManagerInput, setProjectManagerInput] = useState(''); // free-text but must match an existing user
  const [leadDeveloperId, setLeadDeveloperId] = useState('');
  const [qaLeadIds, setQaLeadIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [showIssueTypesModal, setShowIssueTypesModal] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Fetch projects and issues from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, issuesData] = await Promise.all([
        projectsAPI.getAll(),
        issuesAPI.getAll()
      ]);
      setProjects(projectsData);
      setIssues(issuesData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data function
  const handleRefresh = () => {
    fetchData();
  };

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  // Load users for dropdowns/suggestions
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await usersAPI.getAll();
        setUsers(usersData || []);
      } catch (err) {
        console.error('Failed to load users for project modal', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'issues') {
        aValue = a.issueCount;
        bValue = b.issueCount;
      } else if (sortField === 'progress') {
        aValue = a.progress;
        bValue = b.progress;
      } else if (sortField === 'status') {
        aValue = a.status;
        bValue = b.status;
      } else {
        aValue = a.name;
        bValue = b.name;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - (bValue as number) : (bValue as number) - aValue;
    });
  }, [projects, searchTerm, statusFilter, sortField, sortOrder]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const totalIssues = issues.length;
    const openIssues = issues.filter(i => i.status === 'Open').length;
    const criticalIssues = issues.filter(i => i.severity === 'Critical').length;
    const avgProgress = projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0;

    // Status distribution
    const statusDistribution = {
      'Planning': projects.filter(p => p.status === 'Planning').length,
      'In Progress': projects.filter(p => p.status === 'In Progress').length,
      'Completed': projects.filter(p => p.status === 'Completed').length,
      'On Hold': projects.filter(p => p.status === 'On Hold').length,
      'Cancelled': projects.filter(p => p.status === 'Cancelled').length,
    };

    // Issue severity distribution
    const severityDistribution = {
      'Critical': issues.filter(i => i.severity === 'Critical').length,
      'High': issues.filter(i => i.severity === 'High').length,
      'Medium': issues.filter(i => i.severity === 'Medium').length,
      'Low': issues.filter(i => i.severity === 'Low').length,
    };

    return {
      activeProjects,
      completedProjects,
      totalIssues,
      openIssues,
      criticalIssues,
      avgProgress,
      statusDistribution,
      severityDistribution,
    };
  }, [projects, issues]);

  const handleExport = (format: ExportFormat) => {
    const data = filteredAndSortedProjects.map(project => ({
      'Project Name': project.name,
      'Description': project.description,
      'Status': project.status,
      'Progress': `${project.progress}%`,
      'Issues': project.issueCount,
      'Team Members': project.members.length,
      'Start Date': project.startDate,
      'End Date': project.endDate,
    }));

    if (format === 'csv') {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projects-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'excel') {
      alert('Excel export would generate .xlsx file with applied filters and sorting');
    } else if (format === 'pdf') {
      alert('PDF export would generate formatted report with charts and tables');
    }
    setShowExportMenu(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="flex-1 bg-background-light dark:bg-background-dark min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                {user?.role === 'Admin' ? 'Welcome back, Admin!' : `Welcome, ${user?.name}!`}
              </h1>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                title="Refresh projects"
              >
                <span className={`material-symbols-outlined text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {user?.role === 'Admin' ? "Here's a list of your projects." : 'Your assigned projects.'}
            </p>
          </div>
          {user?.role === 'Admin' && (
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setShowCreateProject(true)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-white text-sm font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap">
                <span className="material-symbols-outlined text-xl">add</span>
                <span>Create Project</span>
              </button>
              <button 
                onClick={() => setShowLabelsModal(true)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-600 px-4 text-white text-sm font-semibold hover:bg-slate-700 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap">
                <span className="material-symbols-outlined text-xl">label</span>
                <span>Manage Labels</span>
              </button>
              <button 
                onClick={() => setShowIssueTypesModal(true)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-600 px-4 text-white text-sm font-semibold hover:bg-slate-700 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap">
                <span className="material-symbols-outlined text-xl">category</span>
                <span>Manage Types</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-card-dark rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-soft-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl sm:text-3xl">folder</span>
              </div>
              <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{projects.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Projects</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">{statistics.activeProjects} active</p>
          </div>

          <div className="bg-white dark:bg-card-dark rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-soft-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl sm:text-3xl">check_circle</span>
              </div>
              <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{statistics.completedProjects}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Completed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">{Math.round((statistics.completedProjects / projects.length) * 100)}% completion rate</p>
          </div>

          <div className="bg-white dark:bg-card-dark rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-soft-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl sm:text-3xl">bug_report</span>
              </div>
              <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{statistics.totalIssues}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Issues</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">{statistics.openIssues} open issues</p>
          </div>

          <div className="bg-white dark:bg-card-dark rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-soft-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl sm:text-3xl">priority_high</span>
              </div>
              <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{statistics.criticalIssues}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Critical Issues</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">Needs immediate attention</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Project Status Distribution */}
          <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">pie_chart</span>
              Project Status Distribution
            </h3>
            <div className="space-y-3">
            {Object.entries(statistics.statusDistribution).map(([status, count]) => {
              const percentage = (count / projects.length) * 100;
              return (
                <div key={status} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{status}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {count} ({Math.round(percentage) || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 ease-out ${
                        status === 'Planning' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        status === 'In Progress' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        status === 'Completed' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        status === 'On Hold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

          {/* Issue Severity Distribution */}
          <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">warning</span>
              Issue Severity Distribution
            </h3>
            <div className="space-y-3">
            {Object.entries(statistics.severityDistribution).map(([severity, count]) => {
              const percentage = (count / statistics.totalIssues) * 100;
              return (
                <div key={severity} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{severity}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {count} ({Math.round(percentage) || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 ease-out ${
                        severity === 'Critical' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                        severity === 'High' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        severity === 'Medium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        'bg-gradient-to-r from-green-400 to-green-600'
                      }`}
                      style={{ width: `${percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

          {/* Average Progress */}
          <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">donut_large</span>
              Average Project Progress
            </h3>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 51.2}`}
                    strokeDashoffset={`${2 * Math.PI * 51.2 * (1 - statistics.avgProgress / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.avgProgress}%</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Projects by Issues */}
          <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-500">leaderboard</span>
              Projects by Issue Count
            </h3>
            <div className="space-y-2.5">
            {projects
              .sort((a, b) => b.issueCount - a.issueCount)
              .slice(0, 4)
              .map((project, index) => (
                <div key={project.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{project.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{project.issueCount} issue{project.issueCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="w-12 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                      style={{ width: `${(project.issueCount / Math.max(...projects.map(p => p.issueCount || 0), 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-all hover:shadow-md"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span className="text-sm font-medium">Export Report</span>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-soft-xl border border-slate-200 dark:border-slate-700 py-2 z-10 animate-slide-down">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-xl text-red-600 dark:text-red-400">picture_as_pdf</span>
                Export as PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-xl text-green-600 dark:text-green-400">table_chart</span>
                Export as Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
              >
                <span className="material-symbols-outlined text-xl text-blue-600 dark:text-blue-400">description</span>
                Export as CSV
              </button>
            </div>
          )}
        </div>
        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center font-medium">
          Showing <span className="mx-1 font-semibold text-slate-900 dark:text-white">{filteredAndSortedProjects.length}</span> of <span className="mx-1 font-semibold text-slate-900 dark:text-white">{projects.length}</span> projects
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-soft">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th 
                  className="px-4 sm:px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Project Name
                    {sortField === 'name' && (
                      <span className="material-symbols-outlined text-base">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortField === 'status' && (
                      <span className="material-symbols-outlined text-base">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none"
                  onClick={() => handleSort('issues')}
                >
                  <div className="flex items-center gap-2">
                    Issues
                    {sortField === 'issues' && (
                      <span className="material-symbols-outlined text-base">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none"
                  onClick={() => handleSort('progress')}
                >
                  <div className="flex items-center gap-2">
                    Progress
                    {sortField === 'progress' && (
                      <span className="material-symbols-outlined text-base">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  Members
                </th>
                <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-4 sm:px-6 py-4 text-right text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAndSortedProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {project.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900 dark:text-white">{project.issueCount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 w-10">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-cover bg-center"
                          style={{ backgroundImage: `url(${member.avatar})` }}
                          title={member.name}
                        ></div>
                      ))}
                      {project.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            +{project.members.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="text-xs text-slate-900 dark:text-white">
                        {new Date(project.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        to {new Date(project.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      View
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateProject(false)}>
          <div className="relative w-full max-w-3xl max-h-[90vh] transform rounded-2xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Start a new QA project</p>
              </div>
              <button
                onClick={() => setShowCreateProject(false)}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
              {/* Project Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Project Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Name */}
                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="project-name">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-white transition-all"
                      id="project-name"
                      name="project-name"
                      placeholder="Enter project name"
                      type="text"
                      required
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  {/* Project Code */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="project-code">
                      Project Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-white transition-all uppercase"
                      id="project-code"
                      name="project-code"
                      placeholder="e.g., PROJ-001"
                      type="text"
                      required
                      value={projectCode}
                      onChange={(e) => setProjectCode(e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="project-status">
                      Status
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-gray-200 transition-all"
                      id="project-status"
                      name="project-status"
                    >
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="project-description">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 p-4 text-sm text-gray-900 dark:text-white transition-all resize-none"
                      id="project-description"
                      name="project-description"
                      placeholder="Provide a detailed description of the project..."
                      rows={4}
                      required
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="start-date">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-white transition-all"
                      id="start-date"
                      name="start-date"
                      type="date"
                      required
                      value={projectStartDate}
                      onChange={(e) => setProjectStartDate(e.target.value)}
                    />
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="end-date">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-white transition-all"
                      id="end-date"
                      name="end-date"
                      type="date"
                      required
                      value={projectEndDate}
                      onChange={(e) => setProjectEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Team Assignment */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Team Assignment</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Assign project-specific roles. Project Manager must be an Admin user, Lead Developer must be a Developer user.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Manager */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="project-manager">
                      Project Manager <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 block font-normal">Must be an Admin user</span>
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-gray-200 transition-all"
                      id="project-manager"
                      name="project-manager"
                      value={projectManagerInput}
                      onChange={(e) => setProjectManagerInput(e.target.value)}
                      required
                    >
                      <option value="">Select Admin User</option>
                      {users.filter(u => u.role === 'Admin' && u.status === 'Active').map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  {/* Lead Developer */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="lead-developer">
                      Lead Developer
                      <span className="text-xs text-gray-500 block font-normal">Select from Developer users</span>
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-gray-200 transition-all"
                      id="lead-developer"
                      name="lead-developer"
                      value={leadDeveloperId}
                      onChange={(e) => setLeadDeveloperId(e.target.value)}
                    >
                      <option value="">Select developer</option>
                      {users.filter(u => u.role === 'Developer' && u.status === 'Active').map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  {/* QA Team */}
                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="qa-lead">
                      QA Team
                      <span className="text-xs text-gray-500 block font-normal">Hold Ctrl/Cmd to select multiple</span>
                    </label>
                    <select
                      multiple
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-28 px-3 py-2 text-sm text-gray-900 dark:text-gray-200 transition-all [&>option]:py-1 [&>option]:px-2 [&>option:checked]:bg-primary [&>option:checked]:text-white"
                      id="qa-lead"
                      name="qa-lead"
                      value={qaLeadIds}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                        setQaLeadIds(selected);
                      }}
                    >
                      {users.filter(u => u.role === 'QA' && u.status === 'Active').map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Project Settings */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Project Settings</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-2 focus:ring-primary/20"
                      defaultChecked
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Enable notifications</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Send email notifications for project updates</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-2 focus:ring-primary/20"
                      defaultChecked
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-assign issues</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Automatically assign new issues to team members</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Require approval</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Require manager approval for issue closure</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setShowCreateProject(false)}
                type="button"
                className="px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // validate required fields
                  if (!projectName || !projectStartDate || !projectEndDate) {
                    alert('Please fill in all required fields');
                    return;
                  }

                  // Resolve manager typed value to a user id
                  const managerInput = projectManagerInput.trim();
                  const managerUser = users.find(u => u.name.toLowerCase() === managerInput.toLowerCase() || u.email.toLowerCase() === managerInput.toLowerCase());
                  if (!managerUser) {
                    alert('Please select a valid existing user as Project Manager from suggestions');
                    return;
                  }

                  // Build members payload using selected users
                  const members: Array<{ userId: string; role?: string }> = [];
                  members.push({ userId: managerUser.id, role: 'Manager' });
                  if (leadDeveloperId) {
                    members.push({ userId: leadDeveloperId, role: 'Lead Developer' });
                  }
                  if (qaLeadIds && qaLeadIds.length > 0) {
                    qaLeadIds.forEach(qid => members.push({ userId: qid, role: 'QA' }));
                  }

                  try {
                    const newProject = await projectsAPI.create({
                      name: projectName,
                      description: projectDescription || '',
                      clientName: projectCode || undefined,
                      status: projectStatus || 'Planning',
                      startDate: projectStartDate,
                      endDate: projectEndDate,
                      members
                    });

                    setProjects([...projects, newProject]);
                    setShowCreateProject(false);
                    // clear form
                    setProjectName('');
                    setProjectCode('');
                    setProjectDescription('');
                    setProjectStartDate('');
                    setProjectEndDate('');
                    setProjectManagerInput('');
                    setLeadDeveloperId('');
                    setQaLeadIds([]);

                    alert(`Project "${projectName}" created successfully!`);
                  } catch (error: any) {
                    alert(`Failed to create project: ${error.response?.data?.error || error.message}`);
                  }
                }}
                type="button"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
        </>
        )}

      {/* Admin Modals */}
      <AdminLabelsModal 
        isOpen={showLabelsModal} 
        onClose={() => setShowLabelsModal(false)} 
      />
      <AdminIssueTypesModal 
        isOpen={showIssueTypesModal} 
        onClose={() => setShowIssueTypesModal(false)} 
      />
      </div>
    </div>
  );
}
