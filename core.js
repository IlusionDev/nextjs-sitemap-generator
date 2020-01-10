"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable global-require */
const fs_1 = __importDefault(require("fs"));
const date_fns_1 = __importDefault(require("date-fns"));
const path_1 = __importDefault(require("path"));
class SiteMapper {
    constructor({ alternateUrls, baseUrl, ignoreIndexFiles, ignoredPaths, pagesDirectory, sitemapPath, targetDirectory, nextConfigPath, ignoredExtensions, pagesConfig, }) {
        this.pagesConfig = pagesConfig || {};
        this.alternatesUrls = alternateUrls || {};
        this.baseUrl = baseUrl;
        this.ignoredPaths = ignoredPaths || [];
        this.ignoreIndexFiles = ignoreIndexFiles || false;
        this.ignoredExtensions = ignoredExtensions || [];
        this.pagesdirectory = pagesDirectory;
        this.sitemapPath = sitemapPath;
        this.targetDirectory = targetDirectory;
        this.nextConfigPath = nextConfigPath;
        this.sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;
        if (this.nextConfigPath) {
            // eslint-disable-next-line import/no-dynamic-require
            this.nextConfig = require(nextConfigPath);
            if (typeof this.nextConfig === 'function') {
                this.nextConfig = this.nextConfig([], {});
            }
        }
    }
    preLaunch() {
        fs_1.default.writeFileSync(path_1.default.resolve(this.targetDirectory, './sitemap.xml'), this.sitemap, {
            flag: 'w',
        });
    }
    finish() {
        fs_1.default.writeFileSync(path_1.default.resolve(this.targetDirectory, './sitemap.xml'), '</urlset>', {
            flag: 'as',
        });
    }
    /**
     *
     */
    buildPathMap(dir) {
        let pathMap = {};
        const { exportTrailingSlash } = this.nextConfig || {};
        const data = fs_1.default.readdirSync(dir);
        for (const site of data) {
            // Filter directories
            if (site[0] === '_' || site[0] === '.')
                continue;
            let toIgnore = false;
            for (const ignoredPath of this.ignoredPaths) {
                if (site.includes(ignoredPath))
                    toIgnore = true;
            }
            if (toIgnore)
                continue;
            // Handle recursive paths
            if (fs_1.default.lstatSync(dir + path_1.default.sep + site).isDirectory()) {
                pathMap = {
                    ...pathMap,
                    ...this.buildPathMap(dir + path_1.default.sep + site),
                };
                continue;
            }
            // Is file
            const fileExtension = site.split('.').pop();
            let toIgnoreExtension = false;
            for (const extensionToIgnore of this.ignoredExtensions) {
                if (extensionToIgnore === fileExtension)
                    toIgnoreExtension = true;
            }
            if (toIgnoreExtension)
                continue;
            let fileNameWithoutExtension = site.substring(0, site.length - (fileExtension.length + 1));
            fileNameWithoutExtension =
                this.ignoreIndexFiles && fileNameWithoutExtension === 'index'
                    ? ''
                    : fileNameWithoutExtension;
            let newDir = dir.replace(this.pagesdirectory, '').replace(/\\/g, '/');
            if (this.ignoreIndexFiles && newDir === '/index') {
                newDir = '';
            }
            const pagePath = [newDir, fileNameWithoutExtension]
                .filter((val) => exportTrailingSlash || !!val)
                .join('/');
            pathMap[pagePath] = {
                page: pagePath,
            };
        }
        return pathMap;
    }
    async sitemapMapper(dir) {
        let pathMap = this.buildPathMap(dir);
        const exportPathMap = this.nextConfig && this.nextConfig.exportPathMap;
        if (exportPathMap) {
            try {
                pathMap = await exportPathMap(pathMap, {});
            }
            catch (err) { }
        }
        const paths = Object.keys(pathMap);
        const date = date_fns_1.default.format(new Date(), 'YYYY-MM-DD');
        for (let i = 0, len = paths.length; i < len; i++) {
            const pagePath = paths[i];
            let alternates = '';
            let priority = '';
            let changefreq = '';
            for (let langSite in this.alternatesUrls) {
                alternates += `<xhtml:link rel="alternate" hreflang="${langSite}" href="${this.alternatesUrls[langSite]}${pagePath}" />`;
            }
            if (this.pagesConfig && this.pagesConfig[pagePath.toLowerCase()]) {
                const pageConfig = this.pagesConfig[pagePath];
                priority = pageConfig.priority
                    ? `<priority>${pageConfig.priority}</priority>`
                    : '';
                changefreq = pageConfig.changefreq
                    ? `<changefreq>${pageConfig.changefreq}</changefreq>`
                    : '';
            }
            const xmlObject = `<url><loc>${this.baseUrl}${pagePath}</loc>
                ${alternates}
                ${priority}
                ${changefreq}
                <lastmod>${date}</lastmod>
                </url>`;
            fs_1.default.writeFileSync(path_1.default.resolve(this.targetDirectory, './sitemap.xml'), xmlObject, {
                flag: 'as',
            });
        }
    }
}
exports.default = SiteMapper;
