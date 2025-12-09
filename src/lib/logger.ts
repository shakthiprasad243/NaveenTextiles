// Structured logging utility

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

function formatLog(entry: LogEntry): string {
  const { timestamp, level, message, ...rest } = entry;
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (Object.keys(rest).length === 0) {
    return `${prefix} ${message}`;
  }
  
  return `${prefix} ${message} ${JSON.stringify(rest)}`;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  };
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = createLogEntry('debug', message, context);
      console.log(formatLog(entry));
    }
  },

  info(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry('info', message, context);
    console.log(formatLog(entry));
  },

  warn(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry('warn', message, context);
    console.warn(formatLog(entry));
  },

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const entry = createLogEntry('error', message, {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : { name: 'Unknown', message: String(error) }
    });
    console.error(formatLog(entry));
  },

  // Log API request
  apiRequest(request: Request, context?: Record<string, unknown>) {
    const url = new URL(request.url);
    this.info('API Request', {
      method: request.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      ...context
    });
  },

  // Log API response
  apiResponse(
    request: Request,
    statusCode: number,
    duration: number,
    context?: Record<string, unknown>
  ) {
    const url = new URL(request.url);
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    
    const entry = createLogEntry(level, 'API Response', {
      method: request.method,
      path: url.pathname,
      statusCode,
      duration: `${duration}ms`,
      ...context
    });
    
    if (level === 'error') {
      console.error(formatLog(entry));
    } else if (level === 'warn') {
      console.warn(formatLog(entry));
    } else {
      console.log(formatLog(entry));
    }
  }
};

// Helper to measure request duration
export function measureDuration(startTime: number): number {
  return Date.now() - startTime;
}
