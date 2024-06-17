import {parse} from 'acorn';
import { print } from 'esrap';
import { walk } from 'zimmerframe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { elementsData, normalsData, positionsData } from './elements/geometry/cube/cube-data.mjs';
import { getShaders } from './elements/shaders.mjs';
import { getUniforms, uniforms } from './elements/uniforms.mjs';
import { getAttributes, attributes } from './elements/attributes.mjs';
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
                    position: node.arguments[1],
                    color: node.arguments[2],
                    geometry: {
                        vertices: positionsData,
                        normals: normalsData,
                        elements: elementsData
                    }
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
    
    //this supports only one light
    const lightPosition = JSON.parse(print(state.scene.instances.lights[0].position).code);//[0,0,0];
    const props = {
        // put the names of the uniforms and attributes in the fragment
        ...Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key,key])),
        ...Object.fromEntries(Object.entries(uniforms).map(([key, value]) => [key,key])),
        // put the values of these constants in the fragments
        color:renderArrayToGLSLFloat(print(state.scene.instances.objects[0].color).code),
        lightPosition:{
            value:renderArrayToGLSLFloat(lightPosition),
            name:'lightPosition'
        }
    }
    output.push(...getShaders(props,__dirname));

    output.push('gl.linkProgram(program)')
    output.push('console.log(gl.getProgramInfoLog(program),gl.getProgramParameter(program, gl.LINK_STATUS),);')
    output.push('if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {')
        output.push(`console.error('ERROR linking program!', gl.getProgramInfoLog(program));`);
    output.push('}')

    output.push('gl.validateProgram(program);')
    output.push('console.log(gl.getProgramParameter(program, gl.VALIDATE_STATUS));')
    output.push('if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {')
        output.push(`console.error('ERROR validating program!', gl.getProgramInfoLog(program));`);
    output.push('}')

    output.push('gl.useProgram(program);')
    output.push(...getUniforms());
    console.log("state.scene.instances.objects[0].geometry.vertices",state.scene.instances.objects[0].geometry.vertices);
    if(state.scene.instances.objects[0].geometry){
        output.push(`const positionsData = new Float32Array(${JSON.stringify(state.scene.instances.objects[0].geometry.vertices)});`);
        output.push(`const normalsData = new Float32Array(${JSON.stringify(state.scene.instances.objects[0].geometry.normals)});`);
        output.push(`const elementsData = new Uint16Array(${JSON.stringify(state.scene.instances.objects[0].geometry.elements)});`);
        output.push(...getAttributes());
    }
    //output.push(getLightSettings());
    output.push(getRenderInstruction());
    console.log(output.join('\n'));
    //print(ast);
    return output.join('\n');
}


const getRenderInstruction = () => {
    return `
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, elementsData.length, gl.UNSIGNED_SHORT, 0);
    `;
}

function renderArrayToGLSLFloat(array){
    if(typeof array === 'string'){
        array = JSON.parse(array);
    }
    const types = ['', 'vec2', 'vec3', 'vec4'];
    return `${types[array.length-1]}(${array.map(val=>val.toLocaleString("en", { minimumFractionDigits: 1 })).join(',')})`;
}

const appCode = compile(code);
fs.writeFileSync(__dirname+'/../compiler-output-test/index.js', appCode);
