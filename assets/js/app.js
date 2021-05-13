// The code for the chart is wrapped inside a function that automatically resizes the char
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
    var svgArea = d3.select("#scatter").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Setup chart
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
    top: 50,
    right: 200,
    bottom: 100,
    left: 50
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;


    // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


    // Import data from the csv file
    d3.csv("assets/data/data.csv").then(function(healthcareData) {
        healthcareData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // Create scale functions
        var xLinearScale = d3.scaleLinear()
            .domain([8, d3.max(healthcareData, d => d.poverty)])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(healthcareData, d => d.healthcare)])
            .range([height, 0]);

        // Create axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append Axes to chart
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // Create Circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthcareData)
            .enter()
            .append("circle")
            .attr("class", "stateCircle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "10")
            .attr("opacity", "0.8");

        var abbrGroup = chartGroup.selectAll("label")
            .data(healthcareData)
            .enter()
            .append("text")
            .attr("class", "stateText")
            .text(function(d) {return (d.abbr)})
            .attr("font-size", "8")
            .attr("dx", d => xLinearScale(d.poverty))
            .attr("dy", d => yLinearScale(d.healthcare));
    
        // Initialize tool tip
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                return (`${d.state}<br>Poverty: ${d.poverty} %<br>Healthcare: ${d.healthcare} %`);
            });
        
        // Create tooltip in the chart
        chartGroup.call(toolTip);

        // Display and hide the tooltip
        circlesGroup.on("click", function(data) {
            toolTip.show(data, this);
        })
            // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
            });

        // Create axes labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "active")
            .text("Lacks Healthcare (%)");

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .attr("class", "active")
            .text("Poverty (%)");


    }).catch(function(error) {
        console.log(error);
    });
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);