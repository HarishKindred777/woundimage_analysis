from wound_sheet import create_scores
from regex import perform_regex
import pandas as pd
import re


def parse(records_dict):
    '''
    Takes a dict of records, parses for necessary data, transforms
    it through regex and other methods, and returns a JSON of the
    records.
    '''
    result_df = pd.DataFrame(records_dict, columns=['Mrn', 'TrackItemID', 'AssessmentSentenceId', 'Id', 'Image_Id', 'Facility_Id', 'AssessmentJSON', 'WoundJSON', 'FormJSON'])
    records = perform_regex(result_df.AssessmentJSON)
    records = create_scores(records)
    records['DerivedStatus'] = result_df.WoundJSON.apply(lambda x: re.search('\"DerivedStatus\":\"([A-Za-z]*)\"', x).group(1))
    records['TrackedItemType'] = result_df.WoundJSON.apply(lambda x: re.search('\"TrackedItemType\":\"([A-Za-z,\s]*)\"', x).group(1))
    records['WoundLocation'] = result_df.WoundJSON.apply(lambda x: re.search('\"WoundLocation\":\"([A-Za-z0-9,\s]*)\"', x).group(1))
    records['WoundFullText'] = result_df.WoundJSON.apply(lambda x: re.search('\"WoundFullText\":\"([A-Za-z0-9,\s]*)\"', x).group(1))
    records['DateTime'] = result_df.AssessmentJSON.apply(lambda x: re.search('\"AssessmentDateTime\":\"([0-9\/:\s]*)\"', x).group(1))
    result_df['File_Number'] = result_df['Id'].astype(str) + '_' + result_df['Image_Id'].astype(str)
    df = pd.concat([result_df[['TrackItemID', 'AssessmentSentenceId', 'File_Number', 'FormJSON']], records], axis=1)
    df = df[['TrackItemID', 'AssessmentSentenceId', 'DerivedStatus', 'File_Number', 'DateTime', 'TrackedItemType',
             'WoundLocation', 'WoundFullText', 'Size', 'Dimensions', 'Depth', 'Edges', 'Necrotic Tissue Type',
             'Necrotic Tissue Amount', 'Exudate Type', 'Exudate Amount', 'Skin Color', 'Peripheral Tissue Edema',
             'Peripheral Tissue Induration', 'Granulation Tissue', 'Epithelialization', 'FormJSON']]

    df['DateTime'] = pd.to_datetime(df.DateTime)
    df = df.sort_values(by=['TrackItemID', 'DateTime'], ignore_index=True)
    df['DateTime'] = df.DateTime.astype(str)
    records_json = {"MRN": result_df.iloc[0, 0], "Facility": result_df.iloc[0, 5], "AdmitDate": "N/A", "Assessments": []}
    records_dict = df.to_dict(orient='records')
    for record in records_dict:
        records_json['Assessments'].append(record)
    return records_json
