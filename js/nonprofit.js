var CBSA_SELECTOR = "#cbsa_selector"
var STATE_SELECTOR = "#state_selector"
var TOPIC_SELECTOR = "#topics_selector"
var FILTER_BUTTON = "#filter_button"
var ENABLED_SELECTOR = ".locationMenu.enabled"
var START_YEAR_SELECTOR = "#start_year_selector"
var END_YEAR_SELECTOR = "#end_year_selector"
var BY_STATE = true;

var projection = d3.geoEquirectangular()
  .scale(2800)
  .center([-96.03542,41.69553])
  .translate([300,230]);

var path = d3.geoPath()
  .projection(projection);


function wrap(text, width, dy) {
  text.each(function() {
    var text = d3.select(this),
    words = text.text().split(/\s+/).reverse(),
    word,
    line = [],
    lineNumber = 0,
    lineHeight = 1.5,
    y = text.attr("y"),
    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y);
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "14" + "px").text(word);
      }
    }
  });
}

function sortData(input, startYear, endYear){
  var allYears = [];
  for(i = startYear; i <= endYear; i++ ){
    data = input
      .filter(function(d){
        return parseInt(d["start_year"]) == i;
      })
    var data_start = data
      .filter(function(d){
        return parseFloat(d["percent_no_change"]) != 100 && ( parseFloat(d["percent_large_increase"]) + parseFloat(d["percent_slight_increase"]) ) > ( parseFloat(d["percent_slight_loss"]) + parseFloat(d["percent_large_loss"]) )
      })
      .sort(function(a, b){
        if((parseFloat(b["percent_large_increase"])+parseFloat(b["percent_slight_increase"])) == (parseFloat(a["percent_large_increase"]) + parseFloat(a["percent_slight_increase"]))){
          return parseFloat(b["percent_large_increase"]) - parseFloat(a["percent_large_increase"])
        }else{
          return (parseFloat(a["percent_large_loss"])+parseFloat(a["percent_slight_loss"]) +parseFloat(a["percent_no_change"])) - (parseFloat(b["percent_large_loss"]) + parseFloat(b["percent_slight_loss"]) + parseFloat(b["percent_no_change"]))
        }
      })

    var data_middle = data
      .filter(function(d){
        return parseFloat(d["percent_no_change"]) == 100
      })

    var data_end = data
      .filter(function(d){
        return parseFloat(d["percent_no_change"]) != 100 && ( parseFloat(d["percent_large_increase"]) + parseFloat(d["percent_slight_increase"]) ) <= ( parseFloat(d["percent_slight_loss"]) + parseFloat(d["percent_large_loss"]) )
      })
      .sort(function(a, b){
        if((parseFloat(b["percent_large_loss"])+parseFloat(b["percent_slight_loss"])) == (parseFloat(a["percent_large_loss"]) + parseFloat(a["percent_slight_loss"]))){
          return parseFloat(a["percent_large_loss"]) - parseFloat(b["percent_large_loss"])
        }else{
          return (parseFloat(a["percent_large_loss"])+parseFloat(a["percent_slight_loss"]) +parseFloat(a["percent_no_change"])) - (parseFloat(b["percent_large_loss"]) + parseFloat(b["percent_slight_loss"]) + parseFloat(b["percent_no_change"]))
        }
      })
    allYears.push(data_start.concat(data_middle).concat(data_end))
  }
  return allYears;
}

function getSmallWidth(num, width, height){
  if(num > 400){
    return 26.23;
  }
  else if(num > 40){
    return 50;
  }
  else{
    return 130;
  }
}

function ntees(ntee){
  if(NTEES.hasOwnProperty(ntee)){
    return NTEES[ntee]
  }else{
    for (var key in NTEES) {
        if (NTEES[key][0] == ntee) return NTEES[key];
    }
  }
}

function locations(location){
  if(location.length == 2 || location == "all_states"){
    return [location, STATES[location] ]
  }
  else if(location == "all-usa-state" || location == "All USA"){
    return ["all-usa-state", "United States"]
  }else{
    if(CBSAS.hasOwnProperty(location)){
      return CBSAS[location]
    }else{
      for (var key in CBSAS) {
          if (CBSAS[key][0] == location) return CBSAS[key];
      }
    }
  }
}
d3.select("#loadingGif").style("height", function(){return d3.select("body").node().getBoundingClientRect().height - d3.select("#controls").node().getBoundingClientRect().height + "px" })
d3.csv("data/data.csv", function(err, input){
  var margin = {"left":20,"top":30,"right":10,"bottom":10}
  var SINGLE_YEAR = false;
  function drawSquares(input, isStates, topicFilter, locationFilter, startYear, endYear){
    d3.select("#loadingGif").style("height", function(){return d3.select("body").node().getBoundingClientRect().height - d3.select("#controls").node().getBoundingClientRect().height + "px" })
    d3.select("#jumpNarrative")
      .on("click", function(){
        $('html,body').animate({
        scrollTop: $("#bodyCopy").offset().top - 120},
        'slow');
      })
    var sorted = sortData(input, startYear, endYear)
    if(topicFilter != "all_topics" && locationFilter != "all_states" && locationFilter != "all_cities" && topicFilter != false && locationFilter != false && typeof(topicFilter) != "undefined" && typeof(locationFilter) != "undefined"){
      SINGLE_YEAR = true;
      sorted.splice(-1,1)
      sorted = [[].concat.apply([], sorted) , []];
    }else{
      SINGLE_YEAR = false;
    }
    for(var ind = 0; ind < sorted.length-1; ind++){
      var data = sorted[ind]
      if(isStates){
        d3.select(CBSA_SELECTOR).classed("enabled",false).classed("disabled",true)
        d3.select(STATE_SELECTOR).classed("enabled",true).classed("disabled",false)
        data = data
          .filter(function(d){
            return d.location_type == "state" || d.location_type == "all_usa-state"
          })
      }else{
        d3.select(STATE_SELECTOR).classed("enabled",false).classed("disabled",true)
        d3.select(CBSA_SELECTOR).classed("enabled",true).classed("disabled",false)
        data = data
          .filter(function(d){
            return d.location_type == "cbsa" || d.location_type == "all_usa-state"
          })
      }
      if(typeof(topicFilter) != "undefined" && topicFilter != false && topicFilter != "all_topics"){
        data = data
          .filter(function(d){
            return ntees(topicFilter)[0] == ntees(d.topic)[0]
          })
      }
      if(typeof(locationFilter) != "undefined" && locationFilter != false && locationFilter != "all_cities" && locationFilter != "all_states"){
        data = data
          .filter(function(d){
            return locations(locationFilter)[0] == locations(d.location)[0]
          })
      }

      var yearContainer = d3.select("#chart")
        .append("div")
        .attr("class","yearContainer start_year-" + data[0]["start_year"])
      yearContainer
        .append("div")
        .attr("class","yearHeader")
        .html(function(){
          if(SINGLE_YEAR){
            return data[0]["start_year"] + "&ndash;" + (parseInt(data[data.length-1]["start_year"])+1)
          }else{
            return data[0]["start_year"] + "&ndash;" + (parseInt(data[0]["start_year"])+1)
          }
        })

      var legend = yearContainer
        .append("div")
        .attr("class","legend")

      var li = legend
        .append("div")
        .attr("class","legend-container")

        li.insert("div")
          .attr("class","key key-li")
        li.append("div")
          .attr("class","keyLabel")
          .text("Large increase (more than 10%)")

      var si = legend
        .append("div")
        .attr("class","legend-container")

        si.insert("div")
          .attr("class","key key-si")
        si.append("div")
          .attr("class","keyLabel")
          .text("Slight increase (3 to 10%)")

      var nc = legend
        .append("div")
        .attr("class","legend-container")

        nc.insert("div")
          .attr("class","key key-nc")
        nc.append("div")
          .attr("class","keyLabel")
          .text("No change (-3 to 3%)")

      var sl = legend
        .append("div")
        .attr("class","legend-container")

        sl.insert("div")
          .attr("class","key key-sl")
        sl.append("div")
          .attr("class","keyLabel")
          .text("Slight loss (3 to 10%)")

      var ll = legend
        .append("div")
        .attr("class","legend-container")

        ll.insert("div")
          .attr("class","key key-ll")
        ll.append("div")
          .attr("class","keyLabel")
          .text("Large loss (more than 10%)")


      var chart = yearContainer
        .append("svg")
        .attr("class","chartContainer")
        .attr("width", window.innerWidth - margin.left - margin.right - 1)
        .attr("height", 0)
        .append("g")
        .attr("class","chartGroup")
        .on("mouseout",function(){
          if(d3.selectAll(".small_chart.clicked").nodes().length != 0){
            d3.selectAll(".small_chart")
              .classed("fade",true)
            d3.selectAll(".small_chart.clicked")
              .classed("fade",false)
            d3.selectAll(".highlightTabText").text(stickyTabText)
            d3.selectAll(".highlightTabHeader").text(stickyHeaderText)
          }else{
            d3.selectAll(".small_chart")
              .classed("clicked",false)
              .classed("hovered",false)
              .classed("fade",false)
            stickyTabText = ""
            stickyHeaderText = ""
            d3.selectAll(".highlightShow")
              .style("opacity",0)
            d3.selectAll(".sortShow")
              .style("opacity",1)
          }

        });

      var rowCount,
      small_width = getSmallWidth(data.length,d3.select("#chart").node().getBoundingClientRect().width,window.innerHeight)
      gutter = (data.length < 21) ? 50 :  small_width/9


      rowCount = Math.floor((d3.select("#chart svg").node().getBoundingClientRect().width - margin.left - margin.right) / (small_width + gutter))
      d3.select(chart.node().parentNode)
        .attr("height", function(){
          if(data.length == 52 && !IS_MAP && BY_STATE){
            return "550px";
          }else{
            return margin.top + margin.bottom + (small_width+gutter) * Math.ceil(data.length/rowCount) + "px"
          }
        })
      chart.append("rect")
        .attr("width",233.16 - gutter)
        .attr("height", 29.14 - gutter)
        .attr("x",margin.left)
        .attr("y",margin.top)
        .attr("class","highlightTabBg highlightShow")
        .style("opacity",0)
      chart.append("text")
        .attr("x",margin.left + 9)
        .attr("y",margin.top + 18)
        .attr("class","highlightTabText highlightShow")
        .text("International and foreign affairs")
        .style("opacity",0)
      chart.append("text")
        .attr("x",margin.left)
        .attr("y",margin.top-gutter*2)
        .attr("class","highlightTabHeader highlightShow")
        .text("HIGHLIGHTED TYPE")
        .style("opacity",0)
      var sortY = (data.length > 200) ? margin.top + 15 : margin.top-10;
      chart.append("text")
        .attr("x",margin.left)
        .attr("y",sortY)
        .attr("class","sortShow sortText")
        .text(function(){
          if(SINGLE_YEAR){
            return "By fiscal year"
          }
          else if(data.length == 52 && !IS_MAP && BY_STATE){
            return "By location"
          }else{
            return "From biggest gains to biggest losses"
          }
        })
        .style("opacity",1)

        var mapShow = chart.append("text")
          .attr("class","mapShow")
          .text("(Click to sort data)")
          .attr("x",margin.left + 70)
          .attr("y",20)
          .style("opacity",0)
          .style("pointer-events","none")
          .on("click", function(){
            // BY_STATE = !BY_STATE
            if( BY_STATE ){
              d3.selectAll(".sortText").text("From biggest gains to biggest losses")
              
              d3.selectAll(".mapShow")
                .style("opacity",1)
                .style("pointer-events","visible")
                .attr("x",margin.left + 200)
                .text("(Click for map view)")
              d3.selectAll("svg")
                .each(function(){
                  var c = this
                  rc = Math.floor((d3.select(c).node().getBoundingClientRect().width - margin.left - margin.right) / (50+50/9))

                  var newHeight = (50+50/9) * Math.ceil(52/rc) + 2*50/9 + margin.top

                  d3.select(c).transition().attr("height", function(){ return String(newHeight)})

                  d3.select(c).selectAll(".small_chart")
                    .transition()
                    .duration(1000)
                    .delay(function(d,i){
                      return 200* i/52
                    })
                    .attr("transform", function(d,i){
                      i += 1;
                  
                      var x = margin.left + ( (((i-1)%rc)) * (50+50/9) )
                      var y = margin.top + ( (Math.ceil(i/rc)-1) * (50+50/9) )
                      return "translate(" + x + "," + y + ")"
                    })
                    .on("end", function(){
                      BY_STATE = false;
                    })
              })
            }else{
              d3.selectAll(".sortText").text("By location")

              d3.selectAll(".mapShow")
                .style("opacity",1)
                .style("pointer-events","visible")
                .attr("x",margin.left + 70)
                .text("(Click to sort data)")
              d3.selectAll("svg")
                .each(function(){
                  var c = this
                  d3.select(c).transition().attr("height", "550")
                  d3.select(c).selectAll(".small_chart")
                    .transition()
                    .duration(1000)
                    .delay(function(d,i){
                      return 200* i/52
                    })
                    .attr("transform", function(d,i){
                      var tmp = stateData.features.filter(function(o) { return o.properties.abbr == d.location} )
                      return "translate(" + path.centroid(tmp[0]) + ")"
                    })
                    .on("end", function(){
                      BY_STATE = true;
                    })
              })
            }
          })

      if(data.length == 52 && !IS_MAP && BY_STATE){
        mapShow
          .style("opacity",1)
          .style("pointer-events","visible")
          .attr("x",margin.left + 70)
          .text("(Click to sort data)")

        d3.selectAll(".sortText").text("By location")


      }
      if(data.length == 52 && !IS_MAP && !BY_STATE){
        mapShow
          .style("opacity",1)
          .style("pointer-events","visible")
          .attr("x",margin.left + 200)
          .text("(Click for map view)")

        d3.selectAll(".sortText").text("From biggest gains to biggest losses")

      }
      // chart.append("text")
      //   .attr("x",margin.left)
      //   .attr("y",margin.top + 18)
      //   .attr("class","sortShow sortText")
      //   .html("increase (upper left &rarr; lower right)")
      //   .style("opacity",1)

      var PERCENT = d3.format(".2%")
      var COMMA = d3.format(",.0f")

      var small_chart = chart.selectAll(".small_chart")
        .data(data)
        .enter()
        .append("g")
        .attr("class",function(d){
          var returnClass = "small_chart visible "
          returnClass += d.location_type + " "
          returnClass += "start_year-" + d.start_year + " "
          if (d.location_type == "cbsa"){
            returnClass += CBSAS[d.location][0] + " "
          }else{
            returnClass += locations(d.location)[0] + " "
          }
          returnClass += ntees(d.topic)[0]

          return returnClass
        })
        .attr("width",small_width + "px")
        .attr("height",small_width + "px")
        .attr("transform", function(d,i){
          if(data.length == 52 && !IS_MAP && BY_STATE){
            var tmp = stateData.features.filter(function(o) { return o.properties.abbr == d.location} )
            // console.log(d.location)
            return "translate(" + path.centroid(tmp[0]) + ")"
          }
          i += 1;
          if(data.length > 60){
            var offset = Math.floor(233.16/(small_width+gutter))
            i += offset
          }
          var x = margin.left + ( (((i-1)%rowCount)) * (small_width+gutter) )
          var y = margin.top + ( (Math.ceil(i/rowCount)-1) * (small_width+gutter) )
          return "translate(" + x + "," + y + ")"
        })
        .on("mouseover", function(d){
          d3.select("#tt-topic").text(ntees(d.topic)[1])
          d3.select("#tt-location").text(locations(d.location)[1])
          d3.select("#tt-total_orgs span").text(COMMA(d.total_orgs))
          d3.select("#tt-ll span").text(PERCENT(d.percent_large_loss/100) )
          d3.select("#tt-sl span").text(PERCENT(d.percent_slight_loss/100) )
          d3.select("#tt-nc span").text(PERCENT(d.percent_no_change/100) )
          d3.select("#tt-li span").text(PERCENT(d.percent_large_increase/100) )
          d3.select("#tt-si span").text(PERCENT(d.percent_slight_increase/100) )

          var cell = this;
          d3.select("#chartTooltip")
            .style("display","block")
            .style("left", function(){
              var center = d3.select(cell).node().getBoundingClientRect().left + cell.getBoundingClientRect().width/2
              if(center - 105 < 0){
                d3.select(this).classed("left-tt", true)
                d3.select(this).classed("right-tt", false)
                return (center - 8 - cell.getBoundingClientRect().width/2) + "px"
              }
              else if(center + 105 > window.innerWidth){
                d3.select(this).classed("left-tt", false)
                d3.select(this).classed("right-tt", true)
                return (center - 210 + 8 + cell.getBoundingClientRect().width/2) + "px"
              }else{
                d3.select(this).classed("left-tt", false)
                d3.select(this).classed("right-tt", false)
                return (center - 105) + "px";
              }
              // return ((d3.select(cell).node().getBoundingClientRect().left + cell.getBoundingClientRect().width/2 -105) +"px")
              return 0;
            })
            .style("top", (d3.select(this).node().getBoundingClientRect().bottom+5) +"px")
          if(d3.select("#topicContainer").classed("active")){
            selectionHandler(ntees(d.topic)[0], false, "hover")
          }else{
            if(d3.select(CBSA_SELECTOR).classed("enabled")){
              selectionHandler(false, CBSAS[d.location][0], "hover")  
            }else{
              selectionHandler(false, locations(d.location)[0], "hover")
            }
          }
        })
        .on("mouseout",function(d){
          d3.select("#chartTooltip")
            .style("display","none")
          d3.selectAll(".small_chart").classed("hovered",false)
          if(d3.selectAll(".small_chart.clicked").nodes().length != 0){
            d3.selectAll(".small_chart")
              .classed("fade",true)
            d3.selectAll(".small_chart.clicked")
              .classed("fade",false)
          }else{
            d3.selectAll(".small_chart")
              .classed("clicked",false)
              .classed("hovered",false)
              .classed("fade",false)
          }
          d3.selectAll(".temp_li").remove()
        })
        .on("click",function(d){
          if(d3.select("#topicContainer").classed("active")){
            if(d3.select(CBSA_SELECTOR).classed("disabled")){
              $("#state_selector" ).val("all_states").selectmenu("refresh")
              $("#scroll_state_selector" ).val("all_states").selectmenu("refresh")
            }else{
              $("#cbsa_selector" ).val("all_states").selectmenu("refresh")
              $("#scroll_cbsa_selector" ).val("all_cities").selectmenu("refresh")
            }
            selectionHandler(ntees(d.topic)[0], false, "click")
          }else{
              $("#topics_selector" ).val("all_topics").selectmenu("refresh")
              $("#scroll_topics_selector" ).val("all_topics").selectmenu("refresh")

            if(d.location.length == 2 || d.location == "all_states" || d.location == "all-usa-state"){
              selectionHandler(false, d.location, "click")
            }else{
              selectionHandler(false, CBSAS[d.location][0], "click")
            }
          }
        })

      var cats = ["percent_large_increase","percent_slight_increase","percent_no_change","percent_slight_loss","percent_large_loss"]
      var start = 0;
      for(var i = 0; i < cats.length; i++){
        var cat = cats[i]
        small_chart
          .append("rect")
          .attr("height", function(d){ return small_width*(parseFloat(d[cat])/100)})
          .attr("y", function(d){
            if(isNaN(d[cat])){
            }
            var start = small_width;
            for(var j = 0; j <= i ; j++){
              start += small_width*parseFloat(d[cats[j]])/100
            }
            return (small_width + small_width - start);
          })
          .attr("width", small_width)
          .attr("x",0)
          .attr("class",cat)
      }
      if(data.length < 21){
        small_chart.append("text")
        .attr("class", "smallMultipleLabelTemp")
        .style("opacity",0)
        .attr("y",15+small_width)
        .html(function(d){
          if((d3.selectAll(".small_chart.Arts").nodes().length != 0 && d3.selectAll(".small_chart.Other").nodes().length != 0)){
            return ntees(d.topic)[1]
          }else{
            return parseInt(d.start_year) + "&ndash;" + (parseInt(d.start_year)+1)
          }
        })
        .call(wrap, small_width, small_width)
        .transition()
        .style("opacity",1)
        .on("end", function(){
          d3.select(this).attr("class","smallMultipleLabel")
        })
      }
      yearContainer
        .append("div")
        .attr("class","downloadData")
        .html(function(){
            if(SINGLE_YEAR){
              return "<span>Download data for:</span> <a href = 'data/source/Almanac Data Viz Growth.zip'>All years</a>"
            }else{
              return "<span>Download data for:</span> <a href = 'data/source/Almanac Data Viz Growth " + data[0]["start_year"] + "-" + (parseInt(data[0]["start_year"])+1) + ".xlsx'>" + data[0]["start_year"] + "&ndash;" + (parseInt(data[0]["start_year"])+1)+"</a> | <a href = 'data/source/Almanac Data Viz Growth.zip'>All years</a>"
            }
          })
    }//end outer for loop on sorted data
  }
  drawSquares(input, true, undefined, undefined, 2005, 2014)
  var IS_PHONE = d3.select("#isPhone").style("display") == "block"
  var IS_MOBILE = d3.select("#isMobile").style("display") == "block"
  var IS_MAP = d3.select("#isMap").style("display") == "block"

  window.onresize = function(){
    IS_PHONE = d3.select("#isPhone").style("display") == "block"
    IS_MOBILE = d3.select("#isMobile").style("display") == "block"
    IS_MAP = d3.select("#isMap").style("display") == "block"


    d3.selectAll(".yearContainer").remove()
    drawSquares(input, d3.select(STATE_SELECTOR).classed("enabled"), $(TOPIC_SELECTOR).val(), $(ENABLED_SELECTOR).val(), parseInt($(START_YEAR_SELECTOR).val().replace("start_year-","")), parseInt($(END_YEAR_SELECTOR).val().replace("end_year-","")))
  }

  function listenForEvents(){
    $( START_YEAR_SELECTOR ).selectmenu({
      change: function(event, d){
        // d3.select('#topics_selector option[value=' + this.value +']').node().selected = true
        var startYear = parseInt(this.value.replace("start_year-",""))
        var endYear = parseInt(d3.select("#end_year_selector").node().value.replace("end_year-",""))

        if(endYear <= startYear){
          // $( END_YEAR_SELECTOR ).selectmenu("open")
          // d3.select('#end_year_selector option[value=' + "end_year-" + (startYear + 1) +']').node().selected = true
          $( END_YEAR_SELECTOR ).selectmenu("open")
          d3.select( END_YEAR_SELECTOR + "-button").classed("error", true)
         // d3.selectAll('#end_year_selector option').nodes().disabled = false
        }

        $( "#end_year_selector" ).selectmenu("refresh")
        $( "#scroll_end_year_selector" ).selectmenu("refresh")

        if(this.id.search("scroll") != -1){
          d3.select('#start_year_selector option[value=' + this.value +']').node().selected = true
          $( "#start_year_selector" ).selectmenu("refresh")
        }else{
          d3.select('#scroll_start_year_selector option[value=' + this.value +']').node().selected = true
          $( "#scroll_start_year_selector" ).selectmenu("refresh")
        }
        if(endYear > startYear){
          redrawSquares(d3.select(STATE_SELECTOR).classed("enabled"), $(TOPIC_SELECTOR).val(), $(ENABLED_SELECTOR).val(), "menu", parseInt(this.value.replace("start_year-","")), parseInt($(END_YEAR_SELECTOR).val().replace("end_year-","")))
        }

      },
      select: function(event, d){
        d3.selectAll(".error").classed("error", false)
      }
    })
    $( END_YEAR_SELECTOR ).selectmenu({
      change: function(event, d){
        var endYear = parseInt(this.value.replace("end_year-",""))
        var startYear = parseInt(d3.select("#start_year_selector").node().value.replace("start_year-",""))

        if(endYear <= startYear){
          // $( END_YEAR_SELECTOR ).selectmenu("open")
          // d3.select('#start_year_selector option[value=' + "start_year-" + (endYear - 1) +']').node().selected = true
          $( START_YEAR_SELECTOR ).selectmenu("open")
          d3.select( START_YEAR_SELECTOR + "-button").classed("error", true)
         // d3.selectAll('#end_year_selector option').nodes().disabled = false
        }
        $( "#start_year_selector" ).selectmenu("refresh")
        $( "#scroll_start_year_selector" ).selectmenu("refresh")

        if(this.id.search("scroll") != -1){
          d3.select('#end_year_selector option[value=' + this.value +']').node().selected = true
          $( "#end_year_selector" ).selectmenu("refresh")
        }else{
          d3.select('#scroll_end_year_selector option[value=' + this.value +']').node().selected = true
          $( "#scroll_end_year_selector" ).selectmenu("refresh")
        }
        if( endYear > startYear){
          redrawSquares(d3.select(STATE_SELECTOR).classed("enabled"), $(TOPIC_SELECTOR).val(), $(ENABLED_SELECTOR).val(), "menu", parseInt($(START_YEAR_SELECTOR).val().replace("start_year-","")), parseInt(this.value.replace("end_year-","")))
        }
      },
      select: function(event, d){
        d3.selectAll(".error").classed("error", false)
      }
    })

    $( TOPIC_SELECTOR ).selectmenu({
      change: function(event, d){
        if(d3.selectAll(".small_chart.visible." + this.value).nodes().length == 0){
          redrawSquares(d3.select(STATE_SELECTOR).classed("enabled"), this.value, $(ENABLED_SELECTOR).val(), "menu", undefined, undefined)  
        }else{
          if($(ENABLED_SELECTOR).val() == "all_states" || $(ENABLED_SELECTOR).val() == "all_cities"){
            selectionHandler(this.value, false, "menu")
          }else{
            selectionHandler(this.value, $(ENABLED_SELECTOR).val(), "menu")
          }
        } 
        d3.selectAll(".menuContainer").classed("active",false)
        d3.selectAll(".scroll_menuContainer").classed("active",false)
        d3.select("#topicContainer").classed("active",true)
        d3.select("#scroll_topicContainer").classed("active",true)
        if(this.id.search("scroll") != -1){
          d3.select('#topics_selector option[value=' + this.value +']').node().selected = true
          $( "#topics_selector" ).selectmenu("refresh")
        }else{
          d3.select('#scroll_topics_selector option[value=' + this.value +']').node().selected = true
          $( "#scroll_topics_selector" ).selectmenu("refresh")
        }
        if(this.value == "Hospitals"){
          d3.select("#hide-np").style("display","inline")
          d3.select("#hide-nps").text("have ")
        }
        else if(this.value == "all_topics"){
          d3.select("#hide-np").style("display","none")
          d3.select("#hide-nps").text("nonprofit has ")
        }
        else{
          d3.select("#hide-np").style("display","none")
          d3.select("#hide-nps").text("nonprofits have ")
        }
      }
    })
    $( STATE_SELECTOR ).selectmenu({
      change: function(event, d){
        if(this.value == "none"){
          return false;
        }
        if(d3.select(STATE_SELECTOR).classed("enabled")){
          if(this.value == "all_states" && d3.selectAll(".small_chart.NH").nodes().length == 0 || d3.selectAll(".small_chart.CA").nodes().length == 0){
            redrawSquares(true, $(TOPIC_SELECTOR).val(), this.value, "menu", undefined, undefined)
          }else{
            selectionHandler(false, this.value, "menu")
          }
        }else{
          redrawSquares(true, $(TOPIC_SELECTOR).val(), this.value, "menu", undefined, undefined)
        }

        d3.select("#cbsa_selector").classed("enabled",false).classed("disabled",true)
        d3.select("#state_selector").classed("enabled",true).classed("disabled",false)
        d3.select("#scroll_cbsa_selector").classed("enabled",false).classed("disabled",true)
        d3.select("#scroll_state_selector").classed("enabled",true).classed("disabled",false)

        d3.selectAll(".menuContainer").classed("active",true)
        d3.selectAll(".scroll_menuContainer").classed("active",true)
        d3.select("#topicContainer").classed("active",false)
        d3.select("#scroll_topicContainer").classed("active",false)
        if(this.id.search("scroll") != -1){
          // d3.select('#state_selector option[value=' + this.value +']').node().selected = true
          $( "#state_selector" ).val(this.value).selectmenu("refresh")
        }else{
          // d3.select('#scroll_state_selector option[value=' + this.value +']').node().selected = true
          $( "#scroll_state_selector" ).val(this.value).selectmenu("refresh")
        }
      }
    })
    $( CBSA_SELECTOR ).selectmenu({
      change: function(event, d){
        if(this.value == "none"){
          return false;
        }
        if(d3.select(CBSA_SELECTOR).classed("enabled")){
          if(this.value == "all_cities" && d3.selectAll(".small_chart.Atlanta-Sandy-Springs-Roswell").nodes().length == 0 || d3.selectAll(".small_chart.Austin-Round-Rock").nodes().length == 0){
            redrawSquares(false, $(TOPIC_SELECTOR).val(), this.value, "menu", undefined, undefined)
          }else{
            selectionHandler(false, this.value, "menu")
          }
        }else{
          redrawSquares(false, $(TOPIC_SELECTOR).val(), this.value, "menu", undefined, undefined)
        }

        d3.select("#state_selector").classed("enabled",false).classed("disabled",true)
        d3.select("#cbsa_selector").classed("enabled",true).classed("disabled",false)
        d3.select("#scroll_state_selector").classed("enabled",false).classed("disabled",true)
        d3.select("#scroll_cbsa_selector").classed("enabled",true).classed("disabled",false)

        d3.selectAll(".menuContainer").classed("active",true)
        d3.selectAll(".scroll_menuContainer").classed("active",true)
        d3.select("#topicContainer").classed("active",false)
        d3.select("#scroll_topicContainer").classed("active",false)
        if(this.id.search("scroll") != -1){
          // d3.select('#cbsa_selector option[value=' + this.value +']').node().selected = true
          $( "#cbsa_selector" ).val(this.value).selectmenu("refresh")
        }else{
          // d3.select('#scroll_cbsa_selector option[value=' + this.value +']').node().selected = true
          $( "#scroll_cbsa_selector" ).val(this.value).selectmenu("refresh")
        }
      }
    })

    d3.select(FILTER_BUTTON)
      .on("click", function(){
        d3.selectAll(".highlightShow")
          .style("opacity",0)
        d3.selectAll(".sortShow")
          .style("opacity",1)
        d3.select("#filter_button").transition().duration(800).style("opacity",0)

        if(d3.select(".small_chart.clicked").nodes().length == 0){
          return false;
        }else{
          var clickedTest = d3.select(".yearContainer").selectAll(".small_chart.clicked")

          if(clickedTest.nodes().length  == 1 && (d3.selectAll(".small_chart.clicked.Arts").nodes().length == 0 || d3.selectAll(".small_chart.clicked.Other").nodes().length == 0)){
            redrawSquares(d3.select(STATE_SELECTOR).classed("enabled"), $(TOPIC_SELECTOR).val(), $(ENABLED_SELECTOR).val(), "menu", undefined, undefined) 
            return false;
          }
          if(d3.select(".small_chart.clicked").nodes().length > 200){
            d3.selectAll(".sortShow")
              .transition()
              .attr("y",margin.top+15)
          }else{
            d3.selectAll(".sortShow")
              .transition()
              .attr("y",margin.top-10)
          }
          d3.selectAll(".chartContainer")
            .each(function(){
              var clicked = d3.select(this).selectAll(".small_chart.clicked")
              small_width = getSmallWidth(clicked.nodes().length, d3.select(this).node().getBoundingClientRect().width,d3.select(this).node().getBoundingClientRect().height)
            
              gutter = (clicked.nodes().length < 21) ? 50 :  small_width/9
              rowCount = Math.floor((d3.select("#chart svg").node().getBoundingClientRect().width - margin.left - margin.right) / (small_width + gutter))
              var newHeight = (small_width+gutter) * Math.ceil(clicked.nodes().length/rowCount) + 2*gutter + margin.top

              if(clicked.nodes().length == 52 && !IS_MAP && BY_STATE){
                newHeight = 550;
                d3.selectAll(".sortText").html("By location")
                d3.selectAll(".mapShow").style("opacity",1).style("pointer-events","visible")

              }else{
                d3.selectAll(".sortText").text("From biggest gains to biggest losses")
                d3.selectAll(".mapShow").style("opacity",0).style("pointer-events","none")
              }
              d3.select(this).transition().attr("height", function(){ return String(newHeight)})
              var old_width = parseFloat(d3.select(".small_chart rect").attr("width").replace("px",""))
              var scale = (d3.selectAll(".smallMultipleLabel").nodes().length == 0) ? small_width/old_width : 1;
              console.log(scale)

              // var scale = 1;
              clicked.transition()
              .duration(1000)
              .delay(function(d,i){
                return 200* i/clicked.nodes().length
              })
              .attr("transform", function(d,i){
              if(clicked.nodes().length == 52 && !IS_MAP && BY_STATE){
                var tmp = stateData.features.filter(function(o) { return o.properties.abbr == d.location} )
                return "translate(" + path.centroid(tmp[0]) + ")"
                // d3.selectAll(".sortText").text("By location")
                d3.selectAll(".mapShow")
                  .style("opacity",1)
                  .style("pointer-events","visible")
                  .attr("x",margin.left + 70)
                  .text("(Click to sort data)")
              }
              else if(clicked.nodes().length == 52 && !IS_MAP && !BY_STATE){
                // d3.selectAll(".sortText").text("From biggest gains to biggest losses")
                d3.selectAll(".mapShow")
                  .style("opacity",1)
                  .style("pointer-events","visible")
                  .attr("x",margin.left + 200)
                  .text("(Click for map view)")
              }

                i += 1;
                var x = margin.left + ( (((i-1)%rowCount)) * (small_width+gutter) )
                var y = margin.top + ( (Math.ceil(i/rowCount)-1) * (small_width+gutter) )
                return "translate(" + x + "," + y + ")"
              })
              clicked.selectAll("rect")
              .attr("width", function(){
                return parseFloat(d3.select(this).attr("width")) * scale
              })
              .attr("height", function(){
                return parseFloat(d3.select(this).attr("height")) * scale
              })
              .attr("y", function(){
                return parseFloat(d3.select(this).attr("y")) * scale
              })
              d3.selectAll(".smallMultipleLabel")
                .transition()
                .style("opacity",0)
                .on("end", function(){
                  d3.select(this).remove()
                })


              if(clicked.nodes().length < 21){
                clicked.append("text")
                  .attr("class", "smallMultipleLabelTemp")
                  .style("opacity",0)
                  .attr("y",15+small_width)
                  .html(function(d){
                    if((d3.selectAll(".small_chart.clicked.Arts").nodes().length != 0 && d3.selectAll(".small_chart.clicked.Other").nodes().length != 0)){
                      return ntees(d.topic)[1]
                    }else{
                      return parseInt(d.start_year) + "&ndash;" + (parseInt(d.start_year)+1)
                    }
                  })
                  .call(wrap, small_width, small_width)
                  .transition()
                  .delay(1000)
                  .style("opacity",1)
                  .on("end", function(){
                    d3.select(this).attr("class","smallMultipleLabel")
                  })
              }

          })
        }

        d3.selectAll(".small_chart:not(.clicked)")
        .remove()
      })//end filter button click
  }
  listenForEvents()

  function selectionHandler(topic, location, action){
    d3.selectAll(".onLoadClass").classed("onLoadClass",false)
    var isStates = location.length == 2 || location == "all_states" || location == "all-usa-state"
    if(action == "click"){
      if(location != false){
        if(isStates){
          d3.select('#state_selector option[value=' + location +']').node().selected = true
          $( "#state_selector" ).selectmenu("refresh")
          d3.select('#scroll_state_selector option[value=' + location +']').node().selected = true
          $( "#scroll_state_selector" ).selectmenu("refresh")
        }else{
          d3.select('#cbsa_selector option[value=' + location +']').node().selected = true
          $( "#cbsa_selector" ).selectmenu("refresh")
          d3.select('#scroll_cbsa_selector option[value=' + location +']').node().selected = true
          $( "#scroll_cbsa_selector" ).selectmenu("refresh")
        }
      }
      if(topic != false){
        d3.select('#topics_selector option[value=' + topic +']').node().selected = true
        $( "#topics_selector" ).selectmenu("refresh")
        d3.select('#scroll_topics_selector option[value=' + topic +']').node().selected = true
        $( "#scroll_topics_selector" ).selectmenu("refresh")
        if(topic == "Hospitals"){
          d3.select("#hide-np").style("display","inline")
          d3.select("#hide-nps").style("display","none")
        }else{
          d3.select("#hide-np").style("display","none")
          d3.select("#hide-nps").style("display","inline")
        }
      }
    }
    if(topic != false){

      if(topic == "all_topics"){
        if(d3.selectAll(".small_chart.visible.Arts").nodes().length != 0 && d3.selectAll(".small_chart.visible.Other").nodes().length != 0){
          highlightSquares(topic, location, action)
        }else{
          redrawSquares(isStates, topic, location, action, undefined, undefined)
        }
      }
      else if(d3.selectAll(".small_chart.visible." + topic).nodes().length != 0){
        highlightSquares(topic, location, action)
      }else{
        redrawSquares(isStates, topic, location, action, undefined, undefined)
      }
    }else{
      if(location == "all_states"){
        if(d3.selectAll(".small_chart.visible.NH").nodes().length != 0 && d3.selectAll(".small_chart.visible.CA").nodes().length != 0){
          highlightSquares(topic, location, action)
        }else{
          redrawSquares(isStates, topic, location, action, undefined, undefined)
        }
      }
      else if(location == "all_cities"){
        if(d3.selectAll(".small_chart.visible.Atlanta-Sandy-Springs-Roswell").nodes().length != 0 && d3.selectAll(".small_chart.visible.Austin-Round-Rock").nodes().length != 0){
          highlightSquares(topic, location, action)
        }else{
          redrawSquares(isStates, topic, location, action, undefined, undefined)
        }
      }
      else if(d3.selectAll(".small_chart.visible." + location).nodes().length != 0){
        highlightSquares(topic, location, action)
      }else{
        if(topic == false) topic = $(TOPIC_SELECTOR).val()
        if(location == false) topic = $(ENABLED_SELECTOR).val()
        redrawSquares(isStates, topic, location, action, undefined, undefined)
      }
    }
  }
  var stickyTabText = "";
  var stickyHeaderText = "";
  function highlightTab(topic, location, action){
    if(d3.select(".yearContainer").selectAll(".small_chart").nodes().length < 200){
      return false
    }
    var tabText, headerText;
    d3.selectAll(".sortShow")
      .style("opacity",0)
    d3.selectAll(".highlightShow")
        .style("opacity",1)
    if(topic != false && location != false){
      d3.selectAll(".highlightTabHeader")
        .text("HIGHLIGHTED DATA")
      headerText = "HIGHLIGHTED DATA"
      tabText = "Multiple selections"
    }
    else if(location == false){
      headerText = "HIGHLIGHTED TYPE"
      tabText = ntees(topic)[1]
    }else{
      headerText = "HIGHLIGHTED LOCATION"
      tabText = locations(location)[1]
    }
    d3.selectAll(".highlightTabText")
      .text(tabText)
    d3.selectAll(".highlightTabHeader")
        .text(headerText)
    if(action != "hover"){
      stickyTabText = tabText;
      stickyHeaderText = headerText;
    }
  }

  function highlightSquares(topic, location, action){
    var menuSelector = (location.length == 2 || location == "all_states" || location == "all-usa-state") ? STATE_SELECTOR : CBSA_SELECTOR;
    var allSelector = (location.length == 2 || location == "all_states" || location == "all-usa-state") ? "all_states" : "all_cities";
    var highlightHeader = (location.length == 2 || location == "all_states" || location == "all-usa-state") ? "HIGHLIGHTED STATE" : "HIGHLIGHTED AREA"
    if(location != "all_states" && location != "all_cities"){ highlightTab(topic, location, action) }
    else{ d3.selectAll(".highlightShow").style("opacity",0); d3.selectAll(".sortShow").style("opacity",1) }
    if(action != "hover"){
      d3.select("#filter_button").transition().duration(800).style("opacity",1)
      if(topic != false){
        d3.select(TOPIC_SELECTOR).node().value = topic
        if(action == "click"){
          d3.select(menuSelector).node().value = allSelector
        }
      }else{
        d3.select(menuSelector).node().value = location
        if(action == "click"){
          d3.select(TOPIC_SELECTOR).node().value = "all_topics"
        }
      }
    }
    if(topic != false){
      if(topic == "all_topics"){
        if(d3.select(menuSelector).node().value == allSelector){
        // Menu All topics, All USA selected
          d3.selectAll(".small_chart")
            .classed("fade",false)
            .classed("hovered",false)
            .classed("clicked",false)
        }else{
        // Menu All topics, A state selected
          d3.selectAll(".small_chart")
            .classed("fade",true)
            .classed("hovered",false)
            .classed("clicked",false)
          d3.selectAll(".small_chart." + d3.select(menuSelector).node().value)
            .classed("fade",false)
            .classed("hovered",false)
            .classed("clicked",true)
        }
      }else{
        if(d3.select(menuSelector).node().value != allSelector && d3.select(menuSelector).node().value != "none"){
          selector = "." + d3.select(menuSelector).node().value + "." + topic
        }else{
          selector = "." + topic
        }
        if(action == "hover"){
        // Hover, topic menu is active
          d3.selectAll(".small_chart")
            .classed("fade", true)
            .classed("hovered", false)
          d3.selectAll(".small_chart." + topic)
            .classed("fade",false)
            .classed("hovered",true)
        }
        else if(action == "click"){
        // Click, topic menu is active
          d3.selectAll(".small_chart")
            .classed("fade", true)
            .classed("hovered", false)
            .classed("clicked", false)
          d3.selectAll(".small_chart." + topic)
            .classed("fade",false)
            .classed("hovered",false)
            .classed("clicked",true)
        }else{
        // Select a topic, All USA selected
          if(d3.select(menuSelector).node().value == allSelector){
            d3.selectAll(".small_chart")
              .classed("fade", true)
              .classed("hovered", false)
              .classed("clicked",false)
            d3.selectAll(".small_chart." + topic)
              .classed("fade",false)    
              .classed("hovered",false)  
              .classed("clicked",true)
          }else{
          // Select a topic, A state selected
            d3.selectAll(".small_chart")
              .classed("fade", true)
              .classed("hovered", false)
              .classed("clicked",false)
            d3.selectAll(".small_chart" + selector)
              .classed("fade",false)    
              .classed("hovered",false)  
              .classed("clicked",true)
          }
        }
      }
    }else{
      if(location == allSelector){
        if(d3.select(TOPIC_SELECTOR).node().value == "all_topics"){
        // Menu All states, All USA selected
          d3.selectAll(".small_chart")
            .classed("fade",false)
            .classed("hovered",false)
            .classed("clicked",false)
        }else{
        // Menu All topics, A state selected
          d3.selectAll(".small_chart")
            .classed("fade",true)
            .classed("hovered",false)
            .classed("clicked",false)
          d3.selectAll(".small_chart." + d3.select(TOPIC_SELECTOR).node().value)
            .classed("fade",false)
            .classed("hovered",false)
            .classed("clicked",true)
        }
      }else{
        if(d3.select(TOPIC_SELECTOR).node().value != "all_topics"){
          selector = "." + d3.select(TOPIC_SELECTOR).node().value + "." + location
        }else{
          selector = "." + location
        }
        if(action == "hover"){
        // Hover, topic menu is active
          d3.selectAll(".small_chart")
            .classed("fade", true)
            .classed("hovered", false)
          d3.selectAll(".small_chart." + location)
            .classed("fade",false)
            .classed("hovered",true)
        }
        else if(action == "click"){
        // Click, topic menu is active
          d3.selectAll(".small_chart")
            .classed("fade", true)
            .classed("hovered", false)
            .classed("clicked", false)
          d3.selectAll(".small_chart." + location)
            .classed("fade",false)
            .classed("hovered",false)
            .classed("clicked",true)
        }else{
        // Select a topic, All USA selected
          if(d3.select(TOPIC_SELECTOR).node().value == "all_topics"){
            d3.selectAll(".small_chart")
              .classed("fade", true)
              .classed("hovered", false)
              .classed("clicked",false)
            d3.selectAll(".small_chart." + location)
              .classed("fade",false)    
              .classed("hovered",false)  
              .classed("clicked",true)
          }else{
          // Select a topic, A state selected
            d3.selectAll(".small_chart")
              .classed("fade", true)
              .classed("hovered", false)
              .classed("clicked",false)
            d3.selectAll(".small_chart" + selector)
              .classed("fade",false)    
              .classed("hovered",false)  
              .classed("clicked",true)
          }
        }
      }
    }
  }

  function redrawSquares(isStates, topic, location, action, startYear, endYear){
    if(typeof(startYear) == "undefined"){ startYear = parseInt($(START_YEAR_SELECTOR).val().replace("start_year-",""))}
    if(typeof(endYear) == "undefined"){ endYear = parseInt($(END_YEAR_SELECTOR).val().replace("end_year-",""))}
    counter = 0;
    if(isStates){

      // d3.select('#scroll_cbsa_selector option[value=' + "all_cities" +']').node().selected = true
      $( "#scroll_cbsa_selector" ).val("none").selectmenu("refresh")
      // d3.select('#cbsa_selector option[value=' + "all_cities" +']').node().selected = true
      $( "#cbsa_selector" ).val("none").selectmenu("refresh")
    }else{

            $( "#scroll_state_selector" ).val("none").selectmenu("refresh")
      // d3.select('#cbsa_selector option[value=' + "all_cities" +']').node().selected = true
      $( "#state_selector" ).val("none").selectmenu("refresh")

      // d3.select('#scroll_state_selector option[value=' + "all_states" +']').node().selected = true
      // $( "#scroll_state_selector" ).selectmenu("all_states","selected",true)
      // // d3.select('#state_selector option[value=' + "all_states" +']').node().selected = true
      // $( "#state_selector" ).selectmenu("all_states","selected",true)
    }
    d3.select("#loadingText")
      .style("opacity",0)
    d3.select("#filter_button")
      .transition()
      .style("opacity",0)
    d3.selectAll(".highlightShow")
      .style("opacity",0)
    d3.selectAll(".sortShow")
        .style("opacity",1)
    if(d3.selectAll("#loadingGif").nodes().length == 0){
      d3.select("body")
        .append("div")
        .attr("id", "loadingGif")  
    }
    d3.select("#loadingGif")
      .transition()
      .style("opacity", 1);

    d3.selectAll(".yearContainer")
      .style("position","relative")
      .transition()
      .duration(800)
      .style("left", function(){
        return window.innerWidth * -1.5 + "px"
      })
      .on("end", function(){
        d3.select(this).remove()

        if(d3.selectAll(".yearContainer").nodes().length == 0){
          drawSquares(input, isStates, topic, location, startYear, endYear)
          checkReady()
        }
      })
  }

  $("#scroll_cbsa_selector").selectmenu()
  $("#scroll_state_selector").selectmenu()
  $("#scroll_topics_selector").selectmenu()
  $("#scroll_start_year_selector").selectmenu()
  $("#scroll_end_year_selector").selectmenu()

  $("#cbsa_selector").selectmenu()
  $("#state_selector").selectmenu()
  $("#topics_selector").selectmenu()
  $("#start_year_selector").selectmenu()
  $("#end_year_selector").selectmenu()

  var isAnimating = false;

  function openDrawer(action){
    var scrollTo = (IS_PHONE) ? "-219px" : "-134px";
    if(!IS_MOBILE || action == "click"){
      d3.select("#scroll_controls")
        .transition()
        .duration(600)
        .style("top","40px")
    }

    CBSA_SELECTOR = "#scroll_cbsa_selector"
    STATE_SELECTOR = "#scroll_state_selector"
    TOPIC_SELECTOR = "#scroll_topics_selector"
    FILTER_BUTTON = "#scroll_filter_button"
    ENABLED_SELECTOR = ".scroll_locationMenu.enabled"
    START_YEAR_SELECTOR = "#scroll_start_year_selector"
    END_YEAR_SELECTOR = "#scroll_end_year_selector"
  }
  function closeDrawer(action){
    var scrollTo = (IS_PHONE) ? "-219px" : "-134px";
    if(!IS_MOBILE || action == "click"){
      d3.select("#scroll_controls")
        .transition()
        .duration(600)
        .style("top",scrollTo)
    }

    CBSA_SELECTOR = "#cbsa_selector"
    STATE_SELECTOR = "#state_selector"
    TOPIC_SELECTOR = "#topics_selector"
    FILTER_BUTTON = "#filter_button"
    ENABLED_SELECTOR = ".locationMenu.enabled"
    START_YEAR_SELECTOR = "#start_year_selector"
    END_YEAR_SELECTOR = "#end_year_selector"


  }
  d3.select("#hamboogerBar")
    .on("click", function(){
      if(d3.select(this).classed("closed")){
        openDrawer("click")
        d3.select(this).attr("class", "opened")
      }else{
        closeDrawer("click");
        d3.select(this).attr("class", "closed")
      }
    })
  $(window).scroll(function () { 
      if(d3.select(".yearContainer").node().getBoundingClientRect().top - d3.select("#scroll_controls").node().getBoundingClientRect().height >  35){
        closeDrawer("scroll")
      }else{
        openDrawer("scroll")
      }
      listenForEvents()
  });

})//end csv function

isIE = false;
var firstLoad = true;
var counter = 0;
function checkReady() {
  counter += 1;
  var drawn = d3.select(".small_chart").node();
  if (drawn == null) {
    if(counter >= 2){
        d3.select("#loadingText")
          .transition()
          .style("opacity", 1);
    }
    setTimeout("checkReady()", 100);
  } else {
    setTimeout(function(){
      if(firstLoad){
        d3.select("#hide-nps").text("nonprofit has ")
        d3.select("#loadText2").text("changed financially in")
        d3.select("#slashSentence").text("/")
        d3.select("#loadText3").text("between")
        d3.select("#loadText4").text("and")
        firstLoad = false
      }
      if(!isIE){
        d3.select("#loadingGif")
          .transition()
          .style("opacity", 0);
      }
      else if(isIE <= 10){
        d3.select("#stateImg").classed("ie", true);
        d3.select(".state.styled-select:not(.mobile)").classed("ie",true);
        d3.select("#loadingGif").remove();
      }
      else{
        d3.select("#loadingGif").remove();
      }
    },500);
  }
}
checkReady();
