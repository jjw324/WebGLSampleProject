#version 300 es
in vec3 aPosition;
in vec3 aNormal;

out vec3 texCoord;
uniform mat4 proj;
uniform mat4 cam;
uniform mat4 mm;

void main(){
    gl_Position = proj * cam * mm * vec4(aPosition, 1.0);
    vec4 n = normalize(mm * vec4(aNormal, 1.0));
    vec4 v = normalize(mm*vec4(aPosition,1.0) - inverse(cam)*vec4(0,0,0,1));
    texCoord = reflect(v, n).xyz;
}