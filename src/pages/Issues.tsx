import { useEffect, useState } from 'react';
import { issuesAPI } from '../services/api';
import { Issue } from '../types';

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const data = await issuesAPI.getAll();
        setIssues(data || []);
      } catch (err) {
        console.error('Failed to load issues', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  return (
    <div className="flex-1 p-6">
      <h2 className="text-2xl font-bold mb-4">Issues</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-3">
          {issues.length === 0 ? (
            <div className="text-sm text-slate-600">No issues found.</div>
          ) : (
            <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase">
                    <th className="p-2">ID</th>
                    <th className="p-2">Summary</th>
                    <th className="p-2">Project</th>
                    <th className="p-2">Severity</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue.id} className="border-t">
                      <td className="p-2 text-sm">{issue.bugId}</td>
                      <td className="p-2 text-sm">{issue.moduleName}</td>
                      <td className="p-2 text-sm">{issue.projectName || issue.projectId}</td>
                      <td className="p-2 text-sm">{issue.severity}</td>
                      <td className="p-2 text-sm">{issue.status}</td>
                      <td className="p-2 text-sm">{issue.assignedTo?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
