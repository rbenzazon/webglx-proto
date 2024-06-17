import fs from 'fs';

export const getShaders = (props,__dirname) => {
    const output = [];
    const vertexShaderString = fs.readFileSync(__dirname+'/elements/vertex-shader.glslx', 'utf8');
    const fragmentShaderString = fs.readFileSync(__dirname+'/elements/fragment-shader.glslx', 'utf8');
    const vertexRendered = templateLiteralRenderer(props,vertexShaderString);
    const fragmentRendered = templateLiteralRenderer(props,fragmentShaderString);
    output.push(`const vertexShaderSource = \`${vertexRendered}\`;`);
    output.push('const vertexShader = gl.createShader(gl.VERTEX_SHADER);')
    output.push('gl.shaderSource(vertexShader, vertexShaderSource);')
    output.push('gl.compileShader(vertexShader);')

    output.push(`const fragmentShaderSource = \`${fragmentRendered}\`;`);
    output.push('const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);')
    output.push('gl.shaderSource(fragmentShader, fragmentShaderSource);')
    output.push('gl.compileShader(fragmentShader);')

    output.push('const program = gl.createProgram()')
    output.push('gl.attachShader(program, vertexShader)')
    output.push('gl.attachShader(program, fragmentShader)')
    return output;
}


const templateGenerator = (props,template) => {
    return (propsValues) => Function.constructor.apply(
        this,[...props,`return \`${template}\``]
    ).apply(this,propsValues);
}
const templateLiteralRenderer = (props,template) => {
    return templateGenerator(Object.keys(props),template)(Object.values(props));
}