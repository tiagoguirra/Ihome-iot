import { Accessory, Categories, AccessoryEventTypes } from 'hap-nodejs/dist'
import { AccessoryParams, VoidCallback } from './interfaces'
import * as _ from 'lodash'
import { logDebug } from '../utils/logger'
import * as uuid from 'hap-nodejs/dist/lib/util/uuid'
import { Socket } from 'socket.io'

export class BaseAccessory {
  public name: string
  public pincode: string
  public username: string
  public outputLogs: boolean = true
  public category: Categories
  protected _accessory: Accessory
  public deviceID: string
  public deviceMAC: string
  public socketID: string
  protected socket: Socket
  public categoryName: string
  constructor(params: AccessoryParams) {
    this.name = params.name
    this.pincode = params.pincode
    this.username = params.username
    this.category = params.category
    this.socket = params.socket
    this.socketID = this.socket.id
    this.deviceMAC = params.mac || this.ramdonMac()
    this.deviceID = uuid.generate(
      `accessories:${this.deviceMAC}:${Categories.LIGHTBULB}:${this.username}:${this.pincode}`
    )
    this._accessory = new Accessory(this.name, this.deviceID)
    this._accessory.on(
      AccessoryEventTypes.IDENTIFY,
      (paired: boolean, callback: VoidCallback) => {
        this.debug(`${this.name} foi identificado ${paired}`)
        callback()
      }
    )
  }
  private ramdonMac(): string {
    let mac = ''
    for (let i = 0; i < 12; i++) {
      if (i % 2 === 0) mac += ':'
      mac += Math.floor(Math.random() * 16).toString(16)
    }
    return mac
  }
  public sendAction(event: string, data?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit(event, data || '')
      resolve()
    })
  }
  public getAction(event: string, data?: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.sendAction(event, data || '')
        .then(() => this.listenOnce(event))
        .then(data => {
          resolve(data)
        })
        .catch(err => {
          logDebug.error(`Falha ao obter evento`, err)
          reject({ message: 'Falha ao obter evento', err })
        })
    })
  }
  protected listenOnce(event: string, timeout: number = 5000): Promise<string> {
    const eventPromise: Promise<string> = new Promise((resolve, reject) => {
      this.socket.once(event, data => {
        return resolve(data)
      })
    })
    const timeoutPromise = this.timeOutPromise(timeout)
    return Promise.race([eventPromise, timeoutPromise])
  }
  protected listen(event: string, timeout: number = 5000): Promise<string> {
    const eventPromise: Promise<string> = new Promise((resolve, reject) => {
      this.socket.on(event, data => {
        return resolve(data)
      })
    })
    const timeoutPromise = this.timeOutPromise(timeout)
    return Promise.race([eventPromise, timeoutPromise])
  }
  private timeOutPromise(timeout: number = 5000): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(
        () =>
          reject({
            message: 'Timeout',
            err: `Time exceded ${timeout} seconds`
          }),
        timeout
      )
    })
  }
  protected debug(message: string) {
    if (this.outputLogs) {
      logDebug.debug(message)
    }
  }
  protected error(message: string, err: any) {
    logDebug.error(message, err)
  }
  get accessory(): Accessory {
    return this._accessory
  }
}
