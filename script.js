
spice = new SpiceSimulation;

main();

function main(){
    // fetch canvas and context
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl){
        alert("WebGL not supported.")
        return
    };

    // vertex and fragment shaders
    const vs_source = `
    attribute vec4 a_vertex_position;
    attribute vec4 a_vertex_color;
    attribute vec3 a_vertex_normal;

    uniform mat4 u_model_view_matrix;
    uniform mat4 u_projection_matrix;
    uniform mat4 u_normal_matrix;
    uniform vec3 u_light_position;

    varying lowp vec4 v_color;
    varying highp vec3 v_lighting;

    void main(void) {
        gl_Position = u_projection_matrix * u_model_view_matrix * a_vertex_position;
        v_color = a_vertex_color;

        highp vec3 ambient_light = vec3(0.3, 0.3, 0.3);
        highp vec3 sunlight_color = vec3(1, 1, 1);
        highp vec3 sun_vector = u_light_position - (u_projection_matrix * u_model_view_matrix * a_vertex_position).xyz;

        highp vec4 transformed_normal = u_normal_matrix * vec4(a_vertex_normal, 1.0);

        highp float direction_to_sun = max(dot(transformed_normal.xyz, normalize(sun_vector)), 0.0);

        v_lighting = ambient_light + (sunlight_color * direction_to_sun);
    }
    `;
    const fs_source = `
    varying lowp vec4 v_color;
    varying highp vec3 v_lighting;

    void main(void){
        gl_FragColor = vec4(v_color.rgb * v_lighting, v_color.a);
    }
    `;

    projection_matrix = init_webgl_context(gl);

    sun_position = [0, 0, 20]

    var earth = new Planet(
        1.25,
        "EARTH",
        [0.2, 0.2, 1.0, 1.0],
        "SUN",
        gl,
        vs_source,
        fs_source,
    );

    var moon = new Planet(
        0.75,
        "MOON",
        [0.9, 0.9, 0.9, 1.0],
        "EARTH",
        gl,
        vs_source,
        fs_source,
    );

    var sun = new Planet(
        1.0,
        "SUN",
        [1.0, 1.0, 0.0, 1.0],
        "SUN",
        gl,
        vs_source,
        fs_source,
    )

    planets_to_draw = [
        earth,
        moon,
        sun,
    ];

    var elapsed_time = 0;

    var render = function(time){
        time *= 0.001;
        const delta_t = time - elapsed_time;
        elapsed_time = time;

        // clear canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        planets_to_draw.forEach(function(planet){
            planet.update_position(
                spice.spkpos(
                    planet.name,
                    time,
                    "ECLIPJ2000",
                    "NONE",
                    planet.central_body,
                )
            );
        });

        planets_to_draw.forEach(function(planet){
            planet.display()
        });

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
};

function range(first, last, step) {
    `
    Range function.
    Input:
        -first  float
        -last   float
        -step   float
    Output:     [float, ...]
    `

    var size = (last - first) / step + 1;
    return [...Array(size).keys()].map(i => i * step + first);
};

function compute_sphere_data(radius){
    `
    Compute sphere vertices coordinates and indices.
    Input:
        -radius     float
    Output: array containing:
        -sphere_vertices  [float, ...]
        -sphere_indices   [int, ...]
    `

    const lat = range(-90, 90, 10);
    const lon = range(0, 360, 10);

    var sphere_vertices = [];

    var vertex = [0, 0, 0];
    for (var i = 0; i < lat.length; i++){
        for (var j = 0; j < lon.length; j++){
            vertex = geographic_to_cartesian_coords(lat[i], lon[j], radius)
            sphere_vertices.push(vertex[0])
            sphere_vertices.push(vertex[1])
            sphere_vertices.push(vertex[2])
        }
    }

    var sphere_indices = [];

    for (var i = 0; i < lat.length - 1; i++){
        for (var j = 0; j < lon.length - 1; j++){
            sphere_indices.push(j + i * lon.length)
            sphere_indices.push(j + 1 + i * lon.length)
            sphere_indices.push(j + 1 + (i + 1) * lon.length)
            sphere_indices.push(j + 1 + (i + 1) * lon.length)
            sphere_indices.push(j + (i + 1) * lon.length)
            sphere_indices.push(j + i * lon.length)
        }
    }

    return [sphere_vertices, sphere_indices]

};

function geographic_to_cartesian_coords(lat, lon, r){
    `
    Conversion from geographic coordinates to cartesian coordinates.
    South-North axis set as Y-axis for webgl compatibility
    Input:
        -lat    float
        -lon    float
        -r      float
    Output:     [float, float, float]
    `

    lat = lat * Math.PI / 180;
    lon = lon * Math.PI / 180;
    return [
        r * Math.cos(lon) * Math.cos(lat),
        r * Math.sin(lat),
        r * Math.sin(lon) * Math.cos(lat),
    ]
};

function SpiceSimulation(){
    `
    To compute planets positions and orientations until spice is implemented.
    `

    this.spkpos = function(name, time, frame, correction, central_body){
        `
        Give planet position.
        Input:
            -name           string
                spice compatible planet name
            -time           float
                et time
            -frame          string
                spice compatible reference frame name
            -correction     string
            -central_body   string
                spice compatible planet name
        `

        if (name == "EARTH"){
            return [
                7.0 * Math.cos(time),
                7.0 * Math.sin(time),
                -20
            ];
        };
        if (name == "MOON"){
            return [
                7.0 * Math.cos(time) + 3.0 * Math.cos(time * 3),
                7.0 * Math.sin(time) + 3.0 * Math.sin(time * 3),
                -20,
            ];
        };
        if (name == "SUN"){
            return [
                0.0,
                0.0,
                -20
            ];
        };
    };

    this.pxform = function(frame, name, time){
        `
        Give planet orientation.
        Input:
            -frame          string
                spice compatible reference frame name
            -name           string
                spice compatible IAU planet name
            -time           float
                et time
        `

        return [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0],
        ];
    };
};

function Planet(
    radius,
    name,
    color,
    central_body,
    gl,
    vs_source,
    fs_source,
){
    `
    Class describing a Planet.
    Attributes:
        -radius
        -name
        -color
        -central_body
        -program_info
        -buffers
        -vertices
        -indices
        -model_view_matrix
    Methods:
        -update_position
        -display
    `

    this.radius = radius;
    this.name = name;
    this.central_body = central_body;
    this.color = color;

    const shader_program = init_shader_program(gl, vs_source, fs_source);
    this.program_info = {
        program: shader_program,
        attrib_locations: {
            vertex_position: gl.getAttribLocation(
                shader_program,
                "a_vertex_position"
            ),
            vertex_color: gl.getAttribLocation(
                shader_program,
                "a_vertex_color",
            ),
            vertex_normal: gl.getAttribLocation(
                shader_program,
                "a_vertex_normal",
            )
        },
        uniform_locations: {
            projection_matrix: gl.getUniformLocation(
                shader_program,
                "u_projection_matrix"
            ),
            model_view_matrix: gl.getUniformLocation(
                shader_program,
                "u_model_view_matrix"
            ),
            normal_matrix: gl.getUniformLocation(
                shader_program,
                "u_normal_matrix",
            ),
            light_position: gl.getUniformLocation(
                shader_program,
                "u_light_position",
            )
        }
    };

    this.buffers = init_buffers(gl);

    // creating vertices position buffer and vertices indices buffer
    const shape_data = compute_sphere_data(this.radius);
    this.vertices = shape_data[0];
    this.indices = shape_data[1];

    for (var i = 0; i < this.vertices.length; i++){
        this.vertices[i] *= this.radius;
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.vertices),
        gl.STATIC_DRAW,
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(this.indices),
        gl.STATIC_DRAW,
    );

    // creating vertices colors buffer
    this.vertices_colors = [];
    for (var i = 0; i < this.vertices.length; i++){
        this.vertices_colors = this.vertices_colors.concat(this.color)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.vertices_colors),
        gl.STATIC_DRAW,
    );

    // creating vertices normals buffer
    // sphere normal vectors have same coordinates as vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.vertices),
        gl.STATIC_DRAW,
    );

    this.model_view_matrix = mat4.create();
    mat4.translate(
        this.model_view_matrix,
        this.model_view_matrix,
        [0, 0, -20]
    );

    this.normal_matrix = mat4.create();
    mat4.invert(this.normal_matrix, this.model_view_matrix);
    mat4.transpose(this.normal_matrix, this.normal_matrix);

    this.update_position = function(position_vector){
        `
        Set planet position by updating its model view matrix.
        Input:
            -position_vector    [float, float, float]
        `

        mat4.set(
            this.model_view_matrix,
            this.model_view_matrix[0],
            this.model_view_matrix[1],
            this.model_view_matrix[2],
            this.model_view_matrix[3],
            this.model_view_matrix[4],
            this.model_view_matrix[5],
            this.model_view_matrix[6],
            this.model_view_matrix[7],
            this.model_view_matrix[8],
            this.model_view_matrix[9],
            this.model_view_matrix[10],
            this.model_view_matrix[11],
            position_vector[0],
            position_vector[1],
            position_vector[2],
            this.model_view_matrix[15],
            this.model_view_matrix[16]
        );
    };

    this.display = function(){
        `
        Display planet.
        `

        gl.useProgram(this.program_info.program)

        // fetch vertices positions from buffer
        {
            const nb_components = 3; // nb values per vertex in buffer
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0
            const offset = 0
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position)
            gl.vertexAttribPointer(
                this.program_info.attrib_locations.vertex_position,
                nb_components,
                type,
                normalize,
                stride,
                offset
            )
            gl.enableVertexAttribArray(
                this.program_info.attrib_locations.vertex_position
            )
        }

        // fetch vertices colors from buffer
        {
            const nb_components = 4; // nb values per vertex in buffer
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0
            const offset = 0
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color)
            gl.vertexAttribPointer(
                this.program_info.attrib_locations.vertex_color,
                nb_components,
                type,
                normalize,
                stride,
                offset
            )
            gl.enableVertexAttribArray(
                this.program_info.attrib_locations.vertex_color
            )
        }

        // fetch vertices normals from buffer
        {
            const nb_components = 3; // nb values per vertex in buffer
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0
            const offset = 0
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal)
            gl.vertexAttribPointer(
                this.program_info.attrib_locations.vertex_normal,
                nb_components,
                type,
                normalize,
                stride,
                offset
            )
            gl.enableVertexAttribArray(
                this.program_info.attrib_locations.vertex_normal
            )
        }

        gl.uniformMatrix4fv(
            this.program_info.uniform_locations.model_view_matrix,
            false,
            this.model_view_matrix
        )
        gl.uniformMatrix4fv(
            this.program_info.uniform_locations.projection_matrix,
            false,
            projection_matrix
        )
        gl.uniformMatrix4fv(
            this.program_info.uniform_locations.normal_matrix,
            false,
            this.normal_matrix
        )
        gl.uniform3fv(
            this.program_info.uniform_locations.light_position,
            sun_position
        )


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices)

        // draw
        {
            const offset = 0
            const vertex_count = this.indices.length
            const type = gl.UNSIGNED_SHORT
            gl.drawElements(gl.TRIANGLES, vertex_count, type, offset)
        }
    }

};

function compute_cube_data(){
    `
    Compute cube vert coordinates and indices.
    Output: array containing:
        -cube_vertices  [float, ...]
        -cube_indices   [int, ...]
    `

    var cube_vertices = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    const cube_indices = [
        // define each face of cube as a pair of triangle
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    return [cube_vertices, cube_indices]

};

function init_webgl_context(gl){
    `
    Initiate WebGL context and create perspective matrix.
    Input:
        -gl                 WebGLRenderingContext instance
    Output:
        -projection_matrix  mat4 matrix
    `

    // initiate some WebGL context
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // create perspective matrix
    const field_of_view = (45 * Math.PI) / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const z_near = 0.1;
    const z_far = 100.0;
    const projection_matrix = mat4.create();
    mat4.perspective(projection_matrix, field_of_view, aspect, z_near, z_far);

    return projection_matrix

};

function init_shader_program(gl, vs_source, fs_source) {
    `
    Create a shader program based on vertex and fragment shader GLSL strings.
    Input:
        -vs_source       string
            contains GLSL source code to set
        -fs_source       string
            contains GLSL source code to set
    Output:
        -shader_program  WebGLProgram instance
    `

    const vertex_shader = load_shader(gl, gl.VERTEX_SHADER, vs_source)
    const fragment_shader = load_shader(gl, gl.FRAGMENT_SHADER, fs_source)

    // Create the shader program
    const shader_program = gl.createProgram()
    gl.attachShader(shader_program, vertex_shader)
    gl.attachShader(shader_program, fragment_shader)
    gl.linkProgram(shader_program)
    gl.validateProgram(shader_program)

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
        alert(
            "Unable to initialize the shader program: "+ gl.getProgramInfoLog(
                shader_program
            )
        )
        return null
    }
    if (!gl.getProgramParameter(shader_program, gl.VALIDATE_STATUS)){
        alert(
            "Unable to validate the shader program: "+gl.getProgramInfoLog(
                shader_program
            )
        )
        return null
    }

    return shader_program
};

function load_shader(gl, type, source) {
    `
    Create shader of given type based on a string GLSL shader source.
    Input:
        -gl         WebGLRenderingContext instance
        -type       gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
        -source     string
            contains GLSL source code to set
    Output:
        -shader     WebGLShader instance
    `

    const shader = gl.createShader(type)

    // Send the source to the shader object
    gl.shaderSource(shader, source)

    // Compile the shader program
    gl.compileShader(shader)

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            "An error occurred compiling the shaders: " + gl.getShaderInfoLog(
                shader
            )
        )
        gl.deleteShader(shader)
        return null
    }

    return shader
};

function init_buffers(gl){
    `
    Initialize buffers.
    Input:
        -gl         WebGLRenderingContext instance
    Output:
        -buffers    object containing WebGLBuffer instances
    `

    const position_buffer = gl.createBuffer()
    const index_buffer = gl.createBuffer()
    const color_buffer = gl.createBuffer()
    const normal_buffer = gl.createBuffer()
    return {
        position: position_buffer,
        indices: index_buffer,
        color: color_buffer,
        normal: normal_buffer,
    }
};
