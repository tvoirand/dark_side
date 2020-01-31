"""
This script uses SpiceyPy to write positions of celestial bodies in output file.
"""

import os
import configparser
import argparse
import datetime
import spiceypy as spice


def format_date_for_spice(input_date):
    """
    Converts date string from YYYYmmdd to a SPICE compatible format.
    Input:
        -input_date     str (format YYYYmmdd)
    Output:
        -output_date    str (format YYYY month dd)
    """

    months_names = {
        "01": "Jan",
        "02": "Feb",
        "03": "Mar",
        "04": "Apr",
        "05": "May",
        "06": "Jun",
        "07": "Jul",
        "08": "Aug",
        "09": "Sep",
        "10": "Oct",
        "11": "Nov",
        "12": "Dec",
    }

    year = input_date[:4]
    month = months_names[input_date[4:6]]
    day = input_date[6:]

    output_date = "{} {} {}".format(year, month, day)

    return output_date

def format_date_from_spice(input_date):
    """
    Converts date string from the SPICE et2utc output format to YYYYmmddHHMMss.
    Input:
        -input_date     str (format YYYY month dd)
    Output:
        -output_date    str (format YYYYmmddHHMMss)
    """

    months_numbers = {
        "JAN": "01",
        "FEB": "02",
        "MAR": "03",
        "APR": "04",
        "MAY": "05",
        "JUN": "06",
        "JUL": "07",
        "AUG": "08",
        "SEP": "09",
        "OCT": "10",
        "NOV": "11",
        "DEC": "12",
    }

    year = input_date[:4]
    month = months_numbers[input_date[5:8]]
    day = input_date[9:11]
    hours = input_date[12:14]
    minutes = input_date[15:17]
    seconds = input_date[18:20]

    output_date = "{}{}{}{}{}{}".format(year, month, day, hours, minutes, seconds)

    return output_date

def write_output_file(filename, values):
    """
    Write values as string in output file.
    Input:
        -filename   str
        -values     [string, ...]
    """
    with open(filename, "w") as outfile:
        for i, value in enumerate(values[:-1]):
            outfile.write("{}\n".format(value))
        outfile.write("{}".format(values[-1])) # write last line without newline character


def write_positions(
    utc_start,
    utc_end,
    steps,
):
    """
    Write positions of earth and moon in output file.
    Input:
        -utc_start              str (format YYYYmmdd)
        -utc_end                str (format YYYYmmdd)
        -steps                  int
    """

    # read kernel files paths and some constants from config
    dark_side_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
    config = configparser.ConfigParser()
    config.read(os.path.join(dark_side_path, "config", "config.ini"))
    spk_kernel = config["spice"]["spk_kernel"]
    lsk_kernel = config["spice"]["lsk_kernel"]
    reference_frame = config["spice"]["reference_frame"]
    aberration_correction = config["spice"]["aberration_correction"]

    # load kernels
    spice.furnsh(spk_kernel)
    spice.furnsh(lsk_kernel)

    # compute ET times
    et_start = spice.str2et(format_date_for_spice(utc_start))
    et_end = spice.str2et(format_date_for_spice(utc_end))
    times = [x * (et_end - et_start) / steps + et_start for x in range(steps)]

    # load positions
    earth_positions, _ = spice.spkpos(
        "EARTH", times, reference_frame, aberration_correction, "SUN"
    )
    moon_positions, _ = spice.spkpos(
        "MOON", times, reference_frame, aberration_correction, "EARTH"
    )

    # create output dir
    output_dir = os.path.join(
        dark_side_path,
        "data",
    )
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # write results in output files
    write_output_file(
        os.path.join(output_dir, "earth.txt"),
        ["{:15.8f}, {:15.8f}, {:15.8f}".format(pos[0], pos[1], pos[2]) for pos in earth_positions]
    )
    write_output_file(
        os.path.join(output_dir, "moon.txt"),
        ["{:15.8f}, {:15.8f}, {:15.8f}".format(pos[0], pos[1], pos[2]) for pos in moon_positions]
    )
    write_output_file(
        os.path.join(output_dir, "times.txt"),
        ["{}".format(format_date_from_spice(spice.et2utc(time, "C", 0))) for time in times]
    )


if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("-utc_start")
    parser.add_argument("-utc_end")
    parser.add_argument("-steps")
    args = parser.parse_args()

    write_positions(
        args.utc_start,
        args.utc_end,
        int(args.steps),
    )
