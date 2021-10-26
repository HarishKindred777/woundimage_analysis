from db import db
from parse import parse
from models.wound import WoundModel
from models.image_associations import ImageAssociationsModel
from models.protouch_etl import ProTouch_ETLModel
from models.form import FormModel


class WoundAssessmentModel(db.Model):
    __tablename__ = "WoundAssessment"

    Mrn = db.Column(db.String(10), primary_key=True)
    TrackItemID = db.Column(db.Integer, db.ForeignKey('Wound.TrackItemID'), nullable=False)
    AssessmentSentenceId = db.Column(db.Integer, nullable=False)
    JSON = db.Column(db.String, nullable=True)

    wound = db.relationship('WoundModel', lazy='joined')
    img_assoc = db.relationship('ImageAssociationsModel', lazy='joined')
    protouch = db.relationship('ImageAssociationsModel', lazy='joined')

    @classmethod
    def findByMRN(cls, mrn):
        records = (
            cls.query
            .with_entities(cls.Mrn,
                           cls.TrackItemID,
                           cls.AssessmentSentenceId,
                           ImageAssociationsModel.Id,
                           ImageAssociationsModel.Image_Id,
                           ImageAssociationsModel.Facility_Id,
                           cls.JSON,
                           WoundModel.JSON,
                           FormModel.JSON
                           )
            .join(WoundModel, cls.TrackItemID == WoundModel.TrackItemID)
            .join(ImageAssociationsModel, (cls.TrackItemID == ImageAssociationsModel.TrackedItemId)
                                           & (cls.AssessmentSentenceId == ImageAssociationsModel.AssessmentSentenceID)
                                           & (cls.Mrn == ImageAssociationsModel.Mrn))
            .outerjoin(FormModel, (cls.Mrn == FormModel.Mrn) & (cls.TrackItemID == FormModel.TrackItemID))
            .filter(cls.Mrn == mrn)
            .all())
        if len(records) < 1:
            return records
        return parse(records)

    @classmethod
    def createRecord(cls, args_dict):
        db.session.add(WoundAssessmentModel(Mrn=args_dict['mrn'], JSON=None, AssessmentSentenceId='1^100', TrackItemID=args_dict['track_item_id']))
        db.session.commit()