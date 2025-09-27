'use client';

import React from 'react';
import { useWorkflowStore } from '@/store/workflow';

export default function ExecutionPanel() {
  const { executionLog, isExecuting } = useWorkflowStore();

  if (executionLog.length === 0 && !isExecuting) {
    return null;
  }

  return (
    <div className="absolute bottom-4 right-4 w-96 h-72 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden">
      <div className="p-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900">
            Execution Log
          </h3>
          {isExecuting && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600 font-medium">Running</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="h-56 p-3 overflow-y-auto bg-white">
        <div className="space-y-3">
          {executionLog.map((entry, index) => (
            <div key={index} className="py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-start space-x-3">
                <span className="text-slate-400 font-mono text-xs">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  entry.status === 'completed' ? 'bg-green-400' :
                  entry.status === 'error' ? 'bg-red-400' :
                  entry.status === 'running' ? 'bg-blue-400 animate-pulse' :
                  'bg-slate-300'
                }`} />
                <span className="text-slate-700 flex-1 text-sm leading-relaxed">
                  {entry.message}
                </span>
              </div>
              
              {entry.data && (
                <div className="ml-8 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <pre className="whitespace-pre-wrap text-xs text-slate-600 leading-relaxed font-mono">
                    {typeof entry.data === 'string' 
                      ? entry.data 
                      : JSON.stringify(entry.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}