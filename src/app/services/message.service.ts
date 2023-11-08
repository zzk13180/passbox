import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

type Message = {
  msg: string
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messages$ = new Subject<any>()

  get messagesObs() {
    return this.messages$.asObservable()
  }

  constructor() {}

  open(message: Message) {
    this.messages$.next(message)
  }
}
