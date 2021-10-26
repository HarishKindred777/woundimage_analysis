from flask_restful import Resource, reqparse
from models.form import FormModel

# specify arguments to parse from request
parser = reqparse.RequestParser()
parser.add_argument('MRN')
parser.add_argument('JSON')

class Form(Resource):

    def put(self):
        args = parser.parse_args()  # parse arguments from request
        records = FormModel.updateForm(args['MRN'], args['JSON'])  # update form records with new data
