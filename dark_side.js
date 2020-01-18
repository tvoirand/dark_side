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
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert("WebGL not supported.");
        return;
    }

    var projection_matrix = init_webgl_context(gl);

    var earth = new Planet(1.25, "EARTH", [0.2, 0.2, 1.0, 1.0], "SUN", gl);
    var moon = new Planet(0.75, "MOON", [0.9, 0.9, 0.9, 1.0], "EARTH", gl);
    var sun = new Sun(1.0, [0, 0, -20], "SUN", [1.0, 1.0, 0.0, 1.0], "SUN", gl);
    var objects_to_draw = [earth, moon, sun];

    var elapsed_time = 0;
    var render = function(time) {
        time *= 0.001;
        const delta_t = time - elapsed_time;
        elapsed_time = time;

        objects_to_draw.forEach(function(object) {
            object.position = spice.spkpos(
                object.name,
                time,
                "ECLIPJ2000",
                "NONE",
                object.central_body
            );
        });

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        objects_to_draw.forEach(function(object) {
            object.display(projection_matrix, sun.position, object.position);
        });

        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}
