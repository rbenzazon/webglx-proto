// https://codepen.io/JcersHabs018/pen/QvLoxZ?editors=0011


//import { multiplyArrayOfMatrices, rotateXMatrix, rotateYMatrix, perspectiveMatrix, scaleMatrix, translateMatrix, identity, lookAt } from "./matrix.js"
import { positionsData, elementsData, colorData, normalsData } from "./cube-data.js"
import { identity, lookAt, perspective, rotate, mul, invert, transpose, create, rotateY, rotateX, translate, scale, rotateZ} from "gl-matrix/esm/mat4.js";
import { toRadian } from "gl-matrix/esm/common.js";




let contextAttributes = {
    /*alpha: false,
    antialias: true,
    depth: true,
    failIfMajorPerformanceCaveat: false,
    powerPreference: "default",
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,*/
}

const canvas = document.getElementById("webglCanvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
/**
 * Represents a WebGL rendering context.
 * @type {WebGLRenderingContext}
 */
const gl = canvas.getContext("webgl", contextAttributes)
gl.viewportWidth = canvas.width;
gl.viewportHeight = canvas.height;
gl.clearColor(2.55,2.55,2.55,1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_COLOR_BIT);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);
/*const extensions = new Map()
gl.getSupportedExtensions()
    .forEach(extension => {
        const ext = gl.getExtension(extension)
        ext && extensions.set(extension, ext)
    })
*/

const ext = gl.getExtension('ANGLE_instanced_arrays');
if (!ext) {
  alert('need ANGLE_instanced_arrays');
}

/*


    mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;

    transformedNormal = normalMatrix * transformedNormal;
    */

const vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, `
    precision mediump float;
    
    attribute vec3 position;
    attribute vec3 color;
    attribute vec3 normal;

    attribute mat4 model;
    
    uniform mat4 view;
    uniform mat4 projection;
    uniform mat4 normalMatrix;

    // Pass the color attribute down to the fragment shader
    varying vec3 fragColor;
    varying vec3 vNormal;
    varying vec3 vertex;

    vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {

        // dir can be either a direction vector or a normal vector
        // upper-left 3x3 of matrix is assumed to be orthogonal

        return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );

    }
    
    void main() {
        
        // Pass the color down to the fragment shader
        fragColor = color;
        // Pass the vertex down to the fragment shader
        vertex = vec3(model * vec4(position, 1.0));
        // Pass the normal down to the fragment shader
        //vNormal = vec3(view * model * vec4(normal,1.0));
        mat3 im = mat3( model );
        vNormal = normal;
	    vNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	    vNormal = im * vNormal;
        
        // Pass the position down to the fragment shader
        gl_Position = projection * view * model * vec4(position, 1.0);
    }
`)
gl.compileShader(vertexShader)

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragmentShader, `
    precision mediump float;

    uniform vec3 lightPosition;

    varying vec3 vertex;
    varying vec3 vNormal;    
    varying vec3 fragColor;


    void main() {
        vec3 offset = lightPosition - vertex;
        float distance = length(offset);
        vec3 direction = normalize(offset);

        float diffuse = max(dot(direction, vNormal), 0.0);
        float attenuation = 1.0 / (1.0 + 0.1*distance + 0.8*distance*distance);
        float brightness = max(diffuse * attenuation,0.1);
        gl_FragColor = vec4(brightness*fragColor,1.0);
        //gl_FragColor = vec4(vNormal,1.0);
    }
`)
gl.compileShader(fragmentShader)

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

gl.useProgram(program)

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
/*const worldLocation = gl.getUniformLocation(program, "world")
let world = new Float32Array(16);
identity(world);

gl.uniformMatrix4fv(worldLocation, false, world)*/


const normalMatrixLocation = gl.getUniformLocation(program, "normalMatrix")
let normalMatrix = create();
invert(normalMatrix, view);
transpose(normalMatrix, normalMatrix);
gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);

const lightPositionLocation = gl.getUniformLocation(program, "lightPosition")
const lightPosition = [0, 2, -1];
gl.uniform3fv(lightPositionLocation, lightPosition);

var identityMatrix = new Float32Array(16);
identity(identityMatrix);
var xRotation = new Float32Array(16);
var yRotation = new Float32Array(16);


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

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);

const colorLocation = gl.getAttribLocation(program, "color");
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colorLocation);

const elementsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elementsData, gl.STATIC_DRAW);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);


const modelLoc = gl.getAttribLocation(program, 'model');
const numInstances = 5;
const modelData = new Float32Array(numInstances*16);

const modelMatrices = [];
for (let i = 0; i < numInstances; ++i) {
    const byteOffsetToMatrix = i * 16 * 4;
    const numFloatsForView = 16;
    modelMatrices.push(new Float32Array(
        modelData.buffer,
        byteOffsetToMatrix,
        numFloatsForView));
}
modelMatrices.forEach((mat, index) => {
    const count = index - Math.floor(numInstances / 2);
    identity(mat);
    translate(mat,mat,[count * 2, 0, 0]);
    rotateY(mat,mat,toRadian(count * 10));
    scale(mat,mat,[0.5,0.5,0.5]);
});
function transformInstances(){
    const angle = 0.002 * Math.PI;
    modelMatrices.forEach((mat, index) => {
        rotateY(mat,mat,angle);
        rotateX(mat,mat,angle/1.7);
        rotateZ(mat,mat,angle/1.7);
    });
}


const matrixBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
gl.bufferData(gl.ARRAY_BUFFER, modelData.byteLength, gl.DYNAMIC_DRAW);


gl.bufferSubData(gl.ARRAY_BUFFER, 0, modelData);

// set all 4 attributes for matrix
const bytesPerMatrix = 4 * 16;
for (let i = 0; i < 4; ++i) {
  const loc = modelLoc + i;
  gl.enableVertexAttribArray(loc);
  // note the stride and offset
  const offset = i * 16;  // 4 floats per row, 4 bytes per float
  gl.vertexAttribPointer(
      loc,              // location
      4,                // size (num values to pull from buffer per iteration)
      gl.FLOAT,         // type of data in buffer
      false,            // normalize
      bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
      offset,           // offset in buffer
  );
  // this line says this attribute only changes for each 1 instance
  ext.vertexAttribDivisorANGLE(loc, 1);
}


function loop(){
    /*const angle = performance.now() / 1000 /6 * 2 * Math.PI;
    rotate(yRotation, identityMatrix, angle, [0,1,0]);
    rotate(xRotation, identityMatrix, angle / 4, [1,0,0]);*/
    //mul(world, yRotation, xRotation);

    /*normalMatrix = create();
    invert(normalMatrix, view);
    transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);*/
    transformInstances();
    // upload the new matrix data
    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, modelData);
    //gl.uniformMatrix4fv(worldLocation, false, world);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //(gl.TRIANGLES, 0, positionsData.length / 3, instanceMatrices.length);
    ext.drawElementsInstancedANGLE(gl.TRIANGLES, elementsData.length, gl.UNSIGNED_SHORT, 0, numInstances);
    //gl.drawElementsInstanced(gl.TRIANGLES, elementsData.length, gl.UNSIGNED_SHORT, 0, instanceMatrices.length);
    //gl.drawElements(gl.TRIANGLES, elementsData.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
}
loop();







