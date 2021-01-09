"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("./core"));
module.exports = async function (config) {
    if (!config) {
        throw new Error('Config is mandatory');
    }
    const coreMapper = new core_1.default(config);
    coreMapper.preLaunch();
    await coreMapper.sitemapMapper(config.pagesDirectory);
    coreMapper.finish();
};
