/*
Post-processing graphics module for the dark_side project.
*/

import { init_shader_program } from "./webgl_utils.js";
import postprocessing_fragment_shader from "./shaders/postprocessing_fragment_shader.js";

function compute_kernel_weight(kernel) {
    var weight = kernel.reduce(function(prev, curr) {
        return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
}

function PostprocessingShader(gl) {
    /*
    Class for postprocessing operations.
    Constructor arguments:
        -gl                 WebGLRenderingContext
    Attributes:
        -vs_source          string
            defines vertex shader
        -fs_source          string
            defines fragment shader
        -program_info       object
            contains:
                shader_program,
                attrib_locations,
                    vertex position
                    texture coord
                uniform_locations
                    screen texture
                    texture size
                    kernel
                    kernel weight
        -buffers            object
            contains: position, indices, texutre coords buffers
        -vertices           [float, ...]
        -indices            [int, ...]
        -texture_coords     [float, ...]
        -blur_kernel        [float, ...]
    Methods:
        -display
    */

    this.vs_source = `
        attribute vec4 a_vertex_position;
        attribute vec2 a_texture_coord;
        varying highp vec2 v_texture_coord;
        void main(void){
            gl_Position = a_vertex_position;
            v_texture_coord = a_texture_coord;
        }
    `;
    this.fs_source = postprocessing_fragment_shader;

    const shader_program = init_shader_program(
        gl,
        this.vs_source,
        this.fs_source
    );

    this.program_info = {
        program: shader_program,
        attrib_locations: {
            vertex_position: gl.getAttribLocation(
                shader_program,
                "a_vertex_position"
            ),
            texture_coord: gl.getAttribLocation(
                shader_program,
                "a_texture_coord"
            )
        },
        uniform_locations: {
            screen_texture: gl.getUniformLocation(
                shader_program,
                "u_screen_texture"
            ),
            texture_size: gl.getUniformLocation(
                shader_program,
                "u_texture_size"
            ),
            kernel: gl.getUniformLocation(shader_program, "u_kernel[0]"),
            kernel_weight: gl.getUniformLocation(
                shader_program,
                "u_kernel_weight"
            )
        }
    };

    const position_buffer = gl.createBuffer();
    const index_buffer = gl.createBuffer();
    const texture_coord_buffer = gl.createBuffer();
    this.buffers = {
        position: position_buffer,
        indices: index_buffer,
        texture_coord: texture_coord_buffer
    };

    this.vertices = [
        -1.0,
        -1.0,
        0.0,
        1.0,
        -1.0,
        0.0,
        1.0,
        1.0,
        0.0,
        -1.0,
        1.0,
        0.0
    ];
    this.indices = [0, 1, 2, 0, 2, 3];
    this.texture_coords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];

    this.blur_kernel = [
        1.0 / 16.0,
        2.0 / 16.0,
        1.0 / 16.0,
        2.0 / 16.0,
        4.0 / 16.0,
        2.0 / 16.0,
        1.0 / 16.0,
        2.0 / 16.0,
        1.0 / 16.0
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.vertices),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(this.indices),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texture_coord);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.texture_coords),
        gl.STATIC_DRAW
    );

    this.display = function() {
        /*
        Display this postprocessing shader's texture on canvas
        */

        gl.useProgram(this.program_info.program);

        // fetch vertices positions from buffer
        {
            const nb_components = 3; // nb values per vertex in buffer
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
            gl.vertexAttribPointer(
                this.program_info.attrib_locations.vertex_position,
                nb_components,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(
                this.program_info.attrib_locations.vertex_position
            );
        }

        // fetch texture coordinates from buffer
        {
            const num = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texture_coord);
            gl.vertexAttribPointer(
                this.program_info.attrib_locations.texture_coord,
                num,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(
                this.program_info.attrib_locations.texture_coord
            );
        }

        gl.uniform2f(
            this.program_info.uniform_locations.texture_size,
            gl.canvas.clientWidth,
            gl.canvas.clientHeight
        );
        gl.uniform1fv(
            this.program_info.uniform_locations.kernel,
            this.blur_kernel
        );
        gl.uniform1f(
            this.program_info.uniform_locations.kernel_weight,
            compute_kernel_weight(this.blur_kernel)
        );

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

        // draw
        {
            const offset = 0;
            const vertex_count = this.indices.length;
            const type = gl.UNSIGNED_SHORT;
            gl.drawElements(gl.TRIANGLES, vertex_count, type, offset);
        }
    };
}

function init_postprocessing(gl) {
    /*
    Create, and bind empty texture fitting the canvas.
    Input:
        -gl         WebGLRenderingContext object
    Output:
        -texture    WebGLTexture object
    */

    // creating texture to render to
    const texture_width = gl.canvas.clientWidth;
    const texture_height = gl.canvas.clientHeight;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    {
        // define size and format of level 0
        const level = 0;
        const internal_format = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internal_format,
            texture_width,
            texture_height,
            border,
            format,
            type,
            data
        );
        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    return texture;
}

export { PostprocessingShader, init_postprocessing };
