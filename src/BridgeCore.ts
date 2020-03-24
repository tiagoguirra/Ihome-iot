const storage = require('node-persist')
import { Categories, AccessoryEventTypes, Bridge, uuid } from 'hap-nodejs/dist'
import { logDebug } from './utils/logger'
import { VoidCallback } from './accesssories/interfaces'

storage.initSync()
export const bridge = new Bridge('IHome Bridge', uuid.generate('IHome:Bridge2'))
export const bridgeInit = () => {
  const signals = { SIGINT: 2, SIGTERM: 15 } as Record<string, number>
  bridge.on(
    AccessoryEventTypes.IDENTIFY,
    (paired: boolean, callback: VoidCallback) => {
      logDebug.debug(`IHome bridge identify ${paired}`)
      callback()
    }
  )
  bridge.publish({
    username: process.env.BRIDGE_USERNAME,
    port: Number(process.env.BRIDGE_PORT),
    pincode: process.env.BRIDGE_PINCODE,
    category: Categories.BRIDGE
  })
  Object.keys(signals).forEach((signal: any) => {
    process.on(signal, function() {
      bridge.unpublish()
      setTimeout(function() {
        process.exit(128 + signals[signal])
      }, 1000)
    })
  })
}
