// WebSocket client for real-time notifications
import { io, Socket } from 'socket.io-client';

export interface NotificationData {
  username: string;
  concept: string;
  action: 'completed' | 'uncompleted';
  timestamp: Date;
}

export class WebSocketManager {
  private socket: Socket | null = null;
  private callbacks: Map<string, Function[]> = new Map();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.emit('disconnected');
    });

    this.socket.on('progress_update', (data: NotificationData) => {
      this.emit('progress_update', data);
    });

    this.socket.on('resource_added', (data: any) => {
      this.emit('resource_added', data);
    });

    this.socket.on('member_joined', (data: any) => {
      this.emit('member_joined', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinGroup(groupId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_group', { group_id: groupId });
    }
  }

  leaveGroup(groupId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_group', { group_id: groupId });
    }
  }

  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.callbacks.delete(event);
      return;
    }

    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const websocket = new WebSocketManager();