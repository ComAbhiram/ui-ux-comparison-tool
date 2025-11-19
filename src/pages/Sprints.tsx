import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sprintsAPI, epicsAPI } from '../services/api';
import { Sprint, Epic } from '../types';

export default function Sprints() {
  const { projectId } = useParams<{ projectId?: string }>();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [showCreateEpic, setShowCreateEpic] = useState(false);

  // Sprint form state
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [sprintStart, setSprintStart] = useState('');
  const [sprintEnd, setSprintEnd] = useState('');

  // Epic form state
  const [epicName, setEpicName] = useState('');
  const [epicDescription, setEpicDescription] = useState('');
  const [epicColor, setEpicColor] = useState('#3b82f6');
  const [epicStart, setEpicStart] = useState('');
  const [epicTarget, setEpicTarget] = useState('');

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sprintsData, epicsData] = await Promise.all([
        sprintsAPI.getByProject(projectId!),
        epicsAPI.getByProject(projectId!)
      ]);
      setSprints(sprintsData || []);
      setEpics(epicsData || []);
    } catch (error) {
      console.error('Failed to load sprints/epics', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async () => {
    if (!sprintName || !sprintStart || !sprintEnd) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const newSprint = await sprintsAPI.create({
        projectId: projectId!,
        name: sprintName,
        goal: sprintGoal,
        startDate: sprintStart,
        endDate: sprintEnd
      });
      setSprints([...sprints, newSprint]);
      setShowCreateSprint(false);
      setSprintName('');
      setSprintGoal('');
      setSprintStart('');
      setSprintEnd('');
    } catch (error: any) {
      alert(`Failed to create sprint: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCreateEpic = async () => {
    if (!epicName) {
      alert('Please enter epic name');
      return;
    }

    try {
      const newEpic = await epicsAPI.create({
        projectId: projectId!,
        name: epicName,
        description: epicDescription,
        color: epicColor,
        startDate: epicStart || undefined,
        targetDate: epicTarget || undefined
      });
      setEpics([...epics, newEpic]);
      setShowCreateEpic(false);
      setEpicName('');
      setEpicDescription('');
      setEpicColor('#3b82f6');
      setEpicStart('');
      setEpicTarget('');
    } catch (error: any) {
      alert(`Failed to create epic: ${error.response?.data?.error || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sprints & Epics</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateEpic(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">flag</span>
              <span>New Epic</span>
            </button>
            <button
              onClick={() => setShowCreateSprint(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">sprint</span>
              <span>New Sprint</span>
            </button>
          </div>
        </div>

        {/* Epics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Epics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {epics.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-3">flag</span>
                <p className="text-slate-600 dark:text-slate-400">No epics created yet</p>
              </div>
            ) : (
              epics.map(epic => (
                <div
                  key={epic.id}
                  className="bg-white dark:bg-card-dark rounded-xl p-5 border-l-4 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                  style={{ borderLeftColor: epic.color }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{epic.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      epic.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                      epic.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      epic.status === 'Done' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {epic.status}
                    </span>
                  </div>
                  {epic.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {epic.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{epic.issueCount || 0} issues</span>
                    {epic.progress !== undefined && (
                      <span className="font-medium">{epic.progress}% complete</span>
                    )}
                  </div>
                  {epic.progress !== undefined && (
                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${epic.progress}%`, backgroundColor: epic.color }}
                      ></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sprints Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Sprints</h2>
          <div className="space-y-4">
            {sprints.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-3">sprint</span>
                <p className="text-slate-600 dark:text-slate-400">No sprints created yet</p>
              </div>
            ) : (
              sprints.map(sprint => (
                <div
                  key={sprint.id}
                  className="bg-white dark:bg-card-dark rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{sprint.name}</h3>
                      {sprint.goal && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{sprint.goal}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      sprint.status === 'Planning' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                      sprint.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {sprint.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1">Start Date</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(sprint.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1">End Date</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(sprint.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1">Issues</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {sprint.issueCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1">Completed</p>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {sprint.completedCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Sprint Modal */}
      {showCreateSprint && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateSprint(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Sprint</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sprint Name *</label>
                <input
                  type="text"
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white"
                  placeholder="e.g., Sprint 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Goal</label>
                <textarea
                  value={sprintGoal}
                  onChange={(e) => setSprintGoal(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white resize-none"
                  placeholder="Sprint goal..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Start Date *</label>
                  <input
                    type="date"
                    value={sprintStart}
                    onChange={(e) => setSprintStart(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">End Date *</label>
                  <input
                    type="date"
                    value={sprintEnd}
                    onChange={(e) => setSprintEnd(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateSprint(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSprint}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Sprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Epic Modal */}
      {showCreateEpic && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateEpic(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Epic</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Epic Name *</label>
                <input
                  type="text"
                  value={epicName}
                  onChange={(e) => setEpicName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white"
                  placeholder="e.g., User Authentication"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={epicDescription}
                  onChange={(e) => setEpicDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white resize-none"
                  placeholder="Epic description..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Color</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => setEpicColor(color)}
                      className={`w-10 h-10 rounded-lg border-2 ${epicColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'} transition-all`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Start Date</label>
                  <input
                    type="date"
                    value={epicStart}
                    onChange={(e) => setEpicStart(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Target Date</label>
                  <input
                    type="date"
                    value={epicTarget}
                    onChange={(e) => setEpicTarget(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateEpic(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEpic}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Epic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
