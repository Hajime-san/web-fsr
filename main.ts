import * as THREE from "three";
import vertexShader from "./vert.glsl?raw";
import fragmentShader from "./easu.glsl?raw";
import rcasFragmentShader from "./rcas.glsl?raw";

document.addEventListener("DOMContentLoaded", () => {
  const sharpness = document.getElementById("sharpness") as HTMLInputElement;

  const video = document.getElementById("video") as HTMLVideoElement;
  const width = video.videoWidth;
  const height = video.videoHeight;
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

  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: {
        value: 0.0,
      },
      iChannel0: {
        value: videoTexture,
      },
      iResolution: {
        value: new THREE.Vector2(video.videoWidth, video.videoHeight),
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
  document.getElementById("container")!.appendChild(renderer.domElement);

  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    depthBuffer: false,
    stencilBuffer: false,
  });
  const postScene = new THREE.Scene();
  const postGeometry = new THREE.PlaneGeometry(width, height);
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
        value: new THREE.Vector2(video.videoWidth, video.videoHeight),
      },
      sharpness: { value: Number(sharpness.value) },
    },
    glslVersion: THREE.GLSL3,
  });
  const postMesh = new THREE.Mesh(postGeometry, postMaterial);
  postScene.add(postMesh);

  // animation

  function animation(time: number) {
    material.uniforms["iChannel0"].value = videoTexture;
    postMaterial.uniforms["iChannel0"].value = videoTexture;

    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);

    renderer.setRenderTarget(null);
    renderer.render(postScene, camera);
  }
}, { once: true });
