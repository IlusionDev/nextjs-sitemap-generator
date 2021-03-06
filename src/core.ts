import fs from 'fs'
import { format } from 'date-fns'
import path from 'path'
// eslint-disable-next-line no-unused-vars
import Config, { SitemapStyleFile } from './InterfaceConfig'

class SiteMapper {
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
    sitemapStylesheet,
    allowFileExtensions
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
    this.allowFileExtensions = allowFileExtensions || false
    this.sitemapTag = '<?xml version="1.0" encoding="UTF-8"?>'
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
      this.sitemapStylesheet.forEach(({ type, styleFile }) => {
        xmlStyle += `<?xml-stylesheet href="${styleFile}" type="${type}" ?>\n`
      })
    }
    fs.writeFileSync(
      path.resolve(this.targetDirectory, './', this.sitemapFilename),
      this.sitemapTag + xmlStyle + this.sitemapUrlSet,
      {
        flag: 'w'
      }
    )
  }

  finish () {
    fs.writeFileSync(
      path.resolve(this.targetDirectory, './', this.sitemapFilename),
      '</urlset>',
      {
        flag: 'as'
      }
    )
  }

  isReservedPage (site: string): boolean {
    let isReserved = false
    if (site.charAt(0) === '_' || site.charAt(0) === '.') isReserved = true

    return isReserved
  }

  isIgnoredPath (site: string) {
    let toIgnore = false
    for (const ignoredPath of this.ignoredPaths) {
      if (ignoredPath instanceof RegExp) {
        if (ignoredPath.test(site)) toIgnore = true
      } else {
        if (site.includes(ignoredPath)) toIgnore = true
      }
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

      let fileNameWithoutExtension = site.substring(
        0,
        site.length - (fileExtension.length + 1)
      )
      fileNameWithoutExtension =
        this.ignoreIndexFiles && fileNameWithoutExtension === 'index'
          ? ''
          : fileNameWithoutExtension

      let newDir = dir.replace(this.pagesdirectory, '').replace(/\\/g, '/')

      if (newDir === '/index') newDir = ''

      const pagePath = this.mergePath(newDir, this.allowFileExtensions ? site : fileNameWithoutExtension)

      pathMap[pagePath] = {
        page: pagePath
      }
    }

    return pathMap
  }

  checkTrailingSlash () {
    if (!this.nextConfig) return false
    const { exportTrailingSlash, trailingSlash } = this.nextConfig
    const next9OrlowerVersion = typeof exportTrailingSlash !== 'undefined'
    const next10Version = typeof trailingSlash !== 'undefined'
    if (
      (next9OrlowerVersion || next10Version) &&
      (exportTrailingSlash || trailingSlash)
    ) { return true }

    return false
  }

  async getSitemapURLs (dir) {
    let pathMap = this.buildPathMap(dir)

    const exportTrailingSlash = this.checkTrailingSlash()

    const exportPathMap = this.nextConfig && this.nextConfig.exportPathMap
    if (exportPathMap) {
      try {
        pathMap = await exportPathMap(pathMap, {})
      } catch (err) {
        console.log(err)
      }
    }

    const paths = Object.keys(pathMap).concat(this.extraPaths)

    return paths.map((pagePath) => {
      let outputPath = pagePath

      if (exportTrailingSlash && !this.allowFileExtensions && outputPath.slice(-1) !== '/') {
        outputPath += '/'
      }

      let priority = ''
      let changefreq = ''

      if (!this.pagesConfig) {
        return {
          pagePath,
          outputPath,
          priority,
          changefreq
        }
      }

      Object.entries(this.pagesConfig).forEach(([key, val]) => {
        if (key.includes('*')) {
          const regex = new RegExp(key, 'i')
          if (regex.test(pagePath)) {
            priority = val.priority
            changefreq = val.changefreq
          }
        }
      })

      if (this.pagesConfig[pagePath.toLowerCase()]) {
        const pageConfig = this.pagesConfig[pagePath.toLowerCase()]
        priority = pageConfig.priority
        changefreq = pageConfig.changefreq
      }

      return {
        pagePath,
        outputPath,
        priority,
        changefreq
      }
    })
  }

  async sitemapMapper (dir) {
    const urls = await this.getSitemapURLs(dir)

    const filteredURLs = urls.filter(
      (url) => !this.isIgnoredPath(url.pagePath)
    )

    const date = format(new Date(), 'yyyy-MM-dd')

    filteredURLs.forEach((url) => {
      let xmlObject = '\n\t<url>'

      const location = `<loc>${this.baseUrl}${url.outputPath}</loc>`
      xmlObject += `\n\t\t${location}`

      let alternates = ''
      for (const langSite in this.alternatesUrls) {
        alternates += `<xhtml:link rel="alternate" hreflang="${langSite}" href="${this.alternatesUrls[langSite]}${url.outputPath}" />`
      }
      if (alternates !== '') {
        xmlObject += `\n\t\t${alternates}`
      }

      if (url.priority) {
        const priority = `<priority>${url.priority}</priority>`
        xmlObject += `\n\t\t${priority}`
      }

      if (url.changefreq) {
        const changefreq = `<changefreq>${url.changefreq}</changefreq>`
        xmlObject += `\n\t\t${changefreq}`
      }

      const lastmod = `<lastmod>${date}</lastmod>`
      xmlObject += `\n\t\t${lastmod}\n\t</url>\n`

      fs.writeFileSync(
        path.resolve(this.targetDirectory, './', this.sitemapFilename),
        xmlObject,
        {
          flag: 'as'
        }
      )
    })
  }
}

export default SiteMapper
