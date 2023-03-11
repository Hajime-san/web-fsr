import * as THREE from "three";
import vertexShader from "./vert.glsl?raw";
import fragmentShader from "./easu.glsl?raw";
import rcasFragmentShader from "./rcas.glsl?raw";
import ComparisonSlider from "comparison-slider";

window.addEventListener("load", () => {
  let width = 0;
  let height = 0;
  let aspect = 0;
  const container = document.getElementById("container");
  const sharpness = document.getElementById("sharpness") as HTMLInputElement;

  const video = document.getElementById("video") as HTMLVideoElement;
  aspect = video.videoWidth / video.videoHeight;
  width = window.innerWidth > video.videoWidth
    ? video.videoWidth
    : window.innerWidth;
  height = window.innerHeight > video.videoHeight
    ? video.videoHeight
    : window.innerHeight;

  const camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    1000,
  );
  camera.position.z = 1;

  const scene = new THREE.Scene();
  scene.add(camera);

  const videoTexture = new THREE.VideoTexture(video);

  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      iChannel0: {
        value: videoTexture,
      },
      iResolution: {
        value: new THREE.Vector2(width, height),
      },
    },
    vertexShader,
    fragmentShader,
    glslVersion: THREE.GLSL3,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setAnimationLoop(animation);
  container!.appendChild(renderer.domElement);
  document.getElementsByTagName("canvas")[0].setAttribute(
    "class",
    "ComparisonSlider__After",
  );

  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    depthBuffer: false,
    stencilBuffer: false,
  });
  const postScene = new THREE.Scene();
  const postGeometry = new THREE.PlaneGeometry(2, 2);
  const postMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: rcasFragmentShader,
    uniforms: {
      iChannel0: {
        value: videoTexture,
      },
      iChannel1: {
        value: renderTarget.texture,
      },
      iResolution: {
        value: new THREE.Vector2(width, height),
      },
      sharpness: { value: Number(sharpness.value) },
    },
    glslVersion: THREE.GLSL3,
  });
  const postMesh = new THREE.Mesh(postGeometry, postMaterial);
  postScene.add(postMesh);

  // animation

  function animation() {
    material.uniforms["iChannel0"].value = videoTexture;
    postMaterial.uniforms["iChannel0"].value = videoTexture;

    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);

    renderer.setRenderTarget(null);
    renderer.render(postScene, camera);
  }

  const comparisonSlider = new ComparisonSlider("#container");

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentBoxSize) {
        width = window.innerWidth > video.videoWidth
          ? video.videoWidth
          : window.innerWidth;
        height = width / aspect;

        renderer.setSize(width, height);

        material.uniforms["iResolution"].value = new THREE.Vector2(
          width,
          height,
        );
        postMaterial.uniforms["iResolution"].value = new THREE.Vector2(
          width,
          height,
        );

        container.setAttribute(
          "style",
          `
          width: ${width}px;
          height: ${height}px;
        `,
        );
      }
    }
  });
  resizeObserver.observe(document.body);
}, { once: true });
