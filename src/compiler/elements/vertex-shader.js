import { renderShader } from 'react-glx/shaders';

import template from './vertex-shader.glslx';

export const shader = (
    props = {
        position: "position",
        normal: "normal",
        world: "world",
        view: "view",
        projection: "projection",
        normalMatrix: "normalMatrix"
    }
) => renderShader({
    template,
    props,
});