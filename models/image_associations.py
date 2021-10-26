from db import db
from sqlalchemy import func

facility_dict = {'Sycamore': 1, 'Tampa': 2}

class ImageAssociationsModel(db.Model):
    __tablename__ = "ImageAssociations"

    Id = db.Column(db.Integer, primary_key=True)
    Image_Id = db.Column(db.Integer, nullable=False)
    Facility_Id = db.Column(db.Integer, nullable=False)
    Mrn = db.Column(db.String(10), nullable=False)
    Encounter = db.Column(db.String(12), nullable=True)
    TrackedItemId = db.Column(db.Integer, db.ForeignKey('Wound.TrackItemID'), nullable=False)
    AssessmentSentenceID = db.Column(db.Integer, db.ForeignKey('WoundAssessment.AssessmentSentenceId'), nullable=False, autoincrement=True)

    wound = db.relationship('WoundModel', lazy='joined')
    assessment = db.relationship('WoundAssessmentModel', lazy='joined')

    @classmethod
    def createRecord(cls, args_dict):

        # if cls.query.filter_by(Mrn=args_dict['mrn'], Facility_Id=args_dict['facility_id'], TrackedItemId=args_dict['track_item_id']).first():
        # NOTE: Could set Image_Id column to primary key and set to auto increment
        image_id= db.session.query(func.max(cls.Image_Id)).first()[0] + 1  # increment max Image_Id by 1 for the new Image_Id
        db.session.add(ImageAssociationsModel(Image_Id=image_id, Mrn=args_dict['mrn'], Facility_Id=facility_dict[args_dict['facility_name']], TrackedItemId=args_dict['track_item_id'], AssessmentSentenceID='1^100', Encounter='1'))
        db.session.commit()
