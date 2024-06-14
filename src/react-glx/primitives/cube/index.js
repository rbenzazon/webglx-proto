/**
 * Creates a cube object
 * @param {number|null} size 
 * @param {[number,number,number]|null} position 
 */
export const Cube = (size = 1,position = [0,0,0]) => {
    return {
        size,
        position
    }
}