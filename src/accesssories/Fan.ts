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
  FanParams
} from './interfaces'

export class Fan extends BaseAccessory {
  public power: boolean = false
  public speed: number = 0
  private useSpeed: boolean = false
  constructor(params: FanParams) {
    super({ ...params, category: Categories.FAN })
    this.useSpeed = params.speed || false
    this.init()
  }
  private init() {
    this._accessory
      .getService(Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Manufacturer, 'IHOME')
      .setCharacteristic(Characteristic.Model, 'v1.0')

    this._accessory
      .addService(Service.Fan, this.name) // services exposed to the user should have "names" like "Light" for this case
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
    if (this.useSpeed) {
      this._accessory
        .getService(Service.Fan)!
        .addCharacteristic(Characteristic.RotationSpeed)
        .on(
          CharacteristicEventTypes.SET,
          (value: number, callback: CharacteristicSetCallback) => {
            this.setSpeed(value)
              .then(() => callback())
              .catch(err => callback(err))
          }
        )
        .on(
          CharacteristicEventTypes.GET,
          (callback: NodeCallback<CharacteristicValue>) => {
            this.getSpeed()
              .then(power => callback(null, power))
              .catch(err => callback(err))
          }
        )
    }
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

  async setSpeed(speed: number): Promise<void> {
    try {
      await this.sendAction('setSpeed', speed)
      this.debug(`Velocidade dispositivo ${this.name} alterado para ${speed}`)
      this.speed = speed
    } catch (err) {
      this.speed = 0
    }
  }

  async getSpeed(): Promise<number> {
    try {
      let response = await this.getAction('getSpeed')
      let status = Number(response) || 0
      this.speed = status
      return status
    } catch (err) {
      this.speed = 0
      return 0
    }
  }
}
