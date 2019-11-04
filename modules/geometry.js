/*
Geometry module for the dark_side project.
*/


function compute_sphere_data(radius){
    `
    Compute sphere vertices coordinates and indices.
    Input:
        -radius     float
    Output: array containing:
        -sphere_vertices  [float, ...]
        -sphere_indices   [int, ...]
    `

    const lat = range(-90, 90, 10);
    const lon = range(0, 360, 10);

    var sphere_vertices = [];

    var vertex = [0, 0, 0];
    for (var i = 0; i < lat.length; i++){
        for (var j = 0; j < lon.length; j++){
            vertex = geographic_to_cartesian_coords(lat[i], lon[j], radius)
            sphere_vertices.push(vertex[0])
            sphere_vertices.push(vertex[1])
            sphere_vertices.push(vertex[2])
        }
    }

    var sphere_indices = [];

    for (var i = 0; i < lat.length - 1; i++){
        for (var j = 0; j < lon.length - 1; j++){
            sphere_indices.push(j + i * lon.length)
            sphere_indices.push(j + 1 + i * lon.length)
            sphere_indices.push(j + 1 + (i + 1) * lon.length)
            sphere_indices.push(j + 1 + (i + 1) * lon.length)
            sphere_indices.push(j + (i + 1) * lon.length)
            sphere_indices.push(j + i * lon.length)
        }
    }

    return [sphere_vertices, sphere_indices]

}


function geographic_to_cartesian_coords(lat, lon, r){
    `
    Conversion from geographic coordinates to cartesian coordinates.
    South-North axis set as Y-axis for webgl compatibility
    Input:
        -lat    float
        -lon    float
        -r      float
    Output:     [float, float, float]
    `

    lat = lat * Math.PI / 180;
    lon = lon * Math.PI / 180;
    return [
        r * Math.cos(lon) * Math.cos(lat),
        r * Math.sin(lat),
        r * Math.sin(lon) * Math.cos(lat),
    ]
}
