function loadResults(filepath) {
    $.ajax({
        type: 'GET',
        url: filepath,
        success: function(data) {
            fillTable(data)
            $("#upload-btn").val("Upload")
            deleteResults(filepath)
        },
        // if error, then wait 5 seconds and call function again
        error: function() {
            setTimeout(function() { loadResults(filepath) }, 5000);
        }
    });
}

function deleteResults(filepath) {
    $.ajax({
        type: 'DELETE',
        url: filepath
    });
}

// fills table with statistics for each parameter (major diagonal, minor diagonal, area, and perimeter)
function fillTable(data) {
    $.each(data, function(type, data) {  // type is either "major", "minor", "area", or "perimeter"
        for(let j=1; j < 8; j++) {
            let stat = data[0]['stat' + j]  // gets one of seven statistics from data (i.e., Squared Error is "stat1")
            stat = parseFloat(stat).toFixed(4)  // converts from str to float, then rounds to 4 decimal places
            $("#" + type + j).text(stat)  // assigns stat to a table cell (i.e., "#major1")
        }
    })
}

/*
Script takes filename of predicted parameters .xlsx file and specifies filepath
to the validation results .xlsx file
*/
$(document).ready(function() {
    $("#validation-form").submit(function() {
        $("#upload-btn").val("Processing...")
        let filepath = "/results/validation_results.xlsx"
        loadResults(filepath)

    })
})