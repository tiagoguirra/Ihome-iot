import {
  Service,
  Characteristic,
  CharacteristicEventTypes,
  Categories
} from 'hap-nodejs/dist'
import * as _ from 'lodash'
import { BaseAccessory } from './Base'

import {
  LockDoorStatus,
  AccessoryParams,
  CharacteristicValue,
  CharacteristicSetCallback,
  NodeCallback
} from './interfaces'

export class DoorLock extends BaseAccessory {
  public status: LockDoorStatus = LockDoorStatus.locked
  constructor(params: AccessoryParams) {
    super({ ...params, category: Categories.DOOR_LOCK })
    this.categoryName = 'DoorLock'
    this.init()
  }
  private init() {
    this._accessory
      .getService(Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Manufacturer, 'IHOME')
      .setCharacteristic(Characteristic.Model, 'v1.0')

    this._accessory
      .addService(Service.LockMechanism, this.name) // services exposed to the user should have "names" like "Light" for this case
      .getCharacteristic(Characteristic.LockTargetState)!
      .on(
        CharacteristicEventTypes.SET,
        (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
          this.setStatus(value)
            .then(() => {
              callback()
            })
            .then(() => {
              this.getStatus()
                .then(status => {
                  this._accessory
                    .getService(Service.LockMechanism)!
                    .setCharacteristic(Characteristic.LockCurrentState, status)
                })
                .catch(() => {})
            })
            .catch(() => callback())
        }
      )
      .on(
        CharacteristicEventTypes.GET,
        (callback: NodeCallback<CharacteristicValue>) => {
          this.getStatus()
            .then(status => callback(null, status))
            .catch(err => callback(err))
        }
      )
  }
  async setStatus(status: CharacteristicValue): Promise<void> {
    try {
      let statusNormalized: LockDoorStatus = LockDoorStatus.locked
      if (status == Characteristic.LockTargetState.UNSECURED) {
        statusNormalized = LockDoorStatus.unlocked
      }
      await this.sendAction('setStatus', statusNormalized)
      this.debug(
        `Status dispositivo ${this.name} alterado para ${statusNormalized}`
      )
      this.status = statusNormalized
    } catch (err) {
      this.status = LockDoorStatus.locked
    }
  }

  async getStatus(): Promise<CharacteristicValue> {
    try {
      let data = await this.getAction('getStatus')

      return data == LockDoorStatus.locked
        ? Characteristic.LockTargetState.SECURED
        : Characteristic.LockTargetState.UNSECURED
    } catch (err) {
      return Characteristic.LockTargetState.UNSECURED
    }
  }
}
