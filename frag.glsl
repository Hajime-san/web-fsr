varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float time;
uniform sampler2D tex;

out vec4 outColor;

void main() {

	vec4 texColor = texture(tex, vUv);

    // outColor = vec4(1.0, 0.0, 1.0, 1.0);
	outColor = texColor;
}
