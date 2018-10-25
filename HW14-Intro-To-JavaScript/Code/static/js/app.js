// from data.js
var tableData = data;

function renderTable(inputData){
    // construct the table head
    var thead = d3.select("thead")
    columns = ["datetime", "city", "state", "country", "shape", "durationMinutes", "comments"]
    columns.forEach(column => thead.append("th").classed("table-head", true).text(column))
    
    // construct the table body
    var tbody = d3.select("tbody")
    inputData.forEach(function(d){
        var row = tbody.append("tr")
        columns.forEach(column => row.append("td").text(d[column]))
    })
}

renderTable(tableData)

var criteria = {}
var searchBox = d3.selectAll(".form-control")
searchBox.on("change", function(){
    id = d3.select(this).node().id
    value = d3.select(this).node().value
    if(value!=""){
        criteria[id] = value
    }
    // delete the criteria if the user delete the input in the search box
    else {delete criteria[id]}
})

// console.log(criteria)

var newData = []
var flag = 1

function getNewTable(criteria){
    newData = []
    tableData.forEach(function(d){
        Object.entries(criteria).forEach(function([key, value]){
            // console.log(`dk: ${d[key]}, key: ${key}, value: ${value}`)
            if(d[key] !== value){
                // console.log("False")
                flag=0}
            }
        )
        // console.log(flag)
        if(flag == 1){newData.push(d)}
        flag = 1
        }
    )
    criteria = {}
    return newData
}

// event driven

var filterButton = d3.select("#filter-btn")

filterButton.on("click", function(){
    var filteredTable = getNewTable(criteria)
    d3.select("thead").html("")
    d3.select("tbody").html("")
    renderTable(filteredTable)
    d3.event.preventDefault()
    }
)
