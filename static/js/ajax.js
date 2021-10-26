class MapPlus extends Map {
    // creates a map with a built-in method to convert to JSON
    toJSON() {
        var object = { };
        for (let [key, value] of this) object[key] = value;
        return object;
    }
}


let data_dict = new MapPlus();
let history_json = new MapPlus();
let csvData = [];
let currWnd = null;
let currIdx = 0;
let dataLength = null;
const score_parameters_1 = [new RegExp('^[0-5]$'), "Score must be between 0 and 5"]
const score_parameters_2 = [new RegExp('^[1-5]$'), "Score must be between 1 and 5"]
const size_parameters = [new RegExp('^[0-9]{0,2}(\\.[0-9]{0,2})?$'), "Size must be between 0.0 and 99.9 (cm²)"]
const undermining_parameters = [new RegExp('^[0-9]{0,1}(\\.[0-9]{0,2})?$'), "Undermining must be between 0.00 and 9.99 (cm)"]


function resetForm() {
    resetHistory()
    resetTextBoxes()
    resetLocationCheckboxes("all")
    resetShapeCheckboxes("all")
    resetEtiologyCheckboxes("all")
    resetTreatmentCheckboxes("all")
    $(".selection").css("text-decoration", "none")  // resets selections (assessments & stages)
}


function resetHistory() {
    history_json = new MapPlus();
    console.log(history_json);
}


function resetTextBoxes() {
    $(".text-box").hide()
    $(".text-value").show()
    $(".text-value").attr("title", null)  // remove tooltip
    $(".text-value").css("border-bottom", "0px") // remove tooltip
    // reset text
    $("#location-other-text").text("Other: Site")
    $("#shape-other-text").text("Other: Shape")
    $("#etiology-other-text").text("Other: Etiology")
    for (let num = 1; num < 5; num++) $("#eval-" + num + "-other-text").text("Other")
}

const locations = ['sacrum', 'trochanter', 'ischial_tuberosity', 'medial_ankle', 'lateral_ankle', 'heel'];
const shapes = ['irregular', 'bowl', 'round', 'linear', 'square'];
const etiologies = ['pressure', 'dehiscence', 'venous', 'mixed', 'arterial'];
const treatments = ["maintain", "progress", "prepare"]

function resetLocationCheckboxes(set_loc) {
    locations.forEach( function(loc) {
        if (loc != set_loc) $("#" + loc).prop("checked", false);
    });
    if (set_loc != 'location-other-checkbox') {
        $("#location-other-checkbox").prop("checked", false)
        $("#location-other-input").hide()
        $("#location-other-text").show()
    }
}

function resetShapeCheckboxes(set_shape) {
    shapes.forEach( function(shape) {
        if (shape != set_shape) $("#" + shape).prop("checked", false);
    });
    if (set_shape != 'shape-other-checkbox') {
        $("#shape-other-checkbox").prop("checked", false)
        $("#shape-other-input").hide()
        $("#shape-other-text").show()
    }
}

function resetEtiologyCheckboxes(set_eti) {
    etiologies.forEach( function(eti) {
        if (eti != set_eti) $("#" + eti).prop("checked", false);
    });
    if (set_eti != 'etiology-other-checkbox') {
        $("#etiology-other-checkbox").prop("checked", false)
        $("#etiology-other-input").hide()
        $("#etiology-other-text").show()
    }
}

function resetTreatmentCheckboxes(set_treat, week_num) {
    treatments.forEach( function(treat) {
        treat += "-" + week_num
        if (treat != set_treat) $("#" + treat).prop("checked", false);
    });
    if (set_treat != "eval-" + week_num + "-other-checkbox") {
        $("#eval-" + week_num + "-other-checkbox").prop("checked", false)
        $("#eval-" + week_num + "-other-input").hide()
        $("#eval-" + week_num + "-other-text").show()
    }
}

function selectWound(option) {
    currWnd = option;
    currIdx = 0;
    dataLength = data_dict.get(currWnd).length
    // UNCOMMEnt BELOW: For testing previous and next form buttons
    // dataLength = 9

    resetTextBoxes() // resets form to be populated with new data
    $(".selection").css("text-decoration", "none")  // resets selections (i.e., stage)
    $("input[type=checkbox]").prop("checked", false) // unchecks checkboxes

    $("#btn-previous").hide()
    if (dataLength > 4) $("#btn-next").show()
    else $("#btn-next").hide()
    fillForm();
}


function buildDropdownMenu(options) {
  let menu = document.getElementById("wound-dropdown-menu");
  let menuLength = menu.options.length;
  if (menuLength > 0) {
    $("#wound-dropdown-menu").empty();
  }

  for (let j = 0; j < options.length; j++) {
      let option = options[j];
      let optionElement = document.createElement("option");
      optionElement.setAttribute("id", "option-" + j)
      optionElement.textContent = "Wound " + (j + 1)
      optionElement.value = option
      menu.appendChild(optionElement)
      }
  }

  const assessTypes = ["adm", "dress", "wkly", "dc"];
  const stageTypes = ["stgI", "stgII", "stgIII", "stgIV", "nd", "nt", "sdti"];

  function selectType(type, num) {
      // Underline selected Assessment Type or Stage Type and remove
      // underline from the other types of the same category
      let id = type + num;
      let types = ""
      if ($.inArray(type, assessTypes) != -1) {
            types = assessTypes
            history_json.get(currWnd).get("assessments")[num] = id;
      } else {
            types = stageTypes;
            history_json.get(currWnd).get("stages")[num] = id;
        }
      $("#" + id).css("text-decoration", "underline")
      $.each(types, function(index, type2) {
          id2 = type2 + num;
          if (id != id2) {
              $("#" + id2).css("text-decoration", "none")
          }
      });
  }


function formatDate(datetime) {
    // formats raw date (YYYY-MM-DD) to MM/DD/YYYY
    let date = datetime.substring(0, 10)
    let month = date.substring(5, 7);
    let day = date.substring(8, 10);
    let year = date.substring(0, 4);
    return month + "/" + day + "/" + year
}


function findWounds(data) {
    let wounds = []
    for (var i = 0; i < data.length; i++) {
      let wound = data[i]["TrackItemID"];
      if ($.inArray(wound, wounds) == -1) wounds.push(wound);
    }
    return wounds;
}

function getScore(data) {
    return parseInt(Object.keys(data))
}


function findTotalScore(data) {
    temp = Object.values(data).slice(8, 21)  // get values for each category
    temp.splice(1, 1)
    scores = Object.values(temp)  // get score under each category
    let total_score = 0
    scores.forEach(function(score) {
        total_score += getScore(score)
    })
    return total_score
}

function buildHistoryJSON(wound, json) {
    console.log(json)
    history_json.set(wound, new MapPlus())
    json = JSON.parse(json)
    history_json.get(wound).set("location", json["location"])
    history_json.get(wound).set("shape", json["shape"])
    history_json.get(wound).set("etiology", json["etiology"])
    history_json.get(wound).set("assessments", json["assessments"])
    history_json.get(wound).set("stages", json["stages"])
    history_json.get(wound).set("eval", json["eval"])
    history_json.get(wound).set("treatment", json["treatment"])

    // unclear what this is meant to do - Nick
    locc = history_json.get(wound).set("location", json["location"]);
    $('#history-block').append(locc);
}


function parseData(data) {
    if (data === null) {
        return
    }
    else {
        data_dict.clear()
        // $("#mrn").text(data["MRN"]);
        // $("#facility").text(data["Facility"]);
        // $("#admitDate").text(data["admitDate"]);
        data = data["Assessments"];
        wounds = findWounds(data);
        currWnd = wounds[0]
        buildDropdownMenu(wounds)
        let num = 0
        let assessNum = 1
        for (var i = 0; i < wounds.length; i++) {
          let dataArray = []
          wound = data[num]["TrackItemID"]
          if (data[num]["FormJSON"]) {
              buildHistoryJSON(wound, data[num]['FormJSON'])
          } else {
              history_json.set(wound, new MapPlus());
              history_json.get(wound).set("location", "");
              history_json.get(wound).set("shape", "");
              history_json.get(wound).set("etiology", "");
              history_json.get(wound).set("assessments", {});
              history_json.get(wound).set("stages", {});
              history_json.get(wound).set("eval", {});
              history_json.get(wound).set("treatment", {});
          }
          do {
            if (wound != data[num]["TrackItemID"]) {
                assessNum = 1
                break;
            }
            let innerArray = []
            if (history_json.get(wound).get("assessments")[assessNum]) void(0);
            else {
                history_json.get(wound).get("assessments")[assessNum] = ""
                history_json.get(wound).get("stages")[assessNum] = "";
                history_json.get(wound).get("eval")[assessNum] = {"text": "", "signature": "", "time": "", "date": ""}
                history_json.get(wound).get("eval")[assessNum] = ""
                history_json.get(wound).get("treatment")[assessNum] = ""
            }
            innerArray.push(data[num]["DateTime"])
            innerArray.push(data[num]["WoundLocation"])
            innerArray.push(data[num]["Dimensions"]["Area"]["cm"])
            innerArray.push(data[num]["Size"])
            innerArray.push(data[num]["Depth"])
            innerArray.push(data[num]["Edges"])
            innerArray.push(data[num]["Necrotic Tissue Type"])
            innerArray.push(data[num]["Necrotic Tissue Amount"])
            innerArray.push(data[num]["Exudate Type"])
            innerArray.push(data[num]["Exudate Amount"])
            innerArray.push(data[num]["Skin Color"])
            innerArray.push(data[num]["Peripheral Tissue Edema"])
            innerArray.push(data[num]["Peripheral Tissue Induration"])
            innerArray.push(data[num]["Granulation Tissue"])
            innerArray.push(data[num]["Epithelialization"])
            innerArray.push(findTotalScore(data[num]))
            dataArray.push(innerArray)
            num++
            assessNum++
            } while (num < data.length);
          data_dict.set(wound, dataArray);
          findLocation(wound)
          csvData = dataArray;
          }
        }
    dataLength = data_dict.get(currWnd).length;
    // UNCOMMENT BELOW: For testing previous and next form buttons
    // dataLength = 9
    $("#wound-dropdown-menu").show()
    if (dataLength > 4) $("#btn-next").show()
  }


function findLocation(wound) {
    // Checks the checkbox for the corresponding location if wound location
    // is found. Otherwise, checks the "Other: Site" checkbox.

    if (history_json.get(wound).get("location") == "") {
        let new_loc = data_dict.get(wound)[0][1].toLowerCase();
        new_loc = new_loc.split(' ').join('_')
        for (let i = 0; i < 6; i++) {
            let loc = locations[i];
            if (new_loc.includes(loc)) {
                history_json.get(wound).set("location", loc);
                return;
            }
        }
        history_json.get(wound).set("location", new_loc)
    }
}

function setTooltip(text, type, char_limit=5) {
    // Creates a tooltip (technically uses "title" attribute) if text is
    // greater than 10 characters
    let copy_text = text
    if (type != "location") char_limit = 20
    if (text.length > char_limit) {
        copy_text = text.slice(0, char_limit) + "..."
        $("#" + type + "-other-text").attr("title", text)
        $("#" + type + "-other-text").css("border-bottom", "1px dotted black")
    }
    $("#" + type + "-other-text").text(copy_text)
}


function deleteTooltip(type) {
    // deletes tooltip and removes formatting
    $("#" + type + "-other-text").attr("title", null)
    $("#" + type + "-other-text").css("border-bottom", "0px dotted black")
}

function setCheckbox(value, type, week_num=null) {
    // sets checkbox for location/shape/etiology
    let checkboxes;
    let finished = false;
    if (type == 'location') {
        $.each(locations, function(index, location) {
            let regex = new RegExp(location)
            regex_value = value.replace(/ /g,"_");
            if (regex.test(regex_value)) {
                $("#" + location).prop("checked", true);
                finished = true
            }
        });
        if (!finished) {
            $("#location-other-checkbox").prop("checked", true)
            setTooltip(value, "location")
            return;
        }
    }

    if (type == 'shape') {
        $.each(shapes, function(index, shape) {
            let regex = new RegExp(shape)
            if (regex.test(value)) {
                $("#" + shape).prop("checked", true);
                finished = true
            }
        });
        if (!finished) {
            $("#shape-other-checkbox").prop("checked", true)
            setTooltip(value, "shape")
            return;
        }
    }

    if (type == 'etiology') {
        $.each(etiologies, function(index, etiology) {
            let regex = new RegExp(etiology)
            console.log(regex.test(value))
            if (regex.test(value)) {

                $("#" + etiology).prop("checked", true);
                finished = true
            }
        });
        if (!finished) {
            $("#etiology-other-checkbox").prop("checked", true)
            setTooltip(value, "etiology")
            return;
        }
    }

    if (type == 'treatment') {
        $.each(treatments, function(index, treatment) {
            let regex = new RegExp(treatment)
            if (regex.test(value.split("-")[0])) {

                $("#" + value).prop("checked", true);
                finished = true
            }
        });
        if (!finished) {
            $("#eval-" + week_num + "-other-checkbox").prop("checked", true)
            setTooltip(value, "eval-" + week_num, 20)
            return;
        }
    }
}

function fillForm() {
    data = data_dict.get(currWnd)
    let num = currIdx
    // Check corresponding wound location checkbox if one is in json_history,
    // else check checkbox for "Other: Site"

    let location = history_json.get(currWnd).get("location");
    if (location != "") setCheckbox(location, "location");
    // Check corresponding wound shape checkbox if one is in json_history,
    // else check checkbox for "Other: Shape"
    let shape = history_json.get(currWnd).get("shape");
    if (shape != "") setCheckbox(shape, "shape");
    // Check corresponding wound etiology checkbox if one is in json_history,
    // else check checkbox for "Other: Etiology"
    let etiology = history_json.get(currWnd).get("etiology");
    if (etiology != "") setCheckbox(etiology, "etiology");

    $("#woundNumber").text(currWnd);
    $("#dateFirstObserved").text(formatDate(data[num][0]));
    let week_idx = 1
    while(num < (currIdx + 4) && num < data.length) {
      $("#weekNum" + week_idx).text(num + 1);  // Week
      $("#eval-week-" + week_idx).text(num + 1);  // Eval Week
      $("#week" + week_idx + "-date").text(formatDate(data[num][0]));  // Date
      $("#week" + week_idx + "-size-size-text").text(data[num][2]);  // Size (Area in cm)
      $("#week" + week_idx + "-size-score-text").text(Object.keys(data[num][3]));  // Size Score
      $("#week" + week_idx + "-depth-text").text(Object.keys(data[num][4]));  // Depth
      $("#week" + week_idx + "-edges-text").text(Object.keys(data[num][5]));  // Edges
      $("#week" + week_idx + "-nec-type-text").text(Object.keys(data[num][6]));  // Necrotic Tissue Type
      $("#week" + week_idx + "-nec-amount-text").text(Object.keys(data[num][7]));  // Necrotic Tissue Amount
      $("#week" + week_idx + "-ex-type-text").text(Object.keys(data[num][8]));  // Exudate Type
      $("#week" + week_idx + "-ex-amount-text").text(Object.keys(data[num][9]));  // Exudate Amount
      $("#week" + week_idx + "-skin-text").text(Object.keys(data[num][10]));  // Skin Color
      $("#week" + week_idx + "-edema-text").text(Object.keys(data[num][11]));  // Peripheral Tissue Edema
      $("#week" + week_idx + "-indur-text").text(Object.keys(data[num][12]));  // Peripheral Tissue Induration
      $("#week" + week_idx + "-gran-text").text(Object.keys(data[num][13]));  // Granulation Tissue
      $("#week" + week_idx + "-ep-text").text(Object.keys(data[num][14]));  // Epithelialization
      $("#week" + week_idx + "-bwat").text(data[num][15]);  // BWAT Score
      let assess_id = history_json.get(currWnd).get("assessments")[num + 1];
      if (assess_id) $("#" + assess_id).css("text-decoration", "underline")
      let stage_id = history_json.get(currWnd).get("stages")[num + 1];
      if (stage_id) $("#" + stage_id).css("text-decoration", "underline")
      let treatment_id = history_json.get(currWnd).get("treatment")[num + 1]
      console.log(treatment_id)
      if (treatment_id) setCheckbox(treatment_id, "treatment", num + 1);
      let eval_json = history_json.get(currWnd).get("eval")[num + 1]
      if (eval_json) {

          $("#eval-" + week_idx + "-text-input").val(eval_json["text"])
          $("#eval-" + week_idx + "-signature-text").text(eval_json["signature"])
          if (eval_json["text"].trim() != "") {
              $("#eval-" + week_idx + "-text-input").prop("readonly", true)
              $("#eval-" + week_idx + "-signature-input").hide()
          } else {
              $("#eval-" + week_idx + "-text-input").prop("readonly", false)
              $("#eval-" + week_idx + "-signature-input").show()
          }
          $("#eval-" + week_idx + "-time").text(eval_json["time"])
          $("#eval-" + week_idx + "-date").text(eval_json["date"])
      }
      week_idx++
      num++
    }
    while (week_idx <= 4) {
        document.getElementById("weekNum" + week_idx).innerHTML = "";
        document.getElementById("eval-week-" + week_idx).innerHTML = "";
        document.getElementById("week" + week_idx + "-date").innerHTML = "/&nbsp; &nbsp;/";
        document.getElementById("week" + week_idx + "-size-size-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-size-score-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-depth-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-edges-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-nec-type-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-nec-amount-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-ex-type-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-ex-amount-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-skin-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-edema-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-indur-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-gran-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-ep-text").innerHTML = "";
        document.getElementById("week" + week_idx + "-bwat").innerHTML = "";
        document.getElementById("eval-" + week_idx + "-text-input").innerHTML = "";
        document.getElementById("eval-" + week_idx + "-signature-input").innerHTML = "";
        document.getElementById("eval-" + week_idx + "-time").innerHTML = "";
        document.getElementById("eval-" + week_idx + "-date").innerHTML = "";
        $("#eval-" + week_idx + "-text-input").prop("readonly", true)
        $("#eval-" + week_idx + "-signature-input").hide()
        week_idx++
    }
}

var links = document.querySelectorAll(".hover-box");

function process(data) {
  if (data === null) {
      alert("MRN not found. Check that MRN is accurate.");
  }
  else {
    links.forEach( function(element) {
        element.style.setProperty("display", "block");
    });
    data2 = data["Assessments"];

    var location_dict = {
          0: "ear, left",
          1: "heel, right, medial",
          2: "sacrococcygeal"
    };

    for (var i = 0; i < data2.length; i++) {
      if (data2[i]["WoundLocation"] === location_dict[0]) {
          $("#ear_left").append(data2[i]["WoundLocation"], "\n\n");
      }
      else if (data2[i]["WoundLocation"] === location_dict[1]) {
          $("#right_heel").append(data2[i]["WoundLocation"], "\n\n");
      }
      else {
          $("#sacc").append(data2[i]["WoundLocation"], "\n\n");
      }
    }

    $("#hover1").on("click", function(event) {
      event.preventDefault();
      $('#wound-dropdown-menu').val(wounds[1]).attr("selected", "selected");
      selectWound(wounds[1])
      $('#kindred-form').toggle();
      $('#body-avatar').toggle();
    });

    $("#hover2").on("click", function(event) {
      event.preventDefault();
      $('#wound-dropdown-menu').val(wounds[0]).attr("selected", "selected");
      selectWound(wounds[0])
      $('#kindred-form').toggle();
      $('#body-avatar').toggle();
    });

    $("#hover3").on("click", function(event) {
      event.preventDefault();
      $('#wound-dropdown-menu').val(wounds[2]).attr("selected", "selected");
      selectWound(wounds[2])
      $('#kindred-form').toggle();
      $('#body-avatar').toggle();
    });
  }
}

function exportPDF() {
    window.print();
}

function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    let dataArray = csvData[0];
    let header = "Date,Location,Size,Size Score,Depth,Edges,Necrotic Tissue Type,Necrotic Tissue Amount,Exudate Type,Exudate Amount,Skin Color,Peripheral Tissue Edema,Peripheral Tissue Induration,Granulation Tissue,Epithelialization,BWAT Score,";

    csvContent = csvContent + header + "\r\n";

    console.log(csvData);

    for (var i = 3; i < 16; i++) {
        let arr = Object.keys(dataArray[i]);
        csvData[0][i] = arr[0];
    }

    csvData.forEach(function(rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });

    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
};

$(document).ready(function() {
    links.forEach( function(element) {
        element.style.setProperty("display", "none");
    });
    $("#wound-dropdown-menu").hide()
    $("#btn-previous").hide()
    $("#btn-next").hide()
    $("#select-content").show()
    $("#patient-new").hide()
    $("#kindred-form").hide()
    $("#body-avatar").hide()
    $("#shape-other-input").hide()

    let re = /^[A-Z]{2}[0-9]{8}$/
    $("#process-image").on("submit", function(e) {
        e.preventDefault();
        let mrn = $('#mrn-input').val();
        $('#history-block').append("<br>", mrn);
        if (!re.test(mrn)) {
            return alert($("#mrn").attr("title"))
        }
        req = $.ajax({
            url : "/v1/image-associations",
            type : "POST",
            data : {
                mrn: mrn,
                facility_name: $('#facility-select :selected').val(),
                track_item_id: $('#track-item-id-input').val()
             },
            datatype: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("jqXHR: " + jqXHR.status);
                console.log("textStatus: " + textStatus);
                console.log("errorThrown: " + errorThrown);
            }
        });
        req = $.ajax({
            url : "/v1/wound",
            type : "POST",
            data : {
                mrn: mrn,
                track_item_id: $('#track-item-id-input').val()
             },
            datatype: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("jqXHR: " + jqXHR.status);
                console.log("textStatus: " + textStatus);
                console.log("errorThrown: " + errorThrown);
            }
        });
        req = $.ajax({
            url : "/v1/wound-assessment",
            type : "POST",
            data : {
                mrn: mrn,
                track_item_id: $('#track-item-id-input').val()
             },
            datatype: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("jqXHR: " + jqXHR.status);
                console.log("textStatus: " + textStatus);
                console.log("errorThrown: " + errorThrown);
            }
        });
    });

    $("#processinput").on("submit", function(e) {
        e.preventDefault();
        let mrn = $("#mrn").val()
        $('#history-block').append("<br>", mrn);
        if (!re.test(mrn)) {
            return alert($("#mrn").attr("title"))
        }
        $("#mrn2").val(mrn)
        req = $.ajax({
            url : "/v1/wound-assessment",
            type : "GET",
            data : {
                mrn: mrn,
                ajax: true
             },
            datatype: "json",
            success: function(data) {
                resetForm()
                process(data)
                parseData(data)
                fillForm()
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("jqXHR: " + jqXHR.status);
                console.log("textStatus: " + textStatus);
                console.log("errorThrown: " + errorThrown);
                if (jqXHR.status == 400) {
                    alert("Records for MRN " + mrn + " not found. Check that MRN contains no typos.")
                }
            }
        });
    });

    $("#processinput2").on("submit", function(e) {
        e.preventDefault();
        let mrn2 = $("#mrn2").val()
        $('#history-block').append("<br>", mrn2);
        if (!re.test(mrn2)) {
            return alert($("#mrn2").attr("title"))
        }
        $("#mrn").val(mrn2)
        req = $.ajax({
            url : "/v1/wound-assessment",
            type : "GET",
            data : {
                mrn: mrn2,
                ajax: true
            },
            datatype: "json",
            success: function(data) {
                resetForm()
                process(data);
                parseData(data);
                fillForm();

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("jqXHR: " + jqXHR.status);
                console.log("textStatus: " + textStatus);
                console.log("errorThrown: " + errorThrown);
                if (jqXHR.status == 400) {
                    alert("Records for MRN " + mrn2 + " not found. Check that MRN contains no typos.")
                }
            }
        });
    });

    $("#patient-new-btn").on("click", function() {
        $("#patient-new").show()
        $("#select-content").hide()
    })

    $("#patient-existing-btn").on("click", function() {
        $("#body-avatar").show()
        $("#select-content").hide()
    })

    // If the Toggle View button is clicked, then both views are toggled
    // and causes the current view to dissapear and the other view to
    // appear.
    $("#toggle-view1").on("click", function() {
        $("#kindred-form").toggle()
        $("#body-avatar").toggle()
    });

    $("#toggle-view2").on("click", function() {
        $("#kindred-form").toggle()
        $("#body-avatar").toggle()
    });

    $("#btn-previous").on("click", function() {
        if (currIdx == 0)
          alert("Currently viewing first form; no earlier form(s).");
        else {
          currIdx -= 4;
          if (currIdx == 0) $("#btn-previous").hide()
          // console.log("Current index:" + currIdx);
          fillForm()
          $("#btn-next").show()
        }
    });

    $("#btn-next").on("click", function() {
        if (currIdx + 4 > dataLength - 1)
          alert("Currently viewing last form; no later form(s).")
        else {
          currIdx += 4;
          // console.log("Current index:" + currIdx);
          fillForm()
          if (currIdx + 4 > dataLength - 1) $("#btn-next").hide()
          $("#btn-previous").show()
        }

    });

    $("#wound-dropdown-menu").on("change", function() {
        let option = $(this).val()
        selectWound(option)
    });



    $("#update-form").on("click", function(event) {
        event.preventDefault();
        req = $.ajax({
            url : "/v1/form",
            type : "PUT",
            data : {
                MRN: $("#mrn").val(),
                JSON: JSON.stringify(history_json.toJSON()),
                ajax: true
            },
            datatype: "json",
            success: function(data) {
                alert("Data saved successfully.")
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("jqXHR: " + jqXHR);
                console.log("textStatus: " + textStatus);
                console.log("errorThrown: " + errorThrown);
            }
        });
    });

    $('#btn-export-csv').on("click", function() {
        exportCSV();
        fillForm();
    });

    $('#btn-export-pdf').on('click',function() {
        exportPDF();
        fillForm();
    });

    // Updates history to reflect the selected LOCATION
    $("#sacrum").on("click", function(e) {
        if ($("#sacrum").prop("checked")) {
            resetLocationCheckboxes("sacrum")
            history_json.get(currWnd).set("location", "sacrum")
        } else {
            history_json.get(currWnd).set("location", "")
        }
    });

    $("#trochanter").on("click", function(e) {
        if ($("#trochanter").prop("checked")) {
            resetLocationCheckboxes("trochanter")
            history_json.get(currWnd).set("location", "trochanter")
        } else {
            history_json.get(currWnd).set("location", "")
        }
    });


    $("#ischial_tuberosity").on("click", function(e) {
        if ($("#ischial_tuberosity").prop("checked")) {
            resetLocationCheckboxes("ischial_tuberosity")
            history_json.get(currWnd).set("location", "ischial tuberosity")
        } else {
            history_json.get(currWnd).set("location", "")
        }
    });

    $("#lateral_ankle").on("click", function(e) {
        if ($("#lateral_ankle").prop("checked")) {
            resetLocationCheckboxes("lateral_ankle")
            history_json.get(currWnd).set("location", "lateral ankle")
        } else {
            history_json.get(currWnd).set("location", "")
        }
    });


    $("#medial_ankle").on("click", function(e) {
        if ($("#medial_ankle").prop("checked")) {
            resetLocationCheckboxes("medial_ankle")
            history_json.get(currWnd).set("location", "medial ankle")
        } else {
            history_json.get(currWnd).set("location", "")
        }
    });

    $("#heel").on("click", function(e) {
        if ($("#heel").prop("checked")) {
            resetLocationCheckboxes("heel")
            history_json.get(currWnd).set("location", "heel")
        } else {
            history_json.get(currWnd).set("location", "")
        }
    });

    // Updates history to reflect selected SHAPE
    $("#irregular").on("click", function(e) {
        if ($("#irregular").prop("checked")) {
            resetShapeCheckboxes("irregular")
            history_json.get(currWnd).set("shape", "irregular")
        } else {
            history_json.get(currWnd).set("shape", "")
        }
    });

    $("#bowl").on("click", function(e) {
        if ($("#bowl").prop("checked")) {
            resetShapeCheckboxes("bowl")
            history_json.get(currWnd).set("shape", "bowl/boat")
        } else {
            history_json.get(currWnd).set("shape", "")
        }
    });

    $("#round").on("click", function(e) {
        if ($("#round").prop("checked")) {
            resetShapeCheckboxes("round")
            history_json.get(currWnd).set("shape", "round/oval")
        } else {
            history_json.get(currWnd).set("shape", "")
        }
    });

    $("#linear").on("click", function(e) {
        if ($("#linear").prop("checked")) {
            resetShapeCheckboxes("linear")
            history_json.get(currWnd).set("shape", "linear/elongated")
        } else {
            history_json.get(currWnd).set("shape", "")
        }
    });

    $("#square").on("click", function(e) {
        if ($("#square").prop("checked")) {
            resetShapeCheckboxes("square")
            history_json.get(currWnd).set("shape", "square/rectangle")
        } else {
            history_json.get(currWnd).set("shape", "")
        }
    });

    // Updates history to reflect selected ETIOLOGY
    $("#pressure").on("click", function(e) {
        if ($("#pressure").prop("checked")) {
            resetEtiologyCheckboxes("pressure")
            history_json.get(currWnd).set("etiology", "pressure")
        } else {
            history_json.get(currWnd).set("etiology", "")
        }
    });

    $("#dehiscence").on("click", function(e) {
        if ($("#dehiscence").prop("checked")) {
            resetEtiologyCheckboxes("dehiscence")
            history_json.get(currWnd).set("etiology", "surgical dehiscence")
        } else {
            history_json.get(currWnd).set("etiology", "")
        }
    });

    $("#venous").on("click", function(e) {
        if ($("#venous").prop("checked")) {
            resetEtiologyCheckboxes("venous")
            history_json.get(currWnd).set("etiology", "venous")
        } else {
            history_json.get(currWnd).set("etiology", "")
        }
    });

    $("#mixed").on("click", function(e) {
        if ($("#mixed").prop("checked")) {
            resetEtiologyCheckboxes("mixed")
            history_json.get(currWnd).set("etiology", "mixed")
        } else {
            history_json.get(currWnd).set("etiology", "")
        }
    });

    $("#arterial").on("click", function(e) {
        if ($("#arterial").prop("checked")) {
            resetEtiologyCheckboxes("arterial")
            history_json.get(currWnd).set("etiology", "arterial")
        } else {
            history_json.get(currWnd).set("etiology", "")
        }
    });

    // If checked, the default text dissapears and a text input field
    // appears to allow the user to enter in a custom location. Else,
    // the text input field dissapears and the default text appears.
    $("#location-other-checkbox").on("change", function() {
        if ($("#location-other-checkbox").prop("checked")) {
            resetLocationCheckboxes("location-other-checkbox")
            $("#location-other-text").hide()
            $("#location-other-input").show()
        } else {
            $("#location-other-text").text("Other: Site")
            deleteTooltip("location")
            $("#location-other-text").show()
            $("#location-other-input").hide()
        }
    });

    // If checked, the default text dissapears and a text input field
    // appears to allow the user to enter in a custom shape. Else,
    // the text input field dissapears and the default text appears.
    $("#shape-other-checkbox").on("change", function() {
        if ($("#shape-other-checkbox").prop("checked")) {
            resetShapeCheckboxes("shape-other-checkbox")
            $("#shape-other-text").hide()
            $("#shape-other-input").show()
        } else {
            $("#shape-other-text").text("Other: Shape")
            deleteTooltip("shape")
            $("#shape-other-text").show()
            $("#shape-other-input").hide()
          }
    });

    // If checked, the default text dissapears and a text input field
    // appears to allow the user to enter in a custom etiology. Else,
    // the text input field dissapears and the default text appears.
    $("#etiology-other-checkbox").on("change", function() {
        if ($("#etiology-other-checkbox").prop("checked")) {
            resetEtiologyCheckboxes("etiology-other-checkbox")
            $("#etiology-other-text").hide()
            $("#etiology-other-input").show()
        } else {
            $("#etiology-other-text").text("Other: Etiology")
            deleteTooltip("etiology")
            $("#etiology-other-text").show()
            $("#etiology-other-input").hide()
        }
    });

    // If the user presses "Enter" while the text input field is
    // selected and they entered a new, non-empty value, then the
    // value entered becomes the location, the text input field
    // dissapears, and the value is stored.
    $("#location-other-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            new_loc = $(this).val()
            if (new_loc != "") {
                setTooltip(new_loc, "location")
                history_json.get(currWnd).set("location", new_loc)
            }
            $("#location-other-text").show()
            $("#location-other-input").hide()
        }
    });


    // If the user presses "Enter" while the text input field is
    // selected and they entered a new, non-empty value, then the
    // value entered becomes the shape, the text input field
    // dissapears, and the value is stored.
    $("#shape-other-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            new_loc = $(this).val()
            if (new_loc != "") {
                $("#shape-other-text").text(new_loc)
                setTooltip(new_loc, "shape")
                history_json.get(currWnd).set("shape", new_loc)
            }
            $("#shape-other-text").show()
            $("#shape-other-input").hide()
        }
    });

    // If the user presses "Enter" while the text input field is
    // selected and they entered a new, non-empty value, then the
    // value entered becomes the etiology, the text input field
    // dissapears, and the value is stored.
    $("#etiology-other-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            new_loc = $(this).val()
            if (new_loc != "") {
                $("#etiology-other-text").text(new_loc)
                setTooltip(new_loc, "etiology")
                history_json.get(currWnd).set("etiology", new_loc)
            }
            $("#etiology-other-text").show()
            $("#etiology-other-input").hide()
        };
    });

    // Assess Types 1
    $("#adm1").on("click", function(e) {
        let type = "adm"
        let num = 1
        selectType(type, num)
    });

    $("#dress1").on("click", function(e) {
        let type = "dress"
        let num = 1
        selectType(type, num)
    });

    $("#wkly1").on("click", function(e) {
        let type = "wkly"
        let num = 1
        selectType(type, num)
    });

    $("#dc1").on("click", function(e) {
        let type = "dc"
        let num = 1
        selectType(type, num)
    });

    // Assess Types 2
    $("#adm2").on("click", function(e) {
        let type = "adm"
        let num = 2
        selectType(type, num)
    });

    $("#dress2").on("click", function(e) {
        let type = "dress"
        let num = 2
        selectType(type, num)
    });

    $("#wkly2").on("click", function(e) {
        let type = "wkly"
        let num = 2
        selectType(type, num)
    });

    $("#dc2").on("click", function(e) {
        let type = "dc"
        let num = 2
        selectType(type, num)
    });

    // Assess Types 3
    $("#adm3").on("click", function(e) {
        let type = "adm"
        let num = 3
        selectType(type, num)
    });

    $("#dress3").on("click", function(e) {
        let type = "dress"
        let num = 3
        selectType(type, num)
    });

    $("#wkly3").on("click", function(e) {
        let type = "wkly"
        let num = 3;
        selectType(type, num)
    });

    $("#dc3").on("click", function(e) {
        let type = "dc"
        let num = 3
        selectType(type, num)
    });

    // Assess Type 4
    $("#adm4").on("click", function(e) {
        let type = "adm"
        let num = 4
        selectType(type, num)
    });

    $("#dress4").on("click", function(e) {
        let type = "dress"
        let num = 4
        selectType(type, num)
    });

    $("#wkly4").on("click", function(e) {
        let type = "wkly"
        let num = 4
        selectType(type, num)
    });

    $("#dc4").on("click", function(e) {
        let type = "dc"
        let num = 4
        selectType(type, num)
    });


    // Stage Types 1
    $("#stgI1").on("click", function(e) {
        let type = "stgI"
        let num = 1
        selectType(type, num)
    });

    $("#stgII1").on("click", function(e) {
        let type = "stgII"
        let num = 1
        selectType(type, num)
    });

    $("#stgIII1").on("click", function(e) {
        let type = "stgIII"
        let num = 1
        selectType(type, num)
    });

    $("#stgIV1").on("click", function(e) {
        let type = "stgIV"
        let num = 1
        selectType(type, num)
    });

    $("#nd1").on("click", function(e) {
        let type = "nd"
        let num = 1
        selectType(type, num)
    });

    $("#nt1").on("click", function(e) {
        let type = "nt"
        let num = 1
        selectType(type, num)
    });

    $("#sdti1").on("click", function(e) {
        let type = "sdti"
        let num = 1
        selectType(type, num)
    });

    // Stage Types 2
    $("#stgI2").on("click", function(e) {
        let type = "stgI"
        let num = 2
        selectType(type, num)
    });

    $("#stgII2").on("click", function(e) {
        let type = "stgII"
        let num = 2
        selectType(type, num)
    });

    $("#stgIII2").on("click", function(e) {
        let type = "stgIII"
        let num = 2
        selectType(type, num)
    });

    $("#stgIV2").on("click", function(e) {
        let type = "stgIV"
        let num = 2
        selectType(type, num)
    });

    $("#nd2").on("click", function(e) {
        let type = "nd"
        let num = 2
        selectType(type, num)
    });

    $("#nt2").on("click", function(e) {
        let type = "nt"
        let num = 2
        selectType(type, num)
    });

    $("#sdti2").on("click", function(e) {
        let type = "sdti"
        let num = 2
        selectType(type, num)
    });

    // Stage Types 3
    $("#stgI3").on("click", function(e) {
        let type = "stgI"
        let num = 3
        selectType(type, num)
    });

    $("#stgII3").on("click", function(e) {
        let type = "stgII"
        let num = 3
        selectType(type, num)
    });

    $("#stgIII3").on("click", function(e) {
        let type = "stgIII"
        let num = 3
        selectType(type, num)
    });

    $("#stgIV3").on("click", function(e) {
        let type = "stgIV"
        let num = 3
        selectType(type, num)
    });

    $("#nd3").on("click", function(e) {
        let type = "nd"
        let num = 3
        selectType(type, num)
    });

    $("#nt3").on("click", function(e) {
        let type = "nt"
        let num = 3
        selectType(type, num)
    });

    $("#sdti3").on("click", function(e) {
        let type = "sdti"
        let num = 3
        selectType(type, num)
    });

    // Stage Types 4
    $("#stgI4").on("click", function(e) {
        let type = "stgI"
        let num = 4
        selectType(type, num)
    });

    $("#stgII4").on("click", function(e) {
        let type = "stgII"
        let num = 4
        selectType(type, num);
    });

    $("#stgIII4").on("click", function(e) {
        let type = "stgIII"
        let num = 4
        selectType(type, num)
    });

    $("#stgIV4").on("click", function(e) {
        let type = "stgIV"
        let num = 4
        selectType(type, num)
    });

    $("#nd4").on("click", function(e) {
        let type = "nd"
        let num = 4
        selectType(type, num)
    });

    $("#nt4").on("click", function(e) {
        let type = "nt"
        let num = 4
        selectType(type, num)
    });

    $("#sdti4").on("click", function(e) {
        let type = "sdti"
        let num = 4
        selectType(type, num)
    });


    // Wound Form Scores
    function changeSizeScore(new_size, week_num) {
        if (new_size == 0.00) $("#week" + week_num + "-size-score-text").text("0")
        else if (new_size < 4.0) $("#week" + week_num + "-size-score-text").text("1")
        else if (new_size >= 4.0 && new_size <= 16.0) $("#week" + week_num + "-size-score-text").text("2")
        else if (new_size >= 16.1 && new_size <= 36.0) $("#week" + week_num + "-size-score-text").text("3")
        else if (new_size >= 36.1 && new_size <= 80.0) $("#week" + week_num + "-size-score-text").text("4")
        else if (new_size > 80.00) $("#week" + week_num + "-size-score-text").text("5")
    }


    function changeValue(new_value, week_num, type, change_parameters) {
        let re = change_parameters[0]
        if (re.test(new_value)) {
            $("#week" + week_num + "-" + type + "-text").text(new_value)
            $("#week" + week_num + "-" + type + "-text").show()
            $("#week" + week_num + "-" + type + "-input").hide()
            if (type == "size-size") changeSizeScore(new_value, week_num)
        } else {
            alert(change_parameters[1])
        }
    }


    // Week 1 Scores/Sizes
    // 1 - Size (Size)
    $("#week1-size-size").on("click", function(e) {
        $("#week1-size-size-text").hide()
        $("#week1-size-size-input").show()
    })

    $("#week1-size-size-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let new_size = parseFloat($(this).val()).toFixed(1)
            changeValue(new_size, "1", "size-size", size_parameters)
        }
    });


    // 1 - Size (Score)
    $("#week1-size-score").on("click", function(e) {
        alert("Change size to update score (this will happen automatically).")
    })


    // 1 - Depth
    $("#week1-depth").on("click", function(e) {
        $("#week1-depth-text").hide()
        $("#week1-depth-input").show()
    })

    $("#week1-depth-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "depth", score_parameters_1)
        }
    });


    // 1 - Edges
    $("#week1-edges").on("click", function(e) {
        $("#week1-edges-text").hide()
        $("#week1-edges-input").show()
    })

    $("#week1-edges-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "edges", score_parameters_1)
        }
    });


    // 1 - Undermining (Size)
    $("#week1-under-size").on("click", function(e) {
        $("#week1-under-size-text").hide()
        $("#week1-under-size-input").show()
    })

    $("#week1-under-size-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let new_size = parseFloat($(this).val()).toFixed(2)
            changeValue(new_size, "1", "under-size", undermining_parameters)
        }
    });


    // 1 - Undermining (Score)
    $("#week1-under-score").on("click", function(e) {
        $("#week1-under-score-text").hide()
        $("#week1-under-score-input").show()
    })

    $("#week1-under-score-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "under-score", score_parameters_1)
        }
    });


    // 1 - Necrotic Tissue Type
    $("#week1-nec-type").on("click", function(e) {
        $("#week1-nec-type-text").hide()
        $("#week1-nec-type-input").show()
    })

    $("#week1-nec-type-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "nec-type", score_parameters_2)
        }
    });


    // 1 - Necrotic Tissue Amount
    $("#week1-nec-amount").on("click", function(e) {
        $("#week1-nec-amount-text").hide()
        $("#week1-nec-amount-input").show()
    })

    $("#week1-nec-amount-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "nec-amount", score_parameters_2)
        }
    });


    // 1 - Exudate Type
    $("#week1-ex-type").on("click", function(e) {
        $("#week1-ex-type-text").hide()
        $("#week1-ex-type-input").show()
    })

    $("#week1-ex-type-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "ex-type", score_parameters_2)
        }
    });


    // 1 - Exudate Amount
    $("#week1-ex-amount").on("click", function(e) {
        $("#week1-ex-amount-text").hide()
        $("#week1-ex-amount-input").show()
    })

    $("#week1-ex-amount-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "ex-amount", score_parameters_2)
        }
    });


    // 1 - Skin Color Surrounding Wound
    $("#week1-skin").on("click", function(e) {
        $("#week1-skin-text").hide()
        $("#week1-skin-input").show()
    })

    $("#week1-skin-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "skin", score_parameters_2)
        }
    });


    // 1 - Peripheral Tissue Edema
    $("#week1-edema").on("click", function(e) {
        $("#week1-edema-text").hide()
        $("#week1-edema-input").show()
    })

    $("#week1-edema-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "edema", score_parameters_2)
        }
    });


    // 1 - Peripheral Tissue Induration
    $("#week1-indur").on("click", function(e) {
        $("#week1-indur-text").hide()
        $("#week1-indur-input").show()
    })

    $("#week1-indur-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "indur", score_parameters_2)
        }
    });


    // 1 - Granulation Tissue
    $("#week1-gran").on("click", function(e) {
        $("#week1-gran-text").hide()
        $("#week1-gran-input").show()
    })

    $("#week1-gran-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "gran", score_parameters_2)
        }
    });


    // 1 - Epithelialization
    $("#week1-ep").on("click", function(e) {
        $("#week1-ep-text").hide()
        $("#week1-ep-input").show()
    })

    $("#week1-ep-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "1", "ep", score_parameters_2)
        }
    });


    // Week 2 Scores/Sizes
    // 2 - Size (Size)
    $("#week2-size-size").on("click", function(e) {
        $("#week2-size-size-text").hide()
        $("#week2-size-size-input").show()
    })

    $("#week2-size-size-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let new_size = parseFloat($(this).val()).toFixed(1)
            changeValue(new_size, "2", "size-size", size_parameters)
        }
    });


    // 2 - Size (Score)
    $("#week2-size-score").on("click", function(e) {
        alert("Change size to update score (this will happen automatically).")
    })


    // 2 - Depth
    $("#week2-depth").on("click", function(e) {
        $("#week2-depth-text").hide()
        $("#week2-depth-input").show()
    })

    $("#week2-depth-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "depth", score_parameters_1)
        }
    });


    // 2 - Edges
    $("#week2-edges").on("click", function(e) {
        $("#week2-edges-text").hide()
        $("#week2-edges-input").show()
    })

    $("#week2-edges-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "edges", score_parameters_1)
        }
    });


    // 2 - Undermining (Size)
    $("#week2-under-size").on("click", function(e) {
        $("#week2-under-size-text").hide()
        $("#week2-under-size-input").show()
    })

    $("#week2-under-size-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let new_size = parseFloat($(this).val()).toFixed(2)
            changeValue(new_size, "2", "under-size", undermining_parameters)
        }
    });


    // 2 - Undermining (Score)
    $("#week2-under-score").on("click", function(e) {
        $("#week2-under-score-text").hide()
        $("#week2-under-score-input").show()
    })

    $("#week2-under-score-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "under-score", undermining_parameters)
        }
    });


    // 2 - Necrotic Tissue Type
    $("#week2-nec-type").on("click", function(e) {
        $("#week2-nec-type-text").hide()
        $("#week2-nec-type-input").show()
    })

    $("#week2-nec-type-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "nec-type", score_parameters_2)
        }
    });


    // 2 - Necrotic Tissue Amount
    $("#week2-nec-amount").on("click", function(e) {
        $("#week2-nec-amount-text").hide()
        $("#week2-nec-amount-input").show()
    })

    $("#week2-nec-amount-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "nec-amount", score_parameters_2)
        }
    });


    // 2 - Exudate Type
    $("#week2-ex-type").on("click", function(e) {
        $("#week2-ex-type-text").hide()
        $("#week2-ex-type-input").show()
    })

    $("#week2-ex-type-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "ex-type", score_parameters_2)
        }
    });


    // 2 - Exudate Amount
    $("#week2-ex-amount").on("click", function(e) {
        $("#week2-ex-amount-text").hide()
        $("#week2-ex-amount-input").show()
    })

    $("#week2-ex-amount-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "ex-amount", score_parameters_2)
        }
    });


    // 2 - Skin Color Surrounding Wound
    $("#week2-skin").on("click", function(e) {
        $("#week2-skin-text").hide()
        $("#week2-skin-input").show()
    })

    $("#week2-skin-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "skin", score_parameters_2)
        }
    });


    // 2 - Peripheral Tissue Edema
    $("#week2-edema").on("click", function(e) {
        $("#week2-edema-text").hide()
        $("#week2-edema-input").show()
    })

    $("#week2-edema-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "edema", score_parameters_2)
        }
    });


    // 2 - Peripheral Tissue Induration
    $("#week2-indur").on("click", function(e) {
        $("#week2-indur-text").hide()
        $("#week2-indur-input").show()
    })

    $("#week2-indur-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "indur", score_parameters_2)
        }
    });


    // 2 - Granulation Tissue
    $("#week2-gran").on("click", function(e) {
        $("#week2-gran-text").hide()
        $("#week2-gran-input").show()
    })

    $("#week2-gran-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "gran", score_parameters_2)
        }
    });


    // 2 - Epithelialization
    $("#week2-ep").on("click", function(e) {
        $("#week2-ep-text").hide()
        $("#week2-ep-input").show()
    })

    $("#week2-ep-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "2", "ep", score_parameters_2)
        }
    });


    // Week 3 - Scores/Sizes
    // 3 - Size (Size)
    $("#week3-size-size").on("click", function(e) {
        $("#week3-size-size-text").hide()
        $("#week3-size-size-input").show()
    })

    $("#week3-size-size-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let new_size = parseFloat($(this).val()).toFixed(1)
            changeValue($(this).val(), "3", "size-size", size_parameters)
        }
    });


    // 3 - Size (Score)
    $("#week3-size-score").on("click", function(e) {
        alert("Change size to update score (this will happen automatically).")
    })


    // 3 - Depth
    $("#week3-depth").on("click", function(e) {
        $("#week3-depth-text").hide()
        $("#week3-depth-input").show()
    })

    $("#week3-depth-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "depth", score_parameters_1)
        }
    });


    // 3 - Edges
    $("#week3-edges").on("click", function(e) {
        $("#week3-edges-text").hide()
        $("#week3-edges-input").show()
    })

    $("#week3-edges-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "edges", score_parameters_1)
        }
    });


    // 3 - Undermining (Size)
    $("#week3-under-size").on("click", function(e) {
        $("#week3-under-size-text").hide()
        $("#week3-under-size-input").show()
    })

    $("#week3-under-size-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let new_size = parseFloat($(this).val()).toFixed(2)
            changeValue(new_size, "3", "under-size", undermining_parameters)
        }
    });


    // 3 - Undermining (Score)
    $("#week3-under-score").on("click", function(e) {
        $("#week3-under-score-text").hide()
        $("#week3-under-score-input").show()
    })

    $("#week3-under-score-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "under-score", score_parameters_1)
        }
    });


    // 3 - Necrotic Tissue Type
    $("#week3-nec-type").on("click", function(e) {
        $("#week3-nec-type-text").hide()
        $("#week3-nec-type-input").show()
    })

    $("#week3-nec-type-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "nec-type", score_parameters_2)
        }
    });


    // 3 - Necrotic Tissue Amount
    $("#week3-nec-amount").on("click", function(e) {
        $("#week3-nec-amount-text").hide()
        $("#week3-nec-amount-input").show()
    })

    $("#week3-nec-amount-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "nec-amount", score_parameters_2)
        }
    });


    // 3 - Exudate Type
    $("#week3-ex-type").on("click", function(e) {
        $("#week3-ex-type-text").hide()
        $("#week3-ex-type-input").show()
    })

    $("#week3-ex-type-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "ex-type", score_parameters_2)
        }
    });


    // 3 - Exudate Amount
    $("#week3-ex-amount").on("click", function(e) {
        $("#week3-ex-amount-text").hide()
        $("#week3-ex-amount-input").show()
    })

    $("#week3-ex-amount-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "ex-amount", score_parameters_2)
        }
    });


    // 3 - Skin Color Surrounding Wound
    $("#week3-skin").on("click", function(e) {
        $("#week3-skin-text").hide()
        $("#week3-skin-input").show()
    })

    $("#week3-skin-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "skin", score_parameters_2)
        }
    });


    // 3 - Peripheral Tissue Edema
    $("#week3-edema").on("click", function(e) {
        $("#week3-edema-text").hide()
        $("#week3-edema-input").show()
    })

    $("#week3-edema-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "edema", score_parameters_2)
        }
    });


    // 3 - Peripheral Tissue Induration
    $("#week3-indur").on("click", function(e) {
        $("#week3-indur-text").hide()
        $("#week3-indur-input").show()
    })

    $("#week3-indur-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "indur", score_parameters_2)
        }
    });


    // 3 - Granulation Tissue
    $("#week3-gran").on("click", function(e) {
        $("#week3-gran-text").hide()
        $("#week3-gran-input").show()
    })

    $("#week3-gran-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "gran", score_parameters_2)
        }
    });


    // 3 - Epithelialization
    $("#week3-ep").on("click", function(e) {
        $("#week3-ep-text").hide()
        $("#week3-ep-input").show()
    })

    $("#week3-ep-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "3", "ep", score_parameters_2)
        }
    });


    // Week 4 Scores/Sizes
    // 4 - Size (Size)
    $("#week4-size-size").on("click", function(e) {
        $("#week4-size-size-text").hide()
        $("#week4-size-size-input").show()
    })

    $("#week4-size-size-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let new_size = parseFloat($(this).val()).toFixed(2)
            changeValue(new_size, "4", "size-size", size_parameters)
        }
    });


    // 4 - Size (Score)
    $("#week4-size-score").on("click", function(e) {
        alert("Change size to update score (this will happen automatically).")
    })


    // 4 - Depth
    $("#week4-depth").on("click", function(e) {
        $("#week4-depth-text").hide()
        $("#week4-depth-input").show()
    })

    $("#week4-depth-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "depth", score_parameters_1)
        }
    });


    // 4 - Edges
    $("#week4-edges").on("click", function(e) {
        $("#week4-edges-text").hide()
        $("#week4-edges-input").show()
    })

    $("#week4-edges-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "edges", score_parameters_1)
        }
    });


    // 4 - Undermining (Size)
    $("#week4-under-size").on("click", function(e) {
        $("#week4-under-size-text").hide()
        $("#week4-under-size-input").show()
    })

    $("#week4-under-size-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let new_size = parseFloat($(this).val()).toFixed(2)
            changeValue(new_size, "4", "under-size", undermining_parameters)
        }
    });


    // 4 - Undermining (Score)
    $("#week4-under-score").on("click", function(e) {
        $("#week4-under-score-text").hide()
        $("#week4-under-score-input").show()
    })

    $("#week4-under-score-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "under-score", score_parameters_1)
        }
    });


    // 4 - Necrotic Tissue Type
    $("#week4-nec-type").on("click", function(e) {
        $("#week4-nec-type-text").hide()
        $("#week4-nec-type-input").show()
    })

    $("#week4-nec-type-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "nec-type", score_parameters_2)
        }
    });


    // 4 - Necrotic Tissue Amount
    $("#week4-nec-amount").on("click", function(e) {
        $("#week4-nec-amount-text").hide()
        $("#week4-nec-amount-input").show()
    })

    $("#week4-nec-amount-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "nec-amount", score_parameters_2)
        }
    });


    // 4 - Exudate Type
    $("#week4-ex-type").on("click", function(e) {
        $("#week4-ex-type-text").hide()
        $("#week4-ex-type-input").show()
    })

    $("#week4-ex-type-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "ex-type", score_parameters_2)
        }
    });


    // 4 - Exudate Amount
    $("#week4-ex-amount").on("click", function(e) {
        $("#week4-ex-amount-text").hide()
        $("#week4-ex-amount-input").show()
    })

    $("#week4-ex-amount-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "ex-amount", score_parameters_2)
        }
    });


    // 4 - Skin Color Surrounding Wound
    $("#week4-skin").on("click", function(e) {
        $("#week4-skin-text").hide()
        $("#week4-skin-input").show()
    })

    $("#week4-skin-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "skin", score_parameters_2)
        }
    });


    // 4 - Peripheral Tissue Edema
    $("#week4-edema").on("click", function(e) {
        $("#week4-edema-text").hide()
        $("#week4-edema-input").show()
    })

    $("#week4-edema-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "edema", score_parameters_2)
        }
    });


    // 4 - Peripheral Tissue Induration
    $("#week4-indur").on("click", function(e) {
        $("#week4-indur-text").hide()
        $("#week4-indur-input").show()
    })

    $("#week4-indur-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "indur", score_parameters_2)
        }
    });


    // 4 - Granulation Tissue
    $("#week4-gran").on("click", function(e) {
        $("#week4-gran-text").hide()
        $("#week4-gran-input").show()
    })

    $("#week4-gran-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "gran", score_parameters_2)
        }
    });


    // 4 - Epithelialization
    $("#week4-ep").on("click", function(e) {
        $("#week4-ep-text").hide()
        $("#week4-ep-input").show()
    })

    $("#week4-ep-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            changeValue($(this).val(), "4", "ep", score_parameters_2)
        }
    });

    // Treatment Section 
    // Week 1 Treatment Goal at Evaluation
    // 1 - Maintain Wound Status
    $("#maintain-1").on("click", function(e) {
        if ($("#maintain-1").prop("checked")) {
            resetTreatmentCheckboxes("maintain-1", "1")
            history_json.get(currWnd).get("treatment")["1"] = "maintain-1"
        } else {
            history_json.get(currWnd).get("treatment")["1"] = ""
        }
    });


    // 1 - Progress Towards Closure
    $("#progress-1").on("click", function(e) {
        if ($("#progress-1").prop("checked")) {
            resetTreatmentCheckboxes("progress-1", "1")
            history_json.get(currWnd).get("treatment")["1"] = "progress-1"
        } else {
            history_json.get(currWnd).get("treatment")["1"] = ""
        }
    });

    // 1 - Prepare Wound
    $("#prepare-1").on("click", function(e) {
        if ($("#prepare-1").prop("checked")) {
            resetTreatmentCheckboxes("prepare-1", "1")
            history_json.get(currWnd).get("treatment")["1"] = "prepare-1"
        } else {
            history_json.get(currWnd).get("treatment")["1"] = ""
        }
    });

    // 1- Other
    $("#eval-1-other-checkbox").on("change", function() {
        if ($("#eval-1-other-checkbox").prop("checked")) {
            resetTreatmentCheckboxes("eval-1-other-checkbox", "1")
            $("#eval-1-other-text").hide()
            $("#eval-1-other-input").show()
        } else {
            $("#eval-1-other-text").text("Other")
            deleteTooltip("eval-1")
            $("#eval-1-other-text").show()
            $("#eval-1-other-input").hide()
        }
    });

    $("#eval-1-other-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            new_treat = $(this).val()
            if (new_treat != "") {
                $("#eval-1-other-text").text(new_treat)
                setTooltip(new_treat, "eval-1")
                history_json.get(currWnd).get("treatment")["1"] = new_treat
            }
            $("#eval-1-other-text").show()
            $("#eval-1-other-input").hide()
        };
    });


    // Week 2 Treatment Goal at Evaluation
    // 2 - Maintain Wound Status
    $("#maintain-2").on("click", function(e) {
        if ($("#maintain-2").prop("checked")) {
            resetTreatmentCheckboxes("maintain-2", "2")
            history_json.get(currWnd).get("treatment")["2"] = "maintain-2"
        } else {
            history_json.get(currWnd).get("treatment")["2"] = ""
        }
    });


    // 2 - Progress Towards Closure
    $("#progress-2").on("click", function(e) {
        if ($("#progress-2").prop("checked")) {
            resetTreatmentCheckboxes("progress-2", "2")
            history_json.get(currWnd).get("treatment")["2"] = "progress-2"
        } else {
            history_json.get(currWnd).get("treatment")["2"] = ""
        }
    });

    // 2 - Prepare Wound
    $("#prepare-2").on("click", function(e) {
        if ($("#prepare-2").prop("checked")) {
            resetTreatmentCheckboxes("prepare-2", "2")
            history_json.get(currWnd).get("treatment")["2"] = "prepare-2"
        } else {
            history_json.get(currWnd).get("treatment")["2"] = ""
        }
    });

    // 2- Other
    $("#eval-2-other-checkbox").on("change", function() {
        if ($("#eval-2-other-checkbox").prop("checked")) {
            resetTreatmentCheckboxes("eval-2-other-checkbox", "2")
            $("#eval-2-other-text").hide()
            $("#eval-2-other-input").show()
        } else {
            $("#eval-2-other-text").text("Other")
            deleteTooltip("eval-2")
            $("#eval-2-other-text").show()
            $("#eval-2-other-input").hide()
        }
    });

    $("#eval-2-other-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            new_treat = $(this).val()
            if (new_treat != "") {
                $("#eval-2-other-text").text(new_treat)
                setTooltip(new_treat, "eval-2")
                history_json.get(currWnd).get("treatment")["2"] = new_treat
            }
            $("#eval-2-other-text").show()
            $("#eval-2-other-input").hide()
        };
    });


    // Week 3 Treatment Goal at Evaluation
    // 3 - Maintain Wound Status
    $("#maintain-3").on("click", function(e) {
        if ($("#maintain-3").prop("checked")) {
            resetTreatmentCheckboxes("maintain-3", "3")
            history_json.get(currWnd).get("treatment")["3"] = "maintain-3"
        } else {
            history_json.get(currWnd).get("treatment")["3"] = ""
        }
    });


    // 3 - Progress Towards Closure
    $("#progress-3").on("click", function(e) {
        if ($("#progress-3").prop("checked")) {
            resetTreatmentCheckboxes("progress-3", "3")
            history_json.get(currWnd).get("treatment")["3"] = "progress-3"
        } else {
            history_json.get(currWnd).get("treatment")["3"] = ""
        }
    });

    // 3 - Prepare Wound
    $("#prepare-3").on("click", function(e) {
        if ($("#prepare-3").prop("checked")) {
            resetTreatmentCheckboxes("prepare-3", "3")
            history_json.get(currWnd).get("treatment")["3"] = "prepare-3"
        } else {
            history_json.get(currWnd).get("treatment")["3"] = ""
        }
    });

    // 3- Other
    $("#eval-3-other-checkbox").on("change", function() {
        if ($("#eval-3-other-checkbox").prop("checked")) {
            resetTreatmentCheckboxes("eval-3-other-checkbox", "3")
            $("#eval-3-other-text").hide()
            $("#eval-3-other-input").show()
        } else {
            $("#eval-3-other-text").text("Other")
            deleteTooltip("eval-3")
            $("#eval-3-other-text").show()
            $("#eval-3-other-input").hide()
        }
    });

    $("#eval-3-other-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            new_treat = $(this).val()
            if (new_treat != "") {
                $("#eval-3-other-text").text(new_treat)
                setTooltip(new_treat, "eval-3")
                history_json.get(currWnd).get("treatment")["3"] = new_treat
            }
            $("#eval-3-other-text").show()
            $("#eval-3-other-input").hide()
        };
    });


    // Week 4 Treatment Goal at Evaluation
    // 4 - Maintain Wound Status
    $("#maintain-4").on("click", function(e) {
        if ($("#maintain-4").prop("checked")) {
            resetTreatmentCheckboxes("maintain-4", "4")
            history_json.get(currWnd).get("treatment")["4"] = "maintain-4"
        } else {
            history_json.get(currWnd).get("treatment")["4"] = ""
        }
    });


    // 4 - Progress Towards Closure
    $("#progress-4").on("click", function(e) {
        if ($("#progress-4").prop("checked")) {
            resetTreatmentCheckboxes("progress-4", "4")
            history_json.get(currWnd).get("treatment")["4"] = "progress-4"
        } else {
            history_json.get(currWnd).get("treatment")["4"] = ""
        }
    });

    // 4 - Prepare Wound
    $("#prepare-4").on("click", function(e) {
        if ($("#prepare-4").prop("checked")) {
            resetTreatmentCheckboxes("prepare-4", "4")
            history_json.get(currWnd).get("treatment")["4"] = "prepare-4"
        } else {
            history_json.get(currWnd).get("treatment")["4"] = ""
        }
    });

    // 4- Other
    $("#eval-4-other-checkbox").on("change", function() {
        if ($("#eval-4-other-checkbox").prop("checked")) {
            resetTreatmentCheckboxes("eval-4-other-checkbox", "4")
            $("#eval-4-other-text").hide()
            $("#eval-4-other-input").show()
        } else {
            $("#eval-4-other-text").text("Other")
            deleteTooltip("eval-4")
            $("#eval-4-other-text").show()
            $("#eval-4-other-input").hide()
        }
    });

    $("#eval-4-other-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            new_treat = $(this).val()
            if (new_treat != "") {
                $("#eval-4-other-text").text(new_treat)
                setTooltip(new_treat, "eval-4")
                history_json.get(currWnd).get("treatment")["4"] = new_treat
            }
            $("#eval-4-other-text").show()
            $("#eval-4-other-input").hide()
        };
    });

    // Treatment Evaluation of Effectiveness
    function setEval(signature, num) {
        // saves the eval text, clinicians' signature, and date
        // and time of the assessment
        let eval_text = $("#eval-" + num + "-text-input").val()
        let eval_time = new Date().toLocaleTimeString().split(",")[0]
        let eval_date = new Date().toLocaleDateString().split(",")[0]
        $("#eval-" + num + "-signature-text").text(signature)
                $("#eval-" + num + "-signature-input").hide()
                $("#eval-" + num + "-time").text(eval_time)
                $("#eval-" + num + "-date").text(eval_date)
        history_json.get(currWnd).get("eval")[num] = {"text": eval_text, "signature": signature, "time": eval_time, "date": eval_date};
    }


    $("#eval-1-signature-input").on("keypress", function(e) {
        // when a clinician submits their signature the evaluation
        // is saved and the date and time appear on the signature
        // line
        if (e.which === 13) {
            e.preventDefault()
            let signature = $(this).val().trim()
            if (signature != '') {
                setEval(signature, "1")
            }
        }
    });

    $("#eval-2-signature-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let signature = $(this).val().trim()
            if (signature != '') {
                setEval(signature, "2")
            }
        }
    });

    $("#eval-3-signature-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let signature = $(this).val().trim()
            if (signature != '') {
                setEval(signature, "3")
            }
        }
    });

    $("#eval-4-signature-input").on("keypress", function(e) {
        if (e.which === 13) {
            e.preventDefault()
            let signature = $(this).val().trim()
            if (signature != '') {
                setEval(signature, "4")
            }
        }
    });
});
