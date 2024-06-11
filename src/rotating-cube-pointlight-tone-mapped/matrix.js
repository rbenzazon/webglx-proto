/**
 * Construct a perspective matrix
 * @param {number} fov - the angle in radians of what's in view along the Y axis
 * @param {number} aspectRatio - the ratio of the canvas, typically canvas.width / canvas.height
 * @param {number} near - Anything before this point in the Z direction gets clipped (outside of the clip space)
 * @param {number} far - Anything after this point in the Z direction gets clipped (outside of the clip space)
 * @returns {number[]} - a 4x4 matrix
 * 
 */
export function perspectiveMatrix(fov, aspectRatio, near, far) {
    var f = 1.0 / Math.tan(fov / 2);
    var rangeInv = 1 / (near - far);
 
    return [
      f / aspectRatio, 0,                          0,   0,
      0,               f,                          0,   0,
      0,               0,    (near + far) * rangeInv,  -1,
      0,               0,  near * far * rangeInv * 2,   0
    ];
}
/**
 * Multiply two matrices
 * @param {number[]} a - a 4x4 matrix
 * @param {number[]} b - a 4x4 matrix
 * @returns {number[]} - a 4x4 matrix
 * @see {@link} https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337
 */
export function multiplyMatrices(a, b) {
    const result = [];
  
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    result[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    result[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    result[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    result[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    result[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    result[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    result[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    return result;
}
export function multiplyArrayOfMatrices (matrices) {
    let inputMatrix = matrices[0];
    for(var i=1; i < matrices.length; i++) {
      inputMatrix = multiplyMatrices(inputMatrix, matrices[i]);
    }
    return inputMatrix;
}
/**
 * Rotate a matrix around the X axis
 * @param {number} a - the angle in radians
 * @returns {number[]} - a 4x4 matrix
 */
export function rotateXMatrix(a) {
    return [
         1,       0,        0,     0,
         0,  Math.cos(a),  -Math.sin(a),     0,
         0,  Math.sin(a),   Math.cos(a),     0,
         0,       0,        0,     1
    ];
}
/**
 * Rotate a matrix around the Y axis
 * @param {number} a - the angle in radians
 * @returns {number[]} - a 4x4 matrix
 */
export function rotateYMatrix(a) {
    return [
        Math.cos(a),   0, Math.sin(a),   0,
            0,   1,      0,   0,
      -Math.sin(a),   0, Math.cos(a),   0,
            0,   0,      0,   1
    ];
}
/**
 * Rotate a matrix around the Z axis
 * @param {number} a - the angle in radians
 * @returns {number[]} - a 4x4 matrix
 */
export function rotateZMatrix(a) {
    return [
        Math.cos(a), -Math.sin(a),    0,    0,
      Math.sin(a),  Math.cos(a),    0,    0,
           0,       0,    1,    0,
           0,       0,    0,    1
    ];
}
/**
 * Translate a matrix
 * @param {number} x - the x coordinate
 * @param {number} y - the y coordinate
 * @param {number} z - the z coordinate
 * @returns {number[]} - a 4x4 matrix
 */
export function translateMatrix (x, y, z) {
    return [
        1,    0,    0,   0,
        0,    1,    0,   0,
        0,    0,    1,   0,
        x,    y,    z,   1
    ];
}
/**
 * Scale a matrix
 * @param {number} w - the width
 * @param {number} h - the height
 * @param {number} d - the depth
 * @returns {number[]} - a 4x4 matrix
 */
export function scaleMatrix (w, h, d) {
    return [
        w,    0,    0,   0,
        0,    h,    0,   0,
        0,    0,    d,   0,
        0,    0,    0,   1
    ];
}
const EPSILON = 0.000001;
/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */
export function lookAt(out, eye, center, up) {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    let eyex = eye[0];
    let eyey = eye[1];
    let eyez = eye[2];
    let upx = up[0];
    let upy = up[1];
    let upz = up[2];
    let centerx = center[0];
    let centery = center[1];
    let centerz = center[2];
  
    if (
      Math.abs(eyex - centerx) < EPSILON &&
      Math.abs(eyey - centery) < EPSILON &&
      Math.abs(eyez - centerz) < EPSILON
    ) {
      return identity(out);
    }
  
    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;
  
    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  
    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }
  
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
  
    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
    }
  
    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
  
    return out;
}

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
export function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }