"""
Test script for the "write_positions.py" script.
"""

import os
import subprocess
import configparser

config = configparser.ConfigParser()
config.read(
    os.path.join(
        os.path.dirname(os.path.dirname(os.path.realpath(__file__))),
        "config",
        "config.ini",
    )
)
python_path = config["spice"]["python_path"]

subprocess.call(
    [
        python_path,
        "/Users/thibautvoirand/creation/programmation/dark_side/dark_side/scripts/write_positions.py",
        "-target_body",
        "MOON",
        "-utc_start",
        "20200101",  # "Jan 1, 2020",
        "-utc_end",
        "20200131",  # "Jan 31, 2020",
        "-steps",
        "310",
        "-reference_frame",
        "J2000",
        "-aberration_correction",
        "NONE",
        "-observer_body",
        "EARTH",
    ]
)
subprocess.call(
    [
        python_path,
        "/Users/thibautvoirand/creation/programmation/dark_side/dark_side/scripts/write_positions.py",
        "-target_body",
        "EARTH",
        "-utc_start",
        "20200101",  # "Jan 1, 2020",
        "-utc_end",
        "20200131",  # "Jan 31, 2020",
        "-steps",
        "310",
        "-reference_frame",
        "J2000",
        "-aberration_correction",
        "NONE",
        "-observer_body",
        "SUN",
    ]
)
