import React from 'react';
import { useWorkflowStore } from '@/store/workflow';
import { ArrowDownToLine, ArrowUpToLine, Clock, RotateCcw } from 'lucide-react';
import type { WorkflowVersion } from '@/lib/0g/da-service';

export default function VersionPanel() {
  const { 
    currentWorkflow,
    saveVersion,
    loadVersion,
    rollbackToVersion,
    getVersionHistory
  } = useWorkflowStore();

  const [versions, setVersions] = React.useState<WorkflowVersion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>();

  // Load version history
  React.useEffect(() => {
    const loadVersions = async () => {
      try {
        const history = await getVersionHistory();
        setVersions(
          history
            .map(v => ({
              ...v,
              version: Number(v.version),
              metadata: {
                author: v.metadata?.author || '',
                description: v.metadata?.description,
                changes: v.metadata?.changes,
                ...v.metadata
              }
            }))
            .reverse()
        ); // Show newest first
        setError(undefined);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load versions');
      }
    };
    loadVersions();
  }, [currentWorkflow?.currentVersion, getVersionHistory]);

  // Save new version
  const handleSaveVersion = async () => {
    setLoading(true);
    try {
      await saveVersion();
      setError(undefined);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save version');
    } finally {
      setLoading(false);
    }
  };

  // Load a version
  const handleLoadVersion = async (hash: string) => {
    setLoading(true);
    try {
      await loadVersion(hash);
      setError(undefined);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load version');
    } finally {
      setLoading(false);
    }
  };

  // Rollback to a version
  const handleRollback = async (hash: string) => {
    if (!confirm('This will delete all versions after this point. Are you sure?')) {
      return;
    }

    setLoading(true);
    try {
      await rollbackToVersion(hash);
      setError(undefined);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to rollback');
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkflow) {
    return null;
  }

  return (
    <div className="absolute right-4 top-20 w-80 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden">
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900">Version History</h3>
          <button
            onClick={handleSaveVersion}
            disabled={loading}
            className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            title="Save new version"
          >
            <ArrowUpToLine size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
          {error}
        </div>
      )}

      <div className="h-96 overflow-y-auto">
        {versions.map((version, index) => (
          <div
            key={version.hash}
            className={`p-3 border-b border-slate-100 hover:bg-slate-50 ${
              version.version === currentWorkflow.currentVersion ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Clock size={14} className="text-slate-400" />
                <span className="text-xs text-slate-500">
                  {new Date(version.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleLoadVersion(version.hash)}
                  disabled={loading}
                  className="p-1.5 hover:bg-white rounded disabled:opacity-50"
                  title="Load this version"
                >
                  <ArrowDownToLine size={14} />
                </button>
                {index > 0 && (
                  <button
                    onClick={() => handleRollback(version.hash)}
                    disabled={loading}
                    className="p-1.5 hover:bg-white rounded disabled:opacity-50"
                    title="Rollback to this version"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>
            
            {version.metadata.description && (
              <p className="text-xs text-slate-600 mb-2">
                {version.metadata.description}
              </p>
            )}

            {(version.metadata.changes ?? []).length > 0 && (
              <div className="space-y-1">
                {(version.metadata.changes ?? []).map((change: string, i: number) => (
                  <div key={i} className="text-xs text-slate-500">
                    • {change}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2">
              <div className="text-xs font-mono text-slate-400">
                {version.hash.substring(0, 8)}...{version.hash.slice(-6)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}