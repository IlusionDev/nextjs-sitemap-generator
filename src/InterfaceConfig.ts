export default interface Config {
  alternateUrls?: object;
  baseUrl: string;
  ignoredPaths?: Array<string>;
  ignoreIndexFiles?: Array<string> | boolean;
  ignoredExtensions?: Array<string>;
  pagesDirectory: string;
  nextConfigPath?: string;
  targetDirectory: string;
  pagesConfig?: object;
};