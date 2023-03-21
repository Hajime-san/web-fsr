# web-fsr

This repository is an example of implementation
[FidelityFX Super Resolution 1.0 (FSR)](https://gpuopen.com/fidelityfx-superresolution/)
that port to `WebGL`.\
Thanks to original porting that its in [ShaderToy](https://www.shadertoy.com/).

- [https://www.shadertoy.com/view/stXSWB](https://www.shadertoy.com/view/stXSWB)

I thought that the technique could make `static` video source and `streaming`
clearer, thus I tried to use for upscaling the image of `<video>` element on
HTML.\
So I wrote [static video](./example/) example and
[browser extension](./browser-extension/) to test the result.\
Here are some examples.

- [https://hajime-san.github.io/web-fsr/](https://hajime-san.github.io/web-fsr/)

## my guess

From these examples, I think that `FSR 1.0` works well when the buffer resource
to be denoised, no extreme small resolution and containing high spatial
frequencies.\
And it appears jagged a little bit on outline of Anime characters as in the
picture.

## static video

- original video
  \
  resolution `1280 * 720`
  ![IMG_0086-MOV-original.png](assets/IMG_0086-MOV-original.png?raw=true "IMG_0086-MOV-original")
  `1975kb`
- FSR
  ![IMG_0086-MOV-fsr.png](assets/IMG_0086-MOV-fsr.png?raw=true "IMG_0086-MOV-fsr")
  `2443kb`
- comparison
  ![IMG_0086-MOV-comparison.png](assets/IMG_0086-MOV-comparison.png?raw=true "IMG_0086-MOV-comparison")
- demo
  \
  [https://hajime-san.github.io/web-fsr/](https://hajime-san.github.io/web-fsr/)

## streaming with browser extension

### [新・豪血寺一族 -煩悩解放 - レッツゴー！陰陽師](https://www.nicovideo.jp/watch/sm9)

- original source
  \
  resolution `320 * 240`
  ![sm9-original.png](assets/sm9-original.png?raw=true "sm9-original") `651kb`
- FSR ![sm9-fsr.png](assets/sm9-fsr.png?raw=true "sm9-fsr") `697kb`
- comparison
  ![sm9-comparison.png](assets/sm9-comparison.png?raw=true "sm9-comparison")

### [【MV再現】新・豪血寺一族‐レッツゴー！陰陽師【周央サンゴ】](https://www.nicovideo.jp/watch/sm41892494)

- original source
  \
  resolution `1280 * 720`
  ![sm41892494-original.png](assets/sm41892494-original.png?raw=true "sm41892494-original")
  `1806kb`
- FSR ![sm41892494-fsr.png](assets/sm41892494-fsr.png?raw=true "sm41892494-fsr")
  `2199kb`
- comparison
  ![sm41892494-comparison.png](assets/sm41892494-comparison.png?raw=true "sm41892494-comparison")

### [ぼっち・ざ・ろっく！ #1「転がるぼっち」](https://www.nicovideo.jp/watch/so41178183)

- original source
  \
  resolution `1920 * 1080`
  ![so41178183-original.png](assets/so41178183-original.png?raw=true "so41178183-original")
  `1347kb`
- FSR ![so41178183-fsr.png](assets/so41178183-fsr.png?raw=true "so41178183-fsr")
  `1734kb`
- comparison
  ![so41178183-comparison.png](assets/so41178183-comparison.png?raw=true "so41178183-comparison")

### [[南極大冒険] 地球上で最も過酷！コウテイペンギンの子育て | Emperor penguin | BS4K8K | NHK](https://www.nicovideo.jp/watch/so39952539)

- original source
  \
  resolution `1280 * 720`
  ![so39952539-original.png](assets/so39952539-original.png?raw=true "so39952539-original")
  `1272kb`
- FSR ![so39952539-fsr.png](assets/so39952539-fsr.png?raw=true "so39952539-fsr")
  `1546kb`
- comparison
  ![so39952539-comparison.png](assets/so39952539-comparison.png?raw=true "so39952539-comparison")
