import pandas as pd
import numpy as np
import re


def find_size(data: np.array, text: np.array) -> np.ndarray:
    '''
    Takes two numpy arrays: the first corresponds to 'w_centimeter_area'
    and the second corresponds to 'partial or full thickness' so that it
    first checks if an ulcer's is "healed, resolved wound" before it
    checks of if it's size is "< 4 sq. cm" (healed ulcers and sDTIs both
    describe the wound as 0 sq. cm but one is no longer an active wound).
    '''
    size_dict = {'0': 'healed, resolved wound',
                 '1': 'Length x Width < 4 sq. cm',
                 '2': 'Length x Width 4 to 16 sq. cm',
                 '3': 'Length x Width 16.1 to 36 sq. cm',
                 '4': 'Length x Width 36.1 to 80 sq. cm',
                 '5': 'Length x Width > 80 sq. cm'
                 }

    for i in range(len(data)):
        if text[i] == 'healed, resolved wound':
            data[i] = {0: size_dict['0']}
        elif float(data[i]) < 4:
            data[i] = {1: size_dict['1']}
        elif float(data[i]) >= 4 and float(data[i]) <= 16:
            data[i] = {2: size_dict['2']}
        elif float(data[i]) >= 16.1 and float(data[i]) <= 36:
            data[i] = {3: size_dict['3']}
        elif float(data[i]) >= 36.1 and float(data[i]) <= 80:
            data[i] = {4: size_dict['4']}
        elif float(data[i]) > 80:
            data[i] = {5: size_dict['5']}
    return data


def find_depth(data: np.array) -> np.ndarray:

    depth_dict = {'0': 'healed, resolved wound',
                  '1': 'non-blanchable erythema on intact skin',
                  '2': 'partial thickness skin loss involving epidermis &/or dermis',
                  '3': 'full thickness skin loss involving damage or necrosis of subcutaneous tissue; may extend down to but no through underlying fascia; &/or mixed partial & full thickness &/or layers obscured by granulation tissue',
                  '4': 'obscured by necrosis (score unstageable due to eschar or ssdti)',
                  '5': 'full thickness skin loss with extensive destruction, tissue necrosis or damage to muscle, bone or supporting structures'
                  }

    for i in range(len(data)):
        if data[i] == depth_dict['0']:
            data[i] = {0: depth_dict['0']}
        elif data[i] == depth_dict['1']:
            data[i] = {1: depth_dict['1']}
        elif data[i] == depth_dict['2']:
            data[i] = {2: depth_dict['2']}
        elif data[i] == depth_dict['3']:
            data[i] = {3: depth_dict['3']}
        elif data[i] == depth_dict['4']:
            data[i] = {4: depth_dict['4']}
        elif data[i] == depth_dict['5']:
            data[i] = {5: depth_dict['5']}
    return data


def find_edges(data: np.array) -> np.ndarray:

    edges_dict = {'0': 'healed, resolved wound',
                  '1': 'indistinct, diffuse, none clearly visible',
                  '2': 'distinct, outline clearly visible, attached, even with wound base',
                  '3': 'well-defined, not attached wound base',
                  '4': 'well-defined, not attached to base, rolled under, thickened',
                  '5': 'well-defined, fibrotic, scarred, hyperkeratotic'}

    for i in range(len(data)):
        if data[i] == edges_dict['0']:
            data[i] = {0: edges_dict['0']}
        elif data[i] == edges_dict['1']:
            data[i] = {1: edges_dict['1']}
        elif data[i] == edges_dict['2']:
            data[i] = {2: edges_dict['2']}
        elif data[i] == edges_dict['3']:
            data[i] = {3: edges_dict['3']}
        elif data[i] == edges_dict['4']:
            data[i] = {4: edges_dict['4']}
        elif data[i] == edges_dict['5']:
            data[i] = {5: edges_dict['5']}
    return data


def find_undermining(data: np.array) -> np.ndarray:
    pass
    # array = []
    # for i in range(len(data)):
    #     if data[i][0] == '' and data[i][1] == '':
    #         array[i] = '1'
    #     elif data[i][0] == '<50%' and if '':
    #         array[i] = '1'


def find_necrotic_type(data: np.array) -> np.ndarray:

    necrotic_type_dict = {'1': 'none visible',
                          '2': 'white/grey non-viable tissue &/or non-adherent yellow slough',
                          '3': 'loosely adherent yellow slough',
                          '4': 'adherent, soft, black eschar',
                          '5': 'firmly adherent, hard, black eschar'}

    for i in range(len(data)):
        if data[i] == necrotic_type_dict['1']:
            data[i] = {1: necrotic_type_dict['1']}
        elif data[i] == necrotic_type_dict['2']:
            data[i] = {1: necrotic_type_dict['2']}
        elif data[i] == necrotic_type_dict['3']:
            data[i] = {1: necrotic_type_dict['3']}
        elif data[i] == necrotic_type_dict['4']:
            data[i] = {1: necrotic_type_dict['4']}
        elif data[i] == necrotic_type_dict['5']:
            data[i] = {1: necrotic_type_dict['5']}
    return data


def find_necrotic_amount(data: np.array) -> np.ndarray:

    necrotic_amount_dict = {'1': 'none visible',
                          '2': '< 25% of wound bed covered',
                          '3': '25% to 50% of wound bed covered',
                          '4': '> 50% and < 75% of wound bed covered',
                          '5': '75% to 100% of wound bed covered'}

    for i in range(len(data)):
        text = data[i]

        if text == 'none visible':
            data[i] = {1: necrotic_amount_dict['1']}
        elif text is np.nan:
            text = np.nan
        else:
            str_num = re.sub(r'[^0123456789]', '', text)
            num = int(str_num)
            if num < 25:
                data[i] = {2: necrotic_amount_dict['2']}
            elif num >= 25 and num <= 50:
                data[i] = {3: necrotic_amount_dict['3']}
            elif num > 50 and num <= 75:
                data[i] = {4: necrotic_amount_dict['4']}
            elif num > 75 and num <= 100:
                data[i] = {5: necrotic_amount_dict['5']}
    return data


def find_exudate_type(data: np.array) -> np.ndarray:

    exudate_type_dict = {'1': 'none',
                         '2': 'bloody',
                         '3': 'serosanguineous:thin, watery, pale red/pink',
                         '4': 'serous:thin watery, clear',
                         '5': 'purulent:thin or thick, opaque, tan/yellow, with or without odor'}

    for i in range(len(data)):
        if data[i] == exudate_type_dict['1']:
            data[i] = {1: exudate_type_dict['1']}
        elif data[i] == exudate_type_dict['2']:
            data[i] = {2: exudate_type_dict['2']}
        elif data[i] == exudate_type_dict['3']:
            data[i] = {3: exudate_type_dict['3']}
        elif data[i] == exudate_type_dict['4']:
            data[i] = {4: exudate_type_dict['4']}
        elif data[i] == exudate_type_dict['5']:
            data[i] = {5: exudate_type_dict['5']}
    return data


def find_exudate_amount(data: np.array) -> np.ndarray:

    exudate_amount_dict = {'1': 'none; dry wound',
                           '2': 'scant; wound moist but no observable exudate',
                           '3': 'small',
                           '4': 'moderate',
                           '5': 'large'}

    for i in range(len(data)):
        if data[i] == exudate_amount_dict['1']:
            data[i] = {1: exudate_amount_dict['1']}
        elif data[i] == exudate_amount_dict['2']:
            data[i] = {2: exudate_amount_dict['2']}
        elif data[i] == exudate_amount_dict['3']:
            data[i] = {3: exudate_amount_dict['3']}
        elif data[i] == exudate_amount_dict['4']:
            data[i] = {4: exudate_amount_dict['4']}
        elif data[i] == exudate_amount_dict['5']:
            data[i] = {5: exudate_amount_dict['5']}
    return data


def find_skin_color(data: np.array) -> np.ndarray:

    skin_dict = {'1': 'pink or normal for ethnic group',
                 '2': 'bright red &/or blanches to touch',
                 '3': 'white or grey pallor or hypopigmented',
                 '4': 'dark red or purple &/or non-blanchable',
                 '5': 'black or hyperpigmented'}

    for i in range(len(data)):
        if data[i] == skin_dict['1']:
            data[i] = {1: skin_dict['1']}
        elif data[i] == skin_dict['2']:
            data[i] = {2: skin_dict['2']}
        elif data[i] == skin_dict['3']:
            data[i] = {3: skin_dict['3']}
        elif data[i] == skin_dict['4']:
            data[i] = {4: skin_dict['4']}
        elif data[i] == skin_dict['5']:
            data[i] = {5: skin_dict['5']}
    return data


def find_edema(data: np.array) -> np.ndarray:

    edema_dict = {'1': 'no swelling or edema',
                  '2': 'non-pitting edema extends < 4 cm around wound',
                  '3': 'non-pitting edema extends > = 4 cm around wound',
                  '4': 'pitting edema extends < 4 cm around wound',
                  '5': 'crepitus &/or pitting edema extends > = 4 cm around wound'}

    for i in range(len(data)):
        if data[i] == edema_dict['1']:
            data[i] = {1: edema_dict['1']}
        elif data[i] == edema_dict['2']:
            data[i] = {2: edema_dict['2']}
        elif data[i] == edema_dict['3']:
            data[i] = {3: edema_dict['3']}
        elif data[i] == edema_dict['4']:
            data[i] = {4: edema_dict['4']}
        elif data[i] == edema_dict['5']:
            data[i] = {5: edema_dict['5']}
    return data


def find_induration(data: np.array) -> np.ndarray:

    induration_dict = {'1': 'not present',
                       '2': 'induration < 2 cm around wound',
                       '3': 'induration 2-4 cm extending < 50% around wound',
                       '4': 'induration 2-4 cm extending > = 50% around wound',
                       '5': 'induration > 4 cm in any area around wound'}

    for i in range(len(data)):
        if data[i] == induration_dict['1']:
            data[i] = {1: induration_dict['1']}
        elif data[i] == induration_dict['2']:
            data[i] = {2: induration_dict['2']}
        elif data[i] == induration_dict['3']:
            data[i] = {3: induration_dict['3']}
        elif data[i] == induration_dict['4']:
            data[i] = {4: induration_dict['4']}
        elif data[i] == induration_dict['5']:
            data[i] = {5: induration_dict['5']}
    return data


def find_granulation_tissue(data: np.array) -> np.ndarray:

    granulation_dict = {'1': 'skin intact or partial thickness wound',
                        '2': 'bright, beefy red:75% to 100% of wound filled &/or tissue overgrowth',
                        '3': 'bright, beefy red:< 75% & > 25% of wound filled',
                        '4': 'pink, &/or dull, dusky red &/or fills < = 25% of wound',
                        '5': 'no granulation tissue present (full thickness wounds only)'}

    for i in range(len(data)):
        if data[i] == granulation_dict['1']:
            data[i] = {1: granulation_dict['1']}
        elif data[i] == granulation_dict['2']:
            data[i] = {2: granulation_dict['2']}
        elif data[i] == granulation_dict['3']:
            data[i] = {3: granulation_dict['3']}
        elif data[i] == granulation_dict['4']:
            data[i] = {4: granulation_dict['4']}
        elif data[i] == granulation_dict['5']:
            data[i] = {5: granulation_dict['5']}
    return data


def find_epithelialization(data: np.array) -> np.ndarray:

    ep_dict = {'1': '100% wound covered, surface intact',
               '2': '75% to < 100% wound covered &/or epithelial tissue extends > 0.5 cm into wound bed',
               '3': '50% to < 75% wound covered &/or epithelial tissue extends to < 0.5 cm into wound bed',
               '4': '25% to < 50% of wound covered',
               '5': '< 25% of wound covered'}
               
    for i in range(len(data)):
        if data[i] == ep_dict['1']:
            data[i] = {1: ep_dict['1']}
        elif data[i] == ep_dict['2']:
            data[i] = {2: ep_dict['2']}
        elif data[i] == ep_dict['3']:
            data[i] = {3: ep_dict['3']}
        elif data[i] == ep_dict['4']:
            data[i] = {4: ep_dict['4']}
        elif data[i] == ep_dict['5']:
            data[i] = {5: ep_dict['5']}
    return data


def find_dimensions(data: np.array) -> np.ndarray:

    for i in range(len(data)):
        data[i] = {data[i, 0]}
    return data


def to_dataframe(size: np.ndarray, dims_1: np.ndarray, dims_2: np.ndarray,
                 dims_3: np.ndarray, dims_4: np.ndarray, depth: np.ndarray, edges: np.ndarray,
                 ntype: np.ndarray, namount: np.ndarray, etype: np.ndarray, eamount: np.ndarray, skin: np.ndarray,
                 edema: np.ndarray, ind: np.ndarray, gran: np.ndarray, ep: np.ndarray):
    '''
    Takes the numpy arrays created from AssessText (data_text and
    data_measurements) and 'Id' and 'Image_Id' (data_file_num), combines them
    into a single array, and converts it to a dataframe.
    '''
    size = size.reshape(-1, 1)
    depth = depth.reshape(-1, 1)
    edges = edges.reshape(-1, 1)
    ntype = ntype.reshape(-1, 1)
    namount = namount.reshape(-1, 1)
    etype = etype.reshape(-1, 1)
    eamount = eamount.reshape(-1, 1)
    skin = skin.reshape(-1, 1)
    edema = edema.reshape(-1, 1)
    ind = ind.reshape(-1, 1)
    gran = gran.reshape(-1, 1)
    ep = ep.reshape(-1, 1)
    dims_1 = dims_1.reshape(-1, 1)
    dims_2 = dims_2.reshape(-1, 1)
    dims_3 = dims_3.reshape(-1, 1)
    dims_4 = dims_4.reshape(-1, 1)


    data_total = np.concatenate((size, dims_1, dims_2, dims_3,
                                 dims_4, depth, edges, ntype, namount, etype, eamount,
                                 skin, edema, ind, gran, ep), axis=1)

    columns_total = ['Size', 'Major Axis', 'Minor Axis', 'Area',
                     'Perimeter', 'Depth', 'Edges', 'Necrotic Tissue Type',
                     'Necrotic Tissue Amount', 'Exudate Type', 'Exudate Amount',
                     'Skin Color', 'Peripheral Tissue Edema',
                     'Peripheral Tissue Induration', 'Granulation Tissue',
                     'Epithelialization']
    df = pd.DataFrame(data_total, columns=columns_total)
    return df


def dimensionalize(dimensions: dict) -> dict:
    '''
    Takes wound dimensions (major & minor axes, area, perimeter) in cm (cm^2
    for area) and converts each to in/in^2 and mm/mm^2.
    Example Output:
            "Dimensions": {
                "Major Axis": {
                    "cm": 6.5,
                    "inch": 2.56,
                    "mm": 65.0
                },
                ...
    '''
    for idx, record in enumerate(dimensions):
        for key in record:
            cm_val = dimensions[idx][key]
            inch_val = cm_val / 2.54
            mm_val = cm_val * 10.0
            # if area, then repeat conversion to get dimensions^2
            # i.e., cm^2 -> mm^2: cm * 10.0^2 == cm * 100.0
            if key == 'Area':
                inch_val = inch_val / 2.54
                mm_val = mm_val * 10.0
            dimensions[idx][key] = {"cm": cm_val, "inch": round(inch_val, 2), "mm": round(mm_val,2)}
    return dimensions


def create_scores(records: pd.DataFrame) -> pd.DataFrame:
    recs = records.iloc[:, [0, 1, 2, 3, 19,
                        20, 21, 22, 23, 24,
                        25, 26, 27, 28, 29,
                        30, 31]].to_numpy()

    dims_1 = recs[:, 0]
    dims_2 = recs[:, 1]
    dims_3 = recs[:, 2].copy()
    size = find_size(recs[:, 2], recs[:, 4])
    dims_4 = recs[:, 3]
    depth = find_depth(recs[:, 4])
    edges = find_edges(recs[:, 5])
    #undermining = find_undermining(df[:, 6:7])
    necrotic_type = find_necrotic_type(recs[:, 8])
    necrotic_amount = find_necrotic_amount(recs[:, 9])
    exudate_type = find_exudate_type(recs[:, 10])
    exudate_amount = find_exudate_amount(recs[:, 11])
    skin = find_skin_color(recs[:, 12])
    edema = find_edema(recs[:, 13])
    induration = find_induration(recs[:, 14])
    gran_tissue = find_granulation_tissue(recs[:, 15])
    ep = find_epithelialization(recs[:, 16])

    df = to_dataframe(size, dims_1, dims_2, dims_3, dims_4,
                      depth, edges, necrotic_type, necrotic_amount,
                      exudate_type, exudate_amount, skin, edema,
                      induration, gran_tissue, ep)

    df['Dimensions'] = dimensionalize(df.iloc[:, [1, 2, 3, 4]].to_dict(orient='records'))
    return df
