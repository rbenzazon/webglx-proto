/**
 * Creates a light object
 * @param {number|null} intensity 
 * @param {[number,number,number]|null} position 
 */
export const PointLight = (intensity = 1, position = [0,0,0]) => {
    return {
        intensity,
        position
    }
}