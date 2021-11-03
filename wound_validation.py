import pandas as pd
import numpy as np
import re
import sys
import xlsxwriter
from time import time


def change_to_underscore(model_df:pd.DataFrame) -> None:
    '''
    Alters the text of the FILE_NUMBERS column from files being XXXXX-XXXXX to XXXXX_XXXXX.
    Needed in order to copmare against other file.
    '''
    file_nums = model_df['FILE_NUMBER']
    new = np.array([])
    
    for file in file_nums:
        file = re.sub(r'-', '_', file)
        new = np.append(new, file)
    
    model_df['FILE_NUMBER'] = new


def lowercase(df: pd.DataFrame, model_df: pd.DataFrame) -> None:
    '''
    Converts column names to lowercase.
    '''
    df.columns = [x.lower() for x in df.columns]
    model_df.columns = [x.lower() for x in model_df.columns]


def get_file_nums(df: pd.DataFrame, model_df: pd.DataFrame) -> np.array:
    '''
    Aggregates the file numbers which match in both files, while dropping all NaN values.
    '''
    file_nums_df = df[df['w_millimeter_major'].notna()]
    file_nums_df = file_nums_df['file_number']
    file_nums_act = np.array(file_nums_df)
    
    file_nums_df2 = model_df[model_df['w_millimeter_major'].notna()]
    file_nums_df2 = file_nums_df2['file_number']
    file_nums_pred = np.array(file_nums_df2)
    
    intersected_files = np.intersect1d(file_nums_act, file_nums_pred)
    intersected_files = np.sort(intersected_files)
    
    return intersected_files


def get_values(df: pd.DataFrame, model_df:pd.DataFrame, intersected_files: np.array) -> np.array:
    '''
    Gets the values which match to the aggregated file numbers from both sets of data.
    '''
 
    #For the actual measurements
    new_df = df[df['file_number'].isin(intersected_files)]
    new_df = new_df.sort_values('file_number')

    act_maj = new_df['w_millimeter_major']
    act_maj = np.array(act_maj)
    act_maj = act_maj[~np.isnan(act_maj)]
    
    act_min = new_df['w_millimeter_minor']
    act_min = np.array(act_min)
    act_min = act_min[~np.isnan(act_min)]
    
    act_area = new_df['w_millimeter_area']
    act_area = np.array(act_area)
    act_area = act_area[~np.isnan(act_area)]
    
    act_perimeter = new_df['w_millimeter_perimeter']
    act_perimeter = np.array(act_perimeter)
    act_perimeter = act_perimeter[~np.isnan(act_perimeter)]

    new_peri = new_df['w_millimeter_perimeter_new']
    new_peri = np.array(new_peri)
    new_peri = new_peri[~np.isnan(new_peri)]
    
    #For the models measurements
    new = model_df[model_df['file_number'].isin(intersected_files)]
    new_df2 = new.sort_values('file_number')
    
    pred_maj = new_df2['w_millimeter_major']
    pred_maj = np.array(pred_maj)
    pred_maj = pred_maj[~np.isnan(pred_maj)]

    pred_min = new_df2['w_millimeter_minor']
    pred_min = np.array(pred_min)
    pred_min = pred_min[~np.isnan(pred_min)]
    
    pred_area = new_df2['w_millimeter_area']
    pred_area = np.array(pred_area)
    pred_area = pred_area[~np.isnan(pred_area)]
    
    pred_perimeter = new_df2['w_millimeter_perimeter']
    pred_perimeter = np.array(pred_perimeter)
    pred_perimeter = pred_perimeter[~np.isnan(pred_perimeter)]

  
        
    return act_maj, act_min, act_area, act_perimeter, pred_maj, pred_min, pred_area, pred_perimeter

    
def calculate_maj_dicts(act_maj: np.array, pred_maj:np.array, intersected_files:np.array) -> dict:
    '''
    Calculates the error, squared error, var(X), MSE, RMSE, rMSE, and R2 for the major measurement.
    '''
    total_length = len(act_maj)
    differences = np.array([])
    squared = np.array([])
    mean = np.mean(act_maj)
    var_x = np.array([])
    
    #Gets differences between actual, estimated values
    for i in range(0, total_length):
        difference = act_maj[i] - pred_maj[i]
        differences = np.append(differences, difference)
       
    #Squares the differences values
    for i in range(0, total_length):
        squared_diff = np.square(differences[i])
        squared = np.append(squared, squared_diff)
              

    #Normalizes the differences    
    norm = squared / np.linalg.norm(squared)
    
    #Calculates the squared_error (sum_squares) and mean square
    sum_squares = np.sum(squared)
    sum_squares_norm = np.sum(norm)
    mean_square = sum_squares/total_length
    mean_square_norm = sum_squares_norm/total_length
    
    #Gets VAR(x)
    for i in range(0, total_length):
        var_x = np.append(var_x, np.square(act_maj[i] - mean))
        
    #Calculates the Root Mean Squared Error
    RMSE = np.sqrt(mean_square)
    
    #Calculates Relative Mean Squared Error
    count_ = (total_length - 1) / total_length
    var = sum_squares / np.sum(var_x)
    rMSE = count_ * var
    
    #Calculates R2
    R2 = 1 - rMSE
                    
    d1 = {'File Number':intersected_files, 'Actual Major (mms)':act_maj, 'Predicted Major (mms)':pred_maj, 'Error':differences, 'Squared Diff.':squared,'VAR(x)':var_x, 'Normalized':norm}
    d2 = {'Squared Error (Major)': sum_squares, 'MSE (Major)':mean_square,'RMSE (Major)':RMSE, 'rMSE (Major)':rMSE, 'R2(Major)': R2, 'Squared Error Norm. (Major)': sum_squares_norm, 'MSE Norm (Major)':mean_square_norm}
    
    return d1, d2


def calculate_min_dicts(act_min: np.array, pred_min:np.array, intersected_files:np.array) -> dict:
    '''
    Calculates the error, squared error, var(X), MSE, RMSE, rMSE, and R2 for the major measurement.
    '''
    total_length = len(act_min)
    differences = np.array([])
    squared = np.array([])
    mean = np.mean(act_min)
    var_x = np.array([])
    
    #Gets differences between actual, estimated values
    for i in range(0, total_length):
        difference = act_min[i] - pred_min[i]
        differences = np.append(differences, difference)
       
    #Squares the differences values
    for i in range(0, total_length):
        squared_diff = np.square(differences[i])
        squared = np.append(squared, squared_diff)
              
    #Normalizes the differences    
    norm = squared / np.linalg.norm(squared)
    
    #Calculates the squared_error (sum_squares) and mean square
    sum_squares = np.sum(squared)
    sum_squares_norm = np.sum(norm)
    mean_square = sum_squares/total_length
    mean_square_norm = sum_squares_norm/total_length
    
    #Gets VAR(x)
    for i in range(0, total_length):
        var_x = np.append(var_x, np.square(act_min[i] - mean))
        
    #Calculates the Root Mean Squared Error
    RMSE = np.sqrt(mean_square)
    
    #Calculates Relative Mean Squared Error
    count_ = (total_length - 1) / total_length
    var = sum_squares / np.sum(var_x)
    rMSE = count_ * var
    
    #Calculates R2
    R2 = 1 - rMSE
        
    d3 = {'File Number':intersected_files, 'Actual Minor (mms)':act_min, 'Predicted Minor (mms)':pred_min, 'Error':differences, 'Squared Diff.':squared,'VAR(x)':var_x, 'Normalized':norm}
    d4 = {'Squared Error (Minor)': sum_squares, 'MSE (Minor)':mean_square,'RMSE (Minor)':RMSE, 'rMSE (Minor)':rMSE, 'R2 (Minor)': R2, 'Squared Error Norm. (Minor)': sum_squares_norm, 'MSE Norm (Minor)':mean_square_norm}
    
    return d3, d4


def calculate_area_dicts(act_area: np.array, pred_area: np.array, intersected_files:np.array) -> dict:
    '''
    Calculates the error, squared error, var(X), MSE, RMSE, rMSE, and R2 for the area measurement.
    '''

    total_length = len(act_area)
    differences = np.array([])
    squared = np.array([])
    mean = np.mean(act_area)
    var_x = np.array([])
    
    #Gets differences between actual, estimated values
    for i in range(0, total_length):
        difference = act_area[i] - pred_area[i]
        differences = np.append(differences, difference)
       
    #Squares the differences values
    for i in range(0, total_length):
        squared_diff = np.square(differences[i])
        squared = np.append(squared, squared_diff)
              

    #Normalizes the differences    
    norm = squared / np.linalg.norm(squared)
    
    #Calculates the squared_error (sum_squares) and mean square
    sum_squares = np.sum(squared)
    sum_squares_norm = np.sum(norm)
    mean_square = sum_squares/total_length
    mean_square_norm = sum_squares_norm/total_length
    
    #Gets VAR(x)
    for i in range(0, total_length):
        var_x = np.append(var_x, np.square(act_area[i] - mean))
        
    #Calculates the Root Mean Squared Error
    RMSE = np.sqrt(mean_square)
    
    #Calculates Relative Mean Squared Error
    count_ = (total_length - 1) / total_length
    var = sum_squares / np.sum(var_x)
    rMSE = count_ * var
    
    #Calculates R2
    R2 = 1 - rMSE
                    
    d5 = {'File Number':intersected_files, 'Actual Area (mms)':act_area, 'Predicted Area (mms)':pred_area, 'Error':differences, 'Squared Diff.':squared,'VAR(x)':var_x, 'Normalized':norm}
    d6 = {'Squared Error': sum_squares, 'MSE':mean_square,'RMSE':RMSE, 'rMSE':rMSE, 'R2': R2, 'Squared Error Norm.': sum_squares_norm, 'MSE Norm':mean_square_norm}
    
    return d5, d6  


def calculate_perimeter_dicts(act_perimeter: np.array, pred_perimeter: np.array, intersected_files:np.array) -> dict:
    '''
    Calculates the error, squared error, var(X), MSE, RMSE, rMSE, and R2 for the perimeter measurement.
    '''
    total_length = len(act_perimeter)
    differences = np.array([])
    squared = np.array([])
    mean = np.mean(act_perimeter)
    var_x = np.array([])
    
    #Gets differences between actual, estimated values
    for i in range(0, total_length):
        difference = act_perimeter[i] - pred_perimeter[i]
        differences = np.append(differences, difference)
       
    #Squares the differences values
    for i in range(0, total_length):
        squared_diff = np.square(differences[i])
        squared = np.append(squared, squared_diff)
              

    #Normalizes the differences    
    norm = squared / np.linalg.norm(squared)
    
    #Calculates the squared_error (sum_squares) and mean square
    sum_squares = np.sum(squared)
    sum_squares_norm = np.sum(norm)
    mean_square = sum_squares/total_length
    mean_square_norm = sum_squares_norm/total_length
    
    #Gets VAR(x)
    for i in range(0, total_length):
        var_x = np.append(var_x, np.square(act_perimeter[i] - mean))
        
    #Calculates the Root Mean Squared Error
    RMSE = np.sqrt(mean_square)
    
    #Calculates Relative Mean Squared Error
    count_ = (total_length - 1) / total_length
    var = sum_squares / np.sum(var_x)
    rMSE = count_ * var
    
    #Calculates R2
    R2 = 1 - rMSE
                    
    d7 = {'File Number':intersected_files, 'Actual Perimeter (mms)':act_perimeter, 'Predicted Perimeter (mms)':pred_perimeter, 'Error':differences, 'Squared Diff.':squared,'VAR(x)':var_x, 'Normalized':norm}
    d8 = {'Squared Error': sum_squares, 'MSE':mean_square,'RMSE':RMSE, 'rMSE':rMSE, 'R2': R2, 'Squared Error Norm.': sum_squares_norm, 'MSE Norm':mean_square_norm}

    return d7, d8


def get_averages(d2: dict, d4: dict) -> dict:
    '''
    Gets averages for the squared Error and MSE Error for both the minor and major axis measurements.
    '''
    avg_ss = (d2['Squared Error (Major)'] + d4['Squared Error (Minor)']) / 2
    avg_mse = (d2['MSE (Major)'] + d4['MSE (Minor)']) / 2
    avg_sns = (d2['Squared Error Norm. (Major)'] + d4['Squared Error Norm. (Minor)']) / 2
    avg_msen = (d2['MSE Norm (Major)'] + d4['MSE Norm (Minor)']) / 2
    
    d9 = {'Avg. Squared Error':avg_ss, 'Avg. MSE':avg_mse, 'Avg. Squared Error (Normalized)':avg_sns, 'Avg. MSE (Normalized)':avg_msen}
    
    return d9


def create_dfs(d1: dict, d2: dict, d3:dict, d4:dict, d5:dict, d6:dict, d7:dict, d8:dict, d9:dict) -> pd.DataFrame:
    '''
    Creates the dataframes which are used to populate the excel file for the information.
    '''
    df = pd.DataFrame(d1)
    df2 = pd.DataFrame(d2, index = [0])
    df3 = pd.DataFrame(d3)
    df4 = pd.DataFrame(d4, index = [0])
    df5 = pd.DataFrame(d5)
    df6 = pd.DataFrame(d6, index = [0])
    df7 = pd.DataFrame(d7)
    df8 = pd.DataFrame(d8, index = [0])
    df9 = pd.DataFrame(d9, index = [0])
    
    return df, df2, df3, df4, df5, df6, df7, df8, df9


def writeToExcel(folder_name: str, filename: str, df:pd.DataFrame, df2:pd.DataFrame, df3:pd.DataFrame, df4:pd.DataFrame, df5:pd.DataFrame,
                 df6:pd.DataFrame, df7:pd.DataFrame, df8:pd.DataFrame, df9:pd.DataFrame) -> None:
    '''
    Outputs data and results to an Excel file (.xlsx). Stylizes for presentation & readablilty.
    '''
    writer = pd.ExcelWriter(folder_name + filename, engine = 'xlsxwriter', options={'nan_inf_to_errors': True})
    df.to_excel(writer, sheet_name = 'MajMin Diagonals', startcol = 0, startrow = 1, header = False)
    df2.to_excel(writer, sheet_name = 'MajMin Diagonals', startcol = 8, startrow = 1, header = False, index = False)
    df3.to_excel(writer, sheet_name = 'MajMin Diagonals', startcol = 15, startrow = 1, header = False)
    df4.to_excel(writer, sheet_name = 'MajMin Diagonals', startcol = 23, startrow = 1, header = False, index = False)
    df5.to_excel(writer, sheet_name = 'Area', startcol = 0, startrow = 1, header = False)
    df6.to_excel(writer, sheet_name = 'Area', startcol = 7, startrow = 1, header = False, index = False)
    df7.to_excel(writer, sheet_name = 'Perimeter', startcol = 0, startrow = 1, header = False)
    df8.to_excel(writer, sheet_name = 'Perimeter', startcol = 7, startrow = 1, header = False, index = False)
    df9.to_excel(writer, sheet_name = 'MajMin Diagonals', startcol = 31, startrow = 1, header = False, index = False)


    workbook  = writer.book
    worksheet = writer.sheets['MajMin Diagonals']
    worksheet.freeze_panes(1, 0)
    worksheet2 = writer.sheets['Area']
    worksheet2.freeze_panes(1,0)
    worksheet3 = writer.sheets['Perimeter']
    worksheet3.freeze_panes(1,0)
    
    header1_format = workbook.add_format({
        'bold': True,
        'text_wrap': True,
        'valign': 'top',
        'fg_color': '#9AE5AA',
        'border': 2})
    header2_format = workbook.add_format({
        'bold': True,
        'text_wrap': True,
        'valign': 'top',
        'fg_color': '#F49E9E',
        'border': 2})
    header3_format = workbook.add_format({
        'bold': True,
        'text_wrap': True,
        'valign': 'top',
        'fg_color': '#DDACF5',
        'border': 2})
    header4_format = workbook.add_format({
        'bold': True,
        'text_wrap': True,
        'valign': 'top',
        'fg_color': '#C1DDE7',
        'border': 2})
    header5_format = workbook.add_format({
        'bold': True,
        'text_wrap': True,
        'valign': 'top',
        'fg_color': '#F7FA82',
        'border': 2})    
    
    text_format = workbook.add_format({'bold': True})
    for col_num, value in enumerate(df.columns.values):
        worksheet.write(0, col_num+1, value, header1_format)
    for col_num, value in enumerate(df2.columns.values):
        worksheet.write(0, col_num + 8, value, header2_format)
    for col_num, value in enumerate(df3.columns.values):
        worksheet.write(0, col_num + 16, value, header3_format)
    for col_num, value in enumerate(df4.columns.values):
        worksheet.write(0, col_num + 23, value, header4_format)
    for col_num, value in enumerate(df9.columns.values):
        worksheet.write(0, col_num + 31, value, header5_format)        
    for i, j in enumerate (df2.values):
        for k, l in enumerate (j):
            worksheet.write(1, k + 8, l, text_format)
    for i, j in enumerate (df4.values):
        for k, l in enumerate (j):
            worksheet.write(1 , k + 23, l, text_format)
    for i, j in enumerate (df9.values):
        for k, l in enumerate (j):
            worksheet.write(1 , k + 31, l, text_format)
            
    for col_num, value in enumerate(df5.columns.values):
        worksheet2.write(0, col_num+1, value, header1_format)
    for col_num, value in enumerate(df6.columns.values):
        worksheet2.write(0, col_num + 8, value, header2_format)
        
    for col_num, value in enumerate(df7.columns.values):
        worksheet3.write(0, col_num+1, value, header1_format)
    for col_num, value in enumerate(df8.columns.values):
        worksheet3.write(0, col_num + 8, value, header2_format)

    
    for i, j in enumerate (df6.values):
        for k, l in enumerate (j):
            worksheet2.write(1, k + 8, l, text_format)
    for i, j in enumerate (df8.values):
        for k, l in enumerate (j):
            worksheet3.write(1, k + 8, l, text_format)
    
    writer.save()    # closes Excel writer and outputs Excel file


def validate(actual_path, predicted_path, folder_name, filename):
        '''
        Takes paths to actual and predicted mask parameters and performs statistical calculations
        to validate the wound measurements. Saves a combined Excel file (.xlsx) of the data and
        results.
        '''
        start_time = time()
        df = pd.read_excel(actual_path)
        model_df = pd.read_excel(predicted_path)
        change_to_underscore(model_df)  # replaces hyphen in file numbers with underscores for compatability
        lowercase(df, model_df)  # converts column names to lowercase
        intersected_files = get_file_nums(df, model_df)  # returns records whose file number appears in the actual and predicted mask parameters
        act_maj, act_min, act_area, act_perimeter, pred_maj, pred_min, pred_area, pred_perimeter = get_values(df, model_df, intersected_files)
        d1, d2 = calculate_maj_dicts(act_maj, pred_maj, intersected_files)
        d3, d4 = calculate_min_dicts(act_min, pred_min, intersected_files)
        d5, d6 = calculate_area_dicts(act_area, pred_area, intersected_files)
        d7, d8 = calculate_perimeter_dicts(act_perimeter, pred_perimeter, intersected_files)
        d9 = get_averages(d2,d4)
        df, df2, df3, df4, df5, df6, df7, df8, df9 = create_dfs(d1, d2, d3, d4, d5, d6, d7, d8, d9)
        writeToExcel(folder_name, filename, df, df2, df3, df4, df5, df6, df7, df8, df9)  # writes data and results to a .xlsx file
        print(time() - start_time)
