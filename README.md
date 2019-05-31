![npmv1](https://img.shields.io/npm/v/nextjs-sitemap-generator.svg)

Simple sitemap.xml mapper for NextJs proyects.
## Usage
This module have been created to be used at node server side of NextJs.
It is meant to be used in server.js so that when the server is initialized it will only run once.
If you place it in any of the request handler of the node server performance may be affected.


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
      targetDirectory : 'static/'  
    });

## OPTIONS description

 - **alternateUrls**:  You can add the alternate domains corresponding to the available language. (OPTIONAL)
 - **baseUrl**:  The url that it's going to be used at the beginning of each page.
 - **ignoredPaths**:  File or directory to not map (like admin routes).(OPTIONAL)
 - **pagesDirectory**:  The directory where Nextjs pages live. You can use another directory while they are nextjs pages. **It must to be an absolute path**.
 - **targetDirectory**:  The directory where sitemap.xml going to be written.

## Considerations
For now the **ignoredPaths** matches whatrever cointaning the thing you put, ignoring if ther are files or directories.
In the next versions this going to be fixed.





