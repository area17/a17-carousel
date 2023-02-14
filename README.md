# A17 Carousel

**Note** This is a legacy slider/carousel - online for legacy A17 sites and heritage purposes - this carousel JS really does date back to 2007. It was updated and tweaked over the years, but active development stopped in 2020. Today, you will be better served by [Splide](https://splidejs.com/)

---

* Demos [https://area17.github.io/a17-carousel/](https://area17.github.io/a17-carousel/)
* Issues [https://github.com/area17/a17-carousel/issues](https://github.com/area17/a17-carousel/issues)

## Introduction

This is the public and actively maintained version of the original `A17_slider` script, originally written in September 2007 for the long dead AOL Asylum and since used on many A17 projects.

More detailed instructions on usage are at: [https://area17.github.io/a17-carousel/](https://area17.github.io/a17-carousel/)

## Issues/Contributing/Discussion

If you find a bug in a17-carousel, please add it to [the issue tracker](https://github.com/area17/a17-carousel/issues) or fork it, fix it and submit a pull request for it (👍).

The development script is `dist/a17-carousel.js`. Tabs are 2 spaces, functions are commented, variables are camel case and its preferred that its easier to read than outright file size being the smallest possible.

Make sure to include a minified version inside of `dist` by running: `npm run minify` (you'll need to `npm run install` to install `terser`). The minified version is added to the git repository for users who aren't using build tools.

## Support

IE9+ because of the use of `addEventListener`. This maybe subject to change in the future.

## Filesize

* ~31kb uncompressed
* ~11kb minified
* ~3kb minified and gzipped
