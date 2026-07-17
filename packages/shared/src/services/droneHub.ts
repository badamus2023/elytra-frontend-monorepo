import * as signalR from "@microsoft/signalr";

export interface DroneTelemetry {
  droneId: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  timestamp: string;
}

class DroneHubService {
  private connection: signalR.HubConnection | null = null;

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  async connect(): Promise<void> {
    if (this.isConnected()) return;

    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }

    const hubUrl = import.meta.env.VITE_DRONE_HUB_URL;
    if (!hubUrl) {
      throw new Error("VITE_DRONE_HUB_URL is not configured");
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    await this.connection.start();
    console.log("DroneHub connected");
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async subscribeToDrone(droneId: string): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("SubscribeToDrone", droneId);
  }

  async unsubscribeFromDrone(droneId: string): Promise<void> {
    if (!this.connection) throw new Error("Not connected");
    await this.connection.invoke("UnsubscribeFromDrone", droneId);
  }

  onLocationUpdated(callback: (data: DroneTelemetry) => void): void {
    if (!this.connection) throw new Error("Not connected");
    this.connection.on("DroneLocationUpdated", callback);
  }

  offLocationUpdated(): void {
    if (!this.connection) throw new Error("Not connected");
    this.connection.off("DroneLocationUpdated");
  }
}

export const droneHub = new DroneHubService();
