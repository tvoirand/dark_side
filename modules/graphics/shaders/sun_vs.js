export default `
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
