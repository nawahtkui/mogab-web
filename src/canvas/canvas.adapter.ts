import type {
  Block
} from "../blocks/block.types";

import type {
  BuilderApiResponse,
  CanvasAdapterContract,
  CanvasAddBlockRequest,
  CanvasConfig,
  CanvasDeleteBlockRequest,
  CanvasMoveBlockRequest,
  CanvasPage,
  CanvasPageRequest,
  CanvasProject,
  CanvasUpdateBlockRequest
} from "./canvas.types";

/**
 * MOGAB Canvas Adapter
 *
 * The Canvas communicates with MOGAB through the Builder API.
 *
 * The Builder API remains the execution boundary.
 * The Adapter does not know about storage or Action Engine internals.
 */

type BlockActionOutput = {
  projectId: string;
  page: string;
  block: Block;
};

type MoveActionOutput = {
  projectId: string;
  page: string;
  blocks: Block[];
};

type DeleteActionOutput = {
  projectId: string;
  page: string;
  deletedBlockId: string;
};

export class MOGABCanvasAdapter
  implements CanvasAdapterContract {

  private readonly baseUrl: string;
  private readonly projectId: string;
  private readonly authToken?: string;

  constructor(config: CanvasConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.projectId = config.projectId;
    this.authToken = config.authToken;
  }

  private requestHeaders(
    includeJson: boolean = false
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Execute a Builder API action.
   */
  private async executeAction<T>(
    action: string,
    input: Record<string, unknown>
  ): Promise<T> {

    const response = await fetch(
      `${this.baseUrl}/builder/actions`,
      {
        method: "POST",
        headers: this.requestHeaders(true),
        body: JSON.stringify({
          action,
          input
        })
      }
    );

    let body: BuilderApiResponse<T>;

    try {
      body =
        await response.json() as BuilderApiResponse<T>;
    } catch {
      throw new Error(
        `Builder API returned invalid JSON (${response.status})`
      );
    }

    if (!response.ok || !body.success) {
      throw new Error(
        body.error ||
        `Builder API request failed (${response.status})`
      );
    }

    if (body.output === undefined) {
      throw new Error(
        `Builder API returned no output for action: ${action}`
      );
    }

    return body.output;
  }

  /**
   * Load the complete project.
   *
   * Used by MOGAB Studio for page navigation.
   */
  async getProject(): Promise<CanvasProject> {

    const response = await fetch(
      `${this.baseUrl}/builder/projects/` +
      `${encodeURIComponent(this.projectId)}`,
      {
        headers: this.requestHeaders()
      }
    );

    let body: BuilderApiResponse;

    try {
      body =
        await response.json() as BuilderApiResponse;
    } catch {
      throw new Error(
        `Builder API returned invalid JSON (${response.status})`
      );
    }

    if (
      !response.ok ||
      !body.success ||
      !body.project
    ) {
      throw new Error(
        body.error ||
        `Project request failed (${response.status})`
      );
    }

    return body.project;
  }

  /**
   * Load a page from Builder API.
   */
  async getPage(
    request: CanvasPageRequest
  ): Promise<CanvasPage> {

    const pageSlug =
      request.pageSlug || "home";

    const response = await fetch(
      `${this.baseUrl}/builder/projects/` +
      `${encodeURIComponent(this.projectId)}/pages/` +
      `${encodeURIComponent(pageSlug)}`,
      {
        headers: this.requestHeaders()
      }
    );

    let body: BuilderApiResponse;

    try {
      body =
        await response.json() as BuilderApiResponse;
    } catch {
      throw new Error(
        `Builder API returned invalid JSON (${response.status})`
      );
    }

    if (!response.ok || !body.success || !body.page) {
      throw new Error(
        body.error ||
        `Page request failed (${response.status})`
      );
    }

    return body.page;
  }

  /**
   * Add a block to a page.
   */
  async addBlock(
    request: CanvasAddBlockRequest
  ): Promise<Block> {

    const result =
      await this.executeAction<BlockActionOutput>(
        "block.add",
        {
          projectId: this.projectId,
          pageSlug: request.pageSlug,
          type: request.type,
          props: request.props || {}
        }
      );

    if (!result.block) {
      throw new Error(
        "Builder API block.add returned no block"
      );
    }

    return result.block;
  }

  /**
   * Update a block.
   */
  async updateBlock(
    request: CanvasUpdateBlockRequest
  ): Promise<Block> {

    const result =
      await this.executeAction<BlockActionOutput>(
        "block.update",
        {
          projectId: this.projectId,
          pageSlug: request.pageSlug,
          blockId: request.blockId,
          props: request.props
        }
      );

    if (!result.block) {
      throw new Error(
        "Builder API block.update returned no block"
      );
    }

    return result.block;
  }

  /**
   * Move a block.
   */
  async moveBlock(
    request: CanvasMoveBlockRequest
  ): Promise<Block[]> {

    const result =
      await this.executeAction<MoveActionOutput>(
        "block.move",
        {
          projectId: this.projectId,
          pageSlug: request.pageSlug,
          blockId: request.blockId,
          toIndex: request.toIndex
        }
      );

    if (!Array.isArray(result.blocks)) {
      throw new Error(
        "Builder API block.move returned no blocks"
      );
    }

    return result.blocks;
  }

  /**
   * Delete a block.
   */
  async deleteBlock(
    request: CanvasDeleteBlockRequest
  ): Promise<void> {

    const result =
      await this.executeAction<DeleteActionOutput>(
        "block.delete",
        {
          projectId: this.projectId,
          pageSlug: request.pageSlug,
          blockId: request.blockId
        }
      );

    if (
      result.deletedBlockId !== request.blockId
    ) {
      throw new Error(
        "Builder API block.delete returned an unexpected block ID"
      );
    }
  }
}

/**
 * Factory helper.
 */
export function createCanvasAdapter(
  config: CanvasConfig
): MOGABCanvasAdapter {

  return new MOGABCanvasAdapter(
    config
  );
}
