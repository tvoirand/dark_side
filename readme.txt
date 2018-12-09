Dark side.

Display Sun, Earth (with longitudes and latitudes), and Moon.

Version 0.14 of the 20181209.

Added in this version:
    -postprocessing texture and framebuffer added
        -init_framebuffer and init_postprocessing_texture functions added
        -first drawing scene in framebuffer to which texture is attached
        -then rendering texture to canvas with postprocessing vertex and
        fragment shaders


Todo:
    -get rid of gl-matrix.js dependency
    -implement spice
    -improve sun display
    -fix postprocessing lighting glitch
