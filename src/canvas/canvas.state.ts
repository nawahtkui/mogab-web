import type {
  Block,
  BlockProps,
  BlockType
} from "../blocks/block.types";

import type {
  CanvasPage,
  CanvasPageRequest,
  CanvasAddBlockRequest,
  CanvasUpdateBlockRequest,
  CanvasMoveBlockRequest,
  CanvasDeleteBlockRequest
} from "./canvas.types";

import type { MOGABCanvasAdapter } from "./canvas.adapter";

export type CanvasStateListener = (
  state: CanvasState
) => void;

export type CanvasState = {
  projectId: string;
  pageSlug: string;
  status: "draft" | "published";
  version: number;
  blocks: Block[];
  updatedAt: string;
  loading: boolean;
  error: string | null;
};

export class MOGABCanvasState {

  private readonly adapter: MOGABCanvasAdapter;

  private state: CanvasState;

  private listeners =
    new Set<CanvasStateListener>();

  constructor(
    adapter: MOGABCanvasAdapter
  ) {
    this.adapter = adapter;

    this.state = {
      projectId: "",
      pageSlug: "home",
      status: "draft",
      version: 0,
      blocks: [],
      updatedAt: "",
      loading: false,
      error: null
    };
  }

  getState(): CanvasState {
    return {
      ...this.state,
      blocks: [...this.state.blocks]
    };
  }

  async getProject() {
    return this.adapter.getProject();
  }

  subscribe(
    listener: CanvasStateListener
  ): () => void {

    this.listeners.add(listener);

    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(
    patch: Partial<CanvasState>
  ): void {

    this.state = {
      ...this.state,
      ...patch
    };

    const snapshot =
      this.getState();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private setLoading(
    loading: boolean
  ): void {

    this.setState({
      loading,
      error: loading
        ? null
        : this.state.error
    });
  }

  async loadPage(
    pageSlug: string
  ): Promise<CanvasPage> {

    this.setLoading(true);

    try {

      const request: CanvasPageRequest = {
        pageSlug
      };

      const page =
        await this.adapter.getPage(request);

      this.setState({
        projectId: page.projectId,
        pageSlug: page.page,
        status: page.status,
        version: page.version,
        blocks: [...page.blocks],
        updatedAt: page.updatedAt,
        loading: false,
        error: null
      });

      return page;

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Failed to load canvas page";

      this.setState({
        loading: false,
        error: message
      });

      throw error;
    }
  }

  async addBlock(
    type: BlockType,
    props: BlockProps = {}
  ): Promise<Block> {

    this.setLoading(true);

    try {

      const request: CanvasAddBlockRequest = {
        pageSlug: this.state.pageSlug,
        type,
        props
      };

      const block =
        await this.adapter.addBlock(request);

      await this.refresh();

      return block;

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Failed to add block";

      this.setState({
        loading: false,
        error: message
      });

      throw error;
    }
  }

  async updateBlock(
    blockId: string,
    props: BlockProps
  ): Promise<Block> {

    this.setLoading(true);

    try {

      const request: CanvasUpdateBlockRequest = {
        pageSlug: this.state.pageSlug,
        blockId,
        props
      };

      const block =
        await this.adapter.updateBlock(request);

      await this.refresh();

      return block;

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Failed to update block";

      this.setState({
        loading: false,
        error: message
      });

      throw error;
    }
  }

  async moveBlock(
    blockId: string,
    toIndex: number
  ): Promise<Block[]> {

    this.setLoading(true);

    try {

      const request: CanvasMoveBlockRequest = {
        pageSlug: this.state.pageSlug,
        blockId,
        toIndex
      };

      const blocks =
        await this.adapter.moveBlock(request);

      this.setState({
        blocks: [...blocks],
        loading: false,
        error: null
      });

      return blocks;

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Failed to move block";

      this.setState({
        loading: false,
        error: message
      });

      throw error;
    }
  }

  async deleteBlock(
    blockId: string
  ): Promise<void> {

    this.setLoading(true);

    try {

      const request: CanvasDeleteBlockRequest = {
        pageSlug: this.state.pageSlug,
        blockId
      };

      await this.adapter.deleteBlock(request);

      await this.refresh();

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete block";

      this.setState({
        loading: false,
        error: message
      });

      throw error;
    }
  }

  async refresh(): Promise<CanvasPage> {
    return this.loadPage(
      this.state.pageSlug
    );
  }

  applyBlocksUpdate(
    payload: {
      projectId: string;
      page: string;
      status: "draft" | "published";
      blocks: Block[];
      version?: number;
      updatedAt?: string;
    }
  ): void {

    if (
      payload.projectId !==
        this.state.projectId ||
      payload.page !==
        this.state.pageSlug
    ) {
      return;
    }

    this.setState({
      status: payload.status,
      blocks: [...payload.blocks],
      version:
        payload.version ??
        this.state.version,
      updatedAt:
        payload.updatedAt ??
        this.state.updatedAt,
      loading: false,
      error: null
    });
  }

  clearError(): void {
    this.setState({
      error: null
    });
  }

  reset(): void {

    this.setState({
      projectId: "",
      pageSlug: "home",
      status: "draft",
      version: 0,
      blocks: [],
      updatedAt: "",
      loading: false,
      error: null
    });
  }
}
