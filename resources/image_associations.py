from flask_restful import Resource, reqparse
from models.image_associations import ImageAssociationsModel


parser = reqparse.RequestParser()
parser.add_argument('mrn')
parser.add_argument('facility_name')
parser.add_argument('track_item_id')

class ImageAssociations(Resource):
    
    def post(self):
        args = parser.parse_args()
        args_dict = {'mrn': args['mrn'], 'facility_name': args['facility_name'], 'track_item_id': args['track_item_id']}
        ImageAssociationsModel.createRecord(args_dict)
