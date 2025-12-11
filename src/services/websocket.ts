/**
 * Real WebSocket Service
 * 
 * This service handles real WebSocket connections to the backend.
 * It will be used in production when the backend is available.
 * 
 * Usage: Set REACT_APP_WS_ENDPOINT in .env to your WebSocket URL
 */

type WebSocketCallback = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<WebSocketCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket: Connected');
        this.reconnectAttempts = 0;
        this.emit('system_status', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('system_status', { status: 'error' });
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket: Disconnected');
        this.emit('system_status', { status: 'disconnected' });
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'telemetry_update':
        this.emit('telemetry_update', message.data);
        break;
      case 'alert_triggered':
      case 'alert_resolved':
        this.emit(message.type, message.data);
        break;
      case 'command_ack':
        this.emit('command_ack', message.data);
        break;
      case 'system_status':
        this.emit('system_status', message.data);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(event: string, callback: WebSocketCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: WebSocketCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    });
  }

  sendCommand(command: string, params?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'command',
          data: {
            command,
            parameters: params,
          },
        })
      );
    } else {
      console.error('WebSocket is not connected');
    }
  }
}

// Create singleton instance
const wsEndpoint = import.meta.env.VITE_WS_ENDPOINT || 'ws://localhost:8080';
export const webSocket = new WebSocketService(wsEndpoint);

