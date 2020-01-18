export default `
    attribute vec4 a_vertex_position;
    attribute vec4 a_vertex_color;
    attribute vec3 a_vertex_normal;

    uniform mat4 u_model_view_matrix;
    uniform mat4 u_projection_matrix;
    uniform mat4 u_normal_matrix;
    uniform vec3 u_sun_position;

    varying lowp vec4 v_color;
    varying highp vec3 v_lighting;

    void main(void) {
        gl_Position = u_projection_matrix * u_model_view_matrix * \
        a_vertex_position;
        v_color = a_vertex_color;

        highp vec3 ambient_light = vec3(0.3, 0.3, 0.3);
        highp vec3 sunlight_color = vec3(1.0, 1.0, 1.0);
        highp vec3 sun_vector = u_sun_position - (
            u_model_view_matrix * a_vertex_position
        ).xyz;

        highp vec4 transformed_normal = u_normal_matrix * vec4(
            a_vertex_normal,
            1.0
        );

        highp float direction_to_sun = max(
            dot(transformed_normal.xyz, normalize(sun_vector)),
            0.0
        );

        v_lighting = ambient_light + (sunlight_color * direction_to_sun);
    }
`;
