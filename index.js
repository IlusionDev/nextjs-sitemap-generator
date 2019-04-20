
const Core = require('./core.js');

module.exports = function (config) {

    if (!config ) {
        throw new Error('Config is mandatory');
    }

    let coreMapper = new Core(config);

    coreMapper.preLaunch();
    coreMapper.sitemapMapper(config.pagesDirectory);
    coreMapper.finish();

}
