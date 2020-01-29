export default `
    varying lowp vec4 v_color;
    varying highp vec3 v_lighting;

    void main(void){
        gl_FragColor = vec4(v_color.rgb * v_lighting, v_color.a);
    }
`;
