import pandas as pd
from json import dumps, loads

def process(file_url):
        '''
        Takes paths to actual and predicted mask parameters and performs statistical calculations
        to validate the wound measurements. Saves a combined Excel file (.xlsx) of the data and
        results.
        '''
        xls = pd.ExcelFile(file_url)
        names = ['index', 'stat1', 'stat2', 'stat3', 'stat4', 'stat5', 'stat6', 'stat7']
        major = pd.read_excel(xls, 0, nrows=1, index_col=0, usecols=[0, 8, 9, 10, 11, 12, 13, 14], names=names).to_dict(orient="records")  # major diagonal
        minor = pd.read_excel(xls, 0, nrows=1, index_col=0, usecols=[15, 23, 24, 25, 26, 27, 28, 29], names=names).to_dict(orient="records")  # minor diagonal
        area = pd.read_excel(xls, 1, nrows=1, index_col=0, usecols=[0,8,9,10,11,12,13,14], names=names).to_dict(orient="records")  # area
        perimeter = pd.read_excel(xls, 2, nrows=1, index_col=0, usecols=[0,8,9,10,11,12,13,14], names=names).to_dict(orient="records")  # perimeter
        data = {"major": major, "minor": minor, "area": area, "perimeter": perimeter}
        return loads(dumps(data))