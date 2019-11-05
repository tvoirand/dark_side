/*
Test script for the dark_side project.
*/

import { range } from '../modules/utils.js';
import {
    compute_sphere_data,
    geographic_to_cartesian_coords
} from '../modules/geometry.js';
import { SpiceSimulation } from '../modules/spice_simulation.js';
import {
    init_webgl_context,
    init_shader_program,
    init_framebuffer,
    init_renderbuffer
} from '../modules/graphics/webgl_utils.js';
import { Sun } from '../modules/graphics/sun.js';
import { Planet } from '../modules/graphics/planet.js';
import {
    PostprocessingShader,
    init_postprocessing
} from '../modules/graphics/post_processing.js';

console.log('Testing utils.range');
console.log(range(2, 10, 2));

console.log('Testing geometry.compute_sphere_data');
console.log(compute_sphere_data(1.5));
console.log('Testing geometry.geographic_to_cartesian_coords');
console.log(geographic_to_cartesian_coords(45, -0.5, 6371));

console.log('Testing spice_simulation.SpiceSimulation');
const spice = new SpiceSimulation();
console.log(spice.spkpos('EARTH', 3.0, 'ECLIPJ2000', 'NONE', 'SUN'));

console.log('Testing graphics.webgl_utils.init_webgl_context');
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');
const projection_matrix = init_webgl_context(gl);
console.log(projection_matrix);
console.log('Testing graphics.webgl_utils.init_shader_program');
const vs_source = `
    attribute vec4 a_vertex_position;
    attribute vec4 a_vertex_color;

    uniform mat4 u_model_view_matrix;
    uniform mat4 u_projection_matrix;

    varying lowp vec4 v_color;

    void main(void) {
        gl_Position = u_projection_matrix * u_model_view_matrix * a_vertex_position;
        v_color = a_vertex_color;
    }
`;
const fs_source = `
    varying lowp vec4 v_color;

    void main(void){
        gl_FragColor = v_color;
    }
`;
const shader_program = init_shader_program(gl, vs_source, fs_source);

console.log('Testing graphics.sun.Sun');
var sun = new Sun(1.0, 'SUN', [1.0, 1.0, 0.0, 1.0], 'SUN', gl);
sun.update_position([0.0, 0.0, -20.0]);

console.log('Testing graphics.planet.Planet');
var planet = new Planet(1.25, 'EARTH', [0.2, 0.2, 1.0, 1.0], 'SUN', gl);
planet.update_position([7.0, 0.0, -20.0]);
var sun_position = [0.0, 0.0, -20.0];

console.log('Testing graphics.post_processing.PostprocessingShader');
var postprocessing_shader = new PostprocessingShader(gl);
console.log('Testing graphics.post_processing.init_postprocessing');
const postprocessing_texture = init_postprocessing(gl);
console.log('Testing graphics.webgl_utils.init_framebuffer');
const framebuffer = init_framebuffer(gl, postprocessing_texture);
console.log('Testing graphics.webgl_utils.init_renderbuffer');
const depthbuffer = init_renderbuffer(gl);

// rendering scene to postprocessing texture
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, postprocessing_texture);
    gl.viewport(
        0,
        0,
        gl.canvas.clientWidth,
        gl.canvas.clientHeight,
    );

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    planet.display(projection_matrix, sun_position)
    sun.display(projection_matrix, sun_position)
}

// rendering scene to canvas
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, postprocessing_texture);
    gl.viewport(
        0,
        0,
        gl.canvas.clientWidth,
        gl.canvas.clientHeight,
    );
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    postprocessing_shader.display();
}
