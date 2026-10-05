import type { Block } from "../blocks/block.types";

export type CanvasSelection = {
  blockId: string | null;
};

export type SelectionListener = (
  selection: CanvasSelection
) => void;

export class MOGABSelectionModel {

  private selectedBlockId:
    string | null = null;

  private listeners =
    new Set<SelectionListener>();

  getSelection(): CanvasSelection {

    return {
      blockId:
        this.selectedBlockId
    };
  }

  getSelectedBlock(
    blocks: Block[]
  ): Block | null {

    if (!this.selectedBlockId) {
      return null;
    }

    return (
      blocks.find(
        block =>
          block.id ===
          this.selectedBlockId
      ) || null
    );
  }

  select(
    blockId: string
  ): void {

    this.selectedBlockId =
      blockId;

    this.emit();
  }

  selectBlock(
    block: Block
  ): void {

    this.select(block.id);
  }

  clear(): void {

    this.selectedBlockId =
      null;

    this.emit();
  }

  isSelected(
    blockId: string
  ): boolean {

    return (
      this.selectedBlockId ===
      blockId
    );
  }

  sync(
    blocks: Block[]
  ): void {

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

      this.emit();
    }
  }

  subscribe(
    listener: SelectionListener
  ): () => void {

    this.listeners.add(listener);

    listener(
      this.getSelection()
    );

    return () => {
      this.listeners.delete(
        listener
      );
    };
  }

  private emit(): void {

    const selection =
      this.getSelection();

    for (
      const listener of
      this.listeners
    ) {
      listener(selection);
    }
  }
}
