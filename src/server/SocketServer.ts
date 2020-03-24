import { Server, Namespace } from 'socket.io'
import { bridge } from '../BridgeCore'

import { getAcessory } from '../accesssories'
import { BaseAccessory } from '../accesssories/Base'

export class SocketServer {
  private io: Server
  private accessoryServer: Namespace
  private dashboardServer: Namespace
  public accessories: Map<string, BaseAccessory[]>
  constructor(io: Server) {
    this.io = io
    this.accessoryServer = this.io.of('/accessory')
    this.dashboardServer = this.io.of('/dashboard')
    this.accessories = new Map<string, BaseAccessory[]>()
    this.init()
  }
  listAccessories(socket: SocketIO.Socket) {
    const accessoriesList = []
    this.accessories.forEach(accessories => {
      accessories.forEach(accessory => {
        accessoriesList.push({
          name: accessory.name,
          category: accessory.categoryName,
          uuid: accessory.deviceID,
          socketId: accessory.socketID
        })
      })
    })
    socket.emit('accessories', accessoriesList)
  }
  sendActionAccessory(
    socketID: string,
    deviceID: string,
    eventName: string,
    data: any
  ) {
    const accessoriesSocket = this.accessories.get(socketID)
    if (accessoriesSocket) {
      let device = accessoriesSocket.find(item => item.deviceID == deviceID)
      if (device) {
        device.sendAction(eventName, data)
        return true
      }
      throw new Error('deviceNotFound')
    }
    throw new Error('socketNotFound')
  }
  getActionAccessory(
    socketID: string,
    deviceID: string,
    eventName: string,
    data: any = ''
  ) {
    return new Promise((resolve, reject) => {
      const accessoriesSocket = this.accessories.get(socketID)
      if (accessoriesSocket) {
        let device = accessoriesSocket.find(item => item.deviceID == deviceID)
        if (device) {
          device
            .getAction(eventName, data)
            .then(resp => resolve(resp))
            .catch(err => reject(err.message))
        }
        reject('deviceNotFound')
      }
      reject('socketNotFound')
    })
  }
  addAccessory(data: any, socket: SocketIO.Socket) {
    try {
      const { category, name, params = {} } = data
      const accessory = getAcessory(category, name, socket, params)
      const socketAccessories = this.accessories.get(socket.id) || []
      this.accessories.set(socket.id, [...socketAccessories, accessory])
      bridge.addBridgedAccessory(accessory.accessory)
      this.dashboardServer.emit('addAccessory', {
        name: accessory.name,
        category: accessory.categoryName,
        uuid: accessory.deviceID,
        socketId: accessory.socketID
      })
    } catch (err) {
      socket.emit('upFailure', err.message)
    }
  }
  removeAccessory(socket: SocketIO.Socket) {
    const socketDevices = this.accessories.get(socket.id) || []
    socketDevices.map(accessory => {
      bridge.removeBridgedAccessory(accessory.accessory, false)
      this.dashboardServer.emit('removeAccessory', {
        name: accessory.name,
        category: accessory.categoryName,
        uuid: accessory.deviceID,
        socketId: accessory.socketID
      })
    })
  }
  init() {
    this.accessoryServer.on('connection', (socket: SocketIO.Socket) => {
      socket.on('up', data => this.addAccessory(data, socket))
      socket.on('down', () => this.removeAccessory(socket))
      socket.on('update', data => {
        this.removeAccessory(socket)
        this.addAccessory(data, socket)
      })
      socket.on('disconnect', () => this.removeAccessory(socket))
    })
    this.dashboardServer.on('connection', (socket: SocketIO.Socket) => {
      socket.on('accessories', () => this.listAccessories(socket))
      socket.on('sendAction', ({ event, data, socketID, deviceID }) => {
        try {
          this.sendActionAccessory(event, data, socketID, deviceID)
        } catch (err) {
          socket.emit('sendActionFailure', {
            socketID,
            deviceID,
            reason: err.message
          })
        }
      })
      socket.on(
        'getAction',
        async ({ event, data = '', socketID, deviceID }) => {
          try {
            let value = await this.getActionAccessory(
              event,
              socketID,
              deviceID,
              data
            )
            socket.emit('getActionSuccess', {
              event,
              socketID,
              deviceID,
              value
            })
          } catch (err) {
            socket.emit('getActionFailure', {
              socketID,
              deviceID,
              reason: err.message
            })
          }
        }
      )
    })
  }
}
