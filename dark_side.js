/*
Main script for the dark_side project.
*/

spice = new SpiceSimulation;


main();


function main(){

    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl){
        alert("WebGL not supported.")
        return
    };

    projection_matrix = init_webgl_context(gl);

	postprocessing_shader = new PostprocessingShader(gl);
	const postprocessing_texture = init_postprocessing(gl);

	const framebuffer = init_framebuffer(gl, postprocessing_texture);
	const depthbuffer = init_renderbuffer(gl);

    sun_position = [0, 0, -20]

    var earth = new Planet(
        1.25,
        "EARTH",
        [0.2, 0.2, 1.0, 1.0],
        "SUN",
        gl,
    );
    var moon = new Planet(
        0.75,
        "MOON",
        [0.9, 0.9, 0.9, 1.0],
        "EARTH",
        gl,
    );
    var sun = new Sun(
        1.0,
        "SUN",
        [1.0, 1.0, 0.0, 1.0],
        "SUN",
        gl,
    )
    objects_to_draw = [
        earth,
        moon,
        sun,
    ];



    var elapsed_time = 0;
    var render = function(time){

        time *= 0.001;
        const delta_t = time - elapsed_time;
        elapsed_time = time;

        objects_to_draw.forEach(function(planet){
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
            objects_to_draw.forEach(function(planet){
                planet.display()
            });
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

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
