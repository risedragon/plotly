function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    selector.property("selected", firstSample);
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected

  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    console.log(result)
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });
    // 4. Create the trace for the gauge chart.
    var gaugeData = [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: result.wfreq,
        title: { text: "<b>Belly Button Washing Frequency</b><br>Scrubs Per Week" },
        type: "indicator",
        mode: "gauge+number",
        gauge: {
          axis: {
            range: [null, 10],
            tickmode: "array",
            tickvals: [0, 2, 4, 6, 8, 10]
            },
          bar: { color: "black" },
          steps: [
            { range: [0, 2], color: "red" },
            { range: [2, 4], color: "orange" },
            { range: [4, 6], color: "yellow" },
            { range: [6, 8], color: "lightgreen" },
            { range: [8, 10], color: "green" }
          ],

        }
      }
    ];
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = {
      margin: { t: 0, b: 0 }
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot('gauge', gaugeData, gaugeLayout);
  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples =  data.samples;

    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var results = samples.filter(sampleObj=>sampleObj.id == sample);
    //  5. Create a variable that holds the first sample in the array.
    var result = results[0];
 
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = result.otu_ids;
    var otu_labels = result.otu_labels;
    var sample_values = result.sample_values;
    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    var objs = otu_ids.map((v,i)=>{return {id:v,label:otu_labels[i],value:sample_values[i]}})
                  .sort((a,b)=>a.value - b.value)
                  //.slice(-10)

    var yticks = objs.slice(-10).map(o=>`OTU ${o.id}`)


    // 8. Create the trace for the bar chart. 
    var barData = [
      {
        x: objs.slice(-10).map(o=>o.value),
        y: yticks,
        type: "bar",
        name: "greek",
        text: objs.slice(-10).map(o=>o.label),
        orientation: "h"
      }
    ];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Becteria Cultures Found"
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout)

    // 1. Create the trace for the bubble chart.
    var bubbleData = [
      {
        x: objs.map(o=>o.id),
        y: objs.map(o=>o.value),
        //hoverinfo: "x+y",
        text: objs.map((o,i)=>o.label),
        mode: "markers",
        marker: {
          size: objs.map(o=>o.value/1.2),
          color: objs.map(o=>o.id) //sample_values.map(v=>`hsl(${v}, 100, 50)`)
        }
      }
    ];
  
    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Becteria Cultures Per Sample",
      xaxis: {title: "OUT ID"},
      hovermode: "closest",
      yaxis: {
        autotick: false,
        tick0: 0,
        dtick: 50
      }
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    
  });
}

//buildCharts(940)