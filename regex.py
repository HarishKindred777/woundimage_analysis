import pandas as pd
import numpy as np
from flask import Response
import json
import re
import sys
from scipy import special


def to_lowercase(matchobj) -> str:
    '''
    Takes a match object group (of one or more groups) and
    returns it as lowercase string.
    '''
    if len(matchobj.groups()) > 1:
        return matchobj.group(1) + matchobj.group(2).lower()
    return matchobj.group(0).lower()


def capitalize(matchobj) -> str:
    '''
    Capitalizes a match object and returns it as a string to ensure it's
    treated as a column.

    i.e., "wound onset type:" -> "Wound onset type:"
    '''
    return matchobj.group(1).upper() + matchobj.group(2)


def standardize(matchobj) -> str:
    '''
    Takes a match object, remove all whitespace, parentheses, and periods
    and returns a standardized string for positional abbreviations.

    i.e., "l l." -> "ll" -> "left lower"
    '''
    match = matchobj.group(0).strip(' ().').lower()
    match = re.sub(r'\s+', '', match)
    if match == 'r' or match == 'rt':
        return ' right '
    if match == 'l' or match == 'lt':
        return ' left '
    if match == 'll':
        return ' left lower '
    if match == 'lu':
        return ' left upper '
    if match == 'rl':
        return ' right lower'
    if match == 'ru':
        return ' right upper '

def romanize(matchobj) -> str:
    match = matchobj.group(1)
    stage = matchobj.group(2)
    if stage == '1':
        return match + 'i'
    if stage == '2':
        return match + 'ii'
    if stage == '3':
        return match + 'iii'
    if stage == '4':
        return match + 'iv'


def transform_text(data: np.array) -> np.array:
    '''
    Transforms a numpy array into a standard form for extracting column:text
    pairs.
    '''
    trasform_filters_replace = [
    # remove 'pain management' column (column that contains another
    # column)
    (r'Pain Management:', ''),
    # standardize 'pressure ulcer' column by removing descriptors
    (r'(Weekly|Daily|Admission) wound (care|assessment) -', ''),
    # remove 'Comment:' to standardize 'pressure ulcer' text
    # (not the same as the 'comments' column)
    (r'Comment:', ''),
    # convert 'comments' text to lowercase to avoid false column (allows
    # removing extra whitespace not delimiting column:text pairs in later
    # step)
    (r'(Comments:)(.*?)(?=Wound improvement|Signs/symptoms)', to_lowercase),
    # capitalize "w" in 'wound onset type' column for cases where it's
    # lowercase
    (r'(w)(ound onset type:)', capitalize),
    # remove datetime information (AssessDate contains this information in
    # WoundText already)
    (r'(\s(resurfaced/healed|discharged)\s)?(\d+/\d+/\d+\s\d{2}:\d{2}(\s:)?)',
        ' '),
    # remove extra whitespace causing incorrect column:text pairs
    (r'(\s{2,})(?=Pain related)', ' '),
    # add extra whitespace before 'device related' column so its not skipped
    # (1 instance out of 12005 records)
    (r'(Device related:)', r' \1'),
    # remove extra space before single periods to tidy text
    (r'\s+\.', '.'),
    # remove period(s) followed by a comma to tidy text
    (r'\.+,', ''),
    # remove redudant information from 'pressure ulcer' column
    (r'((UNSTAGE(ABLE)?)?(\sPRESSURE)?(?=\s))|(STG\s(\S+))', ''),
    # remove extra whitespace before
    (r'\s{2,}((?![A-Z])|(?=[A-Z]\s)|(?=[A-Z]{2,})|(?=[A-Z][a-z][A-Z]+))', ' '),
    # convert all uppercase letters to lowercase that don't signal column
    (r'([A-Z]{2,}|[A-Z][a-z][A-Z]+)', to_lowercase),
    # replace "suspected sDTI (unstageable)" and variants from text with
    # "sDTI" for tidiness
    (r'\s(\s?suspected.*?\(unstageable\))|(dti)', 'sdti'),
    # replace "nonviable tissue (unstageable)" from text with "nonviable" for
    # tidiness
    (r'\s+(nonviable).*?\(unstageable\)', r' \1'),
    # standardizes location abbreviations
    (r'\s\(?[RrLl]{1,2}[Tt]?\)?(\s\w\.|\.)?\s', standardize),
    # remove extra space before and after colons to standardize column:text
    # pair format
    (r'(\s+)?(:)(\s+)', r'\2'),
    # remove asterisks to tidy data (they show zero practical use)
    (r'\*', ''),
    # format commas for tidiness
    (r'((?<=\S),(?=\S))|(\s+,\s+)', ', '),
    # remove periods from text of columns.
    # i.e., "pressure ulcer: sacrum.  " -> "pressure ulcer: sacrum  "
    (r'\.(?=\s{2})', ''),
    # remove admission information
    (r'(?<!:)\s?\((poa|(present\s)?on admission).*?\)', ''),
    # replace numbers with roman numerals in 'stage' column info to standardize
    (r'((?:Stage:\s)|(?:stage\s))(\d)', romanize)
    ]
    for i in range(len(data)):
        text = data[i]
        for f in trasform_filters_replace:
            text = re.sub(f[0], f[1], text)
        # convert to lowercase, trim whitespace from beginning,
        # add whitespace at end to capture final column:text pair
        data[i] = text.lower().lstrip().rstrip(',') + '  '
    return data


def get_text(data: np.array) -> np.ndarray:
    '''
    Extracts column:text pairs from the numpy array it's passed using regex and
    returns a numpy array built from those pairs and a dict of columns.
    '''
    rows = []
    columns = {}
    for i in range(len(data)):
        # find column:text pairs for a single row
        records = re.findall(r'(.*?):(.*?)(?:\s{2,})', data[i])
        row = {}
        for j in range(len(records)):
            row[records[j][0]] = records[j][1]  # column->key, text->value

            # update column dictionary for each new column
            if records[j][0] not in columns:
                columns[records[j][0]] = len(columns)
        rows.append(row)  # append row (dict) to rows (list)
    # initialize numpy array (shape: rows X columns) of dtype object (to hold
    # string values) filled with 'None'
    matrix = np.full(shape=(len(rows), len(columns)), fill_value=None,
                     dtype=object)
    for row_idx, row in enumerate(rows):
        for column, col_idx in columns.items():
            # retrieve value from row (dict) using 'column' as key to ensure
            # column:text pair order doesn't affect data integrity
            matrix[row_idx, col_idx] = row.get(column)
    return matrix, columns


def get_area(major: float, minor: float) -> float:
    # formula for area of an ellipse: pi * major/2 * minor/2
    return (np.pi * (major / 2.0) * (minor / 2.0))


def get_perimeter(major: float, minor: float) -> float:
    # divide major/minor by 2 to get semi-major and semi-minor for formula
    eccentricity = 1 - (minor/2.0)**2 / (major/2.0)**2
    return 4*(major/2.0)*special.ellipe(eccentricity)


def get_measurements(data: np.ndarray, columns_dict: dict) -> np.ndarray:
    '''
    Takes the 'wound width' and 'wound length' columns extracted from the
    AssessText column of WoundText and finds the measurements in cm for
    both for each row using regex. Compares both measurements (if found) to
    determine the major axes and minor axes in cm. Uses major/minor axes in cm
    to find values in inches and mm for major/minor axes, area, and perimeter.
    '''
    width_idx = columns_dict.get('wound width')
    length_idx = columns_dict.get('wound length')
    # extract wound measurement columns
    data = (data[:, [width_idx, length_idx]])
    # replace 'None' with an empty string to allow use of re.findall()
    data[data == None] = ''
    pattern = re.compile(r'(\d+\.*\d*)(?=\scm)')  # find measurements in cm
    results = []
    for idx in range(len(data)):
        # indexing 'data' across two columns returns an array
        # array2string() returns a string of the returned array
        match = re.findall(pattern, np.array2string(data[idx, 0:2]))
        results.append(match)
    major_minor_list = []
    for result in results:
        # convert from string to float to perform math operations
        result = [float(num) for num in result]
        if len(result) == 0:
            major = np.NaN
            minor = np.NaN
        elif result[0] >= result[1]:
            major = result[0]
            minor = result[1]
        else:
            major = result[1]
            minor = result[0]
        major_minor_list.append((major, minor))
    matrix = np.full(shape=(len(major_minor_list), 12), fill_value=np.nan,
                     dtype=float)
    for row_idx, row in enumerate(major_minor_list):
        major_cm = row[0]
        minor_cm = row[1]
        if major_cm == 0.0:
            # all measurements will be 0 cm if major is 0 cm
            matrix[row_idx, :] = 0.0
        elif major_cm != np.nan:
            area_cm = round(get_area(major_cm, minor_cm), 2)
            perimeter_cm = round(get_perimeter(major_cm, minor_cm), 2)
            matrix[row_idx, 0] = major_cm
            matrix[row_idx, 1] = minor_cm
            matrix[row_idx, 2] = area_cm
            matrix[row_idx, 3] = perimeter_cm
            matrix[row_idx, 4] = round(major_cm / 2.54, 2)
            matrix[row_idx, 5] = round(minor_cm / 2.54, 2)
            matrix[row_idx, 6] = round(area_cm / 6.452, 2)
            matrix[row_idx, 7] = round(perimeter_cm / 2.54, 2)
            matrix[row_idx, 8] = major_cm * 10
            matrix[row_idx, 9] = minor_cm * 10
            matrix[row_idx, 10] = area_cm * 100
            matrix[row_idx, 11] = perimeter_cm * 10
    return matrix


def to_dataframe(data_text: np.ndarray, columns_dict: dict,
                 data_measurements: np.ndarray):
    '''
    Takes the numpy arrays created from AssessText (data_text and
    data_measurements) and 'Id' and 'Image_Id' (data_file_num), combines them
    into a single array, and converts it to a dataframe.
    '''
    data_total = np.concatenate((data_measurements, data_text),
                                axis=1)
    columns_text = [*columns_dict]
    columns_total = ['w_centimeter_major', 'w_centimer_minor',
                     'w_centimeter_area', 'w_centimeter_perimeter',
                     'w_inch_major', 'w_inch_minor', 'w_inch_area',
                     'w_inch_perimeter', 'w_millimeter_major',
                     'w_millimeter_minor', 'w_millimeter_area',
                     'w_millimeter_perimeter'] + columns_text
    df = pd.DataFrame(data_total, columns=columns_total)
    return df


def get_stage(data: np.ndarray, columns_dict: dict) -> np.ndarray:
    '''
    Removes stage info from 'pressure ulcer' column and, if 'stage' column is
    'None', puts that stage info in it. Removes whitespace and commas from
    'pressure ulcer' column (stage info impacts ability to strip redundant
    punctuation).
    '''
    pattern = re.compile(r'((,\s)|(--))?(((stage)\s\S+)|sdti|nonviable)')
    pressure_ulcer_idx = columns_dict.get('pressure ulcer')
    stage_idx = columns_dict.get('stage')
    count = 0
    for row_idx, value in enumerate(data[:, pressure_ulcer_idx]):
        if value is not None:
            search = re.search(r'((stage)\s\S+)|sdti|nonviable', value)
            if search:  # will return true if re.search returned something
                if data[row_idx, stage_idx] is None:
                    data[row_idx, stage_idx] = search.group()
                    count += 1
                # remove whitespace, periods, and commas (can't remove these
                # until stage info is removed)
                data[row_idx, pressure_ulcer_idx] = \
                    pattern.sub('', value).strip(' .,')
            else:
                # remove whitespace, periods, and commas (can remove b/c there
                # is no stage info
                data[row_idx, pressure_ulcer_idx] = value.strip(' .,')
    return data


def perform_regex(records: pd.DataFrame):
    assess_text = records.apply(lambda x: json.loads(x)['AssessmentText'])
    assess_text_df = transform_text(assess_text)
    data_text, columns_dict = get_text(assess_text)
    data_text = get_stage(data_text, columns_dict)
    data_measurements = get_measurements(data_text, columns_dict)
    return to_dataframe(data_text, columns_dict, data_measurements)