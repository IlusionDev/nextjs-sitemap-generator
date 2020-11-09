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
  ignoredPaths: ["admin", /^\/like\//],
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

it("Should ignore expecified site's path with regexp", () => {
  const ignoredPath = coreMapper.isIgnoredPath("/like/product");

  expect(ignoredPath).toBe(true);
});

it("Should not ignore expecified site's path with regexp", () => {
  const ignoredPath = coreMapper.isIgnoredPath("/store/product/like-a-vergin");

  expect(ignoredPath).toBe(false);
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
  expect(sitemap).toMatchSnapshot()
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

  expect(result).toMatchSnapshot()
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

  it("should check if exportTrailingSlash exists in Next config", async () => {
    const core = getCoreWithNextConfig({
      exportTrailingSlash: true
    });

    expect(core.checkTrailingSlash()).toBe(true);
  });

  it("should check if trailingSlash exists in Next config", async () => {
    const core = getCoreWithNextConfig({
      trailingSlash: true
    });

    expect(core.checkTrailingSlash()).toBe(true);
  });

  it("should check that exportTrailingSlash no exists in Next config", async () => {
    const core = getCoreWithNextConfig({
      exportTrailingSlash: false
    });

    expect(core.checkTrailingSlash()).toBe(false);
  });

  it("should check that trailingSlash no exists in Next config", async () => {
    const core = getCoreWithNextConfig({
      trailingSlash: false
    });

    expect(core.checkTrailingSlash()).toBe(false);
  });

  it("should respect exportTrailingSlash from Next config", async () => {
    const core = getCoreWithNextConfig({
      exportTrailingSlash: true
    });

    const urls = await core.getSitemapURLs(config.pagesDirectory);

    const outputPaths = urls.map(url => url.outputPath);
    expect(outputPaths.every(outputPath => outputPath.endsWith("/")));
    expect(urls).toMatchSnapshot()
  });

  it("should exclude ignoredPaths returned by exportPathMap", async () => {
    const core = getCoreWithNextConfig({
      async exportPathMap(defaultMap) {
        return {
          "/admin/": { page: "/" } // should be filtered out by ignoredPaths
        };
      },
    });

    core.preLaunch();
    await core.sitemapMapper(config.pagesDirectory);
    core.finish();

    const sitemap = fs.readFileSync(
      path.resolve(config.targetDirectory, "./sitemap.xml"),
      { encoding: "UTF-8" }
    );

    expect(sitemap).toMatchSnapshot()
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

    expect(sitemap).toMatchSnapshot()
  });
});
