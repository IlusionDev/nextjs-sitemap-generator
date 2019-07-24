const fs = require('fs');
const dateFns = require('date-fns');
const path = require('path');

class SiteMapper {


    constructor({
                    alternateUrls,
                    baseUrl,
                    ignoreIndexFiles,
                    ignoredPaths,
                    pagesDirectory,
                    sitemapPath,
                    targetDirectory,
                }) {
                    
        this.alternatesUrls = alternateUrls || {};
        this.baseUrl = baseUrl;
        this.ignoredPaths = ignoredPaths || [];
        this.ignoreIndexFiles = ignoreIndexFiles || false;
        this.pagesdirectory = pagesDirectory;
        this.sitemapPath = sitemapPath;
        this.targetDirectory = targetDirectory;
        this.sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;


    }

    preLaunch() {
        fs.writeFileSync(`${this.targetDirectory}sitemap.xml`, this.sitemap, {flag: 'w'});
    };

    finish() {
        fs.writeFileSync(`${this.targetDirectory}sitemap.xml`, '</urlset>', {flag: 'as'});

    };

    sitemapMapper(dir) {

        let date = dateFns.format(new Date(), 'YYYY-MM-DD');
        let data = fs.readdirSync(dir);
        for (let site of data) {
            if (site[0] === '_' || site[0] === '.') continue;
            let toIgnore = false;
            for (let path of this.ignoredPaths) {
                if (site.includes(path)) toIgnore = true;
            }
            if (toIgnore) continue;

            if (fs.lstatSync(dir + path.sep + site).isDirectory()) {
                this.sitemapMapper(dir + path.sep + site);
                continue;
            }
            let fileExtension = site.split('.').pop().length;
            let fileNameWithoutExtension = site.substring(0, site.length - (fileExtension + 1));
            fileNameWithoutExtension = this.ignoreIndexFiles && fileNameWithoutExtension === 'index' ? '' : fileNameWithoutExtension;
            let newDir = dir.replace(this.pagesdirectory, '').replace(/\\/g, '/');
            let alternates = '';
            for (let langSite in this.alternatesUrls) {
                alternates += `<xhtml:link rel="alernate" hreflang="${langSite}" href="${
                    this.alternatesUrls[langSite]
                    }${newDir + '/' + fileNameWithoutExtension}" />`;
            }
            let xmlObject = `<url><loc>${this.baseUrl}${newDir +
                '/' +
                fileNameWithoutExtension}</loc>` +
                alternates +
                `<lastmod>${date}</lastmod></url>`;
            fs.writeFileSync(`${this.targetDirectory}${path.sep}sitemap.xml`, xmlObject, {flag: 'as'});
        }
    }

}

module.exports = SiteMapper;

