
varying vec2 vUv;
varying vec3 vPos;
varying vec2 vCoordinates;
attribute vec3 aCoordinates;


attribute float aSpeed;
attribute float aOffset;
attribute float aPress;
attribute float aDirection;

//Images
uniform sampler2D t1;
uniform sampler2D t2;
uniform vec2 mouse;
uniform float move;
uniform float time;
uniform float mousePressed;
uniform float mouseHover;
float mouseAction;

void main() {
    vUv = uv;

    

    vec3 pos = position;
    pos.x += sin(move*aSpeed)*3.;
    pos.y += sin(move*aSpeed)*3.;
    pos.z = mod(position.z + move*200.*aSpeed + aOffset,2000.) - 1000.;

    vec3 stable = position;
    float dist = distance(stable.xy, mouse);
    float area = 1. - smoothstep(0.,200.,dist);


    // tells object when to animate if mousePressed == 0 no animation
    stable.x += 50.*tan(0.1*time*aPress)*aDirection*area;
    stable.y += 50.*sin(0.1*time*aPress)*aDirection*area*mousePressed;
    stable.z += 200.*cos(0.1*time*aPress)*aDirection*area*mousePressed;


    vec4 mvPosition = modelViewMatrix * vec4( stable, 1. );
    gl_PointSize = 5000. * (1. / - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

  
    // pass data to fragment
    vCoordinates = aCoordinates.xy;
    vPos = pos;
}