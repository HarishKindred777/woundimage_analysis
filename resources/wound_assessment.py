import json
from flask_restful import Resource, reqparse
from models.wound_assessment import WoundAssessmentModel
import numpy as np

'''
NOTE: All methods for a given resource must have the same parameters becasue
they are served by the same URI (i.e., v1/wound-assessment/<string:mrn>).
However, methods can implement query parameters to enable filtering and sorting.
'''

parser = reqparse.RequestParser()
parser.add_argument('mrn')
parser.add_argument('track_item_id')

def convert(o):
    if isinstance(o, np.generic): return o.item()  
    raise TypeError

class WoundAssessment(Resource):

    def get(self):
        args = parser.parse_args()
        records = WoundAssessmentModel.findByMRN(args['mrn'])
        if records:
            # HTTP methods return a flask.Response object whose content-type is
            # "application/json" and whose status code is 200 by default
            return json.loads(json.dumps(records, default=convert)), 200

    def post(self):
        args = parser.parse_args()
        args_dict = {'mrn': args['mrn'], 'track_item_id': args['track_item_id']}
        WoundAssessmentModel.createRecord(args_dict)
