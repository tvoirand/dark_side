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


def write_positions(
    target_body,
    utc_start,
    utc_end,
    steps,
    reference_frame,
    aberration_correction,
    observer_body,
):
    """
    Write positions of celestial bodies in output file.
    Input:
        -target_body            str (SPICE compatible celestial body name)
        -utc_start              str (format YYYYmmdd)
        -utc_end                str (format YYYYmmdd)
        -steps                  int
        -reference_frame        str (SPICE compatible)
        -aberration_correction  str (SPICE compatible)
        -observer_body          str (SPICE compatible celestial body name)
    """

    # read kernel files paths from config
    dark_side_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
    config = configparser.ConfigParser()
    config.read(os.path.join(dark_side_path, "config", "config.ini"))
    spk_kernel = config["spice"]["spk_kernel"]
    lsk_kernel = config["spice"]["lsk_kernel"]

    # load kernels
    spice.furnsh(spk_kernel)
    spice.furnsh(lsk_kernel)

    # compute ET times
    et_start = spice.str2et(format_date_for_spice(utc_start))
    et_end = spice.str2et(format_date_for_spice(utc_end))
    times = [x * (et_end - et_start) / steps + et_start for x in range(steps)]

    # load positions
    positions, _ = spice.spkpos(
        target_body, times, reference_frame, aberration_correction, observer_body
    )

    # write results to output file
    output_file = os.path.join(
        dark_side_path,
        "data",
        "{}.txt".format(datetime.datetime.now().strftime("%Y%m%d_%H%M_%S_{}".format(target_body))),
    )
    if not os.path.exists(os.path.dirname(output_file)):
        os.makedirs(os.path.dirname(output_file))
    with open(output_file, "w") as outfile:
        for i, position in enumerate(positions):
            outfile.write(
                "{} {:15.8f} {:15.8f} {:15.8f}\n".format(
                    format_date_from_spice(spice.et2utc(times[i], "C", 0)),
                    position[0],
                    position[1],
                    position[2],
                )
            )


if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("-target_body")
    parser.add_argument("-utc_start")
    parser.add_argument("-utc_end")
    parser.add_argument("-steps")
    parser.add_argument("-reference_frame")
    parser.add_argument("-aberration_correction")
    parser.add_argument("-observer_body")
    args = parser.parse_args()

    write_positions(
        args.target_body,
        args.utc_start,
        args.utc_end,
        int(args.steps),
        args.reference_frame,
        args.aberration_correction,
        args.observer_body,
    )
