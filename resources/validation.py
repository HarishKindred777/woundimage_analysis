from wound_validation import validate
import pandas as pd
from werkzeug.utils import secure_filename
import os
from flask import Flask, flash, render_template, redirect, url_for, request, send_from_directory, Response


import json
from flask_restful import Resource, reqparse

'''
NOTE: All methods for a given resource must have the same parameters becasue
they are served by the same URI (i.e., v1/wound-assessment/<string:mrn>).
However, methods can implement query parameters to enable filtering and sorting.
'''

parser = reqparse.RequestParser()
parser.add_argument('file')

def write_to_csv(df: pd.DataFrame) -> None:
    '''
    Converts dataframe to csv format and writes it to a .csv file.
    '''
    df_csv = df.to_csv()
    with open('Success.csv', 'w', newline='') as file:
        file.write(df_csv)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class Validation(Resource):

    def get(self):
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            results_folder = "./results/"  # where to save results to
            results_filename = "Wound_Validation.xlsx"  # what to name the results file
            predicted_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)  # path to save predicted mask parameters to
            file.save(predicted_path)  # saves predicted mask parameters (.xlsx file)
            validate("./actual_mask_parameters.xlsx", predicted_path, results_folder, results_filename)  # validates machine learning algorithm's measurements
            return send_from_directory(results_folder, results_filename, as_attachment=True)  # returns results file for user to download