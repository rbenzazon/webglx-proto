import { identity, lookAt, perspective, rotate, mul, invert, transpose, create} from "gl-matrix/esm/mat4.js";
import { toRadian } from "gl-matrix/esm/common.js"
const canvas = document.getElementById("webglCanvas");
const canvasRect = canvas.getBoundingClientRect();
canvas.width = canvasRect.width;
canvas.height = canvasRect.height;
const gl = canvas.getContext("webgl");
gl.viewportWidth = canvas.width;
gl.viewportHeight = canvas.height;
gl.clearColor(2.55,2.55,2.55,1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);
const vertexShaderSource = `//@property {attribute-vec3} position - vertice position
//@property {attribute-vec3} normal - vertice normal vector
//@property {uniform-mat4} world - world matrix
//@property {uniform-mat4} view - view matrix
//@property {uniform-mat4} projection - projection matrix
//@property {uniform-mat4} normalMatrix - normal matrix
//@property {varying-vec3} fragColor - fragment color
//@property {varying-vec3} vNormal - vertex normal
//@property {varying-vec3} vertex - vertex position

precision mediump float;
    
attribute vec3 position;
attribute vec3 normal;

uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 normalMatrix;

// Pass the color attribute down to the fragment shader
varying vec3 fragColor;
varying vec3 vNormal;
varying vec3 vertex;

void main() {
    

    // Pass the color down to the fragment shader
    fragColor = vec3(2.55,2.55,2.55);
    // Pass the vertex down to the fragment shader
    vertex = vec3(world * vec4(position, 1.0));
    // Pass the normal down to the fragment shader
    vNormal = vec3(normalMatrix * vec4(normal, 1.0));
    //vNormal = normal;
    
    // Pass the position down to the fragment shader
    gl_Position = projection * view * world * vec4(position, 1.0);
}`;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
const fragmentShaderSource = `precision mediump float;

uniform vec3 lightPosition;

varying vec3 vertex;
varying vec3 vNormal;    
varying vec3 fragColor;


void main() {
    vec3 offset = vec3(0.0,0.0,0.0) - vertex;
    float distance = length(offset);
    vec3 direction = normalize(offset);

    float diffuse = max(dot(direction, vNormal), 0.0);
    float attenuation = 3.0 / (1.0 + 0.1*distance + 0.1*distance*distance);
    float brightness = max(diffuse * attenuation,0.1);
    gl_FragColor = vec4(brightness*fragColor,1.0);
}`;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
const program = gl.createProgram()
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)
gl.linkProgram(program)
console.log(gl.getProgramInfoLog(program),gl.getProgramParameter(program, gl.LINK_STATUS),);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
console.error('ERROR linking program!', gl.getProgramInfoLog(program));
}
gl.validateProgram(program);
console.log(gl.getProgramParameter(program, gl.VALIDATE_STATUS));
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
console.error('ERROR validating program!', gl.getProgramInfoLog(program));
}
gl.useProgram(program);

        // projection matrix
        const projectionLocation = gl.getUniformLocation(program, "projection")

        const fieldOfViewInRadians = toRadian(45);
        const aspectRatio = canvas.width / canvas.height;
        const nearClippingPlaneDistance = 0.1;
        const farClippingPlaneDistance = 1000;
        
        let projection = new Float32Array(16);
        projection = perspective(
            projection,
            fieldOfViewInRadians,
            aspectRatio,
            nearClippingPlaneDistance,
            farClippingPlaneDistance
        );

        gl.uniformMatrix4fv(projectionLocation, false, projection)
    

    // view matrix
const viewLocation = gl.getUniformLocation(program, "view")
const view = new Float32Array(16);

lookAt(view, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
gl.uniformMatrix4fv(viewLocation, false, view)
    

    // world matrix
const worldLocation = gl.getUniformLocation(program, "world")
let world = new Float32Array(16);
identity(world);

gl.uniformMatrix4fv(worldLocation, false, world)
    

    const normalMatrixLocation = gl.getUniformLocation(program, "normalMatrix")
let normalMatrix = create();
invert(normalMatrix, world);
transpose(normalMatrix, normalMatrix);
gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
    
const positionsData = new Float32Array([-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,1,1,-1,1,1,-1,-1]);
const normalsData = new Float32Array([0,1,0,0,1,0,0,1,0,0,1,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,-1,0,0,-1,0,0,-1,0,0,-1,0]);
const elementsData = new Uint16Array([0,1,2,0,2,3,5,4,6,6,4,7,8,9,10,8,10,11,13,12,14,15,14,12,16,17,18,16,18,19,21,20,22,22,20,23]);

    const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positionsData, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);
    

    const normalsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, normalsData, gl.STATIC_DRAW);
const normalsLocation = gl.getAttribLocation(program, "normal");
gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
gl.vertexAttribPointer(normalsLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(normalsLocation);
    

    const elementsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elementsData, gl.STATIC_DRAW);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, elementsData.length, gl.UNSIGNED_SHORT, 0);
    