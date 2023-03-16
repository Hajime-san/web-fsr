import browser from "webextension-polyfill";
import * as THREE from "three";
import GUI from "lil-gui";
import ComparisonSlider from "comparison-slider/src/comparison-slider.ts";
// shaders
import vertexShader from "../../vert.glsl?raw";
import easuFragmentShader from "../../easu.glsl?raw";
import rcasFragmentShader from "../../rcas.glsl?raw";

(async () => {
  if (typeof browser.tabs === "undefined") return;

  const [currentTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  // popup HUD handler
  const hudHandlerChecked: Record<"hudHandler", boolean> = await browser.storage
    .local.get(["hudHandler"]);
  await browser.storage.local.set({ hudHandler: hudHandlerChecked });
  const hudHandler = document.getElementById("hudHandler") as HTMLInputElement;
  hudHandler.checked = hudHandlerChecked.hudHandler;
  hudHandler.addEventListener("click", async () => {
    await browser.storage.local.set({ hudHandler: hudHandler.checked });
    function injectHudHandler(checked: boolean) {
      if (!document.getElementById("hiddenCSSStyle")) {
        const $style = document.createElement("style");
        $style.setAttribute("id", "hiddenCSSStyle");
        $style.innerHTML = /* css */ `
          [hidden] {display: none!important;}
        `;
        document.head.insertBefore($style, document.head.firstChild);
      }

      const guiElement = document.getElementsByClassName("lil-gui");
      if (guiElement.length > 0) {
        !checked
          ? guiElement[0].removeAttribute("hidden")
          : guiElement[0].setAttribute("hidden", "true");
      }

      const comparisonSliderHandle = document.getElementsByClassName(
        "ComparisonSlider__Handle",
      );
      if (comparisonSliderHandle.length > 0) {
        !checked
          ? comparisonSliderHandle[0].removeAttribute("hidden")
          : comparisonSliderHandle[0].setAttribute("hidden", "true");
      }
    }
    try {
      await browser.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: injectHudHandler,
        args: [hudHandler.checked],
      });
    } catch (error) {
      console.log(error);
    }
  });

  // canvas content script
  async function injectCanvasContent() {
    // page content dom
    const mainVideoPlayer = document.getElementById("MainVideoPlayer");
    const video = Array.from(document.getElementsByTagName("video")).find(
      (element) => element.src.startsWith("blob:"),
    );

    // dom size variables
    let width = 0;
    let height = 0;
    let aspect = 0;
    let scale = 0;

    // calculate initial size
    aspect = video.videoWidth / video.videoHeight;
    width = mainVideoPlayer.clientWidth;
    height = mainVideoPlayer.clientHeight;
    const iResolution = {
      width: video.videoWidth,
      height: video.videoHeight,
    };
    scale = height / iResolution.height;
    let scaledIResolution = {
      width: iResolution.width * scale,
      height: iResolution.height * scale,
    };
    // console.log("iResolution", iResolution);
    // console.log("aspect", aspect);
    // console.log("scale", scale);
    // console.log("scaledIResolution", scaledIResolution);
    // console.log("window.devicePixelRatio", window.devicePixelRatio);
    // initialize dom
    const container = document.createElement("div");
    const containerId = "FXR_CANVAS";
    container.setAttribute("id", containerId);
    container.setAttribute(
      "style",
      "width:100%; height:100%; margin: 0 auto; position: relative; text-align: center;",
    );
    container.setAttribute(
      "class",
      "ComparisonSlider__After",
    );
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas");
    // camera
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
    );

    // common object
    const videoTexture = new THREE.VideoTexture(video);
    const geometry = new THREE.PlaneGeometry(2, 2);

    // EASU stage setting
    const easuScene = new THREE.Scene();
    const easuMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iChannel0: {
          value: videoTexture,
        },
        iResolution: {
          value: new THREE.Vector2(
            scaledIResolution.width,
            scaledIResolution.height,
          ),
        },
      },
      vertexShader,
      fragmentShader: easuFragmentShader,
      glslVersion: THREE.GLSL3,
    });
    const easuMesh = new THREE.Mesh(geometry, easuMaterial);
    easuScene.add(easuMesh);
    easuScene.add(camera);
    // create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas,
      stencil: false,
      depth: false,
    });
    renderer.setSize(scaledIResolution.width, scaledIResolution.height);
    renderer.setAnimationLoop(animation);
    if (!document.getElementById(containerId)) {
      container.appendChild(canvas);
      mainVideoPlayer.insertAdjacentElement("beforeend", container);
    }
    // offscreen render target
    const renderTarget = new THREE.WebGLRenderTarget(
      scaledIResolution.width,
      scaledIResolution.height,
      {
        depthBuffer: false,
        stencilBuffer: false,
      },
    );

    // RCAS stage setting
    const rcasScene = new THREE.Scene();
    const DEFAULT_SHARPNESS = 0.25;
    const rcasMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iChannel0: {
          value: videoTexture,
        },
        iChannel1: {
          value: renderTarget.texture,
        },
        iResolution: {
          value: new THREE.Vector2(
            scaledIResolution.width,
            scaledIResolution.height,
          ),
        },
        sharpness: { value: DEFAULT_SHARPNESS },
      },
      vertexShader,
      fragmentShader: rcasFragmentShader,
      glslVersion: THREE.GLSL3,
    });
    const rcasMesh = new THREE.Mesh(geometry.clone(), rcasMaterial);
    rcasScene.add(rcasMesh);

    // tick
    function animation() {
      easuMaterial.uniforms["iChannel0"].value = videoTexture;
      rcasMaterial.uniforms["iChannel0"].value = videoTexture;
      // render EASU stage
      renderer.setRenderTarget(renderTarget);
      renderer.render(easuScene, camera);
      // render RCAS stage
      renderer.setRenderTarget(null);
      renderer.render(rcasScene, camera);
    }

    // initialize gui
    let gui: GUI;
    if (document.getElementsByClassName("lil-gui").length === 0) {
      gui = new GUI({
        container: mainVideoPlayer,
      });
    }
    const videoPlayer = document.getElementById("VideoPlayer");
    videoPlayer.setAttribute(
      "style",
      "z-index:6; user-select: auto;",
    );
    gui.domElement.setAttribute(
      "style",
      "position: absolute; z-index: 1; top: 10px; right: 10px;",
    );
    // gui params
    const params = {
      source: `${video.videoWidth.toFixed(1)}px * ${
        video.videoHeight.toFixed(1)
      }px`,
      canvas: `${canvas.clientWidth.toFixed(1)}px * ${
        canvas.clientHeight.toFixed(1)
      }px`,
      sharpness: DEFAULT_SHARPNESS,
      FXR: true,
      comparison: true,
    };
    gui.add(params, "source");
    gui.add(params, "canvas");
    // sharpness
    gui.add(params, "sharpness", 0, 2).onChange((value: number) => {
      rcasMaterial.uniforms["sharpness"].value = value;
    });
    // switch canvas
    gui.add(params, "FXR").onChange((value: boolean) => {
      value
        ? canvas.removeAttribute("hidden")
        : canvas.setAttribute("hidden", "true");
    });
    // initialize comparison slider
    let comparisonSlider: ComparisonSlider;
    if (
      document.getElementsByClassName("ComparisonSlider__Handle").length === 0
    ) {
      comparisonSlider = new ComparisonSlider(`#${mainVideoPlayer.id}`, {
        handleOnlyControl: true,
      });
    }
    gui.add(params, "comparison").onChange((value: boolean) => {
      value
        ? comparisonSlider.$handle.removeAttribute("hidden")
        : comparisonSlider.$handle.setAttribute("hidden", "true");
    });

    // check dom resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { contentRect } = entry;
        // recalculate size
        width = contentRect.width;
        height = contentRect.height;
        scale = height / iResolution.height;
        scaledIResolution = {
          width: iResolution.width * scale,
          height: iResolution.height * scale,
        };

        renderer.setSize(scaledIResolution.width, scaledIResolution.height);
        gui.controllers.forEach((controller) => {
          if (controller.property === "canvas") {
            controller.setValue(
              `${scaledIResolution.width.toFixed(1)}px * ${
                scaledIResolution.height.toFixed(1)
              }px`,
            );
          }
        });

        // update uniforms
        easuMaterial.uniforms["iResolution"].value = new THREE.Vector2(
          scaledIResolution.width,
          scaledIResolution.height,
        );
        rcasMaterial.uniforms["iResolution"].value = new THREE.Vector2(
          scaledIResolution.width,
          scaledIResolution.height,
        );
      }
    });
    resizeObserver.observe(mainVideoPlayer);
  }

  try {
    await browser.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: injectCanvasContent,
    });
  } catch (error) {
    console.log(error);
  }
})();
