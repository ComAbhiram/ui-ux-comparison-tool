import { useState, useEffect } from 'react';

interface Label {
  id: number;
  name: string;
  color: string;
  description: string;
  created_at: string;
}

interface LabelFormData {
  name: string;
  color: string;
  description: string;
}

interface AdminLabelsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLabelsModal({ isOpen, onClose }: AdminLabelsProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [formData, setFormData] = useState<LabelFormData>({
    name: '',
    color: '#6366f1',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch labels from API
  const fetchLabels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/labels');
      const data = await response.json();
      setLabels(data);
    } catch (error) {
      console.error('Failed to fetch labels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLabels();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editingLabel 
        ? `http://localhost:5000/api/labels/${editingLabel.id}`
        : 'http://localhost:5000/api/labels';
      
      const method = editingLabel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchLabels(); // Refresh the list
        handleReset();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save label');
      }
    } catch (error) {
      console.error('Failed to save label:', error);
      alert('Failed to save label');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (label: Label) => {
    setEditingLabel(label);
    setFormData({
      name: label.name,
      color: label.color,
      description: label.description || ''
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this label?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/labels/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchLabels(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete label');
      }
    } catch (error) {
      console.error('Failed to delete label:', error);
      alert('Failed to delete label');
    }
  };

  const handleReset = () => {
    setEditingLabel(null);
    setFormData({
      name: '',
      color: '#6366f1',
      description: ''
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
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">label</span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Manage Labels
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
              {editingLabel ? 'Edit Label' : 'Create New Label'}
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
                  placeholder="Label name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Color *
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
                  placeholder="Label description"
                />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Preview
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {formData.name ? (
                    <span
                      className="inline-block px-2 py-1 text-xs font-medium text-white rounded"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.name}
                    </span>
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
                    {isSubmitting ? 'Saving...' : (editingLabel ? 'Update Label' : 'Create Label')}
                  </button>
                  {editingLabel && (
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

          {/* Labels List */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-md font-medium text-slate-900 dark:text-white">
                Existing Labels ({labels.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <span className="text-slate-500">Loading labels...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block px-2 py-1 text-xs font-medium text-white rounded"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </span>
                      {label.description && (
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {label.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(label)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(label.id)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                {labels.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No labels created yet. Create your first label!
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