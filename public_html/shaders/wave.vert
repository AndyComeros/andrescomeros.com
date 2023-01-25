uniform float time;

vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
    dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

float noise(float x, float y) {
    vec2 st = vec2(x,y);
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

void main(){ 
    float res = 0.1f;
    float mult = 3.0f;

    float offset = noise((position.x * res) + time, (position.y * res) + time);

    vec4 result = vec4(position.x, position.y, position.z + offset * mult,1.0);
    gl_Position = projectionMatrix * modelViewMatrix * result;

}