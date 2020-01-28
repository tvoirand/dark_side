/*
Main script for the dark_side project.
*/

import {
    compute_sphere_data,
    geographic_to_cartesian_coords
} from "./modules/geometry.js";
import { SpiceSimulation } from "./modules/spice_simulation.js";
import { Sun } from "./modules/graphics/sun.js";
import { Planet } from "./modules/graphics/planet.js";
import { init_webgl_context } from "./modules/graphics/webgl_utils.js";

var spice = new SpiceSimulation();

main();

function main() {
    /*
    Main function for the dark_side project.
    */

    // initiate canvas
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert("WebGL not supported.");
        return;
    }

    // initiate webgl
    var projection_matrix = init_webgl_context(gl);

    // initiate objects to draw
    var earth = new Planet(1.25, "EARTH", [0.2, 0.2, 1.0, 1.0], "SUN", gl);
    var moon = new Planet(0.75, "MOON", [0.9, 0.9, 0.9, 1.0], "EARTH", gl);
    var sun = new Sun(1.0, [0, 0, -20], "SUN", [1.0, 1.0, 0.0, 1.0], "SUN", gl);
    var objects_to_draw = [earth, moon, sun];

    // initiate elapsed time
    var elapsed_time = 0;

    // loop animation function called at each display refresh
    var render = function(time) {
        time *= 0.001;
        const delta_t = time - elapsed_time;
        elapsed_time = time;

        // update objects positions
        earth.position = spice.spkpos(
            earth.name,
            time,
            "ECLIPJ2000",
            "NONE",
            earth.central_body
        );
        moon.position = spice.spkpos(
            moon.name,
            time,
            "ECLIPJ2000",
            "NONE",
            moon.central_body
        );
        sun.position = spice.spkpos(
            sun.name,
            time,
            "ECLIPJ2000",
            "NONE",
            sun.central_body
        );

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // display objects
        earth.display(projection_matrix, sun.position);
        moon.display(projection_matrix, sun.position);
        sun.display(projection_matrix);

        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}
