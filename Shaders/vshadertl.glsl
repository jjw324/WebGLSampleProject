#version 300 es
precision mediump float;
in vec3 aPosition;
in vec3 aNormal;
in vec2 aTCoord;

out vec3 fN;
out vec3 fE;
out vec3 fL;
out vec2 texCoord;

uniform mat4 mm;
uniform mat4 cam;
uniform mat4 proj;
uniform vec4 lightPos;

void main()
{
    //the vertex in camera coordinates
    vec3 pos = (cam*mm*vec4(aPosition, 1)).xyz;
    //the light in camera coordinates
    vec3 lightPosInCam = (cam*lightPos).xyz;
    //normal in camera coordinates
    fN = normalize(cam*mm*vec4(aNormal,0)).xyz;
    //the ray from the vertex towards the camera
    fE = normalize(vec3(0,0,0)-pos);
    //the ray from the vertex towards the light
    fL = normalize(lightPosInCam.xyz-pos);
    gl_Position = proj*cam*mm*vec4(aPosition, 1.0);
    texCoord = aTCoord;
}