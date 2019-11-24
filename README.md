![npmv1](https://img.shields.io/npm/v/nextjs-sitemap-generator.svg)
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors)

You can make donations for the maintenance of the project.
[Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YFXG8SLXPEVXN&source=url)

Simple sitemap.xml mapper for NextJs proyects.
## Usage
This module have been created to be used at node server side of NextJs.
It is meant to be used in server.js so that when the server is initialized it will only run once.
If you place it in any of the request handler of the node server performance may be affected.

#### Usage for static HTML apps

If you are exporting the next project as a static HTML app, create a next-sitemap-generator script file in the base directory.
The option `pagesDirectory` should point to the static files output folder.
After generating the output files, run `node your_nextjs_sitemap_generator.js` to generate the sitemap.

## OPTIONS

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
      pagesDirectory: __dirname + "\\pages",  
      targetDirectory : 'static/',
      nextConfigPath: __dirname + "\\next.config.js"
      ignoredExtensions: [
            'png',
            'jpg'
      ],
      pagesConfig: {
        '/login': {
          priority: '0.5',
          changefreq: 'daily'
        }
      }
    });

## OPTIONS description

 - **alternateUrls**:  You can add the alternate domains corresponding to the available language. (OPTIONAL)
 - **baseUrl**:  The url that it's going to be used at the beginning of each page.
 - **ignoreIndexFiles**: Whether index file should be in URL or just directory ending with the slash (OPTIONAL)
 - **ignoredPaths**:  File or directory to not map (like admin routes).(OPTIONAL)
 - **ignoredExtensions**:  Ignore files by extension.(OPTIONAL)
 - **pagesDirectory**:  The directory where Nextjs pages live. You can use another directory while they are nextjs pages. **It must to be an absolute path**.
 - **targetDirectory**:  The directory where sitemap.xml going to be written.
 - **pagesConfig**:  Object configuration of priority and changefreq per route.(OPTIONAL)
 - **nextConfigPath**(Used for dynamic routes):  Calls `exportPathMap` if exported from `nextConfigPath` js file.
  See this to understand how to do it (https://github.com/zeit/next.js/blob/canary/examples/with-static-export/next.config.js) (OPTIONAL)

## Considerations
For now the **ignoredPaths** matches whatever cointaning the thing you put, ignoring if there are files or directories.
In the next versions this going to be fixed.






## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/getriot"><img src="https://avatars3.githubusercontent.com/u/2164596?v=4" width="100px;" alt="Daniele Simeone"/><br /><sub><b>Daniele Simeone</b></sub></a><br /><a href="https://github.com/IlusionDev/nextjs-sitemap-generator/commits?author=getriot" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/illiteratewriter"><img src="https://avatars1.githubusercontent.com/u/5787110?v=4" width="100px;" alt="illiteratewriter"/><br /><sub><b>illiteratewriter</b></sub></a><br /><a href="https://github.com/IlusionDev/nextjs-sitemap-generator/commits?author=illiteratewriter" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/goran-zdjelar"><img src="https://avatars2.githubusercontent.com/u/45183713?v=4" width="100px;" alt="Goran Zdjelar"/><br /><sub><b>Goran Zdjelar</b></sub></a><br /><a href="https://github.com/IlusionDev/nextjs-sitemap-generator/commits?author=goran-zdjelar" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jlaramie"><img src="https://avatars0.githubusercontent.com/u/755748?v=4" width="100px;" alt="jlaramie"/><br /><sub><b>jlaramie</b></sub></a><br /><a href="https://github.com/IlusionDev/nextjs-sitemap-generator/commits?author=jlaramie" title="Code">💻</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
