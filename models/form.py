from db import db
from json import loads, dumps

class FormModel(db.Model):
    __tablename__ = "Form"

    Mrn = db.Column(db.String(10), primary_key=True)
    TrackItemID = db.Column(db.String(10), primary_key=True)
    JSON = db.Column(db.String, nullable=False)

    @classmethod
    def updateForm(cls, Mrn, JSON):
        '''
        If a record exists for patient Mrn then the JSON is updated
        to reflect new form data. Otherwise, a new record is addded.
        '''
        JSON = loads(JSON)
        TrackItemIDs = JSON.keys()
        for ID in TrackItemIDs:
            if cls.query.filter_by(Mrn=Mrn, TrackItemID=ID).first():
                cls.query.filter_by(Mrn=Mrn, TrackItemID=ID).update({"JSON": dumps(JSON[ID])})
            else:
                db.session.add(FormModel(Mrn=Mrn, TrackItemID=ID, JSON=dumps(JSON[ID])))
        db.session.commit()
