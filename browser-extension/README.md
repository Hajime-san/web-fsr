## Release flow
`git tag -a web-fxr-browser-extension@VERSION -m 'MESSAGE'`
\
`git push origin --tags`

## setup with self build

1. Run `pnpm install`
2. Run `pnpm build`
3. Register extension to your browser with `dist` directory or `manifest.json` file
    - Chrome
      \
      [https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)
    - FireFox
      \
      [https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

## setup with built assets

1. Donwload latest assets from [https://github.com/Hajime-san/web-fsr/releases](https://github.com/Hajime-san/web-fsr/releases)
  ![download-asset.png](download-asset.png?raw=true "download-asset")
2. Unzip it and register extension to your browser with `web-fsr-browser-extension` directory or `manifest.json` file
    - Chrome
      \
      [https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)
    - FireFox
      \
      [https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

## how to activate
Activate extension in video page with clicking the `WebFSR` icon
  ![extension-image.jpg](extension-image.jpg?raw=true "extension-image")
