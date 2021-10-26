from db import db

class PatientDetailsModel(db.Model):
	__tablename__ = "PatientDetails"

	Mrn = db.Column(db.String(10), primary_key=True)
	JSON = db.Column(db.String, nullable=True)

	@classmethod
	def find_by_mrn(cls, mrn):
		return cls.query.with_entities(cls.JSON).filter_by(Mrn=mrn).first()
