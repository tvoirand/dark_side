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
import {
    norm,
    scalar_vector_multiplication,
    add_vectors_elementwise
} from "./modules/utils.js";

main();

function main() {
    /*
    Main function for the dark_side project.
    */

    // read times and earth and moon positions from spice data files
    var spice_data = read_spice_data();

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
    var earth = new Planet(
        1.25, // radius
        "EARTH", // name
        [0.2, 0.2, 1.0, 1.0], // color
        0.00000004, // orbit display factor
        "SUN", // central body
        gl // webgl context
    );
    var moon = new Planet(
        0.75, // radius
        "MOON", // name
        [0.9, 0.9, 0.9, 1.0], // color
        0.000006, // orbit display factor
        "EARTH", // central body
        gl // webgl context
    );
    var sun = new Sun(
        1.0, // radius
        [0, 0, -20], // position
        "SUN", // name
        [1.0, 1.0, 0.0, 1.0], // color
        "SUN", // central body
        gl // webgl context
    );
    var objects_to_draw = [earth, moon, sun];

    // loop animation function called at each display refresh
    var render = function(time) {
        /*
        Input:
            -time   float
                time since last refresh (in ms) ?
        */

        // get index for spice data arrays based on the time slider value
        var index = get_current_index(spice_data.times.length);

        // display time
        document.getElementById("time_display").innerHTML =
            spice_data.times[index];

        // update earth and moon positions
        earth.position = scalar_vector_multiplication(
            earth.orbit_display_factor,
            spice_data.earth_positions[index]
        );
        moon.position = add_vectors_elementwise(
            earth.position,
            scalar_vector_multiplication(
                moon.orbit_display_factor,
                spice_data.moon_positions[index]
            )
        );

        // shift earth and moon Z value
        earth.position[2] -= 20;
        moon.position[2] -= 20;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // display objects
        earth.display(projection_matrix, sun.position);
        moon.display(projection_matrix, sun.position);
        sun.display(projection_matrix);

        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}

function get_current_index(arrays_length) {
    /*
    Get current index for data array, given the value of the time slider.
    Input:
        -arrays.length  int
    Output:
        -               int
    */

    // get slider values
    var slider_value = document.getElementById("time_slider").value;
    var slider_max = document.getElementById("time_slider").max;
    var slider_min = document.getElementById("time_slider").min;

    // compute corresponding index in times array
    return Math.floor((slider_value - slider_min) * arrays_length / slider_max);
}

function read_spice_data() {
    /*
    Read times and objects (earth and moon) positions from files computed with the scipeypy script.
    Output:
        -spice_data     javascript object
            contains:
                -times: [float, ...]
                -earth_positions: [float, ...]
                -moon_positions: [float, ...]
    */

    // initiate arrays to store times, earth positions, and moon positions data
    var times = [];
    var earth_positions = [];
    var moon_positions = [];

    // fetch times through ajax request
    $.ajax({
        type: "GET",
        url: "./data/times.txt",
        success: function(data) {
            var rows = data.split("\n");
            for (var i = 1; i < rows.length; i++) {
                times.push(parseFloat(rows[i]));
            }
        }
    });

    // fetch earth positions through ajax request
    $.ajax({
        type: "GET",
        url: "./data/earth.txt",
        success: function(data) {
            var rows = data.split("\n");
            for (var i = 1; i < rows.length; i++) {
                var cols = rows[i].split(",");
                earth_positions.push([
                    parseFloat(cols[0]),
                    parseFloat(cols[1]),
                    parseFloat(cols[2])
                ]);
            }
        }
    });

    // fetch moon positions through ajax request
    $.ajax({
        type: "GET",
        url: "./data/moon.txt",
        success: function(data) {
            var rows = data.split("\n");
            for (var i = 1; i < rows.length; i++) {
                var cols = rows[i].split(",");
                moon_positions.push([
                    parseFloat(cols[0]),
                    parseFloat(cols[1]),
                    parseFloat(cols[2])
                ]);
            }
        }
    });

    // create output object
    var spice_data = {
        times: times,
        earth_positions: earth_positions,
        moon_positions: moon_positions
    };

    return spice_data;
}
