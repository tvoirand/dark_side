/*
Utils module for the dark_side project.
*/

function range(first, last, step) {
    `
    Range function.
    Input:
        -first  float
        -last   float
        -step   float
    Output:     [float, ...]
    `;

    var size = (last - first) / step + 1;
    return [...Array(size).keys()].map(i => i * step + first);
}

export { range };
