import browser from "webextension-polyfill";
import * as THREE from "three";

import vertexShader from "../../vert.glsl?raw";
import fragmentShader from "../../frag.glsl?raw";

(async () => {
  const [currentTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  async function insertElement() {
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
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas");
    canvas.setAttribute(
      "style",
      "display: block; margin: 0 auto; position: relative;",
    );
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
    );

    // common object
    const videoTexture = new THREE.VideoTexture(video);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const easuScene = new THREE.Scene();
    const easuMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iChannel0: {
          value: videoTexture,
        },
        iResolution: {
          value: new THREE.Vector2(iResolution.width, iResolution.height),
        },
      },
      vertexShader,
      fragmentShader,
      glslVersion: THREE.GLSL3,
    });
    const easuMesh = new THREE.Mesh(geometry, easuMaterial);
    easuScene.add(easuMesh);
    easuScene.add(camera);
    // create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(iResolution.width * scale, iResolution.height * scale);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setAnimationLoop(animation);
    if (!document.getElementById("canvas")) {
      mainVideoPlayer.insertAdjacentElement("beforeend", canvas);
    }

    // tick
    function animation() {
      easuMaterial.uniforms["iChannel0"].value = videoTexture;
      renderer.render(easuScene, camera);
    }
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
