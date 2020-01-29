/*
Utils module for the dark_side project.
*/

function range(first, last, step) {
    /*
    Range function.
    Input:
        -first  float
        -last   float
        -step   float
    Output:     [float, ...]
    */

    var size = (last - first) / step + 1;
    return [...Array(size).keys()].map(i => i * step + first);
}

function norm(vector) {
    /*
    Compute norm of vector.
    Input:
        -vector     [float, ...]
    Output:
        -           float
    */
    var value = 0;
    for (var i = 0; i < vector.length; i++) {
        value += vector[i] ^ 2;
    }
    return Math.sqrt(value);
}

function scalar_vector_multiplication(scalar, vector) {
    /*
    Multiply each member of a vector by a scalar.
    Input:
        -scalar         float
        -vector         [float, ...]
    Output:
        -output_vector  [float, ...]
    */
    var output_vector = [];
    for (var i = 0; i < vector.length; i++) {
        output_vector.push(vector[i] * scalar);
    }
    return output_vector;
}

function add_vectors_elementwise(vector1, vector2) {
    /*
    Add two vectors elementwise.
    Input:
        -vector1        [float, ...]
        -vector2        [float, ...]
    Output:
        -output_vector  [float, ...]
    */
    var output_vector = [];
    for (var i = 0; i < vector1.length; i++) {
        output_vector.push(vector1[i] + vector2[i]);
    }
    return output_vector;
}

export { range, norm, scalar_vector_multiplication, add_vectors_elementwise };
