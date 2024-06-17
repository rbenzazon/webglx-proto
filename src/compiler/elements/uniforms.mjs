export const getUniforms = () => {
    return [
        getImports(),
        getCameraSettings(),
        getViewSettings(),
        getWorldSettings(),
        getNormalMatrixSettings(),
        /*getLightSettings()*/
    ]
}

export const uniforms = {
    world: {
        type: 'mat4',
        
    },
    view: {
        type: 'mat4',
        
    },
    projection: {
        type: 'mat4',
        
    },
    normalMatrix: {
        type: 'mat4',
        
    },
} 

const getImports = () => {
    return `
    import { perspective, lookAt, identity, invert, transpose, create } from "gl-matrix/esm/mat4.js";
    import { toRadian } from "gl-matrix/esm/common.js";
    `
}

const getCameraSettings = ()=>{
    return `
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
    `
}

const getViewSettings = () => {
    return `
    // view matrix
const viewLocation = gl.getUniformLocation(program, "view")
const view = new Float32Array(16);

lookAt(view, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
gl.uniformMatrix4fv(viewLocation, false, view)
    `;
}

const getWorldSettings = () => {
    return `
    // world matrix
const worldLocation = gl.getUniformLocation(program, "world")
let world = new Float32Array(16);
identity(world);

gl.uniformMatrix4fv(worldLocation, false, world)
    `;
}

const getNormalMatrixSettings = () => {
    return `
    const normalMatrixLocation = gl.getUniformLocation(program, "normalMatrix")
let normalMatrix = create();
invert(normalMatrix, world);
transpose(normalMatrix, normalMatrix);
gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
    `;
}

const getLightSettings = () => {
    return `
    const lightPositionLocation = gl.getUniformLocation(program, "lightPosition")
const lightPosition = [0, 7, -3];
gl.uniform3fv(lightPositionLocation, lightPosition);
    `;
}