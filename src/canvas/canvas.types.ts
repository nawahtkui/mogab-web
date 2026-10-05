import type {
  Block,
  BlockProps,
  BlockType,
  PageSchema
} from "../blocks/block.types";

/**
 * MOGAB Canvas Adapter Types
 *
 * The Canvas talks to the Builder API through these types.
 * The Canvas must not know about storage or Action Engine internals.
 */

export type CanvasConfig = {
  baseUrl: string;
  projectId: string;
  authToken?: string;
};

export type CanvasPageRequest = {
  pageSlug: string;
};

export type CanvasAddBlockRequest = {
  pageSlug: string;
  type: BlockType;
  props?: BlockProps;
};

export type CanvasUpdateBlockRequest = {
  pageSlug: string;
  blockId: string;
  props: BlockProps;
};

export type CanvasMoveBlockRequest = {
  pageSlug: string;
  blockId: string;
  toIndex: number;
};

export type CanvasDeleteBlockRequest = {
  pageSlug: string;
  blockId: string;
};

export type CanvasProject = {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  pages: PageSchema[];
};

export type BuilderApiResponse<T = unknown> = {
  success: boolean;
  output?: T;
  project?: CanvasProject;
  page?: {
    projectId: string;
    page: string;
    status: "draft" | "published";
    version: number;
    blocks: Block[];
    updatedAt: string;
  };
  projectId?: string;
  error?: string;
};

export type CanvasPage = {
  projectId: string;
  page: string;
  status: "draft" | "published";
  version: number;
  blocks: Block[];
  updatedAt: string;
};

export type CanvasAdapterContract = {
  getProject(): Promise<CanvasProject>;

  getPage(
    request: CanvasPageRequest
  ): Promise<CanvasPage>;

  addBlock(
    request: CanvasAddBlockRequest
  ): Promise<Block>;

  updateBlock(
    request: CanvasUpdateBlockRequest
  ): Promise<Block>;

  moveBlock(
    request: CanvasMoveBlockRequest
  ): Promise<Block[]>;

  deleteBlock(
    request: CanvasDeleteBlockRequest
  ): Promise<void>;
};
