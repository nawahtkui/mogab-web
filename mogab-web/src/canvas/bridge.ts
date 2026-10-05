import {
  MOGABCanvasAdapter
} from '../../../src/canvas/canvas.adapter'

import {
  MOGABCanvasController
} from '../../../src/canvas/canvas.controller'

import {
  MOGABDOMCanvas
} from '../../../src/canvas/dom.canvas'

export type MOGABCanvasBridgeConfig = {
  root: HTMLElement
  baseUrl: string
  projectId: string
  token?: string
}

export class MOGABCanvasBridge {

  readonly controller: MOGABCanvasController

  readonly canvas: MOGABDOMCanvas

  constructor(
    config: MOGABCanvasBridgeConfig
  ) {

    const adapter =
      new MOGABCanvasAdapter({
        baseUrl: config.baseUrl,
        projectId: config.projectId,
        authToken: config.token
      })

    this.controller =
      new MOGABCanvasController(
        adapter,
        {
          baseUrl: config.baseUrl,
          projectId: config.projectId,
          token: config.token,
          reconnect: true
        }
      )

    this.canvas =
      new MOGABDOMCanvas(
        this.controller,
        {
          root: config.root
        }
      )
  }

  async load(
    pageSlug: string
  ) {
    return this.canvas.load(pageSlug)
  }

  destroy(): void {
    this.canvas.destroy()
    this.controller.destroy()
  }
}
