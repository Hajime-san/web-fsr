# web-fsr

This repository is an example of implementation
[FidelityFX Super Resolution 1.0 (FSR)](https://github.com/GPUOpen-Effects/FidelityFX-FSR)
that port to `WebGL`.\
Thanks to original porting that its in [ShaderToy](https://www.shadertoy.com/).

- [https://www.shadertoy.com/view/stXSWB](https://www.shadertoy.com/view/stXSWB)

And I tried to use for upscaling the image of `<video>` element on HTML, thus I
thought that the technique could make `static` video source and `streaming`
clearer.

## static

- original video
  \
  resolution `1280 * 720`
  ![IMG_0086-MOV-original.png](assets/IMG_0086-MOV-original.png?raw=true "IMG_0086-MOV-original")
- FSR
  ![IMG_0086-MOV-fsr.png](assets/IMG_0086-MOV-fsr.png?raw=true "IMG_0086-MOV-fsr")
- comparison
  ![IMG_0086-MOV-comparison.png](assets/IMG_0086-MOV-comparison.png?raw=true "IMG_0086-MOV-comparison")

## streaming

### [新・豪血寺一族 -煩悩解放 - レッツゴー！陰陽師](https://www.nicovideo.jp/watch/sm9)

- original video
  \
  resolution `320 * 240`
  ![sm9-original.png](assets/sm9-original.png?raw=true "sm9-original")
- FSR ![sm9-fsr.png](assets/sm9-fsr.png?raw=true "sm9-fsr")
- comparison
  ![sm9-comparison.png](assets/sm9-comparison.png?raw=true "sm9-comparison")

### [【MV再現】新・豪血寺一族‐レッツゴー！陰陽師【周央サンゴ】](https://www.nicovideo.jp/watch/sm41892494)

- original video
  \
  resolution `1280 * 720`
  ![sm41892494-original.png](assets/sm41892494-original.png?raw=true "sm41892494-original")
- FSR ![sm41892494-fsr.png](assets/sm41892494-fsr.png?raw=true "sm41892494-fsr")
- comparison
  ![sm41892494-comparison.png](assets/sm41892494-comparison.png?raw=true "sm41892494-comparison")
