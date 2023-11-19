import { Injectable } from '@angular/core'

@Injectable()
export class PartyService {
  private party: any

  constructor() {}

  async getParty() {
    this.party ??= await import('party-js')
    return this.party
  }
}
