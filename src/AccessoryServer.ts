import { Server, Namespace } from 'socket.io'
import { bridge } from './BridgeCore'

import { getAcessory } from './accesssories'
import { BaseAccessory } from './accesssories/Base'

export class AccessoryServer {
  private io: Server
  private nsp: Namespace
  private accessories: Map<string, BaseAccessory[]>
  constructor(io: Server) {
    this.io = io
    this.nsp = this.io.of('/accessory')
    this.accessories = new Map<string, BaseAccessory[]>()
    this.init()
  }
  addAccessory(data: any, socket: SocketIO.Socket) {
    const { category, name, params = {} } = data
    const accessory = getAcessory(category, name, socket, params)
    const socketAccessories = this.accessories.get(socket.id) || []
    this.accessories.set(socket.id, [...socketAccessories, accessory])
    bridge.addBridgedAccessory(accessory.accessory)
  }
  removeAccessory(socket: SocketIO.Socket) {
    const socketDevices = this.accessories.get(socket.id) || []
    socketDevices.map(device => {
      bridge.removeBridgedAccessory(device.accessory, false)
    })
  }
  init() {
    this.nsp.on('connection', (socket: SocketIO.Socket) => {
      socket.on('up', data => this.addAccessory(data, socket))
      socket.on('down', () => this.removeAccessory(socket))
      socket.on('update', data => {
        this.removeAccessory(socket)
        this.addAccessory(data, socket)
      })
      socket.on('disconnect', this.removeAccessory)
    })
  }
}
