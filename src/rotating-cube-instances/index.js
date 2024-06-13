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

    // tone mapping taken from three.js
    float toneMappingExposure = 1.0;

    // Matrices for rec 2020 <> rec 709 color space conversion
    // matrix provided in row-major order so it has been transposed
    // https://www.itu.int/pub/R-REP-BT.2407-2017
    const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
        vec3( 1.6605, - 0.1246, - 0.0182 ),
        vec3( - 0.5876, 1.1329, - 0.1006 ),
        vec3( - 0.0728, - 0.0083, 1.1187 )
    );

    const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
        vec3( 0.6274, 0.0691, 0.0164 ),
        vec3( 0.3293, 0.9195, 0.0880 ),
        vec3( 0.0433, 0.0113, 0.8956 )
    );

    vec3 OptimizedCineonToneMapping( vec3 color ) {
        // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
        color *= toneMappingExposure;
        color = max( vec3( 0.0 ), color - 0.004 );
        return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );

    }

    // https://iolite-engine.com/blog_posts/minimal_agx_implementation
    // Mean error^2: 3.6705141e-06
    vec3 agxDefaultContrastApprox( vec3 x ) {

        vec3 x2 = x * x;
        vec3 x4 = x2 * x2;

        return + 15.5 * x4 * x2
            - 40.14 * x4 * x
            + 31.96 * x4
            - 6.868 * x2 * x
            + 0.4298 * x2
            + 0.1191 * x
            - 0.00232;

    }
        
    vec3 AgXToneMapping( vec3 color ) {

        // AgX constants
        const mat3 AgXInsetMatrix = mat3(
            vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
            vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
            vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
        );

        // explicit AgXOutsetMatrix generated from Filaments AgXOutsetMatrixInv
        const mat3 AgXOutsetMatrix = mat3(
            vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
            vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
            vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
        );

        // LOG2_MIN      = -10.0
        // LOG2_MAX      =  +6.5
        // MIDDLE_GRAY   =  0.18
        const float AgxMinEv = - 12.47393;  // log2( pow( 2, LOG2_MIN ) * MIDDLE_GRAY )
        const float AgxMaxEv = 4.026069;    // log2( pow( 2, LOG2_MAX ) * MIDDLE_GRAY )

        color *= toneMappingExposure;

        color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;

        color = AgXInsetMatrix * color;

        // Log2 encoding
        color = max( color, 1e-10 ); // avoid 0 or negative numbers for log2
        color = log2( color );
        color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );

        color = clamp( color, 0.0, 1.0 );

        // Apply sigmoid
        color = agxDefaultContrastApprox( color );

        // Apply AgX look
        // v = agxLook(v, look);

        color = AgXOutsetMatrix * color;

        // Linearize
        color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );

        color = LINEAR_REC2020_TO_LINEAR_SRGB * color;

        // Gamut mapping. Simple clamp for now.
        color = clamp( color, 0.0, 1.0 );

        return color;

    }

    void main() {
        vec3 offset = lightPosition - vertex;
        float distance = length(offset);
        vec3 direction = normalize(offset);

        float diffuse = max(dot(direction, vNormal), 0.0);
        float attenuation = 3.0 / (1.0 + 0.1*distance + 0.1*distance*distance);
        float brightness = max(diffuse * attenuation,0.1);
        gl_FragColor = vec4(AgXToneMapping(brightness*fragColor),1.0);
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

lookAt(view, [0, 0, -20], [0, 0, 0], [0, 1, 0]);
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
let lightPosition = [0, 2, -1];
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
        const instanceShift = index*0.0005*Math.PI;
        rotateY(mat,mat,angle+instanceShift);
        rotateX(mat,mat,angle/1.7+instanceShift);
        rotateZ(mat,mat,angle/1.7+instanceShift);
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

function getCirclePoint(center,radius, angle){
    console.log(center,radius,angle);
    return [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
}


function loop(){
    /*const angle = performance.now() / 1000 /6 * 2 * Math.PI;
    rotate(yRotation, identityMatrix, angle, [0,1,0]);
    rotate(xRotation, identityMatrix, angle / 4, [1,0,0]);*/
    //mul(world, yRotation, xRotation);
    lightPosition = [...getCirclePoint([0,0],3,performance.now() / 1000 /6 * 2 * Math.PI), -2];
    gl.uniform3fv(lightPositionLocation, lightPosition);
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







