/**
 * A number, or a string containing a number.
 * @typedef {Object} ReactGLXAPP
 * @property {function} add - Adds an object to the scene
 * @property {function} remove - Removes an object from the scene
 * @property {function} onBeforeRender - Callback function before rendering
 * @property {function} onAfterRender - Callback function after rendering
 * @property {boolean} rendering - Indicates if the scene is rendering
 * @property {HTMLCanvasElement} canvas - The canvas element
 */


/**
 * Creates a ReactGLXAPP application
 * @param {HTMLCanvasElement} canvas 
 * @returns {ReactGLXAPP}
 */
export const ReactGLXAPP = (canvas) => {
    const rendering = false;
    return {
        add: (object) => {
            console.log(object);
        },
        remove: (object) => {
            console.log(object);
        },
        onBeforeRender: () => {
            console.log("rendering");
        },
        onAfterRender: () => {
            console.log("rendered");
        },
        rendering,
        canvas
    }
}