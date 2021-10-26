import json
from flask_restful import Resource, reqparse
from models.wound import WoundModel

'''
NOTE: All methods for a given resource must have the same parameters becasue
they are served by the same URI (i.e., v1/wound-assessment/<string:mrn>).
However, methods can implement query parameters to enable filtering and sorting.
'''

parser = reqparse.RequestParser()
parser.add_argument('mrn')
parser.add_argument('track_item_id')

class Wound(Resource):
    def get(self):
        records = WoundModel.woundFreq()
        return json.loads(json.dumps(records)), 200

    def post(self):
        args = parser.parse_args()
        args_dict = {'mrn': args['mrn'], 'track_item_id': args['track_item_id']}
        WoundModel.createRecord(args_dict)