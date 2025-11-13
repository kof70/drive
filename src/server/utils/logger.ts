// Logger simple pour le développement
class Logger {
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }

  info(message: string): void {
    console.log(this.formatMessage('info', message));
  }

  warn(message: string): void {
    console.warn(this.formatMessage('warn', message));
  }

  error(message: string, error?: Error): void {
    console.error(this.formatMessage('error', message));
    if (error) {
      console.error(error.stack);
    }
  }

  debug(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message));
    }
  }
}

export const logger = new Logger();