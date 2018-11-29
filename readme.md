## Dark side

Display Sun, Earth (with longitudes and latitudes), and Moon.

Version 0.7 of the 20181129.

The SPICE kernels de430.bsp, naif0012.tls.pc, pck00010.tpc are needed and the
file path must be updated in the metakernels.txt file.

# Added in this version
    -added geographic_to_cartesian_coords function
    -added compute_sphere_data function
    -added range function

# Todo
    -move cube data creation in Planet class constructor
    -represent spheres:
        -change the Planet class to use sphere data (nb of vertices in display
        function?)
