export const attributes = {
    position: {
        type: 'vec3',
    },
    normal: {
        type: 'vec3',
    }
}

export const getAttributes = () => {
    return [
        getPositionSettings(),
        getNormalSettings(),
        getElementsSettings()
    ]
}

const getPositionSettings = () => {
    return `
    const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positionsData, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);
    `;
}

const getNormalSettings = () => {
    return `
    const normalsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, normalsData, gl.STATIC_DRAW);
const normalsLocation = gl.getAttribLocation(program, "normal");
gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
gl.vertexAttribPointer(normalsLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(normalsLocation);
    `;
}

const getElementsSettings = () => {
    return `
    const elementsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elementsData, gl.STATIC_DRAW);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
`;
}