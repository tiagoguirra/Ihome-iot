import { Categories } from 'hap-nodejs/dist'
import { Socket } from 'socket.io'
export interface AccessoryParams {
  name: string
  pincode: string
  username: string
  mac: string
  category?: Categories
  socket: Socket
}
export interface LightParams extends AccessoryParams {
  brightness?: boolean
}
export interface FanParams extends AccessoryParams {
  speed?: boolean
}

export enum LockDoorStatus {
  locked = 'locked',
  unlocked = 'unlocked',
  unknow = 'unknow'
}

export type PrimitiveTypes = string | number | boolean
export type Nullable<T> = T | null
export type NodeCallback<T> = (
  err: Nullable<Error> | undefined,
  data?: T
) => void
export type VoidCallback = (err?: Nullable<Error>) => void
export type CharacteristicValue =
  | PrimitiveTypes
  | PrimitiveTypes[]
  | { [key: string]: PrimitiveTypes }
export type CharacteristicSetCallback = (
  error?: Error | null,
  value?: CharacteristicValue
) => void
