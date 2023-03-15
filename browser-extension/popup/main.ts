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

  async function insertElement() {
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
    const scaledIResolution = {
      width: iResolution.width * scale,
      height: iResolution.height * scale,
    };
    console.log("iResolution", iResolution);
    console.log("aspect", aspect);
    console.log("scale", scale);
    console.log("scaledIResolution", scaledIResolution);
    console.log("window.devicePixelRatio", window.devicePixelRatio);
    // initialize dom
    const container = document.createElement("div");
    const containerId = 'FXR_CANVAS';
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
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
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
    const gui = new GUI({
      container: mainVideoPlayer,
    });
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
    const params = { sharpness: DEFAULT_SHARPNESS, FXR: true, comparison: true };
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
    const comparisonSlider = new ComparisonSlider(`#${mainVideoPlayer.id}`);
    gui.add(params, "comparison").onChange((value: boolean) => {
      value
        ? comparisonSlider.$handle.removeAttribute("hidden")
        : comparisonSlider.$handle.setAttribute("hidden", "true");
    });
  }

  try {
    await browser.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: insertElement,
    });
  } catch (error) {
    console.log(error);
  }
})();
