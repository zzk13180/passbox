import { Subject } from 'rxjs'
import { CommandEnum } from 'src/app/enums'

export class CommandService {
  private static readonly triggerCommand$ = new Subject<CommandEnum>()

  static get commandObs() {
    return this.triggerCommand$.asObservable()
  }

  static triggerCommand(command: CommandEnum) {
    this.triggerCommand$.next(command)
  }

  constructor() {}
}
