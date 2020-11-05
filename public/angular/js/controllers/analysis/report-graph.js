module.exports = function renderReportGraph(id, reports, startDate, endDate, description) {
  var margin = { top: 40, right: 0, bottom: 55, left: 50 };
  var width = 1200,
    height = 500;
  var graphWidth = width - margin.left - margin.right,
    graphHeight = height - margin.top - margin.bottom;
  var data = d3.timeHour.range(startDate, endDate).map(function (d) {
    d.setMinutes(0, 0, 0);
    var intTime = d.getTime();
    var bucket = reports.filter(function (report) {
      return report.authoredAt.getTime() === intTime;
    });
    var read = bucket.filter(function (r) {
      return r.read;
    });
    return {
      date: d,
      read: read.length,
      unread: bucket.length - read.length,
    };
  });
  var stacked = d3.stack().keys(["unread", "read"])(data);
  var color = d3.scaleOrdinal().domain(["read", "unread"]).range(["#48a773", "#297b4f"]);

  var tooltipDiv = d3.select(id).append("div").attr("class", "tooltip").style("opacity", 0);
  var tooltip = function (event, d) {
    return tooltipDiv
      .html(
        '<div class="tooltip-title">' +
          (d.data.read + d.data.unread) +
          " Reports" +
          "</div><div>" +
          d.data.read +
          " read" +
          "</div><div>" +
          d.data.unread +
          " unread" +
          "</div><div>" +
          d3.timeFormat("%b. %d %H:00")(d.data.date).replace(/\s0/g, " ") +
          "</div><div>"
      )
      .style("left", event.offsetX + "px")
      .style("top", event.offsetY - 75 + "px");
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
    .range([0, width])
    .paddingInner(0.2)
    .paddingOuter(0.2);
  var y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return d.read + d.unread;
      }),
    ])
    .range([graphHeight, 0]);
  var rects = graph.append("g").selectAll("g").data(stacked);
  rects
    .enter()
    .append("g")
    .attr("fill", function (d) {
      return color(d.key);
    })
    .selectAll("rect")
    .data(function (d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("class", "bar-rect")
    .attr("width", x.bandwidth)
    .attr("height", function (d) {
      return y(d[0]) - y(d[1]);
    })
    .attr("x", function (d) {
      return x(d.data.date);
    })
    .attr("y", function (d) {
      return y(d[1]);
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
  var yAxis = d3.axisLeft(y);
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
}