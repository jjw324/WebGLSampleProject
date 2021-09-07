#version 300 es
precision mediump float;

in vec3 texCoord;
uniform samplerCube textureUnit;
out vec4 fColor;

void main()
{
    fColor = mix(vec4(1,0.84,0,1),texture(textureUnit, texCoord), 0.7);
    fColor.a = 1.0;
}
