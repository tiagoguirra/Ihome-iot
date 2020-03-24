import {
  Service,
  Characteristic,
  CharacteristicEventTypes,
  Categories
} from 'hap-nodejs/dist'
import * as _ from 'lodash'
import { BaseAccessory } from './Base'

import {
  CharacteristicValue,
  CharacteristicSetCallback,
  NodeCallback,
  AccessoryParams
} from './interfaces'

export class Switch extends BaseAccessory {
  public power: boolean = false
  constructor(params: AccessoryParams) {
    super({ ...params, category: Categories.SWITCH })
    this.init()
  }
  private init() {
    this._accessory
      .getService(Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Manufacturer, 'IHOME')
      .setCharacteristic(Characteristic.Model, 'v1.0')

    this._accessory
      .addService(Service.Switch, this.name) // services exposed to the user should have "names" like "Light" for this case
      .getCharacteristic(Characteristic.On)!
      .on(
        CharacteristicEventTypes.SET,
        (value: boolean, callback: CharacteristicSetCallback) => {
          this.setPower(value)
            .then(() => callback())
            .catch(() => callback())
        }
      )
      .on(
        CharacteristicEventTypes.GET,
        (callback: NodeCallback<CharacteristicValue>) => {
          this.getPower()
            .then(power => callback(null, power))
            .catch(err => callback(err))
        }
      )
  }
  async setPower(status: boolean): Promise<void> {
    try {
      await this.sendAction('setPower', status ? 'on' : 'off')
      this.debug(
        `Status dispositivo ${this.name} alterado para ${
          status ? 'Ligado' : 'Desligado'
        }`
      )
      this.power = status
    } catch (err) {
      this.power = false
    }
  }

  async getPower(): Promise<boolean> {
    try {
      let data = await this.getAction('getPower')
      return data == 'on' ? true : false
    } catch (err) {
      this.power = false
      return false
    }
  }
}
