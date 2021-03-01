![npmv1](https://img.shields.io/npm/v/nextjs-sitemap-generator.svg)

[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors)

  

We are looking for maintainers because I don't have enough time to maintain the package.

Please consider to make a donation for the maintenance of the project.

[Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YFXG8SLXPEVXN&source=url)

  

Simple `sitemap.xml` mapper for Next.js projects.

## Installation

To install the package execute this in your terminal if you are using yarn:

```

yarn add nextjs-sitemap-generator

```

And this if you are using npm:

```

npm i --save-dev nextjs-sitemap-generator

```

NextJs starts it's own server to serve all created files. But there are another option called [Custom server](https://nextjs.org/docs/advanced-features/custom-server) that uses a file to start a next server.

If you want use this package you must create the sever file. You can find how to do it here [NextJs custom server](https://nextjs.org/docs/advanced-features/custom-server)

  
  
  

This module have been created to be used at node [custom server](https://nextjs.org/docs/advanced-features/custom-server) side of NextJs.

It is meant to be used in index.js/server.js so that when the server is initialized it will only run once.

If you place it in any of the request handler of the node server performance may be affected.

  

For those people who deploy in Vercel:

> A custom server can not be deployed on Vercel, the platform Next.js was made for.

  

For example:

If you have this example server file

```js

// server.js

const sitemap =  require('nextjs-sitemap-generator');  // Import the package

const  { createServer }  =  require('http')

const  { parse }  =  require('url')

const next =  require('next')

  

const dev = process.env.NODE_ENV !==  'production'

const app =  next({ dev })

const handle = app.getRequestHandler()

  

/*

Here you is you have to use the sitemap function.

Using it here you are allowing to generate the sitemap file

only once, just when the server starts.

*/

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
  nextConfigPath: __dirname + "\\next.config.js"
});

  

app.prepare().then(()  =>  {
  createServer((req,  res)  =>  {
    const  parsedUrl  =  parse(req.url,  true)
    const  {  pathname,  query  }  =  parsedUrl
    if (pathname  ===  '/a') {
      app.render(req,  res,  '/a',  query)
    }  
    else  if (pathname  ===  '/b') {
      app.render(req,  res,  '/b',  query)
    }  else  {
      handle(req,  res,  parsedUrl)
  }}).listen(3000,  (err)  =>  {
    if (err) throw  err
    console.log('> Ready on http://localhost:3000')
 })
})

```

  

#### Usage for static HTML apps


If you are exporting the next project as a static HTML app, create a next-sitemap-generator script file in the base directory.

The option `pagesDirectory` should point to the static files output folder.

After generating the output files, run `node your_nextjs_sitemap_generator.js` to generate the sitemap.

  

If your pages are statically served then you will need to set the `allowFileExtensions` option as `true` so that the pages contain the extension, most cases being `.html`.

#### Usage with `getStaticPaths`

If you are using `next@^9.4.0`, you may have your site configured with getStaticPaths to pregenerate pages on dynamic routes. To add those to your sitemap, you need to load the BUILD_ID file into your config to reach the generated build directory with statics pages inside, whilst excluding everything that isn't static pages:

  

```js

const sitemap =  require("nextjs-sitemap-generator");

const fs =  require("fs");

  

const BUILD_ID = fs.readFileSync(".next/BUILD_ID").toString();

  

sitemap({
  baseUrl: "https://example.com",
  // If you are using Vercel platform to deploy change the route to /.next/serverless/pages 
  pagesDirectory: __dirname + "/.next/server/static/" + BUILD_ID + "/pages",
  targetDirectory: "public/",
  ignoredExtensions: ["js", "map"],
  ignoredPaths: ["assets"], // Exclude everything that isn't static page
});

```

  

## OPTIONS

  

```javascript
// your_nextjs_sitemap_generator.js

const sitemap = require("nextjs-sitemap-generator");

sitemap({
  alternateUrls: {
    en: "https://example.en",
    es: "https://example.es",
    ja: "https://example.jp",
    fr: "https://example.fr",
  },
  baseUrl: "https://example.com",
  ignoredPaths: ["admin"],
  extraPaths: ["/extraPath"],
  pagesDirectory: __dirname + "\\pages",
  targetDirectory: "static/",
  sitemapFilename: "sitemap.xml",
  nextConfigPath: __dirname + "\\next.config.js",
  ignoredExtensions: ["png", "jpg"],
  pagesConfig: {
    "/login": {
      priority: "0.5",
      changefreq: "daily",
    },
  },
  sitemapStylesheet: [
    {
      type: "text/css",
      styleFile: "/test/styles.css",
    },
    {
      type: "text/xsl",
      styleFile: "test/test/styles.xls",
    },
  ],
});

console.log(`✅ sitemap.xml generated!`);


```
## OPTIONS description
-  **alternateUrls**: You can add the alternate domains corresponding to the available language. (OPTIONAL)

-  **baseUrl**: The url that it's going to be used at the beginning of each page.

-  **ignoreIndexFiles**: Whether index file should be in URL or just directory ending with the slash (OPTIONAL)

-  **ignoredPaths**: File or directory to not map (like admin routes).(OPTIONAL)

-  **extraPaths**: Array of extra paths to include in the sitemap (even if not present in pagesDirectory) (OPTIONAL)

-  **ignoredExtensions**: Ignore files by extension.(OPTIONAL)

-  **pagesDirectory**: The directory where Nextjs pages live. You can use another directory while they are nextjs pages. **It must to be an absolute path**.

-  **targetDirectory**: The directory where sitemap.xml going to be written.

-  **sitemapFilename**: The filename for the sitemap. Defaults to `sitemap.xml`. (OPTIONAL)

-  **pagesConfig**: Object configuration of priority and changefreq per route. Accepts regex patterns(OPTIONAL) **Path keys must be lowercase**

-  **sitemapStylesheet**: Array of style objects that will be applied to sitemap.(OPTIONAL)

-  **nextConfigPath**(Used for dynamic routes): Calls `exportPathMap` if exported from `nextConfigPath` js file.

    See this to understand how to do it (https://nextjs.org/docs/api-reference/next.config.js/exportPathMap) (OPTIONAL)

-  **allowFileExtensions**(Used for static applications): Ensures the file extension is displayed with the path in the sitemap. If you are using nextConfigPath with exportTrailingSlash in next config, allowFileExtensions will be ignored.  (OPTIONAL)
  

## Considerations
For now the **ignoredPaths** matches whatever cointaning the thing you put, ignoring if there are files or directories.
In the next versions this going to be fixed.
