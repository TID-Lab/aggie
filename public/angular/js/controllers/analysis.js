angular.module('Aggie')

.controller('AnalysisController', [
  '$scope',
  'Socket',
  'data',
  function($scope, Socket, data) {
    $scope.data = data.map(function (e) {
			var out = Object.assign({}, e);
			out.tags = out.tags
				.map(function (t) {
					return t.includes(",") ? t.split(", ") : t;
				})
				.flat();
			return out;
		});
		var totalCount = data.length;
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
			});
		console.log(
			filtered,
			tagCount,
			tagCount.reduce(function (acc, cur) {
				return acc + cur.value;
			}, 0)
		);

		function wrap(d) {
			var text = d3.select(this),
				width = d.r * 2,
				x = d.x,
				y = d.y,
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1,
				tspan = text.text(null).append("tspan"), //.attr("x", x).attr("y", y);
				elements = [];
			elements.push(tspan);
			while ((word = words.pop())) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text
						.append("tspan")
						.attr("x", 0)
						.attr("y", 0)
						.attr("dy", ++lineNumber * lineHeight + "em")
						.text(word);
					elements.push(tspan);
				}
			}
			// console.log(elements);
			tspan = text
				.append("tspan")
				.attr("x", 0)
				.attr("y", 0)
				.attr("dy", ++lineNumber * lineHeight + "em")
				.text(((d.data.value / totalCount) * 100).toFixed(1) + "%");
			elements.push(tspan);
			elements.forEach(function (e) {
				return e.attr(
					"dy",
					parseFloat((e.attr("dy") || "0em").replace("em", "")) -
						((elements.length - 1) / 2 - 0.2) * lineHeight +
						"em"
				);
			});
		}

		var createBubbleChart = function (data, id) {
			var diameter = 1000;
			var color = (color = d3.scaleOrdinal(
				data.map(function (d) {
					return d.group;
				}),
				d3.schemeTableau10
			));
			var bubble = d3.pack(data).size([diameter, diameter]).padding(1.5);
			var tooltipDiv = d3.select(id).append("div").attr("class", "tooltip").style("opacity", 0);
			var tooltip = function (event, d) {
				return tooltipDiv
					.html(
						'<div class="tooltip-title">' +
							d.data.name +
							"</div><div>" +
							d.data.value +
							" Reports" +
							"</div><div>" +
							((d.data.value / totalCount) * 100).toFixed(1) +
							"%</div>"
					)
					.style("left", event.pageX + "px")
					.style("top", event.pageY - 75 + "px");
			};
			var svg = d3
				.select(id)
				.append("svg")
				.attr("viewBox", [0, 0, diameter, diameter])
				.attr("font-size", 10)
				.attr("font-family", "sans-serif")
				.attr("text-anchor", "middle");
			var nodes = d3
				.hierarchy({ children: data })
				.sum(function (d) {
					return d.value;
				})
				.sort(function (a, b) {
					return b.value - a.value;
				});
			var node = svg
				.selectAll(".node")
				.data(bubble(nodes).descendants())
				.enter()
				.filter(function (d) {
					return !d.children;
				})
				.append("g")
				.attr("class", "node")
				.attr("transform", function (d) {
					return "translate(" + d.x + "," + d.y + ")";
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
			node
				.append("circle")
				.attr("r", function (d) {
					return d.r;
				})
				.style("fill", function (d, i) {
					return color(i);
				})
				.style("cursor", "pointer");
			node
				.append("text")
				.attr("dy", ".2em")
				.style("text-anchor", "middle")
				.text(function (d) {
					return d.data.name;
				})
				.attr("font-family", "sans-serif")
				.attr("font-size", function (d) {
					return d.r / 5;
				})
				.attr("fill", "white")
				.each(wrap)
				.style("cursor", "pointer");

			d3.select(self.frameElement).style("height", diameter + "px");
		};

    var init = function() {
      Socket.on('stats', updateStats);
      Socket.join('stats');
      createBubbleChart(tagCount, "#tag-bubble");
    }

    var updateStats = function(stats) {
      $scope.stats = stats;
    };

    $scope.$on('$destroy', function() {
      Socket.leave('stats');
      Socket.removeAllListeners('stats');
    });

    init();
    
    $scope.initiatesvg = function() {
      $scope.barsvg = d3.select('figure#aggie-viz').append('svg').attr('width', '100%').attr('viewBox', '0 0 1400 800');
    }

    $scope.initiatesvg();
  }
]);
