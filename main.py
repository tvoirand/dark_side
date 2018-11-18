"""
Main script for dark side.
"""

import framemod
import scmod
import spiceypy as spice
import numpy as np
from colour import Color
import pygame.locals
from OpenGL.GL import *
from OpenGL.GLU import *
import os, sys
with open(os.devnull, 'w') as f: # to disable pygame welcome message
    oldstdout = sys.stdout
    sys.stdout = f
    import pygame
    sys.stdout = oldstdout

def compute_sun_display():
    """
    Computes sun colorbar and display coordinates.

    Output:
    -sun_coordinates    list of lists of tuples of 3 floats (vertices coordinates)
    -sun_colorbar       list of tuples of 3 floats (rgb)
    """

    def circle_coordinates(radius, angular_resolution):
        """
        Compute circle coordinates based on radius and angular resolution.

        Input:
        -radius                     float
        -angular_resolution (deg)   integer

        Output:
        -coordinates                list of tuples of 3 floats
        """

        coordinates = []

        for angle in np.arange(0, 360, angular_resolution):

            coordinates.append((
                radius * np.cos(angle*np.pi/180),
                radius * np.sin(angle*np.pi/180),
                0.0
            ))

        return coordinates

    sun_coordinates = []

    radius_list = [0.2 + np.log(i)/10.0 for i in np.arange(1, 5, 0.01)]

    for radius in radius_list:

        sun_coordinates.append(circle_coordinates(radius, 10))

    sun_colorbar = list(Color("yellow").range_to(Color("black"), len(radius_list)))

    return sun_coordinates, sun_colorbar

def display_sun(circles_coordinates, colorbar):
    """
    Displays sun as a polygon at the center of the frame.
    Display is based on concentric circles coordinates and colorbar.

    Input:
    -circles_coordinates    list of lists of tuples of 3 floats (vertices coords.)
    -colorbar               list of tuples of 3 floats (rgb)
    """

    for i, coordinates in enumerate(circles_coordinates):

        glBegin(GL_POLYGON)

        glColor4fv((
            colorbar[i].rgb[0],
            colorbar[i].rgb[1],
            colorbar[i].rgb[2],
            0+i/len(coordinates)
        ))

        for j in range(len(coordinates)):

            glVertex3fv(coordinates[j])

        glEnd()

class Planet:
    """
    Class describing a planet.

    Attributes:
        -position                       tuple of 3 floats
        -rotation (degrees)             float
        -spatial_resolution (degrees)   integer
        -lat                            list of n integers
        -lon                            list of n integers
        -radius                         float
        -color_light                    tuple of 3 floats
        -color_shadow                   tuple of 3 floats
    """

    def __init__(self, spatial_resolution, radius, distance_factor, spice_name, central_body):
        """
        Planet class constructor.

        Input:
            spatial_resolution  integer
                resolution for latitude and longitude display in degrees
            radius              float
                display radius
            distance_factor     float
                factor to adapt distance scale
            spice_name          string
                name for SPICE
            central_body        string or Planet class instance
                central body name for SPICE or central body Planet class instance
        """

        self.radius = radius
        self.spatial_resolution = spatial_resolution
        self.distance_factor = distance_factor
        self.spice_name = spice_name
        self.central_body = central_body

        # list of latitudes and longitudes, based on planet display spatial angular resolution
        self.lat = list(range(-90, 91, spatial_resolution))
        self.lon = list(range(0, 361, spatial_resolution))

        self.position = np.zeros((1, 3))

        self.transformation_matrix = np.zeros((3, 3))

        self.color_shadow = (0.2, 0.2, 0.2)
        self.color_light = (0.6, 0.6, 0.6)

    def display(self, time):
        """
        Display planet.

        Input:
            time    float
                ephemeris time
        """

        def get_position(time):
            """
            Get Planet position using SPICE based on ephemeris time.

            Input:
                time    (float)
                    ephemeris time
            """

            if self.central_body == "SUN":

                self.position = spice.spkpos(
                    self.spice_name, time, "ECLIPJ2000", "NONE", "SUN"
                )[0] * self.distance_factor

            if isinstance(self.central_body, Planet):

                self.position = spice.spkpos(
                    self.spice_name, time, "ECLIPJ2000", "NONE", self.central_body.spice_name
                )[0] * self.distance_factor

                self.position += spice.spkpos(
                    self.central_body.spice_name, time, "ECLIPJ2000", "NONE", "SUN"
                )[0] * self.central_body.distance_factor

        def get_orientation(time):
            """
            Get Planet orientation using SPICE based on ephemeris time.

            Input:
                time    (float)
                    ephemeris time
            """

            self.transformation_matrix = spice.pxform("ECLIPJ2000", "IAU_" + self.spice_name, time)

        get_orientation(time)
        get_position(time)

        # defining list of the vertices of the polyhedron representing the planet
        planet_vertices = []
        for i in range(len(self.lat)):
            for j in range(len(self.lon)):
                vertices_coords = scmod.geographic_to_cartesian_coord(
                    self.lat[i],
                    self.lon[j],
                    self.radius
                )
                vertices_coords = np.asarray(vertices_coords).dot(self.transformation_matrix)
                vertices_coords = vertices_coords + self.position
                planet_vertices.append(vertices_coords)

        # defining list of edges connecting vertices of the polyhedron representing the planet
        planet_edges = []
        for i in range(len(self.lat) - 1):
            for j in range(len(self.lon) - 1):
                planet_edges.append((j + i*len(self.lon), j+1 + i*len(self.lon)))
                planet_edges.append((j+1 + i*len(self.lon), j+1 + (i+1)*len(self.lon)))
                planet_edges.append((j+1 + (i+1)*len(self.lon), j + (i+1)*len(self.lon)))
                planet_edges.append((j+ (i+1)*len(self.lon), j + i*len(self.lon)))

        # defining list of faces connecting vertices of the polyhedron representing the planet
        planet_faces = []
        for i in range(len(self.lat) - 1):
            for j in range(len(self.lon) - 1):
                planet_faces.append((
                    j + i*len(self.lon),
                    j+1 + i*len(self.lon),
                    j+1 + (i+1)*len(self.lon),
                    j + (i+1)*len(self.lon)
                ))

        # drawing faces
        glBegin(GL_QUADS)
        for i in range(len(planet_faces)):
            if scmod.compute_if_lit(
                planet_vertices[planet_faces[i][0]] - self.position,
                self.position
            ):
                glColor3fv(self.color_light)
            else:
                glColor3fv(self.color_shadow)
            for vertex in planet_faces[i]:
                glVertex3fv(planet_vertices[vertex])
        glEnd()

        # drawing edges
        glBegin(GL_LINES)
        glColor4fv((1, 1, 1, 0))
        for edge in planet_edges:
            for vertex in edge:
                glVertex3fv(planet_vertices[vertex])
        glEnd()

if __name__ == "__main__":

    # loading spice kernels
    spice.furnsh("./metakernels.txt")

    SAVE_VIDEO = False

    sun_coordinates, sun_colorbar = compute_sun_display()

    start_date = "Oct 1, 2018"
    end_date = "Dec 1, 2018"
    nb_of_frames = 100
    ephemeris_time = np.linspace(spice.str2et(start_date), spice.str2et(end_date), nb_of_frames)

    earth = Planet(10, 0.4, 2 / 1.5e8, "EARTH", "SUN")
    earth.color_shadow = (0.0, 0.0, 0.3)
    earth.color_light = (0.3, 0.6, 1.0)

    moon = Planet(30, 0.2, 1 / 4e5, "MOON", earth)

    framemod.initiate_pygame_frame()

    while True:

        for i, time in enumerate(ephemeris_time):

            # closing animation window at any event
            for event in pygame.event.get():

                if event.type == pygame.QUIT:

                    pygame.quit()

                    quit()
            glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT)

            display_sun(sun_coordinates, sun_colorbar)

            earth.display(time)
            moon.display(time)

            pygame.display.flip()
            pygame.time.wait(1)

            if SAVE_VIDEO:
                framemod.save_frame(i, "output")

        pygame.quit()

        if SAVE_VIDEO:
            framemod.image_to_video("output")
            framemod.image_to_gif("output")

        quit()
