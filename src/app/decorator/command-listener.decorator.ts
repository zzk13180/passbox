import { Subject, takeUntil, filter } from 'rxjs'
import { CommandService } from 'src/app/services'
import type { CommandEnum } from 'src/app/enums'

export const CommandListener = (command: CommandEnum): MethodDecorator => {
  const destroy$ = new Subject<void>()
  return (
    target: any,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    if (!target.ngOnInit) {
      throw new Error(
        'CommandListener decorator must be used in a component with ngOnInit method',
      )
    }
    if (!target.ngOnDestroy) {
      throw new Error(
        'CommandListener decorator must be used in a component with ngOnDestroy method',
      )
    }

    const originalOnInit = target.ngOnInit
    target.ngOnInit = function () {
      CommandService.commandObs
        .pipe(
          takeUntil(destroy$),
          filter((c: CommandEnum) => c === command),
        )
        .subscribe(() => {
          descriptor.value.apply(this)
        })
      originalOnInit.apply(this)
    }

    const originalOnDestroy = target.ngOnDestroy
    target.ngOnDestroy = function () {
      destroy$.next()
      originalOnDestroy.apply(this)
    }

    return descriptor
  }
}
