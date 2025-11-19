import { useState, useEffect, useRef } from 'react';
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
    type: 'Bug',
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
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [availableTypes, setAvailableTypes] = useState<IssueType[]>([]);
  const [titleError, setTitleError] = useState('');

  // File upload handlers
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging false if we're leaving the component entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
      // Show notification about dropped files
      const fileNames = Array.from(files).map(f => f.name).join(', ');
      console.log(`Files dropped: ${fileNames}`);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load labels and types from API
  useEffect(() => {
    if (isOpen) {
      // Fetch labels from API
      fetch('http://localhost:5000/api/labels')
        .then(res => res.json())
        .then(labels => {
          setAvailableLabels(labels.map((label: any) => ({
            id: label.id.toString(),
            name: label.name,
            color: label.color
          })));
        })
        .catch(error => {
          console.error('Failed to fetch labels:', error);
          // Fallback to default labels
          setAvailableLabels([
            { id: '1', name: 'bug', color: '#d73a49' },
            { id: '2', name: 'enhancement', color: '#a2eeef' },
            { id: '3', name: 'documentation', color: '#0075ca' },
          ]);
        });

      // Fetch issue types from API
      fetch('http://localhost:5000/api/issue-types')
        .then(res => res.json())
        .then(types => {
          setAvailableTypes(types.map((type: any) => ({
            id: type.id.toString(),
            name: type.name,
            icon: type.icon || 'task_alt'
          })));
        })
        .catch(error => {
          console.error('Failed to fetch issue types:', error);
          // Fallback to default types
          setAvailableTypes([
            { id: '1', name: 'Bug', icon: 'bug_report' },
            { id: '2', name: 'Enhancement', icon: 'lightbulb' },
            { id: '3', name: 'Correction', icon: 'build' },
          ]);
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setTitleError('A title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating issue with form data:', formData);
      console.log('Project ID:', projectId);
      console.log('Attachments:', attachments.length);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all required issue data
      formDataToSend.append('projectId', projectId);
      formDataToSend.append('moduleName', formData.title.trim());
      formDataToSend.append('type', formData.type);
      formDataToSend.append('severity', 'Medium');
      formDataToSend.append('status', 'Open');
      formDataToSend.append('description', formData.description.trim() || 'No description provided');
      
      // Ensure we have a valid assignee
      const assignee = formData.assigneeId || users.find(u => u.role === 'Admin')?.id || users[0]?.id;
      if (!assignee) {
        throw new Error('No valid user found for assignment');
      }
      formDataToSend.append('assignedTo', assignee);
      
      // Add labels if any (backend might expect this)
      if (formData.labels.length > 0) {
        formDataToSend.append('labels', JSON.stringify(formData.labels));
      }
      
      // Add confidential flag
      formDataToSend.append('confidential', formData.confidential.toString());
      
      // Add files with correct field name
      attachments.forEach(file => {
        formDataToSend.append('attachments', file);
      });

      console.log('Preparing issue data for parent component...');

      // Prepare issue data for parent component
      const issueData = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        assignedTo: assignee ? { id: assignee } : undefined,
        labels: formData.labels,
        milestone: formData.milestone,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        confidential: formData.confidential,
        attachments: attachments, // Pass files to parent
      };

      console.log('Calling parent onSubmit with issue data...');
      
      // Call parent onSubmit for issue creation and state management
      if (onSubmit) {
        await onSubmit(issueData);
      }
      
      console.log('Issue creation completed successfully');
      
      // Reset form and close modal
      handleClose();
    } catch (error) {
      console.error('Failed to create issue:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create issue. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'Bug',
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
    setAttachments([]);
    setTitleError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

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
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col border border-slate-200 dark:border-slate-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">task_alt</span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New issue</h2>
              <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Create a merge request and branch
              </a>
            </div>
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
        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Type and Title Row */}
                <div className="flex items-start gap-4">
                  {/* Type Dropdown */}
                  <div className="w-64">
                    <div className="mb-3 flex items-center gap-2">
                      <label htmlFor="work-item-type" className="block text-sm font-medium text-slate-900 dark:text-white">
                        Type
                      </label>
                      <span className="text-red-500">*</span>
                    </div>
                    <div className="relative">
                      <select
                        id="work-item-type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {availableTypes.map((type) => (
                          <option key={type.id} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-2">
                      <label htmlFor="work-item-title" className="block text-sm font-medium text-slate-900 dark:text-white">
                        Title
                      </label>
                      <span className="text-red-500">*</span>
                    </div>
                    <input
                      id="work-item-title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        titleError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="Issue title"
                    />
                    {titleError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{titleError}</p>
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
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`w-full h-32 p-3 border-0 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:outline-none transition-colors ${
                            isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          placeholder="Write a comment or drag your files here..."
                        />
                      </div>
                      
                      {/* File Attachment Section */}
                      <div className="mb-4">
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            isDragging 
                              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-3xl text-slate-400">
                              cloud_upload
                            </span>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-medium">Drop files here</span> or{' '}
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-600 hover:text-blue-700 font-medium underline"
                              >
                                browse
                              </button>
                            </div>
                            <div className="text-xs text-slate-500">
                              Supports images, documents, and files up to 10MB
                            </div>
                          </div>
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                          onChange={(e) => handleFileSelect(e.target.files)}
                        />
                        
                        {/* File Preview List */}
                        {attachments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Attached Files ({attachments.length})
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded border">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="material-symbols-outlined text-sm text-slate-500">
                                      {file.type.startsWith('image/') ? 'image' : 'description'}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                        {file.name}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {formatFileSize(file.size)}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeAttachment(index)}
                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Remove file"
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
                        {/* Assignee */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-slate-900 dark:text-white">Assignee</h3>
                            <button 
                              type="button"
                              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              onClick={() => setFormData(prev => ({ ...prev, assigneeId: users[0]?.id || '' }))}
                            >
                              Assign to me
                            </button>
                          </div>
                          <select
                            name="assigneeId"
                            value={formData.assigneeId}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                          >
                            <option value="">Unassigned</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Labels */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">label</span>
                            Labels
                          </h3>
                          
                          {/* Selected Labels Display */}
                          {formData.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                              {formData.labels.map(labelId => {
                                const label = availableLabels.find(l => String(l.id) === String(labelId));
                                if (!label) return null;
                                return (
                                  <span
                                    key={labelId}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-md"
                                    style={{ backgroundColor: label.color }}
                                  >
                                    {label.name}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          labels: prev.labels.filter(id => id !== labelId)
                                        }));
                                      }}
                                      className="ml-1 text-white/80 hover:text-white"
                                    >
                                      <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                  </span>
                                );
              })}
                            </div>
                          )}
                          
                          {/* Labels Dropdown */}
                          <div className="relative">
                            <div className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2 min-h-[100px] max-h-40 overflow-y-auto">
                              {availableLabels.length === 0 ? (
                                <div className="text-sm text-slate-500 dark:text-slate-400 p-2 text-center">
                                  No labels available
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {availableLabels.map((label) => (
                                    <label 
                                      key={label.id} 
                                      className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0"
                                        checked={formData.labels.includes(String(label.id))}
                                        onChange={(e) => {
                                          const isChecked = e.target.checked;
                                          const labelIdString = String(label.id);
                                          console.log('Label selection change:', { 
                                            labelName: label.name, 
                                            labelId: labelIdString, 
                                            isChecked, 
                                            currentLabels: formData.labels 
                                          });
                                          setFormData(prev => {
                                            const newLabels = isChecked
                                              ? [...prev.labels, labelIdString]
                                              : prev.labels.filter(id => id !== labelIdString);
                                            console.log('Updated labels:', newLabels);
                                            return {
                                              ...prev,
                                              labels: newLabels
                                            };
                                          });
                                        }}
                                      />
                                      <span
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-white rounded-md"
                                        style={{ backgroundColor: label.color }}
                                      >
                                        🏷️ {label.name}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                              <span>Click to select/deselect labels</span>
                              <span className="text-slate-400">{formData.labels.length} selected</span>
                            </div>
                          </div>
                        </div>

                        {/* Milestone */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Milestone</h3>
                          <input
                            type="text"
                            name="milestone"
                            value={formData.milestone}
                            onChange={handleInputChange}
                            placeholder="Select milestone"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                          />
                        </div>

                        {/* Due Date */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Due date</h3>
                          <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Creating in <strong>Project Name</strong>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.title.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Create issue'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}