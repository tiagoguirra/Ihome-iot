import { Server, Namespace } from 'socket.io'

export class DashboardServer {
  private io: Server
  private nsp: Namespace
  constructor(io: Server) {
    this.io = io
    this.nsp = this.io.of('/accessory')
    this.init()
  }
  init() {
    this.nsp.on('connection', (socket: SocketIO.Socket) => {})
  }
}
