import type { Block } from "../blocks/block.types";

export type PreviewConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type PreviewConnectedEvent = {
  type: "preview:connected";
  projectId: string;
};

export type PreviewBlocksUpdatedEvent = {
  type: "blocks:updated";
  projectId: string;
  page: string;
  status: "draft" | "published";
  blocks: Block[];
  version?: number;
  updatedAt?: string;
};

export type PreviewMessage =
  | PreviewConnectedEvent
  | PreviewBlocksUpdatedEvent;

export type PreviewClientConfig = {
  baseUrl: string;
  projectId: string;
  token?: string;
  reconnect?: boolean;
  reconnectDelayMs?: number;
};

export type PreviewListener = (
  message: PreviewMessage
) => void;

export type PreviewStateListener = (
  state: PreviewConnectionState
) => void;

export class MOGABPreviewClient {

  private readonly baseUrl: string;
  private readonly projectId: string;
  private readonly token?: string;
  private readonly shouldReconnect: boolean;
  private readonly reconnectDelayMs: number;

  private socket: WebSocket | null = null;

  private reconnectTimer:
    ReturnType<typeof setTimeout> | null = null;

  private manuallyClosed = false;

  private state: PreviewConnectionState =
    "disconnected";

  private listeners =
    new Set<PreviewListener>();

  private stateListeners =
    new Set<PreviewStateListener>();

  constructor(
    config: PreviewClientConfig
  ) {

    this.baseUrl =
      config.baseUrl.replace(/\/+$/, "");

    this.projectId =
      config.projectId;

    this.token =
      config.token?.trim() || undefined;

    this.shouldReconnect =
      config.reconnect ?? true;

    this.reconnectDelayMs =
      config.reconnectDelayMs ?? 1500;
  }

  getState(): PreviewConnectionState {
    return this.state;
  }

  subscribe(
    listener: PreviewListener
  ): () => void {

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeState(
    listener: PreviewStateListener
  ): () => void {

    this.stateListeners.add(listener);

    listener(this.state);

    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private setState(
    state: PreviewConnectionState
  ): void {

    this.state = state;

    for (
      const listener of
      this.stateListeners
    ) {
      listener(state);
    }
  }

  private buildUrl(): string {

    const url =
      new URL(this.baseUrl);

    url.protocol =
      url.protocol === "https:"
        ? "wss:"
        : "ws:";

    url.pathname = "/preview";

    return url.toString();
  }

  connect(): void {

    if (
      this.socket &&
      (
        this.socket.readyState ===
          WebSocket.OPEN ||
        this.socket.readyState ===
          WebSocket.CONNECTING
      )
    ) {
      return;
    }

    this.manuallyClosed = false;

    this.setState("connecting");

    let socket: WebSocket;

    try {

      socket = this.token
        ? new WebSocket(
            this.buildUrl(),
            [`mogab-bearer.${this.token}`]
          )
        : new WebSocket(
            this.buildUrl()
          );

    } catch {

      this.setState("error");

      this.scheduleReconnect();

      return;
    }

    this.socket = socket;

    socket.onopen = () => {

      socket.send(
        JSON.stringify({
          type: "preview:subscribe",
          projectId: this.projectId
        })
      );
    };

    socket.onmessage = event => {

      try {

        const message =
          JSON.parse(
            event.data
          ) as PreviewMessage;

        if (
          message.type ===
          "preview:connected"
        ) {
          this.setState("connected");
        }

        for (
          const listener of
          this.listeners
        ) {
          listener(message);
        }

      } catch {
        // Ignore malformed messages.
      }
    };

    socket.onerror = () => {
      this.setState("error");
    };

    socket.onclose = () => {

      this.socket = null;

      if (!this.manuallyClosed) {

        this.setState(
          "disconnected"
        );

        this.scheduleReconnect();

      } else {

        this.setState(
          "disconnected"
        );
      }
    };
  }

  private scheduleReconnect(): void {

    if (
      !this.shouldReconnect ||
      this.manuallyClosed ||
      this.reconnectTimer
    ) {
      return;
    }

    this.reconnectTimer =
      setTimeout(() => {

        this.reconnectTimer =
          null;

        this.connect();

      }, this.reconnectDelayMs);
  }

  disconnect(): void {

    this.manuallyClosed = true;

    if (this.reconnectTimer) {

      clearTimeout(
        this.reconnectTimer
      );

      this.reconnectTimer = null;
    }

    if (this.socket) {

      this.socket.close();

      this.socket = null;
    }

    this.setState(
      "disconnected"
    );
  }
}
