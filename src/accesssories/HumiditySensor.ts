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

export class HumiditySensor extends BaseAccessory {
  public humidity: number = 0
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
      .addService(Service.HumiditySensor, this.name) // services exposed to the user should have "names" like "Light" for this case
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)!
      .on(
        CharacteristicEventTypes.GET,
        (callback: NodeCallback<CharacteristicValue>) => {
          this.getHumidity()
            .then(humidity => callback(null, humidity))
            .catch(err => callback(err))
        }
      )
  }

  async getHumidity(): Promise<CharacteristicValue> {
    try {
      let humidity = await this.getAction('getHumidity')
      this.humidity = Number(humidity)
      return humidity
    } catch (err) {
      this.humidity = 0
      return 0
    }
  }
}
