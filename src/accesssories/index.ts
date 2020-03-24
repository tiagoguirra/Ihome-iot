import { Ligth } from './Ligth'
import { DoorLock } from './DoorLock'
import { BaseAccessory } from './Base'
import { Socket } from 'socket.io'
import { Fan } from './Fan'
import { HumiditySensor } from './HumiditySensor'
import { Switch } from './Switch'
import { TemperatureSensor } from './TemperaturSensor'

const getAcessory = (
  cateogory: string,
  name: string,
  socket: Socket,
  params?: any
): BaseAccessory => {
  switch (cateogory) {
    case 'Ligth':
      return new Ligth({
        username: process.env.BRIDGE_USERNAME,
        pincode: process.env.BRIDGE_PINCODE,
        name,
        mac: params.mac || '',
        socket: socket,
        brightness: params.brightness || false
      })
    case 'DoorLock':
      return new DoorLock({
        username: process.env.BRIDGE_USERNAME,
        pincode: process.env.BRIDGE_PINCODE,
        name,
        mac: params.mac || '',
        socket: socket
      })
    case 'Fan':
      return new Fan({
        username: process.env.BRIDGE_USERNAME,
        pincode: process.env.BRIDGE_PINCODE,
        name,
        mac: params.mac || '',
        socket: socket,
        speed: params.speed || false
      })
    case 'HumiditySensor':
      return new HumiditySensor({
        username: process.env.BRIDGE_USERNAME,
        pincode: process.env.BRIDGE_PINCODE,
        name,
        mac: params.mac || '',
        socket: socket
      })
    case 'TemperatureSensor':
      return new TemperatureSensor({
        username: process.env.BRIDGE_USERNAME,
        pincode: process.env.BRIDGE_PINCODE,
        name,
        mac: params.mac || '',
        socket: socket
      })
    case 'Switch':
      return new Switch({
        username: process.env.BRIDGE_USERNAME,
        pincode: process.env.BRIDGE_PINCODE,
        name,
        mac: params.mac || '',
        socket: socket
      })
    default:
      throw new Error('Accessory not supported')
  }
}
export {
  Ligth,
  getAcessory,
  Fan,
  Switch,
  TemperatureSensor,
  HumiditySensor,
  DoorLock
}
