import Config, { SitemapStyleFile } from './InterfaceConfig';
declare class SiteMapper {
    pagesConfig?: object;
    alternatesUrls?: object;
    baseUrl: string;
    ignoredPaths?: Array<string | RegExp>;
    extraPaths?: Array<string>;
    ignoreIndexFiles?: Array<string> | boolean;
    ignoredExtensions?: Array<string>;
    pagesdirectory: string;
    sitemapPath: string;
    nextConfigPath?: string;
    sitemapTag: string;
    sitemapUrlSet: string;
    nextConfig: any;
    targetDirectory: string;
    sitemapFilename?: string;
    sitemapStylesheet?: Array<SitemapStyleFile>;
    allowFileExtensions?: boolean;
    constructor({ alternateUrls, baseUrl, extraPaths, ignoreIndexFiles, ignoredPaths, pagesDirectory, targetDirectory, sitemapFilename, nextConfigPath, ignoredExtensions, pagesConfig, sitemapStylesheet, allowFileExtensions }: Config);
    preLaunch(): void;
    finish(): void;
    isReservedPage(site: string): boolean;
    isIgnoredPath(site: string): boolean;
    isIgnoredExtension(fileExtension: string): boolean;
    mergePath(basePath: string, currentPage: string): string;
    buildPathMap(dir: any): object;
    checkTrailingSlash(): boolean;
    getSitemapURLs(dir: any): Promise<{
        pagePath: string;
        outputPath: string;
        priority: string;
        changefreq: string;
    }[]>;
    sitemapMapper(dir: any): Promise<void>;
}
export default SiteMapper;
