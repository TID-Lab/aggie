angular
	.module("Aggie")

	.controller("AnalysisController", [
		"$scope",
		"Socket",
		"data",
		function ($scope, Socket, data) {
			$scope.data = data.map(function (e) {
				var out = Object.assign({}, e);
				out.tags = out.tags.map(function(t) {return (t.includes(",") ? t.split(", ") : t)}).flat();
				out.authoredAt = parseTime(out.authoredAt);
				return out;
			});

			var tags = Array.from(
				data.reduce(function (acc, cur) {
					cur.tags.forEach(function (t) {
						return acc.add(t);
					});
					return acc;
				}, new Set())
			);

			var filtered = tags.reduce(function (acc, key) {
				acc[key] = data.filter(function (e) {
					return e.tags.includes(key);
				}).length;
				return acc;
			}, {});

			filtered["No Tag"] = data.filter(function (e) {
				return !e.tags || e.tags.length < 1;
			}).length;

			var tagCount = Object.keys(filtered)
				.map(function (key) {
					return { name: key, value: filtered[key] };
				})
				.filter(function (e) {
					return e.value > 0;
				})
				.sort(function (a, b) {
					return d3.descending(a.value, b.value);
				});

			var parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");

			var init = function () {
				Socket.on("stats", updateStats);
				Socket.join("stats");
				renderReportGraph("#report-graph", data, tags);
			};

			var updateStats = function (stats) {
				$scope.stats = stats;
			};

			$scope.$on("$destroy", function () {
				Socket.leave("stats");
				Socket.removeAllListeners("stats");
			});

			init();

			function renderReportGraph(id, data, tags) {
				var margin = { top: 40, right: 250, bottom: 50, left: 50 },
					width = 1050 - margin.left - margin.right,
					height = 400 - margin.top - margin.bottom;
				data = data.map(function (e) {
					var out = Object.assign({}, e);
					out.authoredAt.setMinutes(0, 0, 0);
					// out.authoredAt.setHours(0);
					return out;
				});
				var timeBuckets = d3.group(data, function (d) {
					return d.authoredAt.getTime();
				});
				var svg = d3
					.select(id)
					.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				var groupedData = Array.from(timeBuckets.entries())
					.sort(function (a, b) {
						return a[0] - b[0];
					})
					.reduce(function (acc, entry) {
						var grouped = { day: entry[0] };
						tags.forEach(function (tag) {
							grouped[tag] = entry[1].filter(function (r) {
								return r.tags.includes(tag);
							}).length;
						});
						return acc.concat(grouped);
					}, []);
				var totals = groupedData.reduce(function (acc, cur, i) {
					if (i === 0) return acc;
					Object.entries(cur).forEach(function (entry) {
						if (entry[0] !== "day") acc[entry[0]] += entry[1];
					});
					return acc;
				}, Object.assign({}, groupedData[0]));
				delete totals.day;
				Object.keys(totals).forEach(function (key) {
					totals[key] /= groupedData.length;
				});
				var sortedTags = Object.entries(totals)
					.sort(function (a, b) {
						return b[1] - a[1];
					})
					.map(function (e) {
						return e[0];
					});
				var topTags = sortedTags.slice(0, 9).concat(["Other"]);
				var bottomTags = sortedTags.slice(9);
				var prunedData = groupedData.map(function (e) {
					var other = Object.values(_.pick(e, bottomTags)).reduce(function (acc, cur) {
						return acc + cur;
					}, 0);
					return Object.assign({ day: e.day }, _.pick(e, topTags), { Other: other });
				});
				var stack = d3
					.stack()
					.keys(topTags)
					.order(d3.stackOrderAppearance)
					.offset(d3.stackOffsetNone);
				// var color = d3.scaleOrdinal(
				// 	data.map(function (d) {
				// 		return d.;
				// 	}),
				// 	d3.interpolateCool
				// );
				var color = function (tag) {
					return d3
						.scaleLinear()
						.domain([0, 0.5, 1])
						.range(["rgb(72, 167, 115)", "#e1ca2a", "orange"])(
						topTags.indexOf(tag) / topTags.length
					);
				};
				var x = d3
					.scaleLinear()
					.domain(
						d3.extent(data, function (e) {
							return e.authoredAt.getTime();
						})
					)
					.range([0, width]);
				var xAxis = svg
					.append("g")
					.style("font", "12px 'Lato")
					.style("color", "#000")
					.style("opacity", "0.6")
					.attr("transform", "translate(0," + height + ")")
					.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b. %d %H:00")));

				var yScale = d3
					.scaleLinear()
					.domain(
						d3.extent(timeBuckets.values(), function (b) {
							return b.length;
						})
					)
					.range([height, margin.top]);
				svg
					.append("g")
					.style("opacity", "0.6")
					.attr("transform", "translate(0,0)")
					.call(d3.axisLeft(yScale).ticks(5));

				svg
					.append("text")
					.text("Time")
					.style("opacity", "0.75")
					.attr("text-anchor", "end")
					.attr("x", width)
					.attr("y", height + 40);
				svg
					.append("text")
					.text("Reports")
					.attr("text-anchor", "end")
					.attr("x", -25)
					.attr("y", 30)
					.style("opacity", "0.75")
					.attr("text-anchor", "start");

				var area = d3
					.area()
					.x(function (d, i) {
						return x(d.data.day);
					})
					.y0(function (d) {
						return yScale(d[0]);
					})
					.y1(function (d) {
						return yScale(d[1]);
					});
				var areaChart = svg.append("g").attr("clip-path", "url(#clip)");
				areaChart
					.selectAll("mylayers")
					.data(stack(prunedData))
					.enter()
					.append("path")
					.attr("class", function (d) {
						return "myArea " + d.key.replace(/[\s+|/]/g, "-");
					})
					.style("fill", function (d) {
						return color(d.key);
					})
					.attr("d", area);

				var clip = svg
					.append("defs")
					.append("svg:clipPath")
					.attr("id", "clip")
					.append("svg:rect")
					.attr("width", width)
					.attr("height", height)
					.attr("x", 0)
					.attr("y", 0);

				// function updateChart(event, d) {
				//   extent = event.selection;
				//   console.log(!extent);

				//   if (!extent) {
				//     if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
				//     x.domain(
				//       d3.extent(data, function (e) {
				//         return e.authoredAt.getTime();
				//       })
				//     );
				//   } else {
				//     x.domain([x.invert(extent[0]), x.invert(extent[1])]);
				//     areaChart.select(".brush").call(brush.move, null);
				//   }

				//   xAxis
				//     .transition()
				//     .duration(800)
				//     .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b. %d %H:00")));
				//   areaChart.selectAll("path").transition().duration(800).attr("d", area);
				// }
				// var brush = d3
				// 	.brushX() // Add the brush feature using the d3.brush function
				// 	.extent([
				// 		[0, 0],
				// 		[width, height],
				// 	]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
				// 	.on("end", updateChart);
				// areaChart.append("g").attr("class", "brush").call(brush);
				// var idleTimeout;
				// function idled() {
				//   idleTimeout = null;
				// }

				var highlight = function (event, d) {
					d3.selectAll(".myArea").style("opacity", 0.1);
					d3.select("." + d.replace(/[\s+|/]/g, "-")).style("opacity", 1);
				};
				var noHighlight = function (event, d) {
					d3.selectAll(".myArea").style("opacity", 1);
				};

				var size = 20;
				svg
					.selectAll("myrect")
					.data(topTags)
					.enter()
					.append("rect")
					.attr("x", width + 20)
					.attr("y", function (d, i) {
						return 10 + i * (size + 5);
					}) // 100 is where the first dot appears. 25 is the distance between dots
					.attr("width", size)
					.attr("height", size)
					.style("fill", function (d) {
						return color(d);
					})
					.on("mouseover", highlight)
					.on("mouseleave", noHighlight);

				// Add one dot in the legend for each name.
				svg
					.selectAll("mylabels")
					.data(topTags)
					.enter()
					.append("text")
					.attr("class", "legend-item")
					.attr("x", width + 20 + size * 1.2)
					.attr("y", function (d, i) {
						return 10 + i * (size + 5) + size / 2;
					}) // 100 is where the first dot appears. 25 is the distance between dots
					.style("fill", function (d) {
						return color(d);
					})
					.text(function (d) {
						return d;
					})
					.attr("text-anchor", "left")
					.style("alignment-baseline", "middle")
					.on("mouseover", highlight)
					.on("mouseleave", noHighlight);
			}
		},
	]);
