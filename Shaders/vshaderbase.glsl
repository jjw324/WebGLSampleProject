#version 300 es
precision mediump float;

in vec3 aPosition;

uniform mat4 mm;
uniform mat4 cam;
uniform mat4 proj;

out vec4 vColor;

void main()
{
    gl_Position = proj*cam*mm*vec4(aPosition, 1.0);
    vColor = vec4(1,0,0,1);
}