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