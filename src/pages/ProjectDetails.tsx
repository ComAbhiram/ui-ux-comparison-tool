import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, issuesAPI, activitiesAPI, usersAPI } from '../services/api';
import { Issue, IssueStatus, IssueSeverity, Project, Activity, User } from '../types';
import NewIssueModal from '../components/NewIssueModal';

type SortField = 'bugId' | 'moduleName' | 'type' | 'severity' | 'status';
type SortOrder = 'asc' | 'desc';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'issues' | 'kanban' | 'activity'>('issues');
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('bugId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editModuleName, setEditModuleName] = useState('');
  const [editType, setEditType] = useState('');
  const [editSeverity, setEditSeverity] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Manager' | 'Lead Developer' | 'QA' | 'Developer'>('Developer');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [editingCell, setEditingCell] = useState<{ issueId: string; field: 'type' | 'status' } | null>(null);

  // Handle keyboard events for full-screen image modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!fullScreenImage || !selectedIssue?.screenshots) return;

      if (event.key === 'Escape') {
        setFullScreenImage(null);
      } else if (event.key === 'ArrowLeft' && currentImageIndex > 0) {
        const newIndex = currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
        const screenshot = selectedIssue.screenshots[newIndex];
        setFullScreenImage(screenshot.startsWith('http') ? screenshot : `http://localhost:5000${screenshot}`);
      } else if (event.key === 'ArrowRight' && currentImageIndex < selectedIssue.screenshots.length - 1) {
        const newIndex = currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
        const screenshot = selectedIssue.screenshots[newIndex];
        setFullScreenImage(screenshot.startsWith('http') ? screenshot : `http://localhost:5000${screenshot}`);
      }
    };

    if (fullScreenImage) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [fullScreenImage, currentImageIndex, selectedIssue]);

  // Fetch project data, issues, and activities from API
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [projectData, issuesData, activitiesData, usersData] = await Promise.all([
          projectsAPI.getById(id),
          issuesAPI.getAll({ projectId: id }),
          activitiesAPI.getByProject(id),
          usersAPI.getAll()
        ]);
        setProject(projectData);
        setIssues(issuesData);
        setActivities(activitiesData);
        setUsers(usersData);
      } catch (error: any) {
        console.error('Failed to fetch project data:', error);
        
        // Handle authorization errors
        if (error.response?.status === 403) {
          alert('Access Denied: You can only view projects you are assigned to as a member.');
          navigate('/projects');
          return;
        }
        
        // Handle not found
        if (error.response?.status === 404) {
          alert('Project not found');
          navigate('/projects');
          return;
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedIssues = useMemo(() => {
    // Ensure issues is an array and filter out any null/undefined items
    const validIssues = Array.isArray(issues) ? issues.filter(issue => issue && typeof issue === 'object') : [];
    
    let filtered = validIssues.filter(issue => {
      const matchesSearch = (issue.bugId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (issue.moduleName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (issue.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || issue.type === typeFilter;
      const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [issues, searchTerm, typeFilter, severityFilter, statusFilter, sortField, sortOrder]);

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    try {
      await issuesAPI.update(issueId, { status: newStatus });
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));
    } catch (error: any) {
      alert(`Failed to update status: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSeverityChange = async (issueId: string, newSeverity: IssueSeverity) => {
    try {
      await issuesAPI.update(issueId, { severity: newSeverity });
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, severity: newSeverity } : issue
      ));
    } catch (error: any) {
      alert(`Failed to update severity: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleInlineEdit = async (issueId: string, field: 'type' | 'status', value: string) => {
    try {
      const updateData = { [field]: value };
      await issuesAPI.update(issueId, updateData);
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, [field]: value } : issue
      ));
      setEditingCell(null);
    } catch (error: any) {
      alert(`Failed to update ${field}: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !id) return;

    try {
      await projectsAPI.addMember(id, selectedUserId, selectedRole);
      
      // Refresh project data to get updated members list
      const updatedProject = await projectsAPI.getById(id);
      setProject(updatedProject);
      
      setSelectedUserId('');
      setSelectedRole('Developer');
      alert('Member added successfully!');
    } catch (error: any) {
      alert(`Failed to add member: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCreateNewIssue = async (issueData: any) => {
    if (!project?.id) return;

    try {
      console.log('Creating issue with data:', issueData);
      
      // Create FormData for API call with file uploads
      const formData = new FormData();
      
      // Add required fields
      formData.append('projectId', project.id);
      formData.append('type', issueData.type || 'Bug');
      formData.append('title', issueData.title || '');
      formData.append('description', issueData.description || '');
      formData.append('severity', 'Medium'); // Default severity
      formData.append('moduleName', 'General'); // Default module
      
      // Add optional fields
      if (issueData.assignedTo?.id) {
        formData.append('assignedTo', issueData.assignedTo.id);
      }
      
      if (issueData.labels && issueData.labels.length > 0) {
        formData.append('labels', JSON.stringify(issueData.labels));
      }
      
      if (issueData.milestone) {
        formData.append('milestone', issueData.milestone);
      }
      
      if (issueData.startDate) {
        formData.append('startDate', issueData.startDate);
      }
      
      if (issueData.dueDate) {
        formData.append('dueDate', issueData.dueDate);
      }
      
      formData.append('confidential', String(issueData.confidential || false));
      
      // Add file attachments
      if (issueData.attachments && issueData.attachments.length > 0) {
        issueData.attachments.forEach((file: File) => {
          formData.append('attachments', file);
        });
      }

      // Direct API call to backend with proper FormData handling
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch('http://localhost:5000/api/issues', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`Failed to create issue: ${response.status} ${errorText}`);
      }

      const newIssue = await response.json();
      console.log('Issue created successfully:', newIssue);
      
      // Ensure the new issue has all required properties with defaults
      const sanitizedIssue = {
        ...newIssue,
        bugId: newIssue.bugId || `BUG-${Date.now()}`,
        moduleName: newIssue.moduleName || 'General',
        description: newIssue.description || '',
        assignedTo: newIssue.assignedTo || null,
        type: newIssue.type || 'Bug',
        severity: newIssue.severity || 'Medium',
        status: newIssue.status || 'Open'
      };
      
      console.log('Sanitized issue for state:', sanitizedIssue);
      
      // Add to local state
      setIssues(prev => [sanitizedIssue, ...prev]);
      
      // Show success message
      const attachmentCount = issueData.attachments ? issueData.attachments.length : 0;
      alert(`Issue created successfully${attachmentCount > 0 ? ` with ${attachmentCount} file(s)` : ''}!`);
      
    } catch (error: any) {
      console.error('Failed to create issue:', error);
      const errorMessage = error.message || error.response?.data?.error || 'Failed to create issue. Please try again.';
      alert(`Failed to create issue: ${errorMessage}`);
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id || !confirm('Are you sure you want to remove this member?')) return;

    try {
      await projectsAPI.removeMember(id, userId);
      
      // Refresh project data to get updated members list
      const updatedProject = await projectsAPI.getById(id);
      setProject(updatedProject);
      
      alert('Member removed successfully!');
    } catch (error: any) {
      alert(`Failed to remove member: ${error.response?.data?.error || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Kanban Card Component for consistent styling
  const KanbanCard = ({ issue, onClick, className = "" }: { issue: Issue; onClick?: () => void; className?: string }) => (
    <div
      key={issue.id}
      className={`bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer group flex flex-col min-h-[160px] ${className}`}
      onClick={onClick || (() => handleViewDetails(issue))}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-blue-600 dark:text-blue-400">
            {issue.type === 'Bug' ? 'bug_report' : 
             issue.type === 'Enhancement' ? 'lightbulb' : 'build'}
          </span>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {issue.bugId}
          </span>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          issue.type === 'Bug' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
          issue.type === 'Enhancement' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {issue.type}
        </span>
      </div>
      
      {/* Content */}
      <div className="flex-1 mb-3">
        <h5 className="font-medium text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem] leading-6">
          {issue.moduleName}
        </h5>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[2.5rem] leading-5">
          {issue.description}
        </p>
      </div>
      
      {/* Footer */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-600 flex-shrink-0"
              style={{ backgroundImage: `url(${issue.assignedTo?.avatar})` }}
              title={issue.assignedTo?.name || 'Unassigned'}
            ></div>
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {issue.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="material-symbols-outlined text-sm text-slate-400">
              {issue.severity === 'Critical' ? 'priority_high' : 
               issue.severity === 'High' ? 'keyboard_arrow_up' :
               issue.severity === 'Medium' ? 'remove' : 'keyboard_arrow_down'}
            </span>
            <span className={`text-xs font-medium ${
              issue.severity === 'Critical' ? 'text-red-600 dark:text-red-400' :
              issue.severity === 'High' ? 'text-orange-600 dark:text-orange-400' :
              issue.severity === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {issue.severity}
            </span>
          </div>
        </div>
        
        {/* Attachments - Always reserve space */}
        <div className="h-4 flex items-center">
          {issue.screenshots && issue.screenshots.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-sm">image</span>
              <span>{issue.screenshots.length} attachment{issue.screenshots.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowDetailsModal(true);
  };

  const handleEditClick = (issue: Issue) => {
    console.log('handleEditClick called with issue:', issue);
    setSelectedIssue(issue);
    setEditDescription(issue.description);
    setEditModuleName(issue.moduleName);
    setEditType(issue.type);
    setEditSeverity(issue.severity);
    setEditStatus(issue.status);
    setEditAssignedTo(issue.assignedTo?.id || '');
    setEditSelectedFiles([]);
    setShowEditModal(true);
    console.log('Edit modal should be visible now');
  };

  const handleSaveEdit = async () => {
    if (!selectedIssue) return;

    // Validation
    if (!editModuleName || !editType || !editSeverity || !editStatus || !editDescription || !editAssignedTo) {
      alert('Please fill in all required fields:\n- Module Name\n- Issue Type\n- Severity\n- Status\n- Issue Detail\n- Assigned To');
      return;
    }

    try {
      console.log('Updating issue with files:', editSelectedFiles);
      await issuesAPI.update(selectedIssue.id, {
        moduleName: editModuleName,
        type: editType as Issue['type'],
        severity: editSeverity as Issue['severity'],
        status: editStatus as Issue['status'],
        description: editDescription,
        assignedTo: editAssignedTo,
        screenshots: editSelectedFiles
      });

      // Reload issues to get the updated data
      if (id) {
        const updatedIssues = await issuesAPI.getAll({ projectId: id });
        setIssues(updatedIssues);
      }

      setShowEditModal(false);
      setSelectedIssue(null);
      setEditSelectedFiles([]);
      alert('Issue updated successfully!');
    } catch (error: any) {
      console.error('Update issue error:', error);
      alert(`Failed to update issue: ${error.response?.data?.error || error.message}`);
    }
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Project not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-primary hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Fixed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'Reopen':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="flex-1">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading project details...</p>
          </div>
        </div>
      ) : !project ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">Project not found</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* Breadcrumbs */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary transition-colors"
        >
          Dashboard
        </button>
        <span className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-normal">/</span>
        <span className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal">
          {project.name}
        </span>
      </div>
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {project.description}
          </p>
        </div>
        <button
          onClick={() => setShowAddIssue(true)}
          className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-medium leading-normal shadow-sm hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span className="truncate">Report New Issue</span>
        </button>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Status</p>
          <select
            value={project.status}
            onChange={async (e) => {
              const newStatus = e.target.value;
              try {
                await projectsAPI.update(project.id, { status: newStatus });
                setProject({ ...project, status: newStatus as any });
              } catch (error: any) {
                alert(`Failed to update status: ${error.response?.data?.error || error.message}`);
              }
            }}
            className="w-full text-base font-semibold rounded-lg border-0 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Progress</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            {project.progress}%
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Open Issues</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            {issues.filter((i) => i.status === 'Open').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Team Members</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                {project.members.length}
              </p>
            </div>
            <button
              onClick={() => setShowMembersModal(true)}
              className="text-primary hover:text-primary/80 transition-colors"
              title="Manage members"
            >
              <span className="material-symbols-outlined">group_add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'issues'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Issues ({issues.length})
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'kanban'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">view_kanban</span>
              Board
            </span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Issues Table */}
      {activeTab === 'issues' && (
        <>
          {/* Filters and Search for Issues */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="Bug">Bug</option>
              <option value="Enhancement">Enhancement</option>
              <option value="Correction">Correction</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Fixed">Fixed</option>
              <option value="Closed">Closed</option>
              <option value="Reopen">Reopen</option>
            </select>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              {filteredAndSortedIssues.length} of {issues.length} issues
            </div>
          </div>

          <div className="w-full @container">
            <div className="overflow-hidden rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <th 
                      className="px-3 py-1.5 text-left text-gray-700 dark:text-gray-300 text-xs font-normal cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors w-32"
                      onClick={() => handleSort('bugId')}
                    >
                      <div className="flex items-center gap-1">
                        Key
                        {sortField === 'bugId' && (
                          <span className="material-symbols-outlined text-xs">
                            {sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-3 py-1.5 text-left text-gray-700 dark:text-gray-300 text-xs font-normal cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1">
                        Type
                        {sortField === 'type' && (
                          <span className="material-symbols-outlined text-xs">
                            {sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-3 py-1.5 text-left text-gray-700 dark:text-gray-300 text-xs font-normal cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors w-80"
                      onClick={() => handleSort('moduleName')}
                    >
                      <div className="flex items-center gap-1">
                        Issue
                        {sortField === 'moduleName' && (
                          <span className="material-symbols-outlined text-xs">
                            {sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-3 py-1.5 text-left text-gray-700 dark:text-gray-300 text-xs font-normal cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        {sortField === 'status' && (
                          <span className="material-symbols-outlined text-xs">
                            {sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-1.5 text-left text-gray-700 dark:text-gray-300 text-xs font-normal">
                      Assignee
                    </th>
                    <th 
                      className="px-3 py-1.5 text-left text-gray-700 dark:text-gray-300 text-xs font-normal cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => handleSort('severity')}
                    >
                      <div className="flex items-center gap-1">
                        Priority
                        {sortField === 'severity' && (
                          <span className="material-symbols-outlined text-xs">
                            {sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-1.5 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="group border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors focus-within:bg-blue-50 dark:focus-within:bg-blue-900/10"
                      onClick={() => handleViewDetails(issue)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleViewDetails(issue);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for issue ${issue.bugId}: ${issue.moduleName}`}
                    >
                      <td className="px-3 py-1.5 w-32">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-blue-600 dark:text-blue-400">
                            {issue.type === 'Bug' ? 'bug_report' : 
                             issue.type === 'Enhancement' ? 'lightbulb' : 'build'}
                          </span>
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                            {issue.bugId}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                        {editingCell?.issueId === issue.id && editingCell?.field === 'type' ? (
                          <select
                            value={issue.type}
                            onChange={(e) => handleInlineEdit(issue.id, 'type', e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            className="text-xs px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          >
                            <option value="Bug">Bug</option>
                            <option value="Enhancement">Enhancement</option>
                            <option value="Correction">Correction</option>
                          </select>
                        ) : (
                          <span 
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-75 transition-opacity ${
                              issue.type === 'Bug' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              issue.type === 'Enhancement' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}
                            onClick={() => setEditingCell({ issueId: issue.id, field: 'type' })}
                            title="Click to edit type"
                          >
                            {issue.type}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 w-80">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 leading-4">
                            {issue.moduleName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-md leading-3">
                            {issue.description.length > 60 ? `${issue.description.substring(0, 60)}...` : issue.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                        {editingCell?.issueId === issue.id && editingCell?.field === 'status' ? (
                          <select
                            value={issue.status}
                            onChange={(e) => handleInlineEdit(issue.id, 'status', e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            className="text-xs px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Fixed">Fixed</option>
                            <option value="Closed">Closed</option>
                            <option value="Reopen">Reopen</option>
                          </select>
                        ) : (
                          <span 
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-75 transition-opacity ${getStatusColor(issue.status)}`}
                            onClick={() => setEditingCell({ issueId: issue.id, field: 'status' })}
                            title="Click to edit status"
                          >
                            {issue.status}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <div
                            className="w-4 h-4 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-600"
                            style={{ backgroundImage: `url(${issue.assignedTo?.avatar})` }}
                            title={issue.assignedTo?.name || 'Unassigned'}
                          ></div>
                          <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-16">
                            {issue.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <span className="material-symbols-outlined text-sm text-gray-600 dark:text-gray-400">
                            {issue.severity === 'Critical' ? 'priority_high' : 
                             issue.severity === 'High' ? 'keyboard_arrow_up' :
                             issue.severity === 'Medium' ? 'remove' : 'keyboard_arrow_down'}
                          </span>
                          <span className={`text-xs font-medium ${
                            issue.severity === 'Critical' ? 'text-red-600 dark:text-red-400' :
                            issue.severity === 'High' ? 'text-orange-600 dark:text-orange-400' :
                            issue.severity === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {issue.severity}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="opacity-50 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditClick(issue)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
                            title="Edit issue"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Empty State */}
              {filteredAndSortedIssues.length === 0 && (
                <div className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No search results</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Try a different word, phrase or filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setSeverityFilter('all');
                      setStatusFilter('all');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        </>
      )}

      {/* Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          {/* Kanban Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Project Board</h3>
            <div className="flex items-center gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="Bug">Bug</option>
                <option value="Enhancement">Enhancement</option>
                <option value="Correction">Correction</option>
              </select>
              <button
                onClick={() => setShowAddIssue(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Issue
              </button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {/* Open Column */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Open</h4>
                    <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {filteredAndSortedIssues.filter(issue => issue.status === 'Open').length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[400px]">
                  {filteredAndSortedIssues
                    .filter(issue => issue.status === 'Open')
                    .map(issue => (
                      <KanbanCard key={issue.id} issue={issue} />
                    ))}
                </div>
              </div>
            </div>

            {/* In Progress Column */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <h4 className="font-medium text-slate-900 dark:text-white">In Progress</h4>
                    <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {filteredAndSortedIssues.filter(issue => issue.status === 'In Progress').length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[400px]">
                  {filteredAndSortedIssues
                    .filter(issue => issue.status === 'In Progress')
                    .map(issue => (
                      <KanbanCard key={issue.id} issue={issue} />
                    ))}
                </div>
              </div>
            </div>

            {/* Fixed Column */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Fixed</h4>
                    <span className="text-xs bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 px-2 py-0.5 rounded-full">
                      {filteredAndSortedIssues.filter(issue => issue.status === 'Fixed').length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[400px]">
                  {filteredAndSortedIssues
                    .filter(issue => issue.status === 'Fixed')
                    .map(issue => (
                      <KanbanCard key={issue.id} issue={issue} onClick={() => handleViewDetails(issue)} />
                    ))}
                </div>
              </div>
            </div>

            {/* Closed Column */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Closed</h4>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                      {filteredAndSortedIssues.filter(issue => issue.status === 'Closed').length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {filteredAndSortedIssues
                    .filter(issue => issue.status === 'Closed')
                    .map(issue => (
                      <KanbanCard 
                        key={issue.id} 
                        issue={issue} 
                        onClick={() => handleViewDetails(issue)}
                        className="opacity-75"
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark"
            >
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${activity.user.avatar})` }}
              ></div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {activity.user.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{activity.action}</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                  {activity.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Details Modal */}
      {showDetailsModal && selectedIssue && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailsModal(false)}>
          <div className="relative w-full max-w-3xl transform rounded-xl bg-white dark:bg-gray-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedIssue.bugId}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedIssue.severity)}`}>
                    {selectedIssue.severity}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedIssue.status)}`}>
                    {selectedIssue.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedIssue.moduleName}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center ml-4"
                type="button"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Issue Information Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Issue Type
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">{selectedIssue.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Assigned To
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${selectedIssue.assignedTo?.avatar})` }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedIssue.assignedTo?.name || 'Unassigned'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedIssue.assignedTo?.role || 'No role assigned'}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Reported By
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${selectedIssue.reportedBy.avatar})` }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedIssue.reportedBy.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedIssue.reportedBy.role}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Created Date
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">
                    {new Date(selectedIssue.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Issue Description
                </label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                    {selectedIssue.description}
                  </p>
                </div>
              </div>

              {/* Links Section */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Related Links
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">link</span>
                    <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View in Source Control
                    </a>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">code</span>
                    <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Related Commit
                    </a>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">description</span>
                    <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Documentation Reference
                    </a>
                  </div>
                </div>
              </div>

              {/* Screenshots */}
              {selectedIssue.screenshots && selectedIssue.screenshots.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Screenshots
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedIssue.screenshots.map((screenshot, index) => (
                      <div 
                        key={index} 
                        className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                        onClick={() => {
                          setFullScreenImage(screenshot.startsWith('http') ? screenshot : `http://localhost:5000${screenshot}`);
                          setCurrentImageIndex(index);
                        }}
                      >
                        <img 
                          src={screenshot.startsWith('http') ? screenshot : `http://localhost:5000${screenshot}`} 
                          alt={`Screenshot ${index + 1}`} 
                          className="w-full h-auto group-hover:opacity-90 transition-opacity" 
                        />
                        
                        {/* Hover overlay with expand icon */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                            <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">zoom_in</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">image</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No screenshots attached</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Timeline
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">add_circle</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Issue Created</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(selectedIssue.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">update</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Last Updated</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(selectedIssue.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700 rounded-b-xl bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditClick(selectedIssue);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Edit Issue
                </span>
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Description Modal */}
      {showEditModal && selectedIssue && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-gray-900/60 flex items-center justify-center p-4 z-50" onClick={() => setShowEditModal(false)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] transform rounded-xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-xl flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Issue - {selectedIssue.bugId}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                type="button"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bug ID - Read Only */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="edit-bug-id">
                    Bug ID
                  </label>
                  <input
                    className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 h-11 px-4 text-sm font-medium cursor-not-allowed"
                    id="edit-bug-id"
                    name="edit-bug-id"
                    readOnly
                    type="text"
                    value={selectedIssue.bugId}
                  />
                </div>

                {/* Module Name */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="edit-module-name">
                    Module Name *
                  </label>
                  <input
                    className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-11 px-4 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="edit-module-name"
                    name="edit-module-name"
                    value={editModuleName}
                    onChange={(e) => setEditModuleName(e.target.value)}
                    placeholder="Enter module name"
                    type="text"
                  />
                </div>

                {/* Issue Type */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="edit-type">
                    Issue Type *
                  </label>
                  <select
                    className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-11 px-4 text-sm text-gray-900 dark:text-gray-200"
                    id="edit-type"
                    name="edit-type"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                  >
                    <option value="">Select issue type</option>
                    <option value="Bug">Bug</option>
                    <option value="Enhancement">Enhancement</option>
                    <option value="Correction">Correction</option>
                  </select>
                </div>

                {/* Severity */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="edit-severity">
                    Severity *
                  </label>
                  <select
                    className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-11 px-4 text-sm text-gray-900 dark:text-gray-200"
                    id="edit-severity"
                    name="edit-severity"
                    value={editSeverity}
                    onChange={(e) => setEditSeverity(e.target.value)}
                  >
                    <option value="">Select severity</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Status */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="edit-status">
                    Status *
                  </label>
                  <select
                    className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-11 px-4 text-sm text-gray-900 dark:text-gray-200"
                    id="edit-status"
                    name="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="">Select status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Testing">Testing</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Assigned To */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="edit-assigned-to">
                    Assigned To *
                  </label>
                  <select
                    className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-11 px-4 text-sm text-gray-900 dark:text-gray-200"
                    id="edit-assigned-to"
                    name="edit-assigned-to"
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                  >
                    <option value="">Select assignee</option>
                    {users.filter(user => ['Developer', 'Lead Developer', 'QA'].includes(user.role)).map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issue Description - Full Width */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="edit-issue-detail">
                    Issue Detail *
                  </label>
                  <textarea
                    className="form-textarea w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary p-4 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="edit-issue-detail"
                    name="edit-issue-detail"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Provide a detailed description of the issue..."
                    rows={4}
                  />
                </div>

                {/* Current Screenshots Display */}
                {selectedIssue.screenshots && selectedIssue.screenshots.length > 0 && (
                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Current Screenshots
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {selectedIssue.screenshots.map((screenshot, index) => (
                        <div key={index} className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <img 
                            src={screenshot.startsWith('http') ? screenshot : `http://localhost:5000${screenshot}`} 
                            alt={`Current screenshot ${index + 1}`} 
                            className="w-full h-20 object-cover cursor-pointer" 
                            onClick={() => {
                              setFullScreenImage(screenshot.startsWith('http') ? screenshot : `http://localhost:5000${screenshot}`);
                              setCurrentImageIndex(index);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Note: Uploading new screenshots will add to existing ones.
                    </p>
                  </div>
                )}

                {/* Upload New Screenshots */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="edit-screenshot">
                    Add New Screenshots (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="edit-screenshot"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <span className="material-symbols-outlined text-gray-400 mb-2 text-3xl">add_photo_alternate</span>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 5MB each, up to 5 files)</p>
                      </div>
                      <input 
                        id="edit-screenshot" 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setEditSelectedFiles(files);
                        }}
                      />
                    </label>
                  </div>
                  
                  {/* Display newly selected files */}
                  {editSelectedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New files to upload:</p>
                      <div className="space-y-1">
                        {editSelectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded p-2">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = editSelectedFiles.filter((_, i) => i !== index);
                                setEditSelectedFiles(newFiles);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 rounded-b-xl flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setShowEditModal(false)}
                type="button"
                className="px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                type="button"
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Update Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {showAddIssue && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-gray-900/60 flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-2xl max-h-[90vh] transform rounded-xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-xl flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Issue
              </h3>
              <button
                onClick={() => setShowAddIssue(false)}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                type="button"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bug ID */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="bug-id">
                    Bug ID
                  </label>
                  <input
                    className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 h-11 px-4 text-sm font-medium cursor-not-allowed"
                    id="bug-id"
                    name="bug-id"
                    readOnly
                    type="text"
                    value={`${project.name.substring(0, 4).toUpperCase()}-${Math.floor(Math.random() * 1000)}`}
                  />
                </div>

                {/* Module Name */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="module-name">
                    Module Name
                  </label>
                  <input
                    className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-11 px-4 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                    id="module-name"
                    name="module-name"
                    placeholder="Enter module name"
                    type="text"
                  />
                </div>

                {/* Issue Type */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="type">
                    Issue Type
                  </label>
                  <select
                    className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-11 px-4 text-sm text-gray-900 dark:text-gray-200"
                    id="type"
                    name="type"
                  >
                    <option value="">Select issue type</option>
                    <option value="Bug">Bug</option>
                    <option value="Enhancement">Enhancement</option>
                    <option value="Correction">Correction</option>
                  </select>
                </div>

                {/* Severity */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="severity">
                    Severity
                  </label>
                  <select
                    className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-11 px-4 text-sm text-gray-900 dark:text-gray-200"
                    id="severity"
                    name="severity"
                  >
                    <option value="">Select severity</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Assigned To */}
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="assigned-to">
                    Assigned To
                  </label>
                  <select
                    className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-11 px-4 text-sm text-gray-900 dark:text-gray-200"
                    id="assigned-to"
                    name="assigned-to"
                  >
                    <option value="">Select a team member</option>
                    {project.members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Issue Detail */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="issue-detail">
                  Issue Detail
                </label>
                <textarea
                  className="form-textarea w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary p-4 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                  id="issue-detail"
                  name="issue-detail"
                  placeholder="Provide a detailed description of the issue..."
                  rows={4}
                ></textarea>
              </div>

              {/* Related Links */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Related Links
                </label>
                <div className="space-y-3">
                  {/* Source Control Link */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">link</span>
                    </div>
                    <div className="flex-1">
                      <input
                        className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-10 px-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                        placeholder="View in Source Control (e.g., GitHub URL)"
                        type="url"
                        name="source-control-link"
                      />
                    </div>
                  </div>

                  {/* Related Commit Link */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">code</span>
                    </div>
                    <div className="flex-1">
                      <input
                        className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-10 px-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                        placeholder="Related Commit (e.g., commit hash or URL)"
                        type="text"
                        name="commit-link"
                      />
                    </div>
                  </div>

                  {/* Documentation Reference Link */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">description</span>
                    </div>
                    <div className="flex-1">
                      <input
                        className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-primary h-10 px-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
                        placeholder="Documentation Reference (e.g., Wiki or Doc URL)"
                        type="url"
                        name="documentation-link"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2" htmlFor="screenshot">
                  Screenshot (Optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="screenshot"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="material-symbols-outlined text-gray-400 mb-2 text-3xl">upload</span>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 5MB each, up to 5 files)</p>
                    </div>
                    <input 
                      id="screenshot" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setSelectedFiles(files);
                      }}
                    />
                  </label>
                </div>
                
                {/* Display selected files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Selected files:</p>
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded p-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = selectedFiles.filter((_, i) => i !== index);
                              setSelectedFiles(newFiles);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 rounded-b-xl flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => {
                  setShowAddIssue(false);
                  setSelectedFiles([]);
                }}
                type="button"
                className="px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!id) return;
                  
                  const moduleName = (document.getElementById('module-name') as HTMLInputElement)?.value;
                  const type = (document.getElementById('type') as HTMLSelectElement)?.value;
                  const severity = (document.getElementById('severity') as HTMLSelectElement)?.value;
                  const description = (document.getElementById('issue-detail') as HTMLTextAreaElement)?.value;
                  const assignedToId = (document.getElementById('assigned-to') as HTMLSelectElement)?.value;
                  
                  if (!moduleName || !type || !severity || !description || !assignedToId) {
                    alert('Please fill in all required fields:\n- Module Name\n- Issue Type\n- Severity\n- Issue Detail\n- Assigned To');
                    return;
                  }
                  
                  try {
                    console.log('Creating issue with files:', selectedFiles);
                    await issuesAPI.create({
                      projectId: id,
                      moduleName,
                      type: type as Issue['type'],
                      severity: severity as Issue['severity'],
                      description,
                      status: 'Open',
                      assignedTo: assignedToId, // Backend expects 'assignedTo' not 'assignedToId'
                      screenshots: selectedFiles
                    });
                    
                    // Reload issues to get the properly formatted list with user details
                    const updatedIssues = await issuesAPI.getAll({ projectId: id });
                    setIssues(updatedIssues);
                    setShowAddIssue(false);
                    
                    // Reset form
                    (document.getElementById('module-name') as HTMLInputElement).value = '';
                    (document.getElementById('type') as HTMLSelectElement).value = '';
                    (document.getElementById('severity') as HTMLSelectElement).value = '';
                    (document.getElementById('issue-detail') as HTMLTextAreaElement).value = '';
                    (document.getElementById('assigned-to') as HTMLSelectElement).value = '';
                    (document.getElementById('screenshot') as HTMLInputElement).value = '';
                    setSelectedFiles([]);
                    
                    alert('Issue created successfully!');
                  } catch (error: any) {
                    console.error('Create issue error:', error);
                    alert(`Failed to create issue: ${error.response?.data?.error || error.message}`);
                  }
                }}
                type="button"
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Create Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Management Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Manage Team Members
              </h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Add New Member Section */}
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  Add New Member
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Select User
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Choose a user...</option>
                      {users
                        .filter(u => !project.members.some(m => m.id === u.id))
                        .map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.role}) - {user.email}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Project Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="Manager">Manager</option>
                      <option value="Lead Developer">Lead Developer</option>
                      <option value="Developer">Developer</option>
                      <option value="QA">QA</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUserId}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add Member
                </button>
              </div>

              {/* Current Members List */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  Current Members ({project.members.length})
                </h4>
                <div className="space-y-2">
                  {project.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full" />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {member.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {member.email} • {member.role}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Remove member"
                      >
                        <span className="material-symbols-outlined">person_remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Full-Screen Image Modal */}
      {fullScreenImage && selectedIssue && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setFullScreenImage(null)}
        >
          <div className="relative max-w-full max-h-full animate-scaleIn">
            {/* Close button */}
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute -top-12 right-0 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 z-10 transition-all duration-200 hover:scale-110"
              aria-label="Close full-screen image"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {/* Navigation buttons for multiple images */}
            {selectedIssue.screenshots && selectedIssue.screenshots.length > 1 && (
              <>
                {/* Previous button */}
                {currentImageIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex = currentImageIndex - 1;
                      setCurrentImageIndex(newIndex);
                      if (selectedIssue.screenshots) {
                        const screenshot = selectedIssue.screenshots[newIndex];
                        setFullScreenImage(screenshot.startsWith('http') ? screenshot : `http://localhost:5000${screenshot}`);
                      }
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 z-10 transition-all duration-200 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <span className="material-symbols-outlined text-2xl">chevron_left</span>
                  </button>
                )}

                {/* Next button */}
                {currentImageIndex < selectedIssue.screenshots.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex = currentImageIndex + 1;
                      setCurrentImageIndex(newIndex);
                      if (selectedIssue.screenshots) {
                        const screenshot = selectedIssue.screenshots[newIndex];
                        setFullScreenImage(screenshot.startsWith('http') ? screenshot : `http://localhost:5000${screenshot}`);
                      }
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 z-10 transition-all duration-200 hover:scale-110"
                    aria-label="Next image"
                  >
                    <span className="material-symbols-outlined text-2xl">chevron_right</span>
                  </button>
                )}
              </>
            )}
            
            {/* Full-screen image */}
            <img
              src={fullScreenImage}
              alt="Full-screen screenshot"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
            />
            
            {/* Image info overlay */}
            <div className="absolute -bottom-12 left-0 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md text-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                {selectedIssue.screenshots && selectedIssue.screenshots.length > 1 ? (
                  <>
                    Image {currentImageIndex + 1} of {selectedIssue.screenshots.length} • 
                    Use ← → keys or click buttons to navigate • 
                    Press ESC or click outside to close
                  </>
                ) : (
                  <>Click outside, press ESC, or click ✕ to close</>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Issue Modal */}
      {showAddIssue && (
        <NewIssueModal
          isOpen={showAddIssue}
          onClose={() => setShowAddIssue(false)}
          onSubmit={handleCreateNewIssue}
          users={users}
          projectId={project?.id || ''}
        />
      )}
    </div>
  );
}
