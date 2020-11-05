module.exports = function renderSourceBar(id, sources, totalReports, description) {
  var stackedSources = d3
    .stack()
    .keys(
      Object.keys(sources).sort(function (a, b) {
        return sources[b] - sources[a];
      })
    )([sources])
    .reduce(function (acc, entry) {
      return acc.concat([
        {
          value: sources[entry.key],
          startValue: entry[0][0],
          endValue: entry[0][1],
          name: entry.key,
        },
      ]);
    }, []);
  // var color = d3
  // 	.scaleOrdinal()
  // 	.domain(stackedSources.map((d) => d.name))
  // 	.range(
  // 		d3.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), stackedSources.length).reverse()
  // 	);
  var color = (color = d3.scaleOrdinal(
    stackedSources.map(function(d) { return d.name}),
    d3.schemeTableau10 //schemeSet3
  ));
  var width = 1200,
    height = 90;

  var margin = { top: 40, right: 0, bottom: 30, left: 50 };
  var svg = d3.select(id).append("svg").attr("width", width).attr("height", height);
  var x = d3.scaleLinear([0, d3.sum(Object.values(sources))], [margin.left, width - margin.right]);
  var formatPercent = x.tickFormat(null, "%");
  svg
    .append("g")
    .attr("stroke", "white")
    .selectAll("rect")
    .data(stackedSources)
    .join("rect")
    .attr("fill", function (d) {
      return color(d.name);
    })
    .attr("x", function (d) {
      return x(d.startValue);
    })
    .attr("y", margin.top)
    .attr("width", function (d) {
      return x(d.endValue) - x(d.startValue);
    })
    .attr("height", height - margin.top - margin.bottom)
    .append("title")
    .text(function (d) {
      return d.name + "\n" + d.value + " reports";
    });
  svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .selectAll("text")
    .data(
      stackedSources.filter(function (d) {
        return x(d.endValue) - x(d.startValue) > 40;
      })
    )
    .join("text")
    // .attr("fill", function (d) {
    // 	return d3.lab(color(d.name)).l < 50 ? "white" : "black";
    // })
    .attr("transform", function (d) {
      return "translate(" + (x(d.startValue) + 6) + ", 6)";
    })
    .call(function (text) {
      text
        .append("tspan")
        .attr("y", "0.7em")
        .attr("font-weight", "bold")
        .text(function (d) {
          return d.name;
        });
    })
    .call(function (text) {
      return text
        .append("tspan")
        .attr("x", 0)
        .attr("y", "2em")
        .attr("fill-opacity", 0.7)
        .text(function (d) {
          return formatPercent(d.value / totalReports);
        });
    });
  svg
    .append("text")
    .attr("class", "description")
    .text(description)
    .attr("x", margin.left)
    .attr("y", height - 7)
    .style("opacity", "0.75")
    .attr("text-anchor", "left");
};
