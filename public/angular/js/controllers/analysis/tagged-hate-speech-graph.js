module.exports = function renderHateSpeechActualReportGraph(id, data, range, description) {
  var margin = { top: 50, right: 0, bottom: 55, left: 50 };
  var width = 1200,
    height = 300;
  var graphWidth = width - margin.left - margin.right,
    graphHeight = height - margin.top - margin.bottom;

  var tooltipDiv = d3.select(id).append("div").attr("class", "tooltip").style("opacity", 0);
  var tooltip = function (event, d) {
    return tooltipDiv
      .html(
        '<div class="tooltip-title">' +
          d.value +
          " Reports" +
          "</div><div>" +
          d3.timeFormat("%b. %d %H:00")(d.date).replace(/\s0/g, " ") +
          "</div><div>"
      )
      .style("left", event.offsetX + "px")
      .style("top", event.offsetY - 40 + "px");
  };

  var svg = d3.select(id).append("svg").attr("width", width).attr("height", height);
  var graph = svg
    .append("g")
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var gXAxis = graph.append("g").attr("transform", "translate(0," + graphHeight + ")");
  var gYAxis = graph.append("g");
  var x = d3
    .scaleBand()
    .domain(
      data.map(function (d) {
        return d.date;
      })
    )
    .range([0, graphWidth])
    .paddingInner(0.2)
    .paddingOuter(0.2);
  var y = d3.scaleLinear().domain(range).range([graphHeight, 0]);
  var rects = graph.selectAll("rect").data(data);
  rects
    .enter()
    .append("rect")
    .attr("fill", "#f28e2c")
    .attr("width", x.bandwidth)
    .attr("height", function (d) {
      return graphHeight - y(d.value);
    })
    .attr("x", function (d) {
      return x(d.date);
    })
    .attr("y", function (d) {
      return y(d.value);
    })
    .on("mouseover", function (event, d) {
      tooltipDiv.transition().duration(200).style("opacity", 1);
      tooltip(event, d);
    })
    .on("mouseout", function (event, d) {
      tooltipDiv.transition().duration(500).style("opacity", 0);
    })
    .on("mousemove", function (event, d) {
      tooltip(event, d);
    });
  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y).tickFormat(d3.format("d"));
  gXAxis
    .call(
      xAxis
        .tickSize(15)
        .tickPadding(5)
        .tickFormat(function (d, i) {
          return d.getHours() === 0 ? d3.timeFormat("%b. %d")(d) : "";
        })
    )
    .selectAll("text");
  // .attr("transform", "translate(13,50) rotate(90)");
  gXAxis
    .selectAll("g")
    .filter(function (d, i) {
      return d.getHours() !== 0;
    })
    .classed("minor", true);
  gYAxis.call(yAxis);
  svg
    .append("text")
    .attr("class", "description")
    .text(description)
    .attr("x", margin.left)
    .attr("y", height - 7)
    .style("opacity", "0.75")
    .attr("text-anchor", "left");
    svg
      .append("text")
      .text("Reports")
      .attr("class", "description")
      .attr("x", margin.left - 30)
      .attr("y", 20)
      .style("opacity", "0.75")
      .style("font-size", "1em")
      .attr("text-anchor", "left");
}