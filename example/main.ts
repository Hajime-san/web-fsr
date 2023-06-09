import * as THREE from "three";
import GUI from "lil-gui";
import ComparisonSlider from "comparison-slider";
// shaders
import vertexShader from "../vert.glsl?raw";
import easuFragmentShader from "../easu.glsl?raw";
import rcasFragmentShader from "../rcas.glsl?raw";

window.addEventListener("load", () => {
  const DEFAULT_SHARPNESS = 0.2;
  // dom size variables
  let width = 0;
  let height = 0;
  let aspect = 0;
  // dom
  const container = document.getElementById("container");
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const video = document.getElementById("video") as HTMLVideoElement;
  // calculate initial size
  aspect = video.videoWidth / video.videoHeight;
  width = window.innerWidth > video.videoWidth
    ? video.videoWidth
    : window.innerWidth;
  height = window.innerHeight > video.videoHeight
    ? video.videoHeight
    : window.innerHeight;
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
        value: new THREE.Vector2(width, height),
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
  renderer.setSize(width, height);
  renderer.setAnimationLoop(animation);
  container!.appendChild(canvas);
  canvas.setAttribute(
    "class",
    "ComparisonSlider__After",
  );
  // offscreen render target
  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    depthBuffer: false,
    stencilBuffer: false,
  });

  // RCAS stage setting
  const rcasScene = new THREE.Scene();
  const rcasMaterial = new THREE.ShaderMaterial({
    uniforms: {
      iChannel0: {
        value: videoTexture,
      },
      // I think that sampling source texture only seems to be better quality without sampleing EASU pass.🤔
      // I can't make it out that is caused by ShaderToy porting or my misunderstanding.
      // Set iChannel0.value to renderTarget.texture if you want to process correctly with the original algorithm.
      iChannel1: {
        value: renderTarget.texture,
      },
      iResolution: {
        value: new THREE.Vector2(width, height),
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
    // render EASU stage
    renderer.setRenderTarget(renderTarget);
    renderer.render(easuScene, camera);
    // render RCAS stage
    renderer.setRenderTarget(null);
    renderer.render(rcasScene, camera);
  }

  // initialize gui
  const gui = new GUI();
  const params = { sharpness: DEFAULT_SHARPNESS, comparison: true };
  gui.add(params, "sharpness", 0, 2).onChange((value: number) => {
    rcasMaterial.uniforms["sharpness"].value = value;
  });
  // initialize comparison slider
  setTimeout(() => {
    const comparisonSlider = new ComparisonSlider("#container");
    gui.add(params, "comparison").onChange((value: boolean) => {
      value
        ? comparisonSlider.$handle.removeAttribute("hidden")
        : comparisonSlider.$handle.setAttribute("hidden", "true");
    });
  }, 10);

  // check dom resize
  const resizeObserver = new ResizeObserver(() => {
    // recalculate size
    width = window.innerWidth > video.videoWidth
      ? video.videoWidth
      : window.innerWidth;
    height = width / aspect;

    renderer.setSize(width, height);

    // update uniforms
    easuMaterial.uniforms["iResolution"].value = new THREE.Vector2(
      width,
      height,
    );
    rcasMaterial.uniforms["iResolution"].value = new THREE.Vector2(
      width,
      height,
    );

    // update dom size
    container.setAttribute(
      "style",
      `
        width: ${width}px;
        height: ${height}px;
      `,
    );
  });
  resizeObserver.observe(document.body);

  // streaming examples
  // initialize comparison slider
  new ComparisonSlider("#example1");
  new ComparisonSlider("#example2");
  new ComparisonSlider("#example3");
  new ComparisonSlider("#example4");
}, { once: true });
