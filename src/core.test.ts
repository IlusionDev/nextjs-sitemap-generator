/* eslint-disable */

import Core from "./core";
import Config from "./InterfaceConfig";
import path from "path";
import fs from "fs";
import MockDate from "mockdate";

const rootPath = path.resolve("./");

const config: Config = {
  alternateUrls: {
    en: "https://example.en",
    es: "https://example.es",
    ja: "https://example.jp",
    fr: "https://example.fr"
  },
  baseUrl: "https://example.com.ru",
  ignoredPaths: ["admin"],
  pagesDirectory: path.resolve(rootPath, "example", "pages__test"),
  targetDirectory: path.resolve(rootPath, "example", "static"),
  ignoreIndexFiles: true,
  ignoredExtensions: ["yml"],
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
};
const coreMapper = new Core(config);

beforeEach(() => {
  MockDate.set("2020-01-01T12:00:00Z");
});

afterAll(() => {
  MockDate.reset();
});

it("Should detect reserved sites", () => {
  const underscoredSite = coreMapper.isReservedPage("_admin");
  const dotedSite = coreMapper.isReservedPage(".admin");

  expect(underscoredSite).toBe(true);
  expect(dotedSite).toBe(true);
});

it("Should skip non reserved sites", () => {
  const site = coreMapper.isReservedPage("admin");

  expect(site).toBe(false);
});

it("Should ignore expecified site's path ", () => {
  const ignoredPath = coreMapper.isIgnoredPath("admin");

  expect(ignoredPath).toBe(true);
});

it("Should skip non expecified sites's path", () => {
  const ignoredPath = coreMapper.isReservedPage("admin");

  expect(ignoredPath).toBe(false);
});

it("Should ignore expecified extensions", () => {
  const ignoredExtension = coreMapper.isIgnoredExtension("yml");

  expect(ignoredExtension).toBe(true);
});

it("Should skip non expecified extensions", () => {
  const ignoredExtension = coreMapper.isReservedPage("jsx");

  expect(ignoredExtension).toBe(false);
});

it("Should merge path", () => {
  const mergedPath = coreMapper.mergePath("/admin", "list");

  expect(mergedPath).toEqual("/admin/list");
});

it("Should merge path from empty base path", () => {
  const mergedPath = coreMapper.mergePath("", "list");

  expect(mergedPath).toEqual("/list");
});

it("Should merge path from ignored path", () => {
  const mergedPath = coreMapper.mergePath("/admin", "");

  expect(mergedPath).toEqual("/admin");
});

it("Should merge empty path", () => {
  const mergedPath = coreMapper.mergePath("", "");

  expect(mergedPath).toEqual("");
});

it("Should generate sitemap.xml", async () => {
  coreMapper.preLaunch();
  await coreMapper.sitemapMapper(config.pagesDirectory);
  coreMapper.finish();
  const sitemap = fs.statSync(
    path.resolve(config.targetDirectory, "./sitemap.xml")
  );

  expect(sitemap.size).toBeGreaterThan(0);
});

it("should add extraPaths to output", async () => {
  const core = new Core({
    ...config,
    extraPaths: ["/extraPath"]
  });

  const urls = await core.getSitemapURLs(config.pagesDirectory);

  expect(urls).toContainEqual({
    pagePath: "/extraPath",
    outputPath: "/extraPath",
    priority: "",
    changefreq: ""
  });
});

it("Should generate a sitemap with a custom file name", async () => {
  const coreMapper = new Core({
    ...config,
    sitemapFilename: "main.xml",
  });
  coreMapper.preLaunch();
  await coreMapper.sitemapMapper(config.pagesDirectory);
  coreMapper.finish();
  const sitemap = fs.statSync(
    path.resolve(config.targetDirectory, "./main.xml")
  );

  expect(sitemap.size).toBeGreaterThan(0);
});

it("Should generate valid sitemap.xml", async () => {
  coreMapper.preLaunch();
  await coreMapper.sitemapMapper(config.pagesDirectory);
  coreMapper.finish();
  const sitemap = fs.readFileSync(
    path.resolve(config.targetDirectory, "./sitemap.xml"),
    { encoding: "UTF-8" }
  );
  expect(sitemap.includes("xml-stylesheet"));
  expect(sitemap).toMatchInlineSnapshot(`
    "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><?xml-stylesheet href=\\"/test/styles.css\\" type=\\"text/css\\" ?>
    <?xml-stylesheet href=\\"test/test/styles.xls\\" type=\\"text/xsl\\" ?>

          <urlset xsi:schemaLocation=\\"http://www.sitemaps.org/schemas/sitemap/0.9 
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\\" 
          xmlns:xsi=\\"http://www.w3.org/2001/XMLSchema-instance\\" 
          xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\" 
          xmlns:xhtml=\\"http://www.w3.org/1999/xhtml\\">
          <url><loc>https://example.com.ru/index.old</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/index.old\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/index.old\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/index.old\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/index.old\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url><url><loc>https://example.com.ru</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url><url><loc>https://example.com.ru/login</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/login\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/login\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/login\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/login\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url><url><loc>https://example.com.ru/product-discount</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/product-discount\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/product-discount\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/product-discount\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/product-discount\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url><url><loc>https://example.com.ru/set-user</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/set-user\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/set-user\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/set-user\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/set-user\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url><url><loc>https://example.com.ru/store/page1</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/store/page1\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/store/page1\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/store/page1\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/store/page1\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url><url><loc>https://example.com.ru/store/page2</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/store/page2\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/store/page2\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/store/page2\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/store/page2\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url><url><loc>https://example.com.ru/store/product/page1</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/store/product/page1\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/store/product/page1\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/store/product/page1\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/store/product/page1\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url><url><loc>https://example.com.ru/store/product/page2</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/store/product/page2\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/store/product/page2\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/store/product/page2\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/store/product/page2\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url><url><loc>https://example.com.ru/user/page1</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/user/page1\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/user/page1\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/user/page1\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/user/page1\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url><url><loc>https://example.com.ru/user/page2</loc>
                    <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/user/page2\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/user/page2\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/user/page2\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/user/page2\\" />
                    
                    
                    <lastmod>2020-01-01</lastmod>
                    </url></urlset>"
  `);
});

it("Should generate styles xml links", async () => {
  coreMapper.preLaunch();
  await coreMapper.sitemapMapper(config.pagesDirectory);
  coreMapper.finish();
  const sitemap = fs.readFileSync(
    path.resolve(config.targetDirectory, "./sitemap.xml"),
    { encoding: "UTF-8" }
  );

  expect(
    sitemap.includes(
      '<?xml-stylesheet href="test/test/styles.xls" type="text/xsl" ?>'
    )
  ).toBe(true);
  expect(
    sitemap.includes(
      '<?xml-stylesheet href="/test/styles.css" type="text/css" ?>'
    )
  ).toBe(true);
});

it("Should make map of sites", () => {
  const result = coreMapper.buildPathMap(config.pagesDirectory);

  expect(result).toMatchInlineSnapshot(`
    Object {
      "": Object {
        "page": "",
      },
      "/admin/page1": Object {
        "page": "/admin/page1",
      },
      "/admin/page2": Object {
        "page": "/admin/page2",
      },
      "/admin/page3": Object {
        "page": "/admin/page3",
      },
      "/admin/superadmins/page1": Object {
        "page": "/admin/superadmins/page1",
      },
      "/admin/superadmins/page2": Object {
        "page": "/admin/superadmins/page2",
      },
      "/index.old": Object {
        "page": "/index.old",
      },
      "/login": Object {
        "page": "/login",
      },
      "/product-discount": Object {
        "page": "/product-discount",
      },
      "/set-user": Object {
        "page": "/set-user",
      },
      "/store/page1": Object {
        "page": "/store/page1",
      },
      "/store/page2": Object {
        "page": "/store/page2",
      },
      "/store/product/page1": Object {
        "page": "/store/product/page1",
      },
      "/store/product/page2": Object {
        "page": "/store/product/page2",
      },
      "/user/page1": Object {
        "page": "/user/page1",
      },
      "/user/page2": Object {
        "page": "/user/page2",
      },
    }
  `);
});

describe("with nextConfig", () => {
  function getCoreWithNextConfig(nextConfig) {
    const core = new Core(config);

    core.nextConfig = nextConfig;

    return core;
  }

  it("should call exportPathMap from Next config", async () => {
    const core = getCoreWithNextConfig({
      async exportPathMap(defaultMap) {
        return {
          "/exportPathMapURL": { page: "/" }
        };
      }
    });

    const urls = await core.getSitemapURLs(config.pagesDirectory);

    expect(urls).toEqual([
      {
        changefreq: "",
        outputPath: "/exportPathMapURL",
        pagePath: "/exportPathMapURL",
        priority: ""
      }
    ]);
  });

  it("should respect exportTrailingSlash from Next config", async () => {
    const core = getCoreWithNextConfig({
      exportTrailingSlash: true
    });

    const urls = await core.getSitemapURLs(config.pagesDirectory);

    const outputPaths = urls.map(url => url.outputPath);
    expect(outputPaths.every(outputPath => outputPath.endsWith("/")));

    expect(urls).toMatchInlineSnapshot(`
      Array [
        Object {
          "changefreq": "",
          "outputPath": "/admin/page1/",
          "pagePath": "/admin/page1",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/admin/page2/",
          "pagePath": "/admin/page2",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/admin/page3/",
          "pagePath": "/admin/page3",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/admin/superadmins/page1/",
          "pagePath": "/admin/superadmins/page1",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/admin/superadmins/page2/",
          "pagePath": "/admin/superadmins/page2",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/index.old/",
          "pagePath": "/index.old",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/",
          "pagePath": "",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/login/",
          "pagePath": "/login",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/product-discount/",
          "pagePath": "/product-discount",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/set-user/",
          "pagePath": "/set-user",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/store/page1/",
          "pagePath": "/store/page1",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/store/page2/",
          "pagePath": "/store/page2",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/store/product/page1/",
          "pagePath": "/store/product/page1",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/store/product/page2/",
          "pagePath": "/store/product/page2",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/user/page1/",
          "pagePath": "/user/page1",
          "priority": "",
        },
        Object {
          "changefreq": "",
          "outputPath": "/user/page2/",
          "pagePath": "/user/page2",
          "priority": "",
        },
      ]
    `);
  });

  it("should exclude ignoredPaths returned by exportPathMap", async () => {
    const core = getCoreWithNextConfig({
      async exportPathMap(defaultMap) {
        return {
          "/admin/": { page: "/" } // should be filtered out by ignoredPaths
        };
      },
      exportTrailingSlash: true
    });

    core.preLaunch();
    await core.sitemapMapper(config.pagesDirectory);
    core.finish();

    const sitemap = fs.readFileSync(
      path.resolve(config.targetDirectory, "./sitemap.xml"),
      { encoding: "UTF-8" }
    );

    expect(sitemap).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><?xml-stylesheet href=\\"/test/styles.css\\" type=\\"text/css\\" ?>
      <?xml-stylesheet href=\\"test/test/styles.xls\\" type=\\"text/xsl\\" ?>

            <urlset xsi:schemaLocation=\\"http://www.sitemaps.org/schemas/sitemap/0.9 
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\\" 
            xmlns:xsi=\\"http://www.w3.org/2001/XMLSchema-instance\\" 
            xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\" 
            xmlns:xhtml=\\"http://www.w3.org/1999/xhtml\\">
            </urlset>"
    `);
  });

  it("should generate valid sitemap", async () => {
    const core = getCoreWithNextConfig({
      async exportPathMap(defaultMap) {
        return {
          "/exportPathMapURL": { page: "/" }
        };
      },
      exportTrailingSlash: true
    });

    core.preLaunch();
    await core.sitemapMapper(config.pagesDirectory);
    core.finish();

    const sitemap = fs.readFileSync(
      path.resolve(config.targetDirectory, "./sitemap.xml"),
      { encoding: "UTF-8" }
    );

    expect(sitemap).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><?xml-stylesheet href=\\"/test/styles.css\\" type=\\"text/css\\" ?>
      <?xml-stylesheet href=\\"test/test/styles.xls\\" type=\\"text/xsl\\" ?>

            <urlset xsi:schemaLocation=\\"http://www.sitemaps.org/schemas/sitemap/0.9 
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\\" 
            xmlns:xsi=\\"http://www.w3.org/2001/XMLSchema-instance\\" 
            xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\" 
            xmlns:xhtml=\\"http://www.w3.org/1999/xhtml\\">
            <url><loc>https://example.com.ru/exportPathMapURL/</loc>
                      <xhtml:link rel=\\"alternate\\" hreflang=\\"en\\" href=\\"https://example.en/exportPathMapURL/\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"es\\" href=\\"https://example.es/exportPathMapURL/\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"ja\\" href=\\"https://example.jp/exportPathMapURL/\\" /><xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://example.fr/exportPathMapURL/\\" />
                      
                      
                      <lastmod>2020-01-01</lastmod>
                      </url></urlset>"
    `);
  });
});
