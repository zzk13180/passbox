/* Original code: ng-devui/overlay-container/overlay-container-ref.ts */
import {
  ApplicationRef,
  ComponentFactory,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  TemplateRef,
  ViewRef,
} from '@angular/core'
import { DOCUMENT } from '@angular/common'

@Injectable()
export class OverlayContainerRef {
  constructor(
    private _appRef: ApplicationRef,
    private _injector: Injector,
  ) {}

  insert(viewRef: ViewRef): ViewRef {
    this._appRef.attachView(viewRef)
    const documentRef = this._injector.get(DOCUMENT)
    documentRef.body.appendChild((viewRef as EmbeddedViewRef<any>).rootNodes[0])
    return viewRef
  }

  remove(viewRef: ViewRef) {
    viewRef.destroy()
  }

  createEmbeddedView<C>(templateRef: TemplateRef<any>, context?: C) {
    const viewRef = templateRef.createEmbeddedView(context || {})
    return this.insert(viewRef)
  }

  createComponent<C>(
    componentFactory: ComponentFactory<C>,
    injector?: Injector,
    projectableNodes?: any[][],
  ) {
    const componentRef = componentFactory.create(
      injector || this._injector,
      projectableNodes,
    ) as ComponentRef<C>
    this.insert(componentRef.hostView)
    return componentRef
  }
}
