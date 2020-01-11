import Core from './core'

module.exports = async function (config) {
  if (!config) {
    throw new Error('Config is mandatory')
  }

  const coreMapper = new Core(config)

  coreMapper.preLaunch()
  await coreMapper.sitemapMapper(config.pagesDirectory)
  coreMapper.finish()
}
