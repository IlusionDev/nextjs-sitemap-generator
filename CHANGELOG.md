
## 1.0.0

- Fixed failing styles added to sitemap.xml
- Added "extraPaths" param that allows to add manually optional paths
- Changed behavior of "ignoredPaths" param in pull [42](https://github.com/IlusionDev/nextjs-sitemap-generator/pull/42#issue-405401454). Now filtering process is applied to the full path, rather than just filenames at each level of the path.
