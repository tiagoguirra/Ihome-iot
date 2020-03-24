import {
  Service,
  Characteristic,
  CharacteristicEventTypes,
  Categories
} from 'hap-nodejs/dist'
import * as _ from 'lodash'
import { BaseAccessory } from './Base'

import {
  LightParams,
  CharacteristicValue,
  CharacteristicSetCallback,
  NodeCallback
} from './interfaces'

export class Ligth extends BaseAccessory {
  public power: boolean = false
  public brightness: number = 100
  private useBrightness: boolean
  constructor(params: LightParams) {
    super({ ...params, category: Categories.LIGHTBULB })
    this.useBrightness = params.brightness || false
    this.init()
  }
  private init() {
    this._accessory
      .getService(Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Manufacturer, 'IHOME')
      .setCharacteristic(Characteristic.Model, 'v1.0')

    this._accessory
      .addService(Service.Lightbulb, this.name) // services exposed to the user should have "names" like "Light" for this case
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
    if (this.useBrightness) {
      this._accessory
        .getService(Service.Lightbulb)!
        .addCharacteristic(Characteristic.Brightness)
        .on(
          CharacteristicEventTypes.SET,
          (value: number, callback: CharacteristicSetCallback) => {
            this.setBrightness(value)
              .then(() => callback())
              .catch(err => callback(err))
          }
        )
        .on(
          CharacteristicEventTypes.GET,
          (callback: NodeCallback<CharacteristicValue>) => {
            this.getBrightness()
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

  async setBrightness(brightness: number): Promise<void> {
    try {
      await this.sendAction('setBrightness', brightness)
      this.debug(`Brilho dispositivo ${this.name} alterado para ${brightness}`)
      this.brightness = brightness
    } catch (err) {
      this.brightness = 0
    }
  }

  async getBrightness(): Promise<number> {
    try {
      let response = await this.getAction('getBrightness')
      let status = Number(response) || 0
      this.brightness = status
      return status
    } catch (err) {
      this.brightness = 0
      return 0
    }
  }
}
