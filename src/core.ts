import fs from 'fs'
import { format } from 'date-fns'
import path from 'path'
// eslint-disable-next-line no-unused-vars
import Config, { SitemapStyleFile } from './InterfaceConfig'

class SiteMapper {
  pagesConfig?: object;

  alternatesUrls?: object;

  baseUrl: string;

  ignoredPaths?: Array<string>;

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

  constructor ({
    alternateUrls,
    baseUrl,
    extraPaths,
    ignoreIndexFiles,
    ignoredPaths,
    pagesDirectory,
    targetDirectory,
    sitemapFilename,
    nextConfigPath,
    ignoredExtensions,
    pagesConfig,
    sitemapStylesheet
  }: Config) {
    this.pagesConfig = pagesConfig || {}
    this.alternatesUrls = alternateUrls || {}
    this.baseUrl = baseUrl
    this.ignoredPaths = ignoredPaths || []
    this.extraPaths = extraPaths || []
    this.ignoreIndexFiles = ignoreIndexFiles || false
    this.ignoredExtensions = ignoredExtensions || []
    this.pagesdirectory = pagesDirectory
    this.targetDirectory = targetDirectory
    this.sitemapFilename = sitemapFilename || 'sitemap.xml'
    this.nextConfigPath = nextConfigPath
    this.sitemapStylesheet = sitemapStylesheet || []
    this.sitemapTag = `<?xml version="1.0" encoding="UTF-8"?>`
    this.sitemapUrlSet = `
      <urlset xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
      http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" 
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
      xmlns:xhtml="http://www.w3.org/1999/xhtml">
      `

    if (this.nextConfigPath) {
      this.nextConfig = require(nextConfigPath)
      if (typeof this.nextConfig === 'function') {
        this.nextConfig = this.nextConfig([], {})
      }
    }
  }

  preLaunch () {
    let xmlStyle = ''

    if (this.sitemapStylesheet) {
      this.sitemapStylesheet.forEach(({ type, styleFile }) => { xmlStyle += `<?xml-stylesheet href="${styleFile}" type="${type}" ?>\n` })
    }
    fs.writeFileSync(path.resolve(this.targetDirectory, './', this.sitemapFilename), this.sitemapTag + xmlStyle + this.sitemapUrlSet, {
      flag: 'w'
    })
  }

  finish () {
    fs.writeFileSync(path.resolve(this.targetDirectory, './', this.sitemapFilename), '</urlset>', {
      flag: 'as'
    })
  }

  isReservedPage (site: string): boolean {
    let isReserved = false
    if (site.charAt(0) === '_' || site.charAt(0) === '.') isReserved = true

    return isReserved
  }

  isIgnoredPath (site: string) {
    let toIgnore = false
    for (const ignoredPath of this.ignoredPaths) {
      if (site.includes(ignoredPath)) toIgnore = true
    }

    return toIgnore
  }

  isIgnoredExtension (fileExtension: string) {
    let toIgnoreExtension = false
    for (const extensionToIgnore of this.ignoredExtensions) {
      if (extensionToIgnore === fileExtension) toIgnoreExtension = true
    }

    return toIgnoreExtension
  }

  mergePath (basePath: string, currentPage: string) {
    let newBasePath: string = basePath
    if (!basePath && !currentPage) return ''

    if (!newBasePath) {
      newBasePath = '/'
    } else if (currentPage) {
      newBasePath += '/'
    }

    return newBasePath + currentPage
  }

  buildPathMap (dir) {
    let pathMap: object = {}
    const data = fs.readdirSync(dir)

    for (const site of data) {
      if (this.isReservedPage(site)) continue

      // Filter directories
      const nextPath: string = dir + path.sep + site
      if (fs.lstatSync(nextPath).isDirectory()) {
        pathMap = {
          ...pathMap,
          ...this.buildPathMap(dir + path.sep + site)
        }
        continue
      }

      const fileExtension = site.split('.').pop()
      if (this.isIgnoredExtension(fileExtension)) continue

      let fileNameWithoutExtension = site.substring(0, site.length - (fileExtension.length + 1))
      fileNameWithoutExtension = this.ignoreIndexFiles && fileNameWithoutExtension === 'index' ? '' : fileNameWithoutExtension

      let newDir = dir.replace(this.pagesdirectory, '').replace(/\\/g, '/')

      if (newDir === '/index') newDir = ''

      const pagePath = this.mergePath(newDir, fileNameWithoutExtension)

      pathMap[pagePath] = {
        page: pagePath
      }
    }

    return pathMap
  }

  async getSitemapURLs(dir) {
    let pathMap = this.buildPathMap(dir)
    const exportTrailingSlash = this.nextConfig && this.nextConfig.exportTrailingSlash

    const exportPathMap = this.nextConfig && this.nextConfig.exportPathMap
    if (exportPathMap) {
      try {
        pathMap = await exportPathMap(pathMap, {})
      } catch (err) {
        console.log(err)
      }
    }

    const paths = Object.keys(pathMap).concat(this.extraPaths)

    return paths.map(pagePath => {
      let outputPath = pagePath
      if (exportTrailingSlash) {
        outputPath += '/'
      }

      let priority = ''
      let changefreq = ''

      if (this.pagesConfig && this.pagesConfig[pagePath.toLowerCase()]) {
        const pageConfig = this.pagesConfig[pagePath]
        priority = pageConfig.priority
        changefreq = pageConfig.changefreq
      }

      return {
        pagePath,
        outputPath,
        priority,
        changefreq,
      }
    });
  }

  async sitemapMapper(dir) {
    const urls = await this.getSitemapURLs(dir)

    const filteredURLs = urls.filter(url => !this.isIgnoredPath(url.pagePath))

    const date = format(new Date(), 'yyyy-MM-dd')

    filteredURLs.forEach((url) => {
      let alternates = ''
      let priority = ''
      let changefreq = ''

      for (const langSite in this.alternatesUrls) {
        alternates += `<xhtml:link rel="alternate" hreflang="${langSite}" href="${this.alternatesUrls[langSite]}${url.outputPath}" />`
      }

      if (url.priority) {
        priority = `<priority>${url.priority}</priority>`
      }
      if (url.changefreq) {
        changefreq = `<changefreq>${url.changefreq}</changefreq>`
      }

      const xmlObject = `<url><loc>${this.baseUrl}${url.outputPath}</loc>
                ${alternates}
                ${priority}
                ${changefreq}
                <lastmod>${date}</lastmod>
                </url>`

      fs.writeFileSync(path.resolve(this.targetDirectory, './', this.sitemapFilename), xmlObject, {
        flag: 'as'
      })
    })
  }
}

export default SiteMapper
