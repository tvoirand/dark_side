"""
pygame framework building module.

version of the 20180722.
"""

import os, sys
with open(os.devnull, 'w') as f: # to disable pygame welcome message
    oldstdout = sys.stdout
    sys.stdout = f
    import pygame
    sys.stdout = oldstdout
import pygame.locals
from OpenGL.GL import *
from OpenGL.GLU import *
import numpy as np
import os
import cv2
from datetime import datetime
import imageio

def add_leading_zeros_to_fname(folder_name):
    """
    Add leading zeros to files names so that they all have the same number of digits.
    10 digits max.

    Input:
    -folder_name    string
    """

    files = [file for file in os.listdir(folder_name) if file.endswith(".png")]

    max_digits = len(max(files, key=len))

    for file in files:

        leading_zeros = ""

        missing_zeros = max_digits - len(file)

        for i in range(missing_zeros):

            leading_zeros += "0"

        os.rename(folder_name + "/" + file, folder_name + "/" + leading_zeros + file)

def image_to_video(output_dir):
    """
    Creates video file from images stored in a folder.

    Input:
    -output_dir     string
    """

    folder_name = output_dir + "/temp"
    video_name = output_dir + "/" + datetime.now().strftime("%Y%m%d-%H%M") + "-video.avi"

    add_leading_zeros_to_fname(folder_name)

    fourcc = cv2.VideoWriter_fourcc(*"XVID")
    fps = 30

    images = [img for img in os.listdir(folder_name) if img.endswith(".png")]
    frame = cv2.imread(os.path.join(folder_name, images[0]))
    height, width, layers = frame.shape

    video = cv2.VideoWriter(video_name, fourcc, fps, (width,height))

    for image in images:
        video.write(cv2.imread(os.path.join(folder_name, image)))

    cv2.destroyAllWindows()
    video.release()

def image_to_gif(output_dir):
    """
    Creates gif from images stored in a folder.

    Input:
    -output_dir     string
    """

    folder_name = output_dir + "/temp"
    video_name = output_dir + "/" + datetime.now().strftime("%Y%m%d-%H%M") + "-animation.gif"

    add_leading_zeros_to_fname(folder_name)

    images = [
        imageio.imread(os.path.join(folder_name, img)) \
        for img in os.listdir(folder_name) if img.endswith(".png")
    ]

    imageio.mimsave(video_name, images, duration=1/30)

def save_frame(frame_count, output_dir):
    """
    Save current frame to file.
    Input:
    -count          integer
    -output_dir     string
    """

    if not os.path.isdir(output_dir + "/temp"):

        os.mkdir(output_dir + "/temp")

    surface = pygame.display.get_surface()

    pygame.image.save(surface, output_dir + "/temp/{}.png".format(frame_count))

def draw_line(vertices):
    """
    Draws a line between two vertices.
    Inputs:
    -vertices   list of tuples of floats
    """

    glBegin(GL_LINES)

    for vertex in vertices:

        glVertex3fv(vertex)

    glEnd()

def initiate_pygame_frame():
    """
    Initiates pygame frame.
    """

    frame_width = 800
    frame_height = 800
    perspective_angle = 70
    horizon_close = 0.1
    horizon_far = 50
    translation = 5

    pygame.init()

    display = (frame_width, frame_height)

    pygame.display.set_mode(display, pygame.locals.DOUBLEBUF|pygame.locals.OPENGL)

    gluPerspective(perspective_angle, (display[0]/display[1]), horizon_close, horizon_far)

    glTranslatef(0.0, 0.0, -translation)

    glEnable(GL_DEPTH_TEST)
