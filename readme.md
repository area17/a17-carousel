# A17 Carousel

* Demos [http://slider.dev.area17.com/](http://slider.dev.area17.com/)
* Issues [https://code.area17.com/a17/a17-carousel/issues](https://code.area17.com/a17/a17-carousel/issues)

## Introduction

This is the public and actively maintained version of the original `A17_slider` script, originally written in September 2007 for the long dead AOL Asylum and since used on many A17 projects.

More detailed instructions on usage are at: [http://slider.dev.area17.com/](http://slider.dev.area17.com/)

## Issues/Contributing/Discussion

If you find a bug in a17-carousel, please add it to [the issue tracker](https://code.area17.com/a17/a17-carousel/issues) or fork it, fix it and submit a pull request for it (👍).

The development script is `dist/a17-carousel.js`. Tabs are 2 spaces, functions are commented, variables are camel case and its preferred that its easier to read than outright file size being the smallest possible.

Make sure to include a minified version inside of `dist` by running: `npm run minify` (you'll need to `npm run install` to install `terser`). The minified version is added to the git repository for users who aren't using build tools.

## Support

IE9+ because of the use of `addEventListener`. This maybe subject to change in the future.

## Filesize

* ~31kb uncompressed
* ~11kb minified
* ~3kb minified and gzipped
