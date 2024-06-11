export const positionsData = new Float32Array([
    //top
-1.0, 1.0, -1.0,
-1.0, 1.0, 1.0,
1.0, 1.0, 1.0,
1.0, 1.0, -1.0,
//left
-1.0, 1.0, 1.0,
-1.0, -1.0, 1.0,
-1.0, -1.0, -1.0,
-1.0, 1.0, -1.0,
//right
1.0, 1.0, 1.0,
1.0, -1.0, 1.0,
1.0, -1.0, -1.0,
1.0, 1.0, -1.0,
//front
1.0, 1.0, 1.0,
1.0, -1.0, 1.0,
-1.0, -1.0, 1.0,
-1.0, 1.0, 1.0,
//back
1.0, 1.0, -1.0,
1.0, -1.0, -1.0,
-1.0, -1.0, -1.0,
-1.0, 1.0, -1.0,
//bottom
-1.0, -1.0, -1.0,
-1.0, -1.0, 1.0,
1.0, -1.0, 1.0,
1.0, -1.0, -1.0,
]);

export const normalsData = new Float32Array([
    //top
0.0, 1.0, 0.0,
0.0, 1.0, 0.0,
0.0, 1.0, 0.0,
0.0, 1.0, 0.0,
//left
-1.0, 0.0, 0.0,
-1.0, 0.0, 0.0,
-1.0, 0.0, 0.0,
-1.0, 0.0, 0.0,
//right
1.0, 0.0, 0.0,
1.0, 0.0, 0.0,
1.0, 0.0, 0.0,
1.0, 0.0, 0.0,
//front
0.0, 0.0, 1.0,
0.0, 0.0, 1.0,
0.0, 0.0, 1.0,
0.0, 0.0, 1.0,
//back
0.0, 0.0, -1.0,
0.0, 0.0, -1.0,
0.0, 0.0, -1.0,
0.0, 0.0, -1.0,
//bottom
0.0, -1.0, 0.0,
0.0, -1.0, 0.0,
0.0, -1.0, 0.0,
0.0, -1.0, 0.0,
]);


export const elementsData = new Uint16Array([
    //top
0, 1, 2,
0, 2, 3,
//left
5, 4, 6,
6, 4, 7,
// right
8, 9, 10,
8, 10, 11,
//front
13, 12, 14,
15, 14, 12,
//back
16, 17, 18,
16, 18, 19,
//bottom
21, 20, 22,
22, 20, 23
]);

const colorsOfFaces = [
    1.0, 0.0, 0.0,  // Front face: red
    1.0, 1.0, 0.0, // Back face: yellow
    0.0, 1.0, 0.0,  // Top face: green
    1.0, 0.5, 0.5,  // Bottom face: pink
    1.0, 0.0, 1.0,  // Right face: purple
    0.0, 0.0, 1.0,   // Left face: blue
];
console.log("colorsOfFaces",colorsOfFaces);
let tmpColors = [];
for (var j=0; j < 6; j++) {
    for (var i=0; i < 4; i++) {
        tmpColors = tmpColors.concat( [colorsOfFaces[j*3],colorsOfFaces[j*3+1], colorsOfFaces[j*3+2]] );
    }
}
console.log("colorsOfFaces",tmpColors);
export const colorData = new Float32Array(tmpColors);