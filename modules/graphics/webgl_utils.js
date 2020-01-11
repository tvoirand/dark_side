/*
Utils module for using WebGL for the dark_side project.
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

function init_framebuffer(gl, target_texture) {
    /*
    Create, bind, and attach framebuffer to texture.
    Input:
        -gl                 WebGLRenderingContext object
        -target_texture     WebGLTexture object
    Output:
        -framebuffer        WebGLFramebuffer object
    */

    // creating and binding framebuffer
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // attach texture
    const attachment_point = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        attachment_point,
        gl.TEXTURE_2D,
        target_texture,
        0
    );

    // check that framebuffer was created successfully
    if (gl.isFramebuffer(framebuffer)) {
        return framebuffer;
    }
}

function init_renderbuffer(gl) {
    /*
    Initiate renderbuffer.
    Input:
        -gl             WebGLRenderingContext object
    Output:
        -depthbuffer    WebGLRenderbuffer object
    */


    // creating and binding renderbuffer
    const depthbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthbuffer);

    // create and initialize renderbuffer data store
    gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        gl.canvas.clientWidth,
        gl.canvas.clientHeight
    );

    // attach renderbuffer to framebuffer
    gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        depthbuffer
    );

    // check that renderbuffer was created successfully
    if (gl.isRenderbuffer(depthbuffer)) {
        return depthbuffer;
    }
}

export {
    init_webgl_context,
    init_shader_program,
    init_framebuffer,
    init_renderbuffer
};
