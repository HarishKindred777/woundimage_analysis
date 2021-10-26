let chart1 = undefined;

function refresh() {
    $.ajax({
        url: '/v1/wound',
        method: 'GET',
        success: function (data) {
            if (data === null) {
              alert("Chart data not found!");
            } else {
              const x_values = Object.entries(data['x_values'])
              const y_values = Object.entries(data['y_values'])
              newSeries = [{
                name: x_values[0][1],
                data: [{
                  x: x_values[0][1],
                  y: y_values[0][1]
                }]
              },
              {
                name: x_values[1][1],
                data: [{
                  x: x_values[1][1],
                  y: y_values[1][1]
                }]
              },
              {
                name: x_values[2][1],
                data: [{
                  x: x_values[2][1],
                  y: y_values[2][1]
                }]
              },
              {
                name: x_values[3][1],
                data: [{
                  x: x_values[3][1],
                  y: y_values[3][1]
                }]
              },
              {
                name: x_values[4][1],
                data: [{
                  x: x_values[4][1],
                  y: y_values[4][1]
                }]
              },
              {
                name: x_values[5][1],
                data: [{
                  x: x_values[5][1],
                  y: y_values[5][1]
                }]
              },
              {
                name: x_values[6][1],
                data: [{
                  x: x_values[6][1],
                  y: y_values[6][1]
                }]
              },
              {
                name: x_values[7][1],
                data: [{
                  x: x_values[7][1],
                  y: y_values[7][1]
                }]
              },
              {
                name: x_values[8][1],
                data: [{
                  x: x_values[8][1],
                  y: y_values[8][1]
                }]
              },
              {
                name: x_values[9][1],
                data: [{
                  x: x_values[9][1],
                  y: 50
                }]
              }];
              chart1.updateSeries(newSeries);
            }
        }
    });
}

$(document).ready(function() {
  $.ajax({
        url : '/v1/wound',
        type : 'GET',
        // data : {
        //  },
        // datatype: 'json',
        success: function (data) {
            if (data === null) {
              alert("Chart data not found!");
            }
            else {
                const x_values = Object.entries(data['x_values'])
                const y_values = Object.entries(data['y_values'])
                const options = {
                  chart: {
                  	id: "woundLocFreqTop10",
                  	// width: "100%",
				    height: 300,
            type: 'bar',
            toolbar: {
			          show: true,
			          offsetX: -20,
			          offsetY: 10,
			          tools: {
			            download: true,
			            selection: true,
			            zoom: true,
			            zoomin: true,
			            zoomout: true,
			            pan: true,
			            reset: true,
                  customIcons: [{
                      icon: '<span class="fa fa-sync-alt" style="margin: 0px 0px 0px 7px"></span>',
                      index: 4,
                      title: 'Refresh',
                      class: 'chart1-refresh',
                      // click: function (chart, options, e) {
                      click: function() {
                        refresh()
                      }
                      }]
				        }
				    },
				    noData: {
				      text: 'Loading...'
				    },
				    export: {
			          csv: {
			            columnDelimiter: ',',
			            headerCategory: 'location',
			            headerValue: 'count',
			            dateFormatter(timestamp) {
			              return new Date(timestamp).toDateString()
			            }
			          }
			        }
                  },
                  plotOptions: {
                    bar: {
                      horizontal: false,
                    }
                  },
                  series: [{
                    name: x_values[0][1],
                    data: [{
                      x: x_values[0][1],
                      y: y_values[0][1]
                    }]
                  },
                  {
                    name: x_values[1][1],
                    data: [{
                      x: x_values[1][1],
                      y: y_values[1][1]
                    }]
                  },
                  {
                    name: x_values[2][1],
                    data: [{
                      x: x_values[2][1],
                      y: y_values[2][1]
                    }]
                  },
                  {
                    name: x_values[3][1],
                    data: [{
                      x: x_values[3][1],
                      y: y_values[3][1]
                    }]
                  },
                  {
                    name: x_values[4][1],
                    data: [{
                      x: x_values[4][1],
                      y: y_values[4][1]
                    }]
                  },
                  {
                    name: x_values[5][1],
                    data: [{
                      x: x_values[5][1],
                      y: y_values[5][1]
                    }]
                  },
                  {
                    name: x_values[6][1],
                    data: [{
                      x: x_values[6][1],
                      y: y_values[6][1]
                    }]
                  },
                  {
                    name: x_values[7][1],
                    data: [{
                      x: x_values[7][1],
                      y: y_values[7][1]
                    }]
                  },
                  {
                    name: x_values[8][1],
                    data: [{
                      x: x_values[8][1],
                      y: y_values[8][1]
                    }]
                  },
                  {
                    name: x_values[9][1],
                    data: [{
                      x: x_values[9][1],
                      y: y_values[9][1]
                    }]
                  }],
                  xaxis: {
                    labels: {
                      show: false
                    },
                    axisTicks: {
                      show: false
                    },
                    tickPlacement: 'on'  // must include to allow toolbar options
                  },
                  legend: {
                    show: true,
                    showForSingleSeries: true,
                  },
                  title: {
                    text: 'Top 10 Wound Locations',
                    floating: false,
                    offsetY: 20,
                    align: 'center',
                    position: 'top'
                  },
                  onItemClick: {
                      toggleDataSeries: true
                  },
                  onItemHover: {
                      highlightDataSeries: true
                  }
				  // responsive: [
				  //     {
				  //       breakpoint: 768,
				  //       options: {
				  //         plotOptions: {
				  //           bar: {
				  //             horizontal: false
				  //           }
				  //         },
				  //         legend: {
				  //           position: "bottom"
				  //         }
				  //       }
				  //     }
				  //   ]
                  }

                chart1 = new ApexCharts(document.querySelector("#chart1"), options);
                chart1.render();

                // const chart2 = new ApexCharts(document.querySelector("#chart2"), options);
                // const chart3 = new ApexCharts(document.querySelector("#chart3"), options);
                // const chart4 = new ApexCharts(document.querySelector("#chart4"), options);
                // const chart5 = new ApexCharts(document.querySelector("#chart5"), options);
                // const chart6 = new ApexCharts(document.querySelector("#chart6"), options);
                // const chart7 = new ApexCharts(document.querySelector("#chart7"), options);
                // const chart8 = new ApexCharts(document.querySelector("#chart8"), options);
                // chart2.render();
                // chart3.render();
                // chart4.render();
                // chart5.render();
                // chart6.render();
                // chart7.render();
                // chart8.render();

            }
        }
  });
  
  $('#chart1-toggle').on("click", function() {
    	$('#chart1').toggle();
      let text = document.getElementById("chart1-toggle").innerHTML
  		if (text == 'Hide') document.getElementById("chart1-toggle").innerHTML = 'Show';
  		else document.getElementById("chart1-toggle").innerHTML = 'Hide';
  });

});