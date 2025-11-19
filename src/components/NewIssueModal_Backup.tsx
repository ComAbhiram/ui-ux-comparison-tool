import { useState, useEffect } from 'react';
import { Issue, User } from '../types';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface IssueType {
  id: string;
  name: string;
  icon: string;
}

interface NewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issueData: Partial<Issue>) => Promise<void>;
  users: User[];
  projectId: string;
}

export default function NewIssueModal({ isOpen, onClose, onSubmit, users, projectId }: NewIssueModalProps) {
  const [formData, setFormData] = useState({
    type: 'Issue',
    title: '',
    description: '',
    assigneeId: '',
    labels: [] as string[],
    milestone: '',
    startDate: '',
    dueDate: '',
    contacts: [] as string[],
    confidential: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [availableTypes, setAvailableTypes] = useState<IssueType[]>([]);
  const [titleError, setTitleError] = useState('');

  // Load labels and types from API
  useEffect(() => {
    if (isOpen) {
      // Mock data for now - will be replaced with API calls
      setAvailableLabels([
        { id: '1', name: 'bug', color: '#d73a49' },
        { id: '2', name: 'enhancement', color: '#a2eeef' },
        { id: '3', name: 'documentation', color: '#0075ca' },
        { id: '4', name: 'question', color: '#cc317c' },
        { id: '5', name: 'wontfix', color: '#ffffff' },
      ]);
      
      setAvailableTypes([
        { id: '1', name: 'Issue', icon: 'task_alt' },
        { id: '2', name: 'Bug', icon: 'bug_report' },
        { id: '3', name: 'Enhancement', icon: 'lightbulb' },
        { id: '4', name: 'Task', icon: 'checklist' },
      ]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const assignedUser = users.find(u => u.id === formData.assigneeId);
      
      const issueData: Partial<Issue> = {
        type: formData.type as 'Bug' | 'Enhancement' | 'Correction',
        moduleName: formData.title,
        description: formData.description || 'No description provided',
        assignedTo: assignedUser || users[0],
        reportedBy: users[0], // Current user
        severity: 'Medium',
        status: 'Open',
        projectId,
        screenshots: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSubmit(issueData);
      handleClose();
    } catch (error) {
      console.error('Failed to create issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'Issue',
      title: '',
      description: '',
      assigneeId: '',
      labels: [],
      milestone: '',
      startDate: '',
      dueDate: '',
      contacts: [],
      confidential: false,
    });
    setShowPreview(false);
    setEditingSection(null);
    onClose();
  };

  // Validate title
  const validateTitle = (title: string) => {
    if (!title.trim()) {
      setTitleError('A title is required');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'title') {
        validateTitle(value);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">New issue</h2>
            <a
              href="#"
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Open in full page"
            >
              <span className="material-symbols-outlined text-sm">open_in_full</span>
            </a>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type and Title Row */}
            <div className="flex items-start gap-4">
              {/* Type Dropdown */}
              <div className="w-64">
                <div className="mb-3 flex items-center gap-2">
                  <label htmlFor="work-item-type" className="block text-sm font-medium text-slate-900 dark:text-white">
                    Type
                  </label>
                </div>
                <select
                  id="work-item-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title Section */}
            <div className="work-item-overview">
              <div className="form-group">
                <label htmlFor="work-item-title" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Title (required)
                </label>
                <input
                  id="work-item-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (e.target.value.trim()) {
                      setTitleError('');
                    }
                  }}
                  onBlur={() => validateTitle(formData.title)}
                  className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    titleError ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Enter issue title..."
                  data-testid="work-item-title-input"
                />
                {titleError && (
                  <div className="text-red-600 dark:text-red-400 text-sm mt-1">{titleError}</div>
                )}
              </div>
            </div>

            {/* Main Content Area with Sidebar */}
            <div className="flex gap-6">
              {/* Left: Description */}
              <div className="flex-1">
                <div className="work-item-description">
                  <label htmlFor="work-item-description" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Description
                  </label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Add <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">description templates</a> to help your contributors communicate effectively!
                  </p>
                  
                  {/* Description Toolbar */}
                  <div className="border border-slate-300 dark:border-slate-600 rounded-lg mb-2">
                    <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-600 p-2 bg-slate-50 dark:bg-slate-700/50">
                      <div className="flex items-center gap-2">
                        <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-sm">format_bold</span>
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-sm">format_italic</span>
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-sm">format_strikethrough</span>
                        </button>
                        <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                        <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-sm">code</span>
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-sm">link</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                          Write
                        </button>
                        <button type="button" className="text-sm text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white">
                          Preview
                        </button>
                      </div>
                    </div>
                    <textarea
                      id="work-item-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full h-32 p-3 border-0 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:outline-none"
                      placeholder="Write a comment or drag your files here..."
                    />
                  </div>
                  
                  {/* Upload Section */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Attach a file by dragging & dropping, selecting or pasting them.
                  </div>
                </div>
                
                {/* Confidential Issue Toggle */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="confidential"
                    name="confidential"
                    checked={formData.confidential}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
                  />
                  <div className="flex-1">
                    <label htmlFor="confidential" className="block text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                      This issue is confidential
                    </label>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Issue access will be limited to project members with at least the Reporter role, author, and assignees.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="space-y-6">
                
                {/* Editor Toolbar */}
                <div className="flex items-center gap-1 p-2 bg-slate-800 border border-slate-600 rounded-t-lg border-b-0">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      !showPreview ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      showPreview ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Preview
                  </button>
                  <div className="w-px h-4 bg-slate-600 mx-2"></div>
                  {/* Formatting buttons */}
                  <div className="flex items-center gap-1">
                    <button type="button" className="p-1 text-slate-400 hover:text-white rounded">
                      <span className="material-symbols-outlined text-sm">format_bold</span>
                    </button>
                    <button type="button" className="p-1 text-slate-400 hover:text-white rounded">
                      <span className="material-symbols-outlined text-sm">format_italic</span>
                    </button>
                    <button type="button" className="p-1 text-slate-400 hover:text-white rounded">
                      <span className="material-symbols-outlined text-sm">format_strikethrough</span>
                    </button>
                    <button type="button" className="p-1 text-slate-400 hover:text-white rounded">
                      <span className="material-symbols-outlined text-sm">link</span>
                    </button>
                    <button type="button" className="p-1 text-slate-400 hover:text-white rounded">
                      <span className="material-symbols-outlined text-sm">list_alt</span>
                    </button>
                    <button type="button" className="p-1 text-slate-400 hover:text-white rounded">
                      <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                    </button>
                    <button type="button" className="p-1 text-slate-400 hover:text-white rounded">
                      <span className="material-symbols-outlined text-sm">checklist</span>
                    </button>
                    <button type="button" className="p-1 text-slate-400 hover:text-white rounded">
                      <span className="material-symbols-outlined text-sm">table_chart</span>
                    </button>
                    <button type="button" className="p-1 text-slate-400 hover:text-white rounded">
                      <span className="material-symbols-outlined text-sm">attach_file</span>
                    </button>
                  </div>
                </div>
                
                {showPreview ? (
                  <div className="min-h-[120px] p-4 bg-slate-800 border border-slate-600 rounded-b-lg text-slate-300 whitespace-pre-wrap">
                    {formData.description || 'Nothing to preview'}
                  </div>
                ) : (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[120px] p-4 bg-slate-800 border border-slate-600 rounded-b-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Write a comment or drag your files here.."
                  />
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Switch to rich text editing
                  </button>
                  <span className="material-symbols-outlined text-slate-600">help</span>
                </div>
              </div>

              {/* Confidentiality */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={formData.confidential}
                  onChange={(e) => setFormData({ ...formData, confidential: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="confidential" className="text-sm font-medium text-slate-300">
                    Turn on confidentiality
                  </label>
                  <p className="text-xs text-slate-400 mt-1">
                    Limit visibility to project members with at least the Reporter role.
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Assignee */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-300">Assignee</h3>
                  <button 
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                    onClick={() => setEditingSection(editingSection === 'assignee' ? null : 'assignee')}
                  >
                    {editingSection === 'assignee' ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                {editingSection === 'assignee' ? (
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => {
                      setFormData({ ...formData, assigneeId: e.target.value });
                      setEditingSection(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  >
                    <option value="">None - assign yourself</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-400">
                    {formData.assigneeId ? users.find(u => u.id === formData.assigneeId)?.name : 'None - assign yourself'}
                  </p>
                )}
              </div>

              {/* Labels */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-300">Labels</h3>
                  <button 
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                    onClick={() => setEditingSection(editingSection === 'labels' ? null : 'labels')}
                  >
                    {editingSection === 'labels' ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingSection === 'labels' ? (
                  <input
                    type="text"
                    placeholder="Add labels (comma separated)"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingSection(null);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <p className="text-xs text-slate-500">{formData.labels.length > 0 ? formData.labels.join(', ') : 'None'}</p>
                )}
              </div>

              {/* Milestone */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-300">Milestone</h3>
                  <button 
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                    onClick={() => setEditingSection(editingSection === 'milestone' ? null : 'milestone')}
                  >
                    {editingSection === 'milestone' ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingSection === 'milestone' ? (
                  <input
                    type="text"
                    placeholder="Enter milestone name"
                    value={formData.milestone}
                    onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingSection(null);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <p className="text-xs text-slate-500">{formData.milestone || 'None'}</p>
                )}
              </div>

              {/* Dates */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-300">Dates</h3>
                  <button 
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                    onClick={() => setEditingSection(editingSection === 'dates' ? null : 'dates')}
                  >
                    {editingSection === 'dates' ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingSection === 'dates' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs text-slate-500">
                    <div>Start: {formData.startDate || 'None'}</div>
                    <div>Due: {formData.dueDate || 'None'}</div>
                  </div>
                )}
              </div>

              {/* Contacts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-300">Contacts</h3>
                  <button 
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                    onClick={() => setEditingSection(editingSection === 'contacts' ? null : 'contacts')}
                  >
                    {editingSection === 'contacts' ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingSection === 'contacts' ? (
                  <input
                    type="text"
                    placeholder="Add contact emails (comma separated)"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingSection(null);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <p className="text-xs text-slate-500">{formData.contacts.length > 0 ? formData.contacts.join(', ') : 'None'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700 bg-slate-800/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.title.trim() || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create issue'}
          </button>
        </div>
      </div>
    </div>
  );
}