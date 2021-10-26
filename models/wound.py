from db import db
import pandas as pd
import re

class WoundModel(db.Model):
    __tablename__ = "Wound"

    Mrn = db.Column(db.String(10), primary_key=True)
    TrackItemID = db.Column(db.Integer, nullable=False)
    JSON = db.Column(db.String, nullable=True)

    @classmethod
    def woundFreq(cls):
        '''The below is for when we query the database'''
        # records_dict = cls.query.with_entities(cls.JSON).limit(1000)
        path_to_csv = r'C:\Users\Nick\wound_location_data.csv'
        records_df = pd.read_csv(path_to_csv, header=0, names=['pressure ulcer'])
        records_df.columns = ['WoundLocation']
        '''The below is for when we query the database'''
        # records_df = pd.DataFrame(records_dict, columns=['WoundJSON'])
        # records_df['WoundLocation'] = records_df.WoundJSON.apply(lambda x: re.search('\"WoundLocation\":\"([A-Za-z0-9,\s]*)\"', x).group(1))
        wound_freq_df = records_df.WoundLocation.value_counts().reset_index().head(10)
        wound_freq_df.columns = ['WoundLocation', 'Count']
        x_values = list(wound_freq_df.WoundLocation.values)
        y_values = list(wound_freq_df.Count.astype('str').values)
        results_dict = {'x_values': x_values, 'y_values': y_values}
        return results_dict

    @classmethod
    def createRecord(cls, args_dict):
        db.session.add(WoundModel(Mrn=args_dict['mrn'], JSON=None, TrackItemID=args_dict['track_item_id']))
        db.session.commit()