import {parse} from 'acorn';
import { print } from 'esrap';
import { walk } from 'zimmerframe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { type } from 'os';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
walk(ast, {
        enter(node) {
            if (node.type === 'ImportDeclaration' && node.source.value === 'react-glx') {
                const importedMember = node.specifiers.find(specifier => specifier.imported.name === 'ReactGLXAPP' || specifier.local.name === 'ReactGLXAPP');
                if (importedMember) {
                    const importedMemberName = importedMember.imported.name || importedMember.local.name;
                    console.log(importedMemberName);
                }
            }
        }
    });
    */


const code = fs.readFileSync(__dirname+'/source-code-example.js', 'utf8');
const state = {
    specifiers: {},
    app:{
        arguments:{},
    },
    scene:{
        instances:{
            lights:[],
            objects:[],
        },
        initializations:[]
    }
};
export function compile(code) {
    const ast = parse(code,{
        sourceType: 'module',
		ecmaVersion: 13,
		locations: true
    });

    

    walk(ast, state,{
        ImportDeclaration(node, { visit ,state}) {
            if (node.source.value === 'react-glx') {
                const specifier = node.specifiers.find(specifier => specifier.imported.name === 'ReactGLXAPP');
                if (specifier) {
                    state.specifiers.app = specifier.local.name;
                }
            }
            if(node.source.value === 'react-glx/lights/point-light'){
                const specifier = node.specifiers.find(specifier => specifier.imported.name === 'PointLight');
                if (specifier) {
                    state.specifiers.PointLight = specifier.local.name;
                }
            }
            if(node.source.value === 'react-glx/primitives/cube'){
                const specifier = node.specifiers.find(specifier => specifier.imported.name === 'Cube');
                if (specifier) {
                    state.specifiers.Cube = specifier.local.name;
                }
            }
        },
        CallExpression(node, { visit, state, path }) {
            if (node.callee.name === state.specifiers.app) {
                state.app.arguments.canvas = node.arguments[0];
                state.app.identifier = path.at(-1).id;
            }else if(node.callee.name === state.specifiers.PointLight){
                state.scene.instances.lights.push({
                    type: 'PointLight',
                    identifier: path.at(-1).id,
                    intensity: node.arguments[0],
                    position: node.arguments[1]
                });
            }else if(node.callee.name === state.specifiers.Cube){
                state.scene.instances.objects.push({
                    type: 'Cube',
                    identifier: path.at(-1).id,
                    size: node.arguments[0],
                    position: node.arguments[1]
                });

            }else if(node.callee.object.name === state.app.identifier.name && node.callee.property.name === 'add'){
                
                const object = state.scene.instances.objects.find(object => object.identifier.name === node.arguments[0].name);
                if(object){
                    state.scene.initializations.push({
                        type: 'add',
                        object
                    });
                }
            }
        }

    });
    //console.log(JSON.stringify(state, null, 2));
    //console.log(state);

    //do whatever you want with the ast
    const output = [];
    const renderer = fs.readFileSync(__dirname+'/elements/renderer.js', 'utf8');
    output.push(renderer);
    
    
    const attributes = {
        position: {
            type: 'vec3',
        },
        normal: {
            type: 'vec3',
        }
    }
    const uniforms = {
        world: {
            type: 'mat4',
            
        },
        view: {
            type: 'mat4',
            
        },
        projection: {
            type: 'mat4',
            
        },
        normalMatrix: {
            type: 'mat4',
            
        },
    }
    const color = [2.55,2.55,2.55]
    const lightPosition = [0,0,0];
    const props = {
        // put the names of the uniforms and attributes in the fragment
        ...Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key,key])),
        ...Object.fromEntries(Object.entries(uniforms).map(([key, value]) => [key,key])),
        // put the values of these constants in the fragments
        color:renderArrayToGLSLFloat(color),
        lightPosition:renderArrayToGLSLFloat(lightPosition)
    }
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
    console.log(output.join('\n'));

    return print(ast);
}

const templateGenerator = (props,template) => {
    return (propsValues) => Function.constructor.apply(
        this,[...props,`return \`${template}\``]
    ).apply(this,propsValues);
}
const templateLiteralRenderer = (props,template) => {
    return templateGenerator(Object.keys(props),template)(Object.values(props));
}

function renderArrayToGLSLFloat(array){
    const types = ['', 'vec2', 'vec3', 'vec4'];
    return `${types[array.length-1]}(${array.map(val=>val.toLocaleString("en", { minimumFractionDigits: 1 })).join(',')})`;
}

compile(code);
