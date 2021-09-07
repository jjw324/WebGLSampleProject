#version 300 es
precision mediump float;
in vec3 fN;
in vec3 fL;
in vec3 fE;
in vec2 texCoord;

uniform vec4 lightAmbient, lightDiffuse, lightSpecular;
uniform vec4 matAmbient, matDiffuse, matSpecular;
uniform float matAlpha;
uniform sampler2D textureUnit;
out vec4 fColor;

void main()
{
    vec3 N = normalize(fN);
    vec3 E = normalize(fE);
    vec3 L = normalize(fL);
    vec3 H = normalize(L+E);
    vec4 ambient = lightAmbient*matAmbient;
    float Kd = max(dot(L,N),0.0);
    vec4 diffuse = Kd*lightDiffuse*matDiffuse;
    float Ks = pow(max(dot(N,H),0.0),matAlpha);
    vec4 spec = Ks*lightSpecular*matSpecular;
    if(dot(L,N)<0.0)
        spec = vec4(0,0,0,1);
    vec4 noTex = ambient + diffuse + spec;
    fColor = noTex*texture(textureUnit, texCoord);
    fColor.a = 1.0;
} 

