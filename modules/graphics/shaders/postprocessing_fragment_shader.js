export default `#version 300 es
    in highp vec2 v_texture_coord;
    out mediump vec4 FragColor;
    uniform sampler2D u_screen_texture;
    uniform mediump vec2 u_texture_size;
    uniform mediump float u_kernel[9];
    uniform mediump float u_kernel_weight;
    void main(void){
        mediump vec2 one_pixel_size = vec2(1.0, 1.0) / u_texture_size;
        mediump vec4 color_sum =
            texture(
                u_screen_texture,
                v_texture_coord + one_pixel_size * vec2(-1, -1)
            ) * u_kernel[0] +
            texture(
                u_screen_texture,
                v_texture_coord + one_pixel_size * vec2(0, -1)
            ) * u_kernel[1] +
            texture(
                u_screen_texture,
                v_texture_coord + one_pixel_size * vec2(1, -1)
            ) * u_kernel[2] +
            texture(
                u_screen_texture,
                v_texture_coord + one_pixel_size * vec2(-1, 0)
            ) * u_kernel[3] +
            texture(
                u_screen_texture,
                v_texture_coord + one_pixel_size * vec2(0, 0)
            ) * u_kernel[4] +
            texture(
                u_screen_texture,
                v_texture_coord + one_pixel_size * vec2(1, 0)
            ) * u_kernel[5] +
            texture(
                u_screen_texture,
                v_texture_coord + one_pixel_size * vec2(-1, 1)
            ) * u_kernel[6] +
            texture(
                u_screen_texture,
                v_texture_coord + one_pixel_size * vec2(0, 1)
            ) * u_kernel[7] +
            texture(
                u_screen_texture,
                v_texture_coord + one_pixel_size * vec2(1, 1)
            ) * u_kernel[8]
            ;
        FragColor = vec4((color_sum / u_kernel_weight).rgb, 1.0);
    }
`;
