import type {
  Block,
  BlockProps,
  BlockType
} from "../blocks/block.types";

import type { MOGABCanvasAdapter } from "./canvas.adapter";

import {
  MOGABCanvasLive,
  type CanvasLiveConfig
} from "./canvas.live";

import {
  MOGABSelectionModel,
  type CanvasSelection,
  type SelectionListener
} from "./selection.model";

import {
  renderBlock,
  renderBlocks,
  type RenderedBlock
} from "./renderer";

import type {
  CanvasState
} from "./canvas.state";

import type {
  CanvasProject
} from "./canvas.types";

export type CanvasControllerConfig =
  CanvasLiveConfig;

export type CanvasControllerListener = (
  state: CanvasControllerState
) => void;

export type CanvasControllerState = {
  canvas: CanvasState;
  selection: CanvasSelection;
  renderedBlocks: RenderedBlock[];
};

export class MOGABCanvasController {

  readonly live: MOGABCanvasLive;

  readonly selection: MOGABSelectionModel;

  private listeners =
    new Set<CanvasControllerListener>();

  private unsubscribeCanvas:
    (() => void) | null = null;

  private unsubscribeSelection:
    (() => void) | null = null;

  constructor(
    adapter: MOGABCanvasAdapter,
    config: CanvasControllerConfig
  ) {

    this.live =
      new MOGABCanvasLive(
        adapter,
        config
      );

    this.selection =
      new MOGABSelectionModel();

    this.unsubscribeCanvas =
      this.live.subscribe(
        this.handleCanvasState
      );

    this.unsubscribeSelection =
      this.selection.subscribe(
        this.handleSelection
      );
  }

  private handleCanvasState = (
    canvas: CanvasState
  ): void => {

    this.selection.sync(
      canvas.blocks
    );

    this.emit();
  };

  private handleSelection = (
    _selection: CanvasSelection
  ): void => {

    this.emit();
  };

  private emit(): void {

    const state =
      this.getState();

    for (
      const listener of
      this.listeners
    ) {
      listener(state);
    }
  }

  getState(): CanvasControllerState {

    const canvas =
      this.live.state.getState();

    return {
      canvas,
      selection:
        this.selection.getSelection(),
      renderedBlocks:
        renderBlocks(
          canvas.blocks
        )
    };
  }

  async load(
    pageSlug: string
  ): Promise<CanvasControllerState> {

    await this.live.load(
      pageSlug
    );

    return this.getState();
  }

  async getProject(): Promise<CanvasProject> {

    return this.live.getProject();
  }

  selectBlock(
    blockId: string
  ): void {

    const canvas =
      this.live.state.getState();

    const block =
      canvas.blocks.find(
        item =>
          item.id === blockId
      );

    if (!block) {
      throw new Error(
        `Block not found: ${blockId}`
      );
    }

    this.selection.selectBlock(
      block
    );
  }

  clearSelection(): void {
    this.selection.clear();
  }

  getSelectedBlock(): Block | null {

    return this.selection.getSelectedBlock(
      this.live.state.getState().blocks
    );
  }

  renderSelectedBlock():
    RenderedBlock | null {

    const block =
      this.getSelectedBlock();

    if (!block) {
      return null;
    }

    return renderBlock(block);
  }

  async addBlock(
    type: BlockType,
    props: BlockProps = {}
  ): Promise<Block> {

    const block =
      await this.live.state.addBlock(
        type,
        props
      );

    this.selection.selectBlock(
      block
    );

    return block;
  }

  async updateSelectedBlock(
    props: BlockProps
  ): Promise<Block> {

    const block =
      this.getSelectedBlock();

    if (!block) {
      throw new Error(
        "No block selected"
      );
    }

    return this.live.state.updateBlock(
      block.id,
      props
    );
  }

  async moveSelectedBlock(
    toIndex: number
  ): Promise<Block[]> {

    const block =
      this.getSelectedBlock();

    if (!block) {
      throw new Error(
        "No block selected"
      );
    }

    return this.live.state.moveBlock(
      block.id,
      toIndex
    );
  }

  async deleteSelectedBlock():
    Promise<void> {

    const block =
      this.getSelectedBlock();

    if (!block) {
      throw new Error(
        "No block selected"
      );
    }

    await this.live.state.deleteBlock(
      block.id
    );

    this.selection.clear();
  }

  subscribe(
    listener: CanvasControllerListener
  ): () => void {

    this.listeners.add(listener);

    listener(
      this.getState()
    );

    return () => {
      this.listeners.delete(
        listener
      );
    };
  }

  subscribeSelection(
    listener: SelectionListener
  ): () => void {

    return this.selection.subscribe(
      listener
    );
  }

  getPreviewConnectionState() {
    return this.live.preview.getState();
  }

  connectPreview(): void {
    this.live.preview.connect();
  }

  disconnectPreview(): void {
    this.live.preview.disconnect();
  }

  async refresh():
    Promise<CanvasControllerState> {

    await this.live.state.refresh();

    return this.getState();
  }

  destroy(): void {

    if (this.unsubscribeCanvas) {
      this.unsubscribeCanvas();
      this.unsubscribeCanvas = null;
    }

    if (this.unsubscribeSelection) {
      this.unsubscribeSelection();
      this.unsubscribeSelection = null;
    }

    this.live.destroy();

    this.listeners.clear();
  }
}

export function createCanvasController(
  adapter: MOGABCanvasAdapter,
  config: CanvasControllerConfig
): MOGABCanvasController {

  return new MOGABCanvasController(
    adapter,
    config
  );
}
