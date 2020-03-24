import {
  Service,
  Characteristic,
  CharacteristicEventTypes,
  Categories
} from 'hap-nodejs/dist'
import * as _ from 'lodash'
import { BaseAccessory } from './Base'

import {
  AccessoryParams,
  CharacteristicValue,
  NodeCallback
} from './interfaces'

export class TemperatureSensor extends BaseAccessory {
  public temperature: number = 0
  constructor(params: AccessoryParams) {
    super({ ...params, category: Categories.SENSOR })
    this.init()
  }
  private init() {
    this._accessory
      .getService(Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Manufacturer, 'IHOME')
      .setCharacteristic(Characteristic.Model, 'v1.0')

    this._accessory
      .addService(Service.TemperatureSensor, this.name) // services exposed to the user should have "names" like "Light" for this case
      .getCharacteristic(Characteristic.CurrentTemperature)!
      .on(
        CharacteristicEventTypes.GET,
        (callback: NodeCallback<CharacteristicValue>) => {
          this.getTemperature()
            .then(temperature => callback(null, temperature))
            .catch(err => callback(err))
        }
      )
  }

  async getTemperature(): Promise<CharacteristicValue> {
    try {
      let temperature = await this.getAction('getTemperature')
      this.temperature = Number(temperature)
      return temperature
    } catch (err) {
      return 0
    }
  }
}
