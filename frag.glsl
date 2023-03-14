
uniform sampler2D iChannel0;
varying vec2 vUv;
out vec4 fragColor;

void main()
{
    fragColor = texture(iChannel0,vUv);
}
