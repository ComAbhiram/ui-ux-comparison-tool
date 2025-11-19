import { useState, useEffect } from 'react';

interface IssueType {
  id: number;
  name: string;
  icon: string;
  description: string;
  color: string;
  created_at: string;
}

interface IssueTypeFormData {
  name: string;
  icon: string;
  description: string;
  color: string;
}

interface AdminIssueTypesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminIssueTypesModal({ isOpen, onClose }: AdminIssueTypesProps) {
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingType, setEditingType] = useState<IssueType | null>(null);
  const [formData, setFormData] = useState<IssueTypeFormData>({
    name: '',
    icon: 'task_alt',
    description: '',
    color: '#6366f1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available Material Icons for issue types
  const availableIcons = [
    { icon: 'task_alt', label: 'Task' },
    { icon: 'bug_report', label: 'Bug' },
    { icon: 'lightbulb', label: 'Idea' },
    { icon: 'build', label: 'Tools' },
    { icon: 'new_releases', label: 'Feature' },
    { icon: 'priority_high', label: 'Priority' },
    { icon: 'warning', label: 'Warning' },
    { icon: 'info', label: 'Info' },
    { icon: 'help', label: 'Question' },
    { icon: 'checklist', label: 'Checklist' },
    { icon: 'code', label: 'Code' },
    { icon: 'integration_instructions', label: 'Integration' },
    { icon: 'settings', label: 'Settings' },
    { icon: 'security', label: 'Security' },
    { icon: 'speed', label: 'Performance' },
    { icon: 'design_services', label: 'Design' }
  ];

  // Fetch issue types from API
  const fetchIssueTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/issue-types');
      const data = await response.json();
      setIssueTypes(data);
    } catch (error) {
      console.error('Failed to fetch issue types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchIssueTypes();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editingType 
        ? `http://localhost:5000/api/issue-types/${editingType.id}`
        : 'http://localhost:5000/api/issue-types';
      
      const method = editingType ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchIssueTypes(); // Refresh the list
        handleReset();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save issue type');
      }
    } catch (error) {
      console.error('Failed to save issue type:', error);
      alert('Failed to save issue type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (issueType: IssueType) => {
    setEditingType(issueType);
    setFormData({
      name: issueType.name,
      icon: issueType.icon || 'task_alt',
      description: issueType.description || '',
      color: issueType.color || '#6366f1'
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this issue type?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/issue-types/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchIssueTypes(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete issue type');
      }
    } catch (error) {
      console.error('Failed to delete issue type:', error);
      alert('Failed to delete issue type');
    }
  };

  const handleReset = () => {
    setEditingType(null);
    setFormData({
      name: '',
      icon: 'task_alt',
      description: '',
      color: '#6366f1'
    });
  };

  const predefinedColors = [
    '#d73a49', '#a2eeef', '#0075ca', '#cc317c', '#ffffff', '#cfd3d7',
    '#7057ff', '#008672', '#e4e669', '#d93f0b', '#0e8a16', '#6366f1',
    '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">category</span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Manage Issue Types
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Form Section */}
          <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col min-h-0">
            <h3 className="text-md font-medium text-slate-900 dark:text-white mb-4 flex-shrink-0">
              {editingType ? 'Edit Issue Type' : 'Create New Issue Type'}
            </h3>
            
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Issue type name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg p-2">
                  {availableIcons.map(({ icon, label }) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-2 rounded-lg border-2 flex flex-col items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        formData.icon === icon 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      title={label}
                    >
                      <span className="material-symbols-outlined text-lg">{icon}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Color
                </label>
                <div className="space-y-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer"
                  />
                  
                  {/* Predefined Colors */}
                  <div className="grid grid-cols-6 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded border-2 ${formData.color === color ? 'border-slate-900 dark:border-white' : 'border-slate-300 dark:border-slate-600'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Issue type description"
                />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Preview
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {formData.name ? (
                    <div className="flex items-center gap-2">
                      <span 
                        className="material-symbols-outlined text-lg"
                        style={{ color: formData.color }}
                      >
                        {formData.icon}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {formData.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-sm">Enter a name to preview</span>
                  )}
                </div>
              </div>
              </div>

              {/* Fixed Button Area */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name.trim()}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Saving...' : (editingType ? 'Update Type' : 'Create Type')}
                  </button>
                  {editingType && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Issue Types List */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-md font-medium text-slate-900 dark:text-white">
                Existing Issue Types ({issueTypes.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <span className="text-slate-500">Loading issue types...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {issueTypes.map((issueType) => (
                  <div
                    key={issueType.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className="material-symbols-outlined text-lg"
                        style={{ color: issueType.color || '#6366f1' }}
                      >
                        {issueType.icon || 'task_alt'}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {issueType.name}
                        </span>
                        {issueType.description && (
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {issueType.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(issueType)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(issueType.id)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                {issueTypes.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No issue types created yet. Create your first issue type!
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}