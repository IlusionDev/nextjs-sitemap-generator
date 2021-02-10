import Core from './core'
import InterfaceConfig from './InterfaceConfig'

export default async function(config: InterfaceConfig) {
  if (!config) {
    throw new Error('Config is mandatory')
  }

  const coreMapper = new Core(config)

  coreMapper.preLaunch()
  await coreMapper.sitemapMapper(config.pagesDirectory)
  coreMapper.finish()
}
