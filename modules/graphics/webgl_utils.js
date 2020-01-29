/*
WebGL utils module for the dark_side project.
*/

function init_webgl_context(gl) {
    /*
    Initiate WebGL context and create perspective matrix.
    Input:
        -gl                 WebGLRenderingContext object
    Output:
        -projection_matrix  mat4 matrix
    */

    // initiate some WebGL context
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // create perspective matrix
    const field_of_view = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const z_near = 0.1;
    const z_far = 100.0;
    const projection_matrix = mat4.create();
    mat4.perspective(projection_matrix, field_of_view, aspect, z_near, z_far);

    return projection_matrix;
}

function init_shader_program(gl, vs_source, fs_source) {
    /*
    Create a shader program based on vertex and fragment shader GLSL strings.
    Input:
        -vs_source       string
            contains GLSL source code to set
        -fs_source       string
            contains GLSL source code to set
    Output:
        -shader_program  WebGLProgram object
    */

    const vertex_shader = load_shader(gl, gl.VERTEX_SHADER, vs_source);
    const fragment_shader = load_shader(gl, gl.FRAGMENT_SHADER, fs_source);

    // Create the shader program
    const shader_program = gl.createProgram();
    gl.attachShader(shader_program, vertex_shader);
    gl.attachShader(shader_program, fragment_shader);
    gl.linkProgram(shader_program);
    gl.validateProgram(shader_program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
        alert(
            "Unable to initialize the shader program: " +
                gl.getProgramInfoLog(shader_program)
        );
        return null;
    }
    if (!gl.getProgramParameter(shader_program, gl.VALIDATE_STATUS)) {
        alert(
            "Unable to validate the shader program: " +
                gl.getProgramInfoLog(shader_program)
        );
        return null;
    }

    return shader_program;
}

function load_shader(gl, type, source) {
    /*
    Create shader of given type based on a string GLSL shader source.
    Input:
        -gl         WebGLRenderingContext object
        -type       gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
        -source     string
            contains GLSL source code to set
    Output:
        -shader     WebGLShader object
    */

    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            "An error occurred compiling the shaders: " +
                gl.getShaderInfoLog(shader)
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

export { init_webgl_context, init_shader_program };
