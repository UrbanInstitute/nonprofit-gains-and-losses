var CBSA_SELECTOR = "#cbsa_selector"
var STATE_SELECTOR = "#state_selector"
var TOPIC_SELECTOR = "#topics_selector"
var FILTER_BUTTON = "#filter_button"
var ENABLED_SELECTOR = ".locationMenu.enabled"
var START_YEAR_SELECTOR = "#start_year_selector"
var END_YEAR_SELECTOR = "#end_year_selector"

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

function sortData(input){
  var allYears = [];
  for(i = 2009; i <= 2014; i++ ){
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
    return 20;
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
  if(location.length == 2 || location == "All USA"){
    return location
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

d3.csv("data/data.csv", function(err, input){
  var margin = {"left":10,"top":10,"right":10,"bottom":10}
  function drawSquares(input, isStates, topicFilter, locationFilter){
    var sorted = sortData(input)
    for(var ind = 0; ind < sorted.length-1; ind++){
      var data = sorted[ind]
      if(isStates){
        d3.select(CBSA_SELECTOR).classed("enabled",false).classed("disabled",true)
        d3.select(STATE_SELECTOR).classed("enabled",true).classed("disabled",false)
        data = data
          .filter(function(d){
            return d.location_type == "state"
          })
      }else{
        d3.select(STATE_SELECTOR).classed("enabled",false).classed("disabled",true)
        d3.select(CBSA_SELECTOR).classed("enabled",true).classed("disabled",false)
        data = data
          .filter(function(d){
            return d.location_type == "cbsa"
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
            return locations(locationFilter) == locations(d.location)
          })
      }

      var yearContainer = d3.select("#chart")
        .append("div")
        .attr("class","yearContainer start_year-" + data[0]["start_year"])
      yearContainer
        .append("text")
        .html(data[0]["start_year"] + "&ndash;" + (parseInt(data[0]["start_year"])+1))
      var chart = yearContainer
        .append("svg")
        .attr("class","chartContainer")
        .attr("width", window.innerWidth - margin.left - margin.right - 1)
        .attr("height", 400)
        .append("g")
        .attr("class","chartGroup")
        .on("mouseout",function(){
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

        });

      var rowCount,
      small_width = getSmallWidth(data.length,d3.select("#chart").node().getBoundingClientRect().width,window.innerHeight)
      gutter = (data.length < 15) ? 50 :  small_width/9


      rowCount = Math.floor((d3.select("#chart svg").node().getBoundingClientRect().width - margin.left - margin.right) / (small_width + gutter))
      d3.select(chart.node().parentNode)
        .attr("height", function(){
          return margin.top + margin.bottom + (small_width+gutter) * Math.ceil(data.length/rowCount) + "px"
        })
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
            returnClass += d.location + " "
          }
          if (d.topic == "aggregate"){
            returnClass += d.topic
          }else{
            returnClass += ntees(d.topic)[0]
          }
          return returnClass
        })
        .attr("width",small_width + "px")
        .attr("height",small_width + "px")
        .attr("transform", function(d,i){
          i += 1;
          if(data.length > 60){
            var offset = Math.ceil(150/(small_width+gutter))
            i += offset
          }
          var x = margin.left + ( (((i-1)%rowCount)) * (small_width+gutter) )
          var y = margin.top + ( (Math.ceil(i/rowCount)-1) * (small_width+gutter) )
          return "translate(" + x + "," + y + ")"
        })
        .on("mouseover", function(d){
          if(d3.select("#topicContainer").classed("active")){
            selectionHandler(ntees(d.topic)[0], false, "hover")
          }else{
            if(d3.select(CBSA_SELECTOR).classed("enabled")){
              selectionHandler(false, CBSAS[d.location][0], "hover")  
            }else{
              selectionHandler(false, d.location, "hover")
            }
          }
        })
        .on("mouseout",function(d){
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
            selectionHandler(ntees(d.topic)[0], false, "click")
          }else{
            if(d.location.length == 2 || d.location == "all_states"){
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
      if(data.length < 15){
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
    }//end outer for loop on sorted data
  }
  drawSquares(input, false)
  window.onresize = function(){
    d3.selectAll(".yearContainer").remove()
    drawSquares(input, d3.select(STATE_SELECTOR).classed("enabled"), $(TOPIC_SELECTOR).val(), $(ENABLED_SELECTOR).val())
  }

  function listenForEvents(){
    $( START_YEAR_SELECTOR ).selectmenu({
      change: function(event, d){

      }
    })
    $( END_YEAR_SELECTOR ).selectmenu({
      change: function(event, d){
        
      }
    })
    $( TOPIC_SELECTOR ).selectmenu({
      change: function(event, d){
        if(d3.selectAll(".small_chart.visible." + this.value).nodes().length == 0){
          redrawSquares(d3.select(STATE_SELECTOR).classed("enabled"), this.value, $(ENABLED_SELECTOR).val(), "menu")  
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
        if(this.id.search("scroll") != -1){ d3.select('#topics_selector option[value=' + this.value +']').node().selected = true }
        else{ d3.select('#scroll_topics_selector option[value=' + this.value +']').node().selected = true  }
      }
    })
    $( STATE_SELECTOR ).selectmenu({
      change: function(event, d){
        if(d3.select(STATE_SELECTOR).classed("enabled")){
          selectionHandler(false, this.value, "menu")
        }else{
          redrawSquares(true, $(TOPIC_SELECTOR).val(), this.value, "menu")
        }

        d3.select("#cbsa_selector").classed("enabled",false).classed("disabled",true)
        d3.select("#state_selector").classed("enabled",true).classed("disabled",false)
        d3.select("#scroll_cbsa_selector").classed("enabled",false).classed("disabled",true)
        d3.select("#scroll_state_selector").classed("enabled",true).classed("disabled",false)

        d3.selectAll(".menuContainer").classed("active",true)
        d3.selectAll(".scroll_menuContainer").classed("active",true)
        d3.select("#topicContainer").classed("active",false)
        d3.select("#scroll_topicContainer").classed("active",false)
        if(this.id.search("scroll") != -1){ d3.select('#state_selector option[value=' + this.value +']').node().selected = true }
        else{ d3.select('#scroll_state_selector option[value=' + this.value +']').node().selected = true  }
      }
    })
    $( CBSA_SELECTOR ).selectmenu({
      change: function(event, d){
        if(d3.select(CBSA_SELECTOR).classed("enabled")){
          selectionHandler(false, this.value, "menu")
        }else{
          redrawSquares(false, $(TOPIC_SELECTOR).val(), this.value, "menu")
        }

        d3.select("#state_selector").classed("enabled",false).classed("disabled",true)
        d3.select("#cbsa_selector").classed("enabled",true).classed("disabled",false)
        d3.select("#scroll_state_selector").classed("enabled",false).classed("disabled",true)
        d3.select("#scroll_cbsa_selector").classed("enabled",true).classed("disabled",false)

        d3.selectAll(".menuContainer").classed("active",true)
        d3.selectAll(".scroll_menuContainer").classed("active",true)
        d3.select("#topicContainer").classed("active",false)
        d3.select("#scroll_topicContainer").classed("active",false)
        if(this.id.search("scroll") != -1){ d3.select('#cbsa_selector option[value=' + this.value +']').node().selected = true }
        else{ d3.select('#scroll_cbsa_selector option[value=' + this.value +']').node().selected = true  }
      }
    })

    d3.select(FILTER_BUTTON)
      .on("click", function(){
        d3.select("#filter_button").transition().duration(800).style("opacity",0)

        if(d3.select(".small_chart.clicked").nodes().length == 0){
          return false;
        }else{
          d3.selectAll(".chartContainer")
            .each(function(){
              var clicked = d3.select(this).selectAll(".small_chart.clicked")
              small_width = getSmallWidth(clicked.nodes().length, d3.select(this).node().getBoundingClientRect().width,d3.select(this).node().getBoundingClientRect().height)
              gutter = (clicked.nodes().length < 15) ? 50 :  small_width/9
              rowCount = Math.floor((d3.select("#chart svg").node().getBoundingClientRect().width - margin.left - margin.right) / (small_width + gutter))
              var newHeight = (small_width+gutter) * Math.ceil(clicked.nodes().length/rowCount) + 2*gutter

              d3.select(this).transition().attr("height", function(){ return String(newHeight)})
              var old_width = parseFloat(d3.select(".small_chart").attr("width").replace("px",""))
              var scale = (d3.selectAll(".smallMultipleLabel").nodes().length == 0) ? small_width/old_width : 1;

              // var scale = 1;
              clicked.transition()
              .duration(1000)
              .delay(function(d,i){
                return 200* i/clicked.nodes().length
              })
              .attr("transform", function(d,i){
                i += 1;
                var x = margin.left + ( (((i-1)%rowCount)) * (small_width+gutter) )
                var y = margin.top + gutter + ( (Math.ceil(i/rowCount)-1) * (small_width+gutter) )
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


              if(clicked.nodes().length < 15){
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
    var isStates = location.length == 2
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
      }
    }
    if(topic != false){
      if(topic == "all_topics"){
        if(d3.selectAll(".small_chart.visible.Arts").nodes().length != 0 && d3.selectAll(".small_chart.visible.Other").nodes().length != 0){
          highlightSquares(topic, location, action)
        }else{
          redrawSquares(isStates, topic, location, action)
        }
      }
      else if(d3.selectAll(".small_chart.visible." + topic).nodes().length != 0){
        highlightSquares(topic, location, action)
      }else{
        redrawSquares(isStates, topic, location, action)
      }
    }else{
      if(location == "all_states"){
        if(d3.selectAll(".small_chart.visible.NH").nodes().length != 0 && d3.selectAll(".small_chart.visible.CA").nodes().length != 0){
          highlightSquares(topic, location, action)
        }else{
          redrawSquares(isStates, topic, location, action)
        }
      }
      else if(location == "all_cities"){
        if(d3.selectAll(".small_chart.visible.Atlanta-Sandy-Springs-Roswell").nodes().length != 0 && d3.selectAll(".small_chart.visible.Austin-Round-Rock").nodes().length != 0){
          highlightSquares(topic, location, action)
        }else{
          redrawSquares(isStates, topic, location, action)
        }
      }
      else if(d3.selectAll(".small_chart.visible." + location).nodes().length != 0){
        highlightSquares(topic, location, action)
      }else{
        if(topic == false) topic = $(TOPIC_SELECTOR).val()
        if(location == false) topic = $(ENABLED_SELECTOR).val()
        redrawSquares(isStates, topic, location, action)
      }
    }
  }

  function highlightSquares(topic, location, action){
    var menuSelector = (location.length == 2) ? STATE_SELECTOR : CBSA_SELECTOR;
    var allSelector = (location.length == 2) ? "all_states" : "all_cities";
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
        if(d3.select(menuSelector).node().value != allSelector){
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

  function redrawSquares(isStates, topic, location, action){
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
          drawSquares(input, isStates, topic, location)
          checkReady()
        }
      })
  }



  $(window).scroll(function () { 
      var scrolled = $(window).scrollTop()
      if(scrolled <= 400){
        CBSA_SELECTOR = "#cbsa_selector"
        STATE_SELECTOR = "#state_selector"
        TOPIC_SELECTOR = "#topics_selector"
        FILTER_BUTTON = "#filter_button"
        ENABLED_SELECTOR = ".locationMenu.enabled"
      }else{
        CBSA_SELECTOR = "#scroll_cbsa_selector"
        STATE_SELECTOR = "#scroll_state_selector"
        TOPIC_SELECTOR = "#scroll_topics_selector"
        FILTER_BUTTON = "#scroll_filter_button"
        ENABLED_SELECTOR = ".scroll_locationMenu.enabled"
      }
      listenForEvents()
  });

})//end csv function

isIE = false;
function checkReady() {
  var drawn = d3.select(".small_chart").node();
  if (drawn == null) {
    setTimeout("checkReady()", 100);
  } else {
    setTimeout(function(){
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
