import { io, Socket } from 'socket.io-client';

export class RealTimeUpdatesService {
  private static socket: Socket | null = null;

  /**
   * Initialize the WebSocket connection.
   * @param url - The WebSocket server URL.
   */
  static initialize(url: string): void {
    if (!this.socket) {
      this.socket = io(url);

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });
    }
  }

  /**
   * Subscribe to booking status updates.
   * @param bookingId - The ID of the booking to subscribe to.
   * @param callback - A callback function to handle status updates.
   */
  static subscribeToBookingUpdates(bookingId: string, callback: (status: string) => void): void {
    if (this.socket) {
      this.socket.on(`booking:${bookingId}:status`, callback);
    }
  }

  /**
   * Unsubscribe from booking status updates.
   * @param bookingId - The ID of the booking to unsubscribe from.
   */
  static unsubscribeFromBookingUpdates(bookingId: string): void {
    if (this.socket) {
      this.socket.off(`booking:${bookingId}:status`);
    }
  }

  /**
   * Disconnect the WebSocket connection.
   */
  static disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}