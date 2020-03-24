import { HttpServer } from './server/HttpServer'
import * as fs from 'fs-extra'
import * as path from 'path'
import { logDebug, logFile } from './utils/logger'
import { config as envConfig } from 'dotenv'

const startConfig = () => {
  const configPath = path.resolve(__dirname, '..', '.env')
  if (fs.existsSync(configPath)) {
    envConfig({ path: configPath })
  } else {
    throw new Error('Arquivo de variaveis de ambiente (.env) não encontrado')
  }
}

const bootstrap = async () => {
  try {
    if (process.env.ENVIRONMENT != 'production') {
      logDebug.debug('Ambiente de desenvolvimento, usando variaveis do .env')
      startConfig()
    } else {
      logDebug.debug('Ambiente de produção, usando variaveis do processo')
    }
    process.env.ROOT_PATH = path.resolve(__dirname, '..')
    process.env.PUBLIC_PATH = path.resolve(process.env.ROOT_PATH, 'public')
    HttpServer.init()
  } catch (err) {
    logDebug.error('Uma exceção quebrou a execução da aplicação: ', err)
    logFile(err, 'main')
  }
}

bootstrap()
