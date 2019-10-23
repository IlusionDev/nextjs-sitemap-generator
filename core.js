const fs = require("fs");
const dateFns = require("date-fns");
const path = require("path");

class SiteMapper {
    constructor({
        alternateUrls,
        baseUrl,
        ignoreIndexFiles,
        ignoredPaths,
        pagesDirectory,
        sitemapPath,
        targetDirectory,
        nextConfigPath,
        ignoredExtensions
    }) {
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
            this.nextConfig = require(nextConfigPath);
        }
    }

    preLaunch() {
        fs.writeFileSync(
            path.resolve(this.targetDirectory, "./sitemap.xml"),
            this.sitemap,
            {
                flag: "w"
            }
        );
    }

    finish() {
        fs.writeFileSync(
            path.resolve(this.targetDirectory, "./sitemap.xml"),
            "</urlset>",
            {
                flag: "as"
            }
        );
    }

    /**
     *
     */
    buildPathMap(dir) {
        var pathMap = {};

        let data = fs.readdirSync(dir);
        for (let site of data) {
            // Filter directories
            if (site[0] === "_" || site[0] === ".") continue;
            let toIgnore = false;
            for (let path of this.ignoredPaths) {
                if (site.includes(path)) toIgnore = true;
            }
            if (toIgnore) continue;

            // Handle recursive paths
            if (fs.lstatSync(dir + path.sep + site).isDirectory()) {
                pathMap = {
                    ...pathMap,
                    ...this.buildPathMap(dir + path.sep + site)
                };

                continue;
            }

            // Is file
            let fileExtension = site.split(".").pop();

            //Ignoring file extension by user config
            let toIgnoreExtension = false;

            for (let extensionToIgnore of this.ignoredExtensions) {
                if (extensionToIgnore === fileExtension) toIgnoreExtension = true;
            }

            if (toIgnoreExtension) continue;
            //

            let fileNameWithoutExtension = site.substring(
                0,
                site.length - (fileExtension.length + 1)
            );
            fileNameWithoutExtension =
                this.ignoreIndexFiles && fileNameWithoutExtension === "index"
                    ? ""
                    : fileNameWithoutExtension;
            let newDir = dir.replace(this.pagesdirectory, "").replace(/\\/g, "/");

            if (this.ignoreIndexFiles && newDir === "/index") {
                newDir = "";
            }

            let pagePath = newDir + "/" + fileNameWithoutExtension;
            pathMap[pagePath] = {
                page: pagePath
            };
        }

        return pathMap;
    }

    async sitemapMapper(dir) {
        var pathMap = this.buildPathMap(dir);
        const exportPathMap = this.nextConfig && this.nextConfig.exportPathMap;

        if (exportPathMap) {
            pathMap = await exportPathMap(pathMap, {});
        }

        const paths = Object.keys(pathMap);
        const date = dateFns.format(new Date(), "YYYY-MM-DD");

        for (var i = 0, len = paths.length; i < len; i++) {
            let pagePath = paths[i];
            let alternates = "";

            for (let langSite in this.alternatesUrls) {
                alternates += `<xhtml:link rel="alernate" hreflang="${langSite}" href="${this.alternatesUrls[langSite]}${pagePath}" />`;
            }

            let xmlObject =
                `<url><loc>${this.baseUrl}${pagePath}</loc>` +
                alternates +
                `<lastmod>${date}</lastmod></url>`;

            fs.writeFileSync(
                path.resolve(this.targetDirectory, "./sitemap.xml"),
                xmlObject,
                {flag: "as"}
            );
        }
    }
}

module.exports = SiteMapper;
