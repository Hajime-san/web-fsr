varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {

    vUv = uv;

    vPosition = position;

    vNormal = normalMatrix * normal;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = mvPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
