var TOPICS = {
  "1 Arts" : "arts",
  "2a Higher Education" : "higher_ed",
  "2b Other Education" : "other_ed",
  "3 Environment and Animals" : "environment",
  "4a Hospitals" : "hospitals",
  "4b Other Health" : "other_health",
  "5 Human Services" : "human_services",
  "6 International and Foreign Affairs" : "international",
  "7 Religion Related" : "religion",
  "8 Other" : "other",
  "none" : "none"
}
var FIPS = {"AK":"02", "AL":"01", "AR":"05", "AZ":"04", "CA":"06", "CO":"08", "CT":"09", "DC":"11", "DE":"10", "FL":"12", "GA":"13", "HI":"15", "IA":"19", "ID":"16", "IL":"17", "IN":"18", "KS":"20", "KY":"21", "LA":"22", "MA":"25", "MD":"24", "ME":"23", "MI":"26", "MN":"27", "MO":"29", "MS":"28", "MT":"30", "NC":"37", "ND":"38", "NE":"31", "NH":"33", "NJ":"34", "NM":"35", "NV":"32", "NY":"36", "OH":"39", "OK":"40", "OR":"41", "PA":"42", "RI":"44", "SC":"45", "SD":"46", "TN":"47", "TX":"48", "UT":"49", "VA":"51", "VT":"50", "WA":"53", "WI":"55", "WV":"54", "WY":"56"}


var color = d3.scaleThreshold()
    .domain([-80, -60, -40, -20, 0, 20, 40, 60, 80])
    .range(["rgb(255, 79, 0)", "rgb(255, 132, 0)", "rgb(253, 185, 19)", "rgb(255, 217, 144)", "rgb(255, 235, 196)", "rgb(207, 227, 245)","rgb(130, 196, 233)","rgb(22, 150, 210)","rgb(0, 118, 188)","rgb(29, 66, 129)"]);


function sortData(input){
  var allYears = [];
  for(i = 2009; i <= 2014; i++ ){
    data = input.filter(function(d){
      return parseInt(d["start_year"]) == i;
    })
    var data_start = data.filter(function(d){
      return parseFloat(d["percent_no_change"]) != 100 && ( parseFloat(d["percent_large_increase"]) + parseFloat(d["percent_slight_increase"]) ) > ( parseFloat(d["percent_slight_loss"]) + parseFloat(d["percent_large_loss"]) )
    })
    .sort(function(a, b){
      if((parseFloat(b["percent_large_increase"])+parseFloat(b["percent_slight_increase"])) == (parseFloat(a["percent_large_increase"]) + parseFloat(a["percent_slight_increase"]))){
              return parseFloat(b["percent_large_increase"]) - parseFloat(a["percent_large_increase"])
            }else{
                return (parseFloat(a["percent_large_loss"])+parseFloat(a["percent_slight_loss"]) +parseFloat(a["percent_no_change"])) - (parseFloat(b["percent_large_loss"]) + parseFloat(b["percent_slight_loss"]) + parseFloat(b["percent_no_change"]))
            }
        })

    var data_middle = data.filter(function(d){
      return parseFloat(d["percent_no_change"]) == 100
    })

    var data_end = data.filter(function(d){
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
  // return Math.sqrt((width*height*4.5)/(num));
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
var IS_STATES = false;
d3.csv("data/data.csv", function(err, input){



  var sorted = sortData(input)
  for(var ind = 0; ind < sorted.length-1; ind++){
    var data = sorted[ind]
    if(IS_STATES){
      d3.select("#cbsa_selector").classed("enabled",false).classed("disabled",true)
      d3.select("#state_selector").classed("enabled",true).classed("disabled",false)
      data = data.filter(function(d){
        return d.location_type == "state"
      })
    }else{
      d3.select("#state_selector").classed("enabled",false).classed("disabled",true)
      d3.select("#cbsa_selector").classed("enabled",true).classed("disabled",false)
      data = data.filter(function(d){
        return d.location_type == "cbsa"
      })
    }
    var yearContainer = d3.select("#chart")
      .append("div")
      .attr("class","start_year-" + data[1]["start_year"])

    yearContainer
      .append("text")
      .html(data[0]["start_year"] + "&ndash;" + (parseInt(data[0]["start_year"])+1))
    var chart = yearContainer
        .append("svg")
        .attr("class","chartContainer")
        .attr("width", window.innerWidth)
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



  var margin = {"left":10,"top":10,"right":10,"bottom":10}
  var rowCount,
    small_width = getSmallWidth(input.length,d3.select("#chart").node().getBoundingClientRect().width,window.innerHeight)
    gutter = small_width/9;


  rowCount = Math.floor((d3.select("#chart svg").node().getBoundingClientRect().width - margin.left - margin.right) / (small_width + gutter))
  d3.select(chart.node().parentNode).attr("height", function(){ return margin.top + margin.bottom + (small_width+gutter) * Math.ceil(data.length/rowCount) + "px"})
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
        returnClass += NTEES[d.topic][0]
      }
      return returnClass
    })
      // var state;
      // if(d["CBSA Name"].search(",") != -1){
      //   state = d["CBSA Name"].split(", ")[1]
      // }else{
      //   state = d["CBSA Name"]
      // }
      // states = state.split("-")
      // var fips = " ";
      // for(var i = 0; i < states.length; i++){
      //   fips += "fips_" + String(FIPS[states[i]]) + " "
      // }
      // return "small_chart " + TOPICS[d["topic"]] + " cbsa_" + d["CBSA"] + fips
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
        selectionHandler(NTEES[d.topic][0], false, "hover")
      }else{
        if(d3.select("#cbsa_selector").classed("enabled")){
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
        selectionHandler(NTEES[d.topic][0], false, "click")
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
  // small_chart.append("svg:image")
  //   .attr("x",0)
  //   .attr("")
  //   .attr("xlink:href", "test.png")
  for(var i = 0; i < cats.length; i++){
    var cat = cats[i]
    small_chart
      .append("rect")
      .attr("width", function(d){ return small_width*(parseFloat(d[cat])/100)})
      .attr("x", function(d){
        if(isNaN(d[cat])){
        }
        var start = 0;
        for(var j =0; j < i ; j++){
          start += small_width*parseFloat(d[cats[j]])/100
        }
        return start;
      })
      .attr("height", small_width)
      .attr("y",0)
      .attr("class",cat)
  }
  // small_chart.append("rect")
  //   .attr("class","bg")
  //   .attr("width",small_width + 2*gutter)
  //   .attr("height",small_width + 2*gutter)
  //   .attr("x",-1*gutter)
  //   .attr("y",-1*gutter)
}




d3.select("#topics_selector")
  .on("change", function(){
    d3.selectAll(".menuContainer").classed("active",false)
    d3.select("#topicContainer").classed("active",true)
    selectionHandler(this.value, false, "menu")
  })

d3.select("#state_selector")
  .on("change", function(){
    if(d3.select("#state_selector").classed("enabled")){
      selectionHandler(false, this.value, "menu")
    }else{
      d3.select("#cbsa_selector").classed("enabled",false).classed("disabled",true)
      d3.select("#state_selector").classed("enabled",true).classed("disabled",false)
      redrawSquares(false, this.value, "menu")
    }
    d3.selectAll(".menuContainer").classed("active",false)
    d3.select("#locationContainer").classed("active",true)
  })
d3.select("#cbsa_selector")
  .on("change", function(){
    d3.select("#state_selector").classed("enabled",false).classed("disabled",true)
    d3.select("#cbsa_selector").classed("enabled",true).classed("disabled",false)

    d3.selectAll(".menuContainer").classed("active",false)
    d3.select("#locationContainer").classed("active",true)
    selectionHandler(false, this.value, "menu")
  })

d3.select("#filter_button")
  .on("click", function(){
    if(d3.select(".small_chart.clicked").nodes().length == 0){
      return false;
    }else{

      d3.selectAll(".chartContainer")
      .each(function(){
        var clicked = d3.select(this).selectAll(".small_chart.clicked")
        small_width = getSmallWidth(clicked.nodes().length, d3.select(this).node().getBoundingClientRect().width,d3.select(this).node().getBoundingClientRect().height)
        gutter = (clicked.nodes().length < 15) ? 50 :  small_width/20
        rowCount = Math.floor((d3.select("#chart svg").node().getBoundingClientRect().width - margin.left - margin.right) / (small_width + gutter))
        var newHeight = (small_width+gutter) * Math.ceil(clicked.nodes().length/rowCount) + gutter
        d3.select(this).transition().attr("height", function(){ return String(newHeight)})
        var old_width = parseFloat(d3.select(".small_chart").attr("width").replace("px",""))
        var scale = small_width/old_width

        clicked.transition()
              .duration(1000)
              .delay(function(d,i){
                return 200* i/clicked.nodes().length
              })
        .attr("transform", function(d,i){
          i += 1;
          var x = margin.left + ( (((i-1)%rowCount)) * (small_width+gutter) )
          var y = margin.top + gutter + ( (Math.ceil(i/rowCount)-1) * (small_width+gutter) )
          return "translate(" + x + "," + y + ")scale(" + scale + ")"
        })
        d3.selectAll(".smallMultipleLabel")
          .transition()
          .style("opacity",0)
          .on("end", function(){
            d3.select(this).remove()

          })
function wrap(text, width, dy) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.5, // ems
        y = text.attr("y"),
        // dy = parseFloat(dy)/10,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y+3).attr("dy", dy + "px");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "2.9" + "px").text(word);
      }
    }
  });
}

        if(clicked.nodes().length < 15){
          clicked.append("text")
            .attr("class", "smallMultipleLabelTemp")
            .style("opacity",0)
            .attr("dy",3+small_width/scale)
            .html(function(d){
              if((d3.selectAll(".small_chart.clicked.Arts").nodes().length != 0 && d3.selectAll(".small_chart.clicked.Other").nodes().length != 0)){
                return NTEES[d.topic][1]
              }else{
                return parseInt(d.start_year) + "&ndash;" + (parseInt(d.start_year)+1)
              }
              // console.log(d, this)
            })
            .call(wrap, small_width/scale, small_width/scale)
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
  })


})


function selectionHandler(topic, location, action){
  if(topic != false){
    if(topic == "all_topics"){
      if(d3.selectAll(".small_chart.visible.Arts").nodes().length != 0 && d3.selectAll(".small_chart.visible.Other").nodes().length != 0){
        highlightSquares(topic, location, action)
      }else{
        redrawSquares(topic, location, action)
      }
    }
    else if(d3.selectAll(".small_chart.visible." + topic).nodes().length != 0){
      highlightSquares(topic, location, action)
    }else{
      redrawSquares(topic, location, action)
    }
  }else{
    if(location == "all_states"){
      if(d3.selectAll(".small_chart.visible.NH").nodes().length != 0 && d3.selectAll(".small_chart.visible.CA").nodes().length != 0){
        highlightSquares(topic, location, action)
      }
      else{
        redrawSquares(topic, location_type, action)
      }
    }
    else if(location == "all_cities"){
      if(d3.selectAll(".small_chart.visible.Atlanta-Sandy-Springs-Roswell").nodes().length != 0 && d3.selectAll(".small_chart.visible.Austin-Round-Rock").nodes().length != 0){
        highlightSquares(topic, location, action)
      }
      else{
        redrawSquares(topic, location_type, action)
      }
    }
    else if(d3.selectAll(".small_chart.visible." + location).nodes().length != 0){
      highlightSquares(topic, location, action)
    }else{
      redrawSquares(topic, location, action)
    }
  }

}
function highlightSquares(topic, location, action){
  var menuSelector = (location.length == 2) ? "#state_selector" : "#cbsa_selector";
  var allSelector = (location.length == 2) ? "all_states" : "all_cities";

  if(action != "hover"){
    if(topic != false){
      d3.select("#topics_selector").node().value = topic
      if(action == "click"){
        d3.select(menuSelector).node().value = allSelector
      }
    }else{
      d3.select(menuSelector).node().value = location
      if(action == "click"){
        d3.select("#topics_selector").node().value = "all_topics"
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
      if(d3.select("#topics_selector").node().value == "all_topics"){
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
        d3.selectAll(".small_chart." + d3.select("#topics_selector").node().value)
          .classed("fade",false)
          .classed("hovered",false)
          .classed("clicked",true)
      }
    }else{
      if(d3.select("#topics_selector").node().value != "all_topics"){
        selector = "." + d3.select("#topics_selector").node().value + "." + location
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
        if(d3.select("#topics_selector").node().value == "all_topics"){
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
function redrawSquares(topic, location, action){
  console.log("redrawing")
}


// function sizeChange() {
//     d3.select("#map svg g").attr("transform", "scale(" + $("#map").width()/900 + ")");
//     d3.select("#chart svg g").attr("transform", "scale(" + $("#chart").width()/900 + ")");
//     d3.select("g").attr("transform", "scale(" + $("#chart").width()/900 + ")");

//     $("#map svg").height($("#map").width()*0.618);
//     // $("#chart svg").height($("#chart").width()*10);

// }


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