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

    $scope.prepareDataBar = function(data) {
      var actualStatistics = [];
      var expectedStatistics = [];

      for (var prop in data[0].metadata.actualStatistics) {
        actualStatistics.push({
          type: prop,
          count: 0
        });

        expectedStatistics.push({
          type: prop,
          count: 0
        });
      }

      for (var i =0; i<data.length; i++) {
        var post = data[i];
        for (var prop in post.metadata.actualStatistics) {
          var actReaction = actualStatistics.find(function(r) {
            return r.type == prop;
          });
          actReaction.count += post.metadata.actualStatistics[prop];

          var expReaction = expectedStatistics.find(function(r) {
            return r.type == prop;
          });
          expReaction.count += post.metadata.expectedStatistics[prop];
        }
      }

      $scope.actualStatistics = actualStatistics;
      $scope.expectedStatistics = expectedStatistics;
    }

    $scope.initiateBar = function(actualStatistics, expectedStatistics) {
      $scope.barsvg = d3.select('figure#aggie-viz1').append('svg').attr('width', '100%').attr('viewBox', '0 0 1400 800');

      var width = 1400, height = 800;

      var actMax = d3.max(actualStatistics, function(d) {
        return d.count;
      });

      var expMax = d3.max(expectedStatistics, function(d) {
        return d.count;
      });

      var yScale = d3.scaleLinear()
      .domain([0, Math.max(actMax,expMax)])
      .range([height - 70, 120]);

      var xScaleRange = [];
      for (var i =  0; i < actualStatistics.length; i++) {
        xScaleRange[i] = 100 + i * (width - 30)/actualStatistics.length;
      }

      var xScale = d3.scaleOrdinal()
      .domain(Object.keys(actualStatistics))
      .range(xScaleRange);

      var heightScale = d3.scaleLinear()
        .domain([0, Math.max(actMax, expMax)])
        .range([0, height - 190]);

      $scope.barsvg.selectAll('.bar')
        .data(actualStatistics)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) {return xScale(d.type) - 30})
        .attr('y', function(d) {return yScale(d.count)})
        .attr('width', 60)
        .attr('height', function(d) { return heightScale(d.count)})
        .attr('fill', '#F79F1F');

        $scope.barsvg.selectAll('.mark')
          .data(expectedStatistics)
          .enter()
          .append('line')
          .attr('class', 'mark')
          .attr('x1', function(d) {return  xScale(d.type) - 30})
          .attr('y1', function(d) {return yScale(d.count)})
          .attr('x2', function(d){return xScale(d.type) + 30})
          .attr('y2', function(d) {return yScale(d.count)})
          .attr('stroke', '#3498db')
          .attr('stroke-width', 4);

          $scope.barsvg.selectAll('.bar-label')
          .data(actualStatistics)
          .enter()
          .append('text')
          .text(function(d) {return d.type.slice(0,-5)})
          .attr('class', 'bar-label')
          .attr('text-anchor', 'middle')
          .attr('transform', function(d) {return 'translate('+xScale(d.type)+ ',' + (yScale(0) + 20) + ')'});

          $scope.barsvg.append('g')
          .attr('class', 'y-axis')
            .call(d3.axisLeft().scale(yScale))
            .attr('transform', 'translate(50,0)');

    $scope.barsvg.append('text')
    .text('Actual Statistics')
    .attr('transform', 'translate(1120, 20)');

    $scope.barsvg.append('text')
  .text('Expected Statistics')
  .attr('transform', 'translate(1120, 40)');

  $scope.barsvg.append('rect')
  .attr('fill', '#F79F1F')
  .attr('width', 10)
  .attr('height',10)
  .attr('x', 1100)
  .attr('y', 10);

  $scope.barsvg.append('line')
  .attr('stroke', '#3498db')
  .attr('stroke-width', 4)
  .attr('x1', 1100)
  .attr('x2', 1110)
  .attr('y1', 35)
  .attr('y2', 35);
    }

    $scope.initiatePieChart = function(mediaTypeCounts) {
      $scope.piesvg = d3.select('figure#aggie-viz2').append('svg').attr('width', '100%').attr('viewBox', '0 0 1400 800');

      var width = 1400, height = 800;

      var radius = Math.min(width, height)/4;

      var colorScale = d3
				.scaleOrdinal()
				.domain(
					mediaTypeCounts.map(function (d) {
						return d.type;
					})
				)
				.range(d3.schemeTableau10);

      var pie = d3.pie().value(function(d) {
        return d.count;
      });

      var data_ready = pie(mediaTypeCounts);

      var g= $scope.piesvg
        .append('g')
        .attr('transform', 'translate(' + width/3 + ',' + height/2 + ')');

      var u = g.selectAll("path")
      .data(data_ready);

      var legendyScaleRange = [];
      for (var i=0; i<mediaTypeCounts.length; i++) {
        legendyScaleRange[i] = height/2 - 200 + i*50;
      }

      var legendyScale = d3.scaleOrdinal()
       .domain(mediaTypeCounts.map(function(d) {
         return d.type;
        }))
       .range(legendyScaleRange);

       u
    .enter()
    .append('path')
    .attr('d', d3.arc()
    .innerRadius(0)
    .outerRadius(radius)
    )
    .attr('fill', function(d){ return(colorScale(d.data.type)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 1);

  var group = $scope.piesvg.selectAll('.legend')
    .data(mediaTypeCounts)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform',function(d) {
      return "translate(" + (1.8 * width) / 3 + "," + legendyScale(d.type) + ") scale(2.3)";
    });

    group.append('text')
    .text(function(d) {
      return d.type;
    });

    group.append('rect')
      .attr('fill', function(d) {
        return colorScale(d.type);
      })
      .attr('width', 20)
      .attr('height', 20)
      .attr('x', -30)
      .attr('y', -10);
    }

    $scope.initiateAreaGraph = function(areaChartCounts) {
      $scope.areasvg = d3.select('figure#aggie-viz3').append('svg').attr('width', '100%').attr('viewBox', '0 0 1400 800');
    
      var width = 1400, height = 800;

      var xScale = d3.scaleLinear()
      .domain(d3.extent(areaChartCounts, function(d) {
        return d.time;
      }))
      .range([50, width - 50]);

      var yScale = d3.scaleLinear()
    .domain([0, d3.max(areaChartCounts, function(d) {
      return d.count;
    })])
    .range([height - 50, 50]);

    console.log("here2");

    $scope.areasvg
      .append('g')
      .call(d3.axisBottom(xScale))
      .attr('transform', 'translate(0,' + (height - 40) + ')');

      $scope.areasvg.append('g')
    .call(d3.axisLeft(yScale))
    .attr('transform', 'translate(40, 0)');

    $scope.areasvg.append('path')
    .datum(areaChartCounts)
    .attr("fill", function(d) {
      return "steelblue";
    })
    .attr("stroke", "none")
    .attr("d", d3.area()
       .curve(d3.curveLinear)
       .x(function(d) {
         return xScale(d.time);
       })
       .y0(function(d) {
         return yScale(0);
       })
       .y1(function(d) {
         return yScale(d.count);
       }));
    }

    $scope.prepareDataPie = function(data) {
      var mediaTypeCounts = [];

      for (var i=0; i<data.length; i++) {
        var datum = data[i];

        if (mediaTypeCounts.find(function(d) {
          return d.type == datum.metadata.type;
        })) {
          mediaTypeCounts.find(function(d) {
            return d.type == datum.metadata.type;
          }).count++;
        } else {
          mediaTypeCounts.push({
            type: datum.metadata.type,
            count: 1
        });
        }
      }

      $scope.mediaTypeCounts = mediaTypeCounts;
    }

    $scope.prepareDataArea = function(data) {
      var areaChartCounts = [];
      for (var i = 0; i<data.length; i++) {
        var hour = new Date(data[i].authoredAt).getHours();

        if (areaChartCounts.find(function(d) {
          return d.time == hour;
        })) {
          areaChartCounts.find(function(d) {
            return d.time == hour;
          }).count++;
        } else {
          areaChartCounts.push({
            time: hour,
            count: 1
          });
        }
      }

      for (var i = d3.min(areaChartCounts, function(d) {
        return d.time;
      }); i<=d3.max(areaChartCounts,function(d) {
        return d.time;
      }); i++) {
        if (!areaChartCounts.find(function(d) {
          return d.time == i;
        })) {
          areaChartCounts.push({
            time: i,
            count: 0
          });
        }
      }
    
      $scope.areaChartCounts = areaChartCounts.sort(function(a,b) {return a.time - b.time;});
    }

    $scope.prepareDataBar($scope.data);
    $scope.initiateBar($scope.actualStatistics, $scope.expectedStatistics);
    $scope.prepareDataPie($scope.data);
    $scope.initiatePieChart($scope.mediaTypeCounts);
    $scope.prepareDataArea($scope.data);
    $scope.initiateAreaGraph($scope.areaChartCounts);
  }
]);
