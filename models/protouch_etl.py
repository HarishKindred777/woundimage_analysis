from db import db
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER, INTEGER, SMALLDATETIME, NCHAR, BIT, NVARCHAR


class ProTouch_ETLModel(db.Model):
	__tablename__ = "ProTouch_ETL"

	Row_ID = db.Column(INTEGER, primary_key=True, nullable=False)
	Facility_Name = db.Column(NCHAR(255), nullable=False)
	Facility_Id = db.Column(INTEGER, nullable=False)
	PatientID = db.Column(INTEGER, nullable=False)
	MRN = db.Column(NCHAR(10), nullable=False)
	TrackedItemId = db.Column(NVARCHAR(10), nullable=False)
	# Last_ETL_token = db.Column(UNIQUEIDENTIFIER, nullable=True)
	# Last_ETL_dateTime = db.Column(SMALLDATETIME, nullable=True)
	# Last_ETL_status = db.Column(BIT, nullable=True)
	# Last_ETL_message = db.Column(NVARCHAR(255), nullable=True)

	# wound = db.relationship('WoundModel', lazy='joined')
	# assessment = db.relationship('WoundAssessmentModel', lazy='joined')