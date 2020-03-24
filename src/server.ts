import * as express from 'express'
import * as http from 'http'
import * as cors from 'cors'
import * as socketIo from 'socket.io'
import { AccessoryServer } from './AccessoryServer'
import { logDebug } from './utils/logger'
import { bridgeInit } from './BridgeCore'

export default class Server {
  app: express.Application
  route: any
  logger: any
  io: SocketIO.Server
  serverAccessory: AccessoryServer
  serverHttp: http.Server
  constructor() {
    this.app = express()
    this.logger = logDebug
    this.midllewares()
    this.servers()
    this.run()
  }
  static init() {
    return new this()
  }

  midllewares() {
    this.app.disable('x-powered-by')
    this.app.options('*', cors())
    this.app.use(
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
      })
    )
  }
  servers() {
    bridgeInit()
    this.serverHttp = http.createServer(this.app)
    this.io = socketIo(this.serverHttp)
    this.serverAccessory = new AccessoryServer(this.io)
  }
  async run() {
    try {
      const port = process.env.PORT || 8000
      const host = process.env.HOST || 'localhost'
      const name = process.env.APP_NAME || 'IHome'
      await this.serverHttp.listen({ port, host }, () =>
        this.logger.log(`${name} running on port ${port}`)
      )
      this.serverHttp.timeout = 10 * 1000 * 60
    } catch (err) {
      this.logger.error(
        `Uma exceção quebrou a execução da aplicação: ${err.message}`
      )
      this.logger.trace(err)
      throw new Error('Application is crashed')
    }
  }
}
