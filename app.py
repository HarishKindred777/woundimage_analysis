''' website/API base components '''
import flask
from flask import Flask, flash, render_template, redirect, url_for, request, send_from_directory, Response, abort
from werkzeug.utils import secure_filename
import os
from flask_restful import Api
from flask_mail import Mail, Message
import pandas as pd
from wound_validation import validate
from process import process

'''
user-based interface components
NOTE: UNCOMMENT BELOW TO IMPLEMENT USER-BASED INTERFACE
'''

# from flask_bcrypt import Bcrypt
# from flask_login import LoginManager, login_user, current_user, logout_user
# from models.users import User_Model
# from resources.forms import RegistrationForm, LoginForm


''' website/API database instance '''
from db import db

''' resources for interacting with backend '''
from resources.wound_assessment import WoundAssessment
from resources.image_associations import ImageAssociations
from resources.patient_details import PatientDetails
from resources.wound import Wound
from resources.form import Form

UPLOAD_FOLDER = './uploads'  # place uploaded files here (delete after use)
ALLOWED_EXTENSIONS = {'xlsx', 'csv'}  # add extension for files to be uploaded

app = flask.Flask(__name__)

@app.before_first_request
def create_tables():
	# if a table does not exist in the database, then it's created based on models
    db.create_all()
    
''' NOTE: UNCOMMENT BELOW TO IMPLEMENT USER-BASED INTERFACE'''
# bcrypt = Bcrypt(app)
# login_manager = LoginManager(app)


''' NOTE: UNCOMMENT BELOW TO IMPLEMENT USER-BASED INTERFACE'''
app.config['SECRET_KEY'] = 'ee3b0559cf7a77b13b2c3d5881ef233a'

app.config.update(
    # GENERAL SETTINGS
    DEBUG=True,
    JSON_SORT_KEYS=False,  # prevents returned JSON keys from being sorted alphabetically
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    # EMAIL SETTINGS
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS = True,
    MAIL_USE_SSL = False,
    MAIL_USERNAME = 'woundtesting@gmail.com',
    MAIL_PASSWORD = 'LZ*h%paKy7s9AD',
    # FILE UPLOAD SETTINGS
    UPLOAD_FOLDER=UPLOAD_FOLDER
)

mail = Mail(app)

'''
Change server_name and database_name for your specific
machine before attempting to run app
'''
from urllib import parse 
connecting_string = 'Driver={ODBC Driver 13 for SQL Server};Server=tcp:woundimageanalysis-server.database.windows.net,1433;Database=woundapi;Uid=woundimageanalysis-server-admin;Pwd={4R362AH3ROV4GGGV$};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30'
params = parse.quote_plus(connecting_string)
app.config['SQLALCHEMY_DATABASE_URI'] = "mssql+pyodbc:///?odbc_connect=%s" % params

<<<<<<< HEAD
=======

>>>>>>> a2064ec1c2b0384b146a12e07837fa5fe9e44495
##server_name = 'Beanz\TEW_SQLEXPRESS'
##database_name = 'wound_api'
##app.config['SQLALCHEMY_DATABASE_URI'] = f'mssql+pyodbc://{server_name}/{database_name}?driver=SQL+Server'


''' NOTE: Uncomment below block of code to allow Cross-Origin Resource Sharing (CORS) '''
from flask_cors import CORS
CORS(app) # Using default arguments; consider limiting to certain resources in production

api = Api(app, catch_all_404s=True)  # allows us to easily add resources to api


# add resources to API and specifies their URL
api.add_resource(WoundAssessment, '/v1/wound-assessment')
api.add_resource(Wound, '/v1/wound')
api.add_resource(PatientDetails, '/v1/patient-details')
api.add_resource(ImageAssociations, '/v1/image-associations')
api.add_resource(Form, '/v1/form')


# @login_manager.user_loader
# def load_user(user_id):
#   return User_Model.query.get(int(user_id))


'''
landing page for website
NOTE: UNCOMMENT BELOW TO IMPLEMENT USER-BASED INTERFACE
'''
@app.route('/', methods=['GET', 'POST'])
def register():
    # if current_user.is_authenticated:
    return redirect(url_for('dashboard'))
    # form = RegistrationForm()
    # if form.validate_on_submit():
    #   hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
    #   user = User_Model(email=form.email.data, password=hashed_password)
    #   db.session.add(user)
    #   db.session.commit()
    #   flask.flash(f'Sweet! {form.email.data}', 'success')
    #   return redirect(url_for('login'))
    # return flask.render_template('register.html', title='Create Account', form=form)


''' NOTE: UNCOMMENT BELOW TO IMPLEMENT USER-BASED INTERFACE'''
# @app.route('/login/', methods=['GET', 'POST'])
# def login():
#   if current_user.is_authenticated:
#       return redirect(url_for('dashboard'))
#   form = LoginForm()
#   if form.validate_on_submit():
#       user = User_Model.query.filter_by(email=form.email.data).first()
#       if user and bcrypt.check_password_hash(user.password, form.password.data):
#           login_user(user, remember=form.remember.data)
#           return redirect(url_for('dashboard'))
#       else:
#           flask.flash('Login Unsuccessful. Please check email and password', 'danger')
#   return flask.render_template('login.html', title='Login', form=form)


''' NOTE: UNCOMMENT BELOW TO IMPLEMENT USER-BASED INTERFACE'''
# @app.route("/logout")
# def logout():
#   logout_user()
#   return redirect(url_for('register'))


@app.route('/email-data', methods=['GET', 'POST'])
def email():
    error = None
    if request.method == 'POST':
        email = request.form['email']
        if email == "":
            error = "No email entered, try again."
        else:
            msg = Message(
                    'Data Requested',
                    sender ='woundtesting@gmail.com',
                    recipients = email.split()
            )
            msg.body = 'Requested data from the Kindred Wound Database'
            msg.html = render_template('export.html')
            mail.send(msg)
            return flask.render_template('kindred_form.html')
    else:
        return flask.render_template('email.html')


@app.route('/kindred-form/', methods=['GET'])
def kindred():
    return flask.render_template('kindred_form.html')


@app.route('/body-form/', methods=['GET'])
def body():
    return flask.render_template('body_avatar.html')


@app.route('/dashboard/', methods=['GET', 'POST'])
def dashboard():
    # form = LoginForm()
    # if not current_user.is_authenticated:
    #   return redirect(url_for('register'))
    return flask.render_template('dashboard.html')


@app.route('/results/<filename>', methods=['GET', 'DELETE'])
def results(filename):
    '''
    Access to the validation results file.

    GET: If validation results file exists, then process it and return validation
    results. Else, return 404 error.
    DELETE: Deletes validation results file.
    '''
    if request.method == 'GET':
        filename = "./results/" + filename
        if os.path.isfile(filename):
            return process(filename)
        abort(404)
    if request.method == 'DELETE':
        filename = "./results/" + filename
        os.remove(filename)
        return "File deleted", 200


def fileAllowed(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/validation/', methods=['GET', 'POST'])
def validation():
    '''
    Takes user-uploaded predicted parameter, validates a file is passed and that
    it's allowed (.csv or .xlsx), and performs validation on it. The path to the
    predicted parameters file is saved to the ./uploads folder to be accessed by
    validate(). Returns validation results for the user to save.
    '''
    if request.method == 'POST':
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if fileAllowed(file.filename):
            filename = secure_filename(file.filename)
            results_save_folder = "./results/"
            results_filename = "validation_results.xlsx"
            predicted_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)  # path to save predicted mask parameters to
            file.save(predicted_path)  # saves predicted mask parameters (.xlsx file)
            validate("./actual_mask_parameters.xlsx", predicted_path, results_save_folder, results_filename)  # validates machine learning algorithm's measurements
            return send_from_directory(results_save_folder, results_filename, as_attachment=True)  # returns results file for user to download
        else:
            flash('Filetype not allowed. Select .csv or .xlsx (i.e., an Excel file)')
            return redirect(request.url)
    if request.method == 'GET':
        return flask.render_template('validation.html')

# @app.route('/history/', methods=['GET', 'POST'])
# def history():
#     return flask.render_template('history.html')


if __name__ == '__main__':
    db.init_app(app)
    # can also set app.config["DEBUG"] = True
    app.run(debug=True)  # while debug=True, any changes to the program trigger Flask to reload it
