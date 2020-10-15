var _ = require('lodash')

angular
	.module("Aggie")

	.controller("AnalysisController", [
		"$scope",
		"Socket",
		"data",
		"smtcTags",
		function ($scope, Socket, data, smtcTags) {
			var groupById = function(memo, item) {
				memo[item._id] = item;
				return memo;
			};
			$scope.smtcTags = smtcTags;
			$scope.smtcTagsById = $scope.smtcTags.reduce(groupById, {});
			console.log($scope.smtcTags, $scope.smtcTagsById);
			var parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
			$scope.data = data.map(function (e) {
				var out = Object.assign({}, e);
				out.tags = out.tags.map(function (t) { return (t.includes(",") ? t.split(", ") : t) }).flat();
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


			var init = function () {
				Socket.on("stats", updateStats);
				Socket.join("stats");
				renderReportGraph("#report-graph", $scope.data, tags);
				renderTagBarHistogram("#tags-hist", tagCount);
				renderStatisticsPlot("#most-stats", tagCount, tagCount[0].name, $scope.data);
			};

			var updateStats = function (stats) {
				$scope.stats = stats;
			};

			$scope.$on("$destroy", function () {
				Socket.leave("stats");
				Socket.removeAllListeners("stats");
			});

			init();

			function renderStatisticsPlot(id, tagCount, maxTag, data) {
				var margin = { top: 10, right: 30, bottom: 58, left: 100 },
					width = 900 - margin.left - margin.right,
					height = 450 - margin.top - margin.bottom;
				var reports = data
					.filter(function (d) {
						return d.tags.includes(maxTag);
					})
					.map(function (r) {
						return Object.assign({}, r.metadata.expectedStatistics);
					});
				var reportStats = Object.entries(
					reports.reduce(
						function (acc, cur, i) {
							Object.keys(cur).forEach(function (k) {
								acc[k].push(cur[k]);
							});
							return acc;
						},
						Object.keys(reports[0]).reduce(function (acc, key) {
							acc[key] = [];
							return acc;
						}, {})
					)
				).map(function (e) {
					var sorted = e[1].sort(d3.ascending);
					var q1 = d3.quantile(sorted, 0.25);
					var q3 = d3.quantile(sorted, 0.75);
					var median = d3.quantile(sorted, 0.5);
					// if (median === q1 && median !== q3) median += 0.2;
					// else if (median === q3 && median !== q1) median -= 0.2;
					return { name: e[0], values: sorted, min: d3.min(e[1]), max: d3.max(e[1]), q1: q1, q3: q3, median: median };
				});
				console.log(reportStats);
				var labels = [
					"Likes 👍",
					"Shares ➦",
					"Comments 🗨️",
					"Loves ❤️",
					"Wows 😯",
					"Hahas 😂",
					"Sads 😢",
					"Angrys 😡",
					"Thankfuls 🌺",
					"Cares 🤗",
				];

				var svg = d3
					.select(id)
					.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				var x = d3
					.scaleBand()
					.range([0, width])
					.domain([
						"likeCount",
						"shareCount",
						"commentCount",
						"loveCount",
						"wowCount",
						"hahaCount",
						"sadCount",
						"angryCount",
						"thankfulCount",
						"careCount",
					])
					.paddingInner(1)
					.paddingOuter(0.5);
				var xAxis = svg
					.append("g")
					.style("font", "12px 'Lato")
					.style("color", "#000")
					.style("opacity", "0.6")
					.attr("transform", "translate(0," + height + ")")
					.call(
						d3.axisBottom(x).tickFormat(function (d, i) {
							return labels[i];
						})
					);
				var y = d3
					.scaleLinear()
					.domain([
						0,
						d3.max(reports, function (r) {
							return d3.max(Object.values(r));
						}),
					])
					.range([height, 0]);
				svg.append("g").style("opacity", "0.6").call(d3.axisLeft(y));
				svg
					.selectAll("vertLines")
					.data(reportStats)
					.enter()
					.append("line")
					.attr("x1", function (d) {
						return x(d.name);
					})
					.attr("x2", function (d) {
						return x(d.name);
					})
					.attr("y1", function (d) {
						return y(d.min);
					})
					.attr("y2", function (d) {
						return y(d.max);
					})
					.attr("stroke", "black")
					.style("opacity", "0.6")
					.style("width", 40);
				var boxWidth = 30;
				svg
					.selectAll("boxes")
					.data(reportStats)
					.enter()
					.append("rect")
					.attr("x", function (d) {
						return x(d.name) - boxWidth / 2;
					})
					.attr("y", function (d) {
						return y(d.q3);
					})
					.attr("height", function (d) {
						return y(d.q1) - y(d.q3);
					})
					.attr("width", boxWidth)
					.attr("stroke", "black")
					.style("fill", "rgb(72, 167, 115)");
				svg
					.selectAll("medianLines")
					.data(reportStats)
					.enter()
					.append("line")
					.attr("x1", function (d) {
						return x(d.name) - boxWidth / 1.5;
					})
					.attr("x2", function (d) {
						return x(d.name) + boxWidth / 1.5;
					})
					.attr("y1", function (d) {
						return y(d.median);
					})
					.attr("y2", function (d) {
						return y(d.median);
					})
					.attr("stroke", "black")
					.attr("stroke-width", 2)
					.style("width", 80);

				var label = svg
					.append("text")
					.text("Expected* post statistics for " + maxTag + " posts")
					.attr("text-anchor", "end")
					.attr("x", width / 2 - 100)
					.attr("y", height + 54)
					.style("opacity", "0.75")
					.attr("text-anchor", "start");
				var len = label.node().getComputedTextLength();
				label.attr("x", width / 2 - len / 2);
			}

			function renderTagBarHistogram(id, data) {
				var margin = { top: 10, right: 30, bottom: 68, left: 100 },
					width = 1080 - margin.left - margin.right,
					height = 450 - margin.top - margin.bottom;
				var svg = d3
					.select(id)
					.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				var y = d3
					.scaleBand()
					.range([0, height])
					.domain(
						data.map(function (e) {
							return e.name;
						})
					)
					.padding(0.2);
				var yAxis = svg
					.append("g")
					.style("font", "12px 'Lato")
					.style("color", "#000")
					.style("opacity", "0.6")
					.call(d3.axisLeft(y));
				var x = d3
					.scaleLinear()
					.domain([
						0,
						d3.max(data, function (d) {
							return d.value;
						}),
					])
					.range([0, width]);
				svg
					.append("g")
					.style("font", "12px 'Lato")
					.style("color", "#000")
					.style("opacity", "0.6")
					.attr("transform", "translate(0," + height + ")")
					.call(d3.axisBottom(x))
					.selectAll("text")
					.attr("transform", "translate(-10,0)rotate(-45)")
					.style("text-anchor", "end");
				svg
					.selectAll("myRect")
					.data(data)

					.enter()
					.append("rect")
					.attr("transform", "translate(1,0) ")
					.attr("x", x(0))
					.attr("y", function (d) {
						return y(d.name);
					})
					.attr("width", function (d) {
						return x(d.value);
					})
					.attr("height", y.bandwidth())
					.attr("fill", "#48a773");

				svg
					.append("text")
					.text("Reports in past 48hrs")
					.attr("text-anchor", "end")
					.attr("x", width / 2 - 100)
					.attr("y", height + 64)
					.style("opacity", "0.75")
					.attr("text-anchor", "start");
			}

			function renderReportGraph(id, data, tags) {
				var margin = { top: 40, right: 250, bottom: 100, left: 50 },
					width = 900 - margin.left - margin.right,
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
				var color = d3.scaleOrdinal(d3.schemeTableau10);
				// var color = function (tag) {
				// 	return d3
				// 		.scaleLinear()
				// 		.domain([0, 0.5, 1])
				// 		.range(["rgb(72, 167, 115)", "#e1ca2a", "orange"])(
				// 			topTags.indexOf(tag) / topTags.length
				// 		);
				// };
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
					.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b. %d %H:00")))
					.selectAll("text")
					.attr("transform", "translate(-25,25) rotate(-35)");

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
					.attr("x", width / 2)
					.attr("y", height + 90);
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
