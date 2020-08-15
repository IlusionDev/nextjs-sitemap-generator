![npmv1](https://img.shields.io/npm/v/nextjs-sitemap-generator.svg)
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors)

You can make donations for the maintenance of the project.
[Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YFXG8SLXPEVXN&source=url)

Simple `sitemap.xml` mapper for Next.js projects.

## Usage

This module have been created to be used at node server side of NextJs.
It is meant to be used in server.js so that when the server is initialized it will only run once.
If you place it in any of the request handler of the node server performance may be affected.

#### Usage for static HTML apps

If you are exporting the next project as a static HTML app, create a next-sitemap-generator script file in the base directory.
The option `pagesDirectory` should point to the static files output folder.
After generating the output files, run `node your_nextjs_sitemap_generator.js` to generate the sitemap.

#### Usage with `getStaticPaths`

If you are using `next@^9.4.0`, you may have your site configured with getStaticPaths to pregenerate pages on dynamic routes. To add those to your sitemap, you need to load the BUILD_ID file into your config whilst excluding fallback pages:

```js
const sitemap = require("nextjs-sitemap-generator");
const fs = require("fs");

const BUILD_ID = fs.readFileSync(".next/BUILD_ID").toString();

sitemap({
  baseUrl: "https://example.com",
  pagesDirectory: __dirname + "/.next/serverless/pages",
  targetDirectory: "public/",
  ignoredExtensions: ["js", "map"],
  ignoredPaths: ["[fallback]"],
});
```

## OPTIONS

```javascript
// your_nextjs_sitemap_generator.js

const sitemap = require('nextjs-sitemap-generator');

sitemap({
  alternateUrls: {
    en: 'https://example.en',
    es: 'https://example.es',
    ja: 'https://example.jp',
    fr: 'https://example.fr',
  },
  baseUrl: 'https://example.com',
  ignoredPaths: ['admin'],
  extraPaths: ['/extraPath'],
  pagesDirectory: __dirname + "\\pages",
  targetDirectory : 'static/',
  sitemapFilename: 'sitemap.xml',
  nextConfigPath: __dirname + "\\next.config.js",
  ignoredExtensions: [
        'png',
        'jpg'
  ],
  pagesConfig: {
    '/login': {
      priority: '0.5',
      changefreq: 'daily'
    }
  },
  sitemapStylesheet: [
    {
      type: "text/css",
      styleFile: "/test/styles.css"
    },
    {
      type: "text/xsl",
      styleFile: "test/test/styles.xls"
    }
  ]
});

console.log(`✅ sitemap.xml generated!`);
```

## OPTIONS description

 - **alternateUrls**:  You can add the alternate domains corresponding to the available language. (OPTIONAL)
 - **baseUrl**:  The url that it's going to be used at the beginning of each page.
 - **ignoreIndexFiles**: Whether index file should be in URL or just directory ending with the slash (OPTIONAL)
 - **ignoredPaths**:  File or directory to not map (like admin routes).(OPTIONAL)
 - **extraPaths**:  Array of extra paths to include in the sitemap (even if not present in pagesDirectory) (OPTIONAL)
 - **ignoredExtensions**:  Ignore files by extension.(OPTIONAL)
 - **pagesDirectory**:  The directory where Nextjs pages live. You can use another directory while they are nextjs pages. **It must to be an absolute path**.
 - **targetDirectory**:  The directory where sitemap.xml going to be written.
 - **sitemapFilename**:  The filename for the sitemap. Defaults to `sitemap.xml`. (OPTIONAL)
 - **pagesConfig**:  Object configuration of priority and changefreq per route.(OPTIONAL)
 - **sitemapStylesheet**:  Array of style objects that will be applied to sitemap.(OPTIONAL)
 - **nextConfigPath**(Used for dynamic routes):  Calls `exportPathMap` if exported from `nextConfigPath` js file.
  See this to understand how to do it (https://nextjs.org/docs/api-reference/next.config.js/exportPathMap) (OPTIONAL)

## Considerations
For now the **ignoredPaths** matches whatever cointaning the thing you put, ignoring if there are files or directories.
In the next versions this going to be fixed.






## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/getriot"><img src="https://avatars3.githubusercontent.com/u/2164596?v=4" width="100px;" alt=""/><br /><sub><b>Daniele Simeone</b></sub></a><br /><a href="https://github.com/IlusionDev/nextjs-sitemap-generator/commits?author=getriot" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/illiteratewriter"><img src="https://avatars1.githubusercontent.com/u/5787110?v=4" width="100px;" alt=""/><br /><sub><b>illiteratewriter</b></sub></a><br /><a href="https://github.com/IlusionDev/nextjs-sitemap-generator/commits?author=illiteratewriter" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/goran-zdjelar"><img src="https://avatars2.githubusercontent.com/u/45183713?v=4" width="100px;" alt=""/><br /><sub><b>Goran Zdjelar</b></sub></a><br /><a href="https://github.com/IlusionDev/nextjs-sitemap-generator/commits?author=goran-zdjelar" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jlaramie"><img src="https://avatars0.githubusercontent.com/u/755748?v=4" width="100px;" alt=""/><br /><sub><b>jlaramie</b></sub></a><br /><a href="https://github.com/IlusionDev/nextjs-sitemap-generator/commits?author=jlaramie" title="Code">💻</a></td>
    <td align="center"><a href="https://ecoeats.uk"><img src="https://avatars2.githubusercontent.com/u/1136276?v=4" width="100px;" alt=""/><br /><sub><b>Stewart McGown</b></sub></a><br /><a href="https://github.com/IlusionDev/nextjs-sitemap-generator/commits?author=stewartmcgown" title="Documentation">📖</a></td>
    <td align="center"><a href="https://jordanandree.com"><img src="https://avatars0.githubusercontent.com/u/235503?v=4" width="100px;" alt=""/><br /><sub><b>Jordan Andree</b></sub></a><br /><a href="https://github.com/IlusionDev/nextjs-sitemap-generator/commits?author=jordanandree" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
