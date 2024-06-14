import { renderShader } from 'react-glx/shaders';

import template from './vertex-shader.glslx';

export const shader = (
    props = {
        lightPosition: "lightPosition",
    }
) => renderShader({
    template,
    props,
});