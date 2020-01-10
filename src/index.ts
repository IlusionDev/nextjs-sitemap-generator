/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import Core from './core';

export default async function (config) {
  if (!config) {
    throw new Error('Config is mandatory');
  }

  const coreMapper = new Core(config);

  coreMapper.preLaunch();
  await coreMapper.sitemapMapper(config.pagesDirectory);
  coreMapper.finish();
}
