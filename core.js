"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const date_fns_1 = require("date-fns");
const path_1 = __importDefault(require("path"));
class SiteMapper {
    constructor({ alternateUrls, baseUrl, ignoreIndexFiles, ignoredPaths, pagesDirectory, targetDirectory, nextConfigPath, ignoredExtensions, pagesConfig }) {
        this.pagesConfig = pagesConfig || {};
        this.alternatesUrls = alternateUrls || {};
        this.baseUrl = baseUrl;
        this.ignoredPaths = ignoredPaths || [];
        this.ignoreIndexFiles = ignoreIndexFiles || false;
        this.ignoredExtensions = ignoredExtensions || [];
        this.pagesdirectory = pagesDirectory;
        this.targetDirectory = targetDirectory;
        this.nextConfigPath = nextConfigPath;
        this.sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;
        if (this.nextConfigPath) {
            this.nextConfig = require(nextConfigPath);
            if (typeof this.nextConfig === 'function') {
                this.nextConfig = this.nextConfig([], {});
            }
        }
    }
    preLaunch() {
        fs_1.default.writeFileSync(path_1.default.resolve(this.targetDirectory, './sitemap.xml'), this.sitemap, {
            flag: 'w'
        });
    }
    finish() {
        fs_1.default.writeFileSync(path_1.default.resolve(this.targetDirectory, './sitemap.xml'), '</urlset>', {
            flag: 'as'
        });
    }
    isReservedPage(site) {
        let isReserved = false;
        if (site.charAt(0) === '_' || site.charAt(0) === '.')
            isReserved = true;
        return isReserved;
    }
    isIgnoredPath(site) {
        let toIgnore = false;
        for (const ignoredPath of this.ignoredPaths) {
            if (site.includes(ignoredPath))
                toIgnore = true;
        }
        return toIgnore;
    }
    isIgnoredExtension(fileExtension) {
        let toIgnoreExtension = false;
        for (const extensionToIgnore of this.ignoredExtensions) {
            if (extensionToIgnore === fileExtension)
                toIgnoreExtension = true;
        }
        return toIgnoreExtension;
    }
    mergePath(basePath, currentPage) {
        let newBasePath = basePath;
        if (!basePath && !currentPage)
            return '';
        if (!newBasePath) {
            newBasePath = '/';
        }
        else if (currentPage) {
            newBasePath += '/';
        }
        return newBasePath + currentPage;
    }
    buildPathMap(dir) {
        let pathMap = {};
        const data = fs_1.default.readdirSync(dir);
        for (const site of data) {
            // Filter directories
            if (this.isReservedPage(site))
                continue;
            let toIgnore = false;
            toIgnore = this.isIgnoredPath(site);
            if (toIgnore)
                continue;
            const nextPath = dir + path_1.default.sep + site;
            if (fs_1.default.lstatSync(nextPath).isDirectory()) {
                pathMap = {
                    ...pathMap,
                    ...this.buildPathMap(dir + path_1.default.sep + site)
                };
                continue;
            }
            const fileExtension = site.split('.').pop();
            if (this.isIgnoredExtension(fileExtension))
                continue;
            let fileNameWithoutExtension = site.substring(0, site.length - (fileExtension.length + 1));
            fileNameWithoutExtension = this.ignoreIndexFiles && fileNameWithoutExtension === 'index' ? '' : fileNameWithoutExtension;
            let newDir = dir.replace(this.pagesdirectory, '').replace(/\\/g, '/');
            if (newDir === '/index')
                newDir = '';
            const pagePath = newDir;
            pathMap[pagePath] = {
                page: pagePath
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
            catch (err) {
                console.log(err);
            }
        }
        const paths = Object.keys(pathMap);
        const date = date_fns_1.format(new Date(), 'yyyy-MM-dd');
        for (let i = 0, len = paths.length; i < len; i++) {
            const pagePath = paths[i];
            let alternates = '';
            let priority = '';
            let changefreq = '';
            for (const langSite in this.alternatesUrls) {
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
                flag: 'as'
            });
        }
    }
}
exports.default = SiteMapper;
