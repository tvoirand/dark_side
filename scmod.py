"""
science module for ships.

version of the 20180720.
"""

import numpy as np

class Ship:
    """
    Class describing a ship.

    The "vertices" attribute is an array containing (columns):
    (time elapsed since passage at periapsis, x-coord, y-coord, z-coord)

    Attributes:
    -ship_count (class attribute)   integer
    -id                             integer
    -orbital_parameters             list of 5 floats (a, e, inc, raan, om)
    -scale                          float
    -vertices                       numpy array of floats (shape (nb_of_steps, 4))
    """

    ships_count = 0

    def __init__(self, orbital_parameters, nb_of_steps):
        """
        Constructor of the Ship class.

        Input:
        -orbital_parameters     list of 5 floats (a, e, inc, raan, om)
        -nb_of_steps            integer
        """

        self.id = Ship.ships_count
        self.orbital_parameters = orbital_parameters
        self.scale = 2.5 / (orbital_parameters[0] * (1 + orbital_parameters[1]))
        self.vertices = np.zeros((nb_of_steps, 4))
        Ship.ships_count += 1

def from_orbital_to_cartesian_coordinates(a, e, inc, raan, om, t, mu):
    '''
    Converting from orbital parameters to cartesian coordinates.
    - Inputs:
            a         float   semi-major axis (km)
    		e         float   eccentricity (-)
    		inc       float   inclination (deg)
    		raan      float   right ascension of the ascending node (deg)
    		om        float   argument of periapsis (deg)
    		t         float   time spent since passage at periapsis (s)
    		mu	      float   gravitational parameter of the central body	(km3/s2)
    - Outputs:
    		pos   	  numpy array of floats (shape (3,)) (km)
    '''

    # converting angles from degrees to radians
    inc = inc * np.pi / 180
    raan = raan * np.pi / 180
    om = om * np.pi / 180

    # computing mean anomaly
    n = np.sqrt(mu / np.power(a, 3.0))
    M = n * t

    # computing eccentric anomaly
    E = [M]
    for j in range(100):
        E.append(E[j] + (M - E[j] + e * np.sin(E[j])) / (1 - e * np.cos(E[j])))
        if(abs(E[j+1] - E[j]) < 1e-8):
            E = E[j+1]
            break

    # computing true anomaly
    nu = 2 * np.arctan2(
            np.sqrt(1 + e) * np.sin(E / 2),
            np.sqrt(1 - e) * np.cos(E / 2)
        ) % (np.pi * 2)

    # computing radius
    r = a * (1 -np.power(e, 2.0)) / (1 + e * np.cos(nu))

    # computing position vector
    pos = np.asarray((
        r * (np.cos(om + nu) * np.sin(raan) + np.sin(om + nu) * np.cos(raan) * np.cos(inc)),
        r * (np.cos(om + nu) * np.cos(raan) - np.sin(om + nu) * np.sin(raan) * np.cos(inc)),
        r * (np.sin(om + nu) * np.sin(inc)),
    ))

    return pos

def rotate_frame_around_z(input_vector, angle):
    '''
	Converts coordinates to rotated reference frame.
    Inputs:
    -input_vector       numpy array of floats
    -angle (degrees)    float
    Outputs:
    -output_vector      numpy array of floats
    '''

    angle = angle * np.pi / 180

    output_vector = [
        np.cos(angle) * input_vector[0] + np.sin(angle) * input_vector[1],
        np.cos(angle) * input_vector[1] - np.sin(angle) * input_vector[0],
        input_vector[2]
    ]

    return output_vector

def rotate_frame_around_y(input_vector, angle):
    '''
	Converts coordinates to rotated reference frame.
    Inputs:
    -input_vector       numpy array of floats
    -angle (degrees)    float
    Outputs:
    -output_vector      numpy array of floats
    '''

    angle = angle * np.pi / 180

    output_vector = [
        np.cos(angle) * input_vector[0] - np.sin(angle) * input_vector[2],
        input_vector[1],
        np.cos(angle) * input_vector[2] + np.sin(angle) * input_vector[0]
    ]

    return output_vector

def geographic_to_cartesian_coord(lat, lon, r):
    '''
    Converts from geographic to cartesian coordinates

    - Inputs:

    - Outputs:
    '''

    lat = lat * np.pi / 180
    lon = lon * np.pi / 180

    position_vector = [
        r * np.cos(lon) * np.cos(lat),
        r * np.sin(lon) * np.cos(lat),
        r * np.sin(lat)
    ]

    return position_vector

def compute_if_lit(sun_vector, surface_vector):
    """
    Compute if a portion of planet surface receives sunlight.

    Input:
    -sun_vector         tuple of 3 floats
    -surface_vector     tuple of 3 floats
    Output:
    -boolean
    """

    surface_vector = surface_vector / np.linalg.norm(surface_vector)

    sun_vector = sun_vector / np.linalg.norm(sun_vector)

    prdct = - np.dot(surface_vector, sun_vector)

    if prdct <= 0:

        return False

    else:

        return True
