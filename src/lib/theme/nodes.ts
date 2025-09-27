export const nodeTheme = {
  base: {
    container: 'relative min-w-[200px] rounded-lg border bg-white transition-all duration-200',
    header: 'flex items-center p-3 border-b border-slate-100',
    icon: 'flex items-center justify-center w-7 h-7 rounded text-white mr-2',
    title: 'font-medium text-sm text-slate-900 truncate',
    description: 'text-xs text-slate-500 truncate mt-0.5',
    content: 'p-3',
  },
  handle: {
    base: 'w-2 h-2 border border-slate-300 bg-white rounded-full hover:border-slate-400 transition-colors',
    input: 'left-[-4px]',
    output: 'right-[-4px]',
  },
  status: {
    idle: {
      border: 'border-slate-200',
      indicator: '',
    },
    running: {
      border: 'border-blue-400',
      indicator: 'w-2 h-2 bg-blue-400 rounded-full animate-pulse absolute -top-1 -right-1 border border-white',
    },
    completed: {
      border: 'border-green-400',
      indicator: 'w-2 h-2 bg-green-400 rounded-full absolute -top-1 -right-1 border border-white',
    },
    error: {
      border: 'border-red-400',
      indicator: 'w-2 h-2 bg-red-400 rounded-full absolute -top-1 -right-1 border border-white',
    },
  },
  output: {
    container: 'px-3 pb-3',
    box: 'p-2 bg-slate-50 border border-slate-100 rounded',
    header: 'flex items-center space-x-1.5 mb-1',
    content: 'whitespace-pre-wrap text-xs text-slate-600 leading-relaxed mt-1',
  },
  error: {
    container: 'px-3 pb-3',
    box: 'p-2 bg-red-50 border border-red-100 rounded',
    header: 'flex items-center space-x-1.5 mb-1',
    text: 'text-xs text-red-600',
  },
};