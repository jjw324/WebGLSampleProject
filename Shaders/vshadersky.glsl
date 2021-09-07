#version 300 es
in vec3 aPosition;

out vec3 texCoord;
uniform mat4 proj;
uniform mat4 cam;
uniform mat4 mm;

void main(){
    gl_Position = proj * cam * mm * vec4(aPosition, 1.0);
    texCoord = normalize(aPosition.xyz);
}
