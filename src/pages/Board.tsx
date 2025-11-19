import { useEffect, useState } from 'react';
import { issuesAPI } from '../services/api';
import { Issue } from '../types';

const STATUSES = ['Open', 'In Progress', 'Fixed', 'Closed'];

export default function Board() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await issuesAPI.getAll();
        setIssues(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = issues.filter(i => i.status === status);
    return acc;
  }, {} as Record<string, Issue[]>);

  return (
    <div className="flex-1 p-6">
      <h2 className="text-2xl font-bold mb-4">Board</h2>
      <div className="flex gap-4">
        {STATUSES.map(status => (
          <div key={status} className="flex-1 bg-white dark:bg-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold mb-3">{status} ({grouped[status]?.length || 0})</h3>
            <div className="space-y-3">
              {(grouped[status] || []).map(issue => (
                <div key={issue.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md border">
                  <div className="text-sm font-medium">{issue.bugId} — {issue.moduleName}</div>
                  <div className="text-xs text-slate-500">{issue.severity} • {issue.assignedTo?.name || 'Unassigned'}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
