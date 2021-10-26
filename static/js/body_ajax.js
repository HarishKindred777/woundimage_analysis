const links = document.querySelectorAll(".hover-box");

// no();
// $.getScript( "static/ajax.js", function( data, textStatus, jqxhr ) {
//       console.log( data ); // Data returned
//       console.log( textStatus ); // Success
//       console.log( jqxhr.status ); // 200
//       console.log( "Load was performed." );
// });

$(document).ready(function() {
      links.forEach( function(element) {
          element.style.setProperty("display", "none");
      });
      $('#processinput2').on('click', function(event) {
            event.preventDefault();
            req2 = $.ajax({
                  url : '/v1/wound-assessment',
                  type : 'GET',
                  data : {
                        mrn: $('#mrn').val(),
                        ajax: true
                   },
                  datatype: 'json',
                  success: function (data) {
                        process(data);
                  }
            });
      });
});

function process (data) {
      if (data === null) {
            alert("Please enter in an MRN");
            console.log('testing1')
      }
      else {
            console.log('testing2')
            links.forEach( function(element) {
                element.style.setProperty('display', 'block');
            });
            data2 = data['Assessments'];

            var location_dict = {
                  0: "ear, left",
                  1: "heel, right, medial",
                  2: "sacrococcygeal"
            };

            for (var i = 0; i < data2.length; i++) {
                  if (data2[i]["WoundLocation"] === location_dict[0]) {
                        $("#ear_left").append(data2[i]['WoundLocation'], "\n\n");
                  }
                  else if (data2[i]["WoundLocation"] === location_dict[1]) {
                        $("#right_heel").append(data2[i]['WoundLocation'], "\n\n");
                  }
                  else {
                        $("#sacc").append(data2[i]['WoundLocation'], "\n\n");
                  }
            }

            $('#hover1').on('click', function(event) {
                  event.preventDefault();
                  // $.loadScript("/static/js/ajax.js");
                  // f2(data);
                  // location.href = "/kindred-form/";
            });

            $('#hover2').on('click', function(event) {
                  event.preventDefault();
                  // location.href = "/v1/wound-assessment?mrn=DD00050167";
            });

            $('#hover3').on('click', function(event) {
                  event.preventDefault();
            });
      }
}

// $.loadScript = function (url) {
//     $.ajax({
//         url: url,
//         dataType: 'script',
//         success: function () {
//             window.location.replace('/kindred-form/');
//             $(".img-loc").load("/kindred-form/");
//             $(document).ajaxStop(function () {
//                   alert("stopped");
//             });
//         },
//         async: true
//     });
// }
