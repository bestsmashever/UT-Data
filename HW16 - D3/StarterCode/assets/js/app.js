// set up the svg 
var svgWidth = 960;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
}

var width = svgWidth - margin.left - margin.right
var height = svgHeight - margin.top - margin.bottom

// create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty"
var chosenYAxis = "obesity"

function xScale(healthData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.85,
            d3.max(healthData, d => d[chosenXAxis]) * 1.15   
        ])
        .range([0, width])

    return xLinearScale
}

function yScale(healthData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.85,
            d3.max(healthData, d => d[chosenYAxis]) * 1.15    
        ])
        .range([height, 0])
    
    return yLinearScale
}

// function used for updating xAxis and yAxis upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {
    
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
};

function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {
    
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
};

// function used for updating texts inside the circles
function renderStatesX(statesGroup, newXScale, chosenXAxis) {

    statesGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));
    
    return statesGroup;
}

function renderStatesY(statesGroup, newYScale, chosenYAxis) {

    statesGroup.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis]));
    
    return statesGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty (%): ";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Age (Median)"
    }
    else {
        var xlabel = "Household Income (Median)"
    };

    if (chosenYAxis === "obesity") {
        var ylabel = "Obese (%): "
    }
    else if (chosenYAxis === "smokes") {
        var ylabel = "Smokes (%): "
    }
    else {
        var ylabel = "Lacks Healthcare (%): "
    };

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .html(d => `${d.state} <br> ${xlabel} ${d[chosenXAxis]} <br> ${ylabel} ${d[chosenYAxis]}`)

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data)
    })
        .on("mouseout", function(data) {
            toolTip.hide(data)
        });

    return circlesGroup;
}

// retrieve data from csv file
var file = "assets/data/data.csv"
d3.csv(file).then(successHandle, errorHandle);

function errorHandle(error) {
    throw error;
}

function successHandle(healthData) {

    console.log(healthData);

    // parse data
    healthData.forEach(function(data) {
        data.poverty = parseFloat(data.poverty);
        data.age = parseFloat(data.age);
        data.income = +data.income;
        data.obesity = parseFloat(data.obesity);
        data.smokes = parseFloat(data.smokes)
        data.healthcare = parseFloat(data.healthcare)
    })
    
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis)
    
    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis)

    // append initial circles
    var circlesGroup = chartGroup.append("g").selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .classed("stateCircle", true)
    
    var statesGroup = chartGroup.append("g").selectAll("text")
        .data(healthData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .classed("stateText", true)
        .text(d => d.abbr)

    // create x labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // set value for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");

    // create y labels
    var yLabelsGroup = chartGroup.append("g")
    // switch x and y coordinates in the translate because of the rotate(-90)
        .attr("transform", `rotate(-90) translate(${-height/2}, ${-margin.left})`);

    var obeseLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "obesity")
        .classed("active", true)
        .text("Obese (%)");

    var smokeLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    xLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replace chosenXAxis with value
                chosenXAxis = value;
                
                console.log(`chosenXAxis: ${chosenXAxis}`, `| chosenYAxis: ${chosenYAxis}`);

                // updates x scale for new data
                xLinearScale = xScale(healthData, chosenXAxis);
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);

                // update texts
                statesGroup = renderStatesX(statesGroup, xLinearScale, chosenXAxis);

                // update tooltips
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    };
                }
            }
        );
    
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of seleciton
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                // replace chosenYAXis with value
                chosenYAxis = value;

                console.log(`chosenXAxis: ${chosenXAxis}`, `| chosenYAxis: ${chosenYAxis}`);
                
                // updates y scale for new data
                yLinearScale = yScale(healthData, chosenYAxis);
                yAxis = renderYAxis(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);

                // update texts
                statesGroup = renderStatesY(statesGroup, yLinearScale, chosenYAxis);

                // update tooltips
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                
                if (chosenYAxis === "obesity") {
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    }
                else if (chosenYAxis === "smokes") {
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    }
                else {
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    }; 
                }
            }
        )
        
    
}