import type {
  BlockProps,
  BlockType
} from "../blocks/block.types";

import type {
  MOGABCanvasController
} from "./canvas.controller";

import {
  MOGABDOMCanvasRenderer
} from "./dom.renderer";

export type DOMCanvasConfig = {
  root: HTMLElement;
};

export class MOGABDOMCanvas {

  readonly renderer:
    MOGABDOMCanvasRenderer;

  private readonly controller:
    MOGABCanvasController;

  private unsubscribe:
    (() => void) | null = null;

  constructor(
    controller: MOGABCanvasController,
    config: DOMCanvasConfig
  ) {

    this.controller =
      controller;

    this.renderer =
      new MOGABDOMCanvasRenderer({
        root: config.root,

        onSelect: (
          blockId
        ) => {
          this.controller.selectBlock(
            blockId
          );
        }
      });

    this.unsubscribe =
      this.controller.subscribe(
        state => {

          this.renderer.render(
            state.canvas.blocks
          );

          const selected =
            state.selection.blockId;

          if (selected) {
            this.renderer.select(
              selected
            );
          } else {
            this.renderer.clearSelection();
          }
        }
      );
  }

  async load(
    pageSlug: string
  ) {
    return this.controller.load(
      pageSlug
    );
  }

  async addBlock(
    type: BlockType,
    props: BlockProps = {}
  ) {

    return this.controller.addBlock(
      type,
      props
    );
  }

  async updateSelectedBlock(
    props: BlockProps
  ) {

    return this.controller
      .updateSelectedBlock(
        props
      );
  }

  async deleteSelectedBlock() {

    return this.controller
      .deleteSelectedBlock();
  }

  clearSelection(): void {

    this.controller.clearSelection();
  }

  destroy(): void {

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.renderer.destroy();
  }
}

export function createDOMCanvas(
  controller: MOGABCanvasController,
  config: DOMCanvasConfig
): MOGABDOMCanvas {

  return new MOGABDOMCanvas(
    controller,
    config
  );
}
