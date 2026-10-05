import type { Block } from "../blocks/block.types";

import {
  renderBlock,
  type RenderedBlock
} from "./renderer";

export type DOMCanvasRendererOptions = {
  root: HTMLElement;
  onSelect?: (blockId: string) => void;
};

export class MOGABDOMCanvasRenderer {

  private readonly root: HTMLElement;

  private readonly onSelect?: (
    blockId: string
  ) => void;

  private selectedBlockId: string | null = null;

  constructor(
    options: DOMCanvasRendererOptions
  ) {
    this.root = options.root;
    this.onSelect = options.onSelect;

    this.root.addEventListener(
      "click",
      this.handleClick
    );
  }

  private handleClick = (
    event: MouseEvent
  ): void => {

    const target =
      event.target as Element | null;

    if (!target) return;

    const element =
      target.closest(
        "[data-mogab-block-id]"
      );

    if (!element) return;

    const blockId =
      element.getAttribute(
        "data-mogab-block-id"
      );

    if (!blockId) return;

    event.preventDefault();
    event.stopPropagation();

    this.select(blockId);

    if (this.onSelect) {
      this.onSelect(blockId);
    }
  };

  render(blocks: Block[]): void {

    const fragment =
      document.createDocumentFragment();

    for (const block of blocks) {

      const rendered =
        renderBlock(block);

      const wrapper =
        this.createBlockElement(
          rendered
        );

      fragment.appendChild(
        wrapper
      );
    }

    this.root.replaceChildren(
      fragment
    );

    this.applySelection();
  }

  private createBlockElement(
    rendered: RenderedBlock
  ): HTMLElement {

    const wrapper =
      document.createElement("div");

    wrapper.setAttribute(
      "data-mogab-block-id",
      rendered.id
    );

    wrapper.setAttribute(
      "data-mogab-block-type",
      rendered.type
    );

    wrapper.className =
      "mogab-canvas-block";

    wrapper.innerHTML =
      rendered.html;

    return wrapper;
  }

  select(blockId: string): void {

    this.selectedBlockId =
      blockId;

    this.applySelection();
  }

  clearSelection(): void {

    this.selectedBlockId =
      null;

    this.applySelection();
  }

  getSelectedBlockId():
    string | null {

    return this.selectedBlockId;
  }

  sync(blocks: Block[]): void {

    if (
      this.selectedBlockId &&
      !blocks.some(
        block =>
          block.id ===
          this.selectedBlockId
      )
    ) {
      this.selectedBlockId =
        null;
    }

    this.render(blocks);
  }

  private applySelection(): void {

    const elements =
      this.root.querySelectorAll(
        "[data-mogab-block-id]"
      );

    for (const element of elements) {

      const blockId =
        element.getAttribute(
          "data-mogab-block-id"
        );

      const selected =
        blockId ===
        this.selectedBlockId;

      element.classList.toggle(
        "mogab-block-selected",
        selected
      );

      element.setAttribute(
        "aria-selected",
        selected
          ? "true"
          : "false"
      );
    }
  }

  destroy(): void {

    this.root.removeEventListener(
      "click",
      this.handleClick
    );

    this.root.replaceChildren();

    this.selectedBlockId =
      null;
  }
}
