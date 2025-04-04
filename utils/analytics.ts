export function trackError(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Tracked Error:', error, errorInfo);
    // Optionally send this information to an analytics server
  }
  