import type { MOGABCanvasAdapter } from "./canvas.adapter";
import {
  MOGABCanvasState,
  type CanvasStateListener
} from "./canvas.state";
import {
  MOGABPreviewClient,
  type PreviewStateListener
} from "./preview.client";

export type CanvasLiveConfig = {
  baseUrl: string;
  projectId: string;
  token?: string;
  reconnect?: boolean;
  reconnectDelayMs?: number;
};

export class MOGABCanvasLive {

  readonly state: MOGABCanvasState;

  readonly preview: MOGABPreviewClient;

  private unsubscribePreview:
    (() => void) | null = null;

  constructor(
    adapter: MOGABCanvasAdapter,
    config: CanvasLiveConfig
  ) {

    this.state =
      new MOGABCanvasState(adapter);

    this.preview =
      new MOGABPreviewClient({
        baseUrl: config.baseUrl,
        projectId: config.projectId,
        token: config.token,
        reconnect:
          config.reconnect ?? true,
        reconnectDelayMs:
          config.reconnectDelayMs ?? 1500
      });

    this.unsubscribePreview =
      this.preview.subscribe(message => {

        if (
          message.type ===
          "blocks:updated"
        ) {

          this.state.applyBlocksUpdate({
            projectId: message.projectId,
            page: message.page,
            status: message.status,
            blocks: message.blocks,
            version: message.version,
            updatedAt: message.updatedAt
          });
        }
      });
  }

  async getProject() {
    return this.state.getProject();
  }

  async load(
    pageSlug: string
  ) {

    await this.state.loadPage(
      pageSlug
    );

    this.preview.connect();

    return this.state.getState();
  }

  subscribe(
    listener: CanvasStateListener
  ): () => void {

    return this.state.subscribe(
      listener
    );
  }

  subscribePreview(
    listener: PreviewStateListener
  ): () => void {

    return this.preview.subscribeState(
      listener
    );
  }

  disconnect(): void {

    this.preview.disconnect();

    if (this.unsubscribePreview) {

      this.unsubscribePreview();

      this.unsubscribePreview = null;
    }
  }

  destroy(): void {
    this.disconnect();
  }
}
