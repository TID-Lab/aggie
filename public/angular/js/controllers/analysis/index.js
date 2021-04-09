var _ = require("lodash");

angular
  .module("Aggie")

  .controller("AnalysisController", [
    "$scope",
    "Socket",
    "data",
    function ($scope, Socket, data) {

      $scope.read_only = false;
      $scope.tagSelection = 'all-tags';

      $scope.initiateText = function(textToShow) {
        d3.select('#time-text').html('Distribution of ' + textToShow + ' reports by time.');
        d3.select('#word-text').html('Distribution of ' + textToShow + ' reports by word.');
        d3.select('#author-text').html('Distribution of ' + textToShow + ' reports by author.');
        d3.select('#media-text').html('Distribution of ' + textToShow + ' reports by media.');
      }

      $scope.updateTimestamp = function () {
        $scope.lastUpdated = (new Date()).toString();
      }

      $scope.loadData = function () {
        $scope.tagData = data.tags;
        if ($scope.tagSelection == 'all-tags') {
          if ($scope.read_only) {
            $scope.textToShow = "READ";
            $scope.authorData = data.authors_read;
            $scope.mediaData = data.media_read;
            $scope.wordData = data.words_read;
            $scope.timeData = data.time_read;
          } else {
            $scope.textToShow = "ALL";
            $scope.authorData = data.authors;
            $scope.mediaData = data.media;
            $scope.wordData = data.words;
            $scope.timeData = data.time;
          }
        } else {
          $scope.textToShow = $scope.tagSelection.toUpperCase();
          $scope.authorData = data.tagData.author[$scope.tagSelection];
          $scope.mediaData = data.tagData.media[$scope.tagSelection];
          $scope.wordData = data.tagData.word[$scope.tagSelection];
          $scope.timeData = data.tagData.time[$scope.tagSelection];
        }
        $scope.initiateText($scope.textToShow);
      }

      $scope.createTagChart = function () {
        var padding = {
          l: 40,
          r: 10,
          t: 40,
          b: 20
        }

        var width = 400;
        var height = 250;

        var svg = d3.select('#tags-view');
        if ($scope.tagData.length == 0) {
          svg.append('text')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('text-anchor', 'middle')
            .text('No data to visualize');
        } else {
          var tags, flatNodeHeirarchy, packedData;
          tags = $scope.tagData;

          var root = {
            children: tags
          }
          flatNodeHeirarchy = d3.hierarchy(root).sum(function (d) {
            return d.count
          });

          packedData = d3.pack()
            .size([width, height])
            .padding(5)
            (flatNodeHeirarchy);

          var colorScale = d3.scaleOrdinal()
            .domain(d3.extent(packedData.leaves(), function (d) {
              return d.r
            }))
            .range(d3.schemeGreens[4]);

          var leaf = svg.selectAll(".leaf")
            .data(packedData.leaves())
            .enter()
            .append("g")
            .attr('class', 'leaf')
            .attr("transform", function (d) {
              return 'translate(' + (d.x + 1) + ',' + (d.y + 1) + ')';
            })
            .on('mouseover', function (e, d) {
              svg.selectAll('.leaf').attr('opacity', 0.2);
              d3.select(this).attr('opacity', 1).style("cursor", "pointer");;

              svg.append('text')
                .attr('transform', 'translate(' + width / 2 + ',' + (height + padding.t) + ')')
                .attr('id', 'desc-text')
                .text(d.data.count + ' reports for tag ' + d.data.name)
                .attr('text-anchor', 'middle');
            })
            .on('mouseout', function (d, i) {
              svg.selectAll('.leaf').attr('opacity', 1);
              svg.select('#desc-text').remove();
            })
            .on('click', function (e, d) {
              $scope.clear();
              if ($scope.tagSelection == d.data.name) {
                $scope.tagSelection = 'all-tags';
                d3.selectAll('.tag-circle')
                  .attr('opacity', 1)
                  .attr('stroke', 'none');
              } else {
                $scope.tagSelection = d.data.name;
                d3.selectAll('.tag-circle').attr('opacity', 0.1);
                d3.select('#' + d.data.name)
                  .attr('opacity', 1)
                  .attr('stroke', 'black')
                  .attr('stroke-width', 1);
              }
              $scope.loadData();
              $scope.drawAllGraphs();
            });

          var circle = leaf.append("circle")
            .attr('class', 'tag-circle')
            .attr('id', function (d) {
              return d.data.name;
            })
            .attr("r", function (d) {
              return d.r
            })
            .attr("fill", function (d) {
              return colorScale(d.r)
            });

          var text = leaf.append('text')
            .text(function (d) {
              return d.data.name
            })
            .attr('text-anchor', 'middle');
        }
      }

      $scope.createAuthorChart = function () {
        var padding = {
          l: 40,
          r: 10,
          t: 60,
          b: 20
        }

        var svg = d3.select('#author-view').append('g').attr('class', 'container-group');

        var width = 400;
        var height = 200;

        if ($scope.authorData.length == 0) {
          svg.append('text')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('text-anchor', 'middle')
            .text('No data to visualize');
        } else {
          var xScale = d3.scaleLinear()
            .domain([0, d3.max($scope.authorData, function (d) {
              return d.subCount;
            })])
            .range([padding.l, width - padding.r]);

          var yScale = d3.scaleLinear()
            .domain([0, d3.max($scope.authorData, function (d) {
              return d.reportCount;
            })])
            .range([height - padding.b, padding.t]);

          svg.append('g')
            .attr('class', 'axis')
            .call(
              d3.axisBottom()
              .scale(xScale)
              .ticks(5)
              .tickFormat(function (d) {
                return d / 1000 + 'k';
              })
            )
            .attr('transform', 'translate(0,' + (height - padding.b) + ')');

          svg.append('g')
            .attr('class', 'axis')
            .call(
              d3.axisLeft()
              .scale(yScale)
              .ticks(3)
              .tickFormat(d3.format('.0f'))
            )
            .attr('transform', 'translate(' + padding.l + ', 0)');

          svg.selectAll('.author')
            .data($scope.authorData)
            .enter()
            .append('circle')
            .attr('class', 'author')
            .attr('cx', function (d) {
              return xScale(d.subCount)
            })
            .attr('cy', function (d) {
              return yScale(d.reportCount)
            })
            .attr('r', 3)
            .attr('fill', 'green')
            .on('mouseover', function (e, d) {
              svg.selectAll('.author').attr('opacity', 0.2);
              d3.select(this).attr('opacity', 1);

              svg.append('text')
                .attr('transform', 'translate(' + width / 2 + ',' + (height + padding.t) + ')')
                .attr('id', 'desc-text')
                .text(d.reportCount + ' reports by ' + d.name + ' with ' + d.subCount + ' subscribers')
                .attr('text-anchor', 'middle');
            })
            .on('mouseout', function (e, d) {
              svg.selectAll('.author').attr('opacity', 1);
              svg.select('#desc-text').remove();
            });

          svg.append('text')
            .attr('class', 'axis-label')
            .text('No. of Subscribers')
            .attr('transform', 'translate(' + width / 2 + ',' + (height + padding.t / 2) + ')')
            .style("text-anchor", "middle");
          svg.append("text")
            .attr('class', 'axis-label')
            .attr("transform", "rotate(-90)")
            .attr("y", padding.l / 4)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("No. of reports");
        }
      }

      $scope.createMediaChart = function () {
        var padding = {
          l: 40,
          r: 10,
          t: 30,
          b: 20
        }

        var svg = d3.select('#media-view').append('g').attr('class', 'container-group');

        var width = 400;
        var height = 250;

        if ($scope.mediaData.length == 0) {
          svg.append('text')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('text-anchor', 'middle')
            .text('No data to visualize');
        } else {
          var radius = Math.min((width - padding.l - padding.r), (height - padding.t - padding.b)) / 2;

          var g = svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

          var colorScale = d3.scaleOrdinal()
            .domain($scope.mediaData.map(function (d) {
              return d.name
            }))
            .range(d3.schemeAccent);

          var data_ready = d3.pie()
            .value(function (d) {
              return d.count
            })
            ($scope.mediaData);

          g.selectAll('.slice')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('class', 'slice')
            .attr('d', d3.arc()
              .innerRadius(0)
              .outerRadius(radius)
            )
            .attr('fill', function (d) {
              return colorScale(d.data.name)
            })
            // .attr("stroke", "black")
            // .style("stroke-width", "2px")
            .style("opacity", 1)
            .on('mouseover', function (e, d) {
              svg.selectAll('.slice').style('opacity', 0.2);
              d3.select(this).style('opacity', 1);

              svg.append('text')
                .attr('id', 'desc-text')
                .attr('transform', 'translate(' + width / 2 + ',' + (height + padding.t) + ')')
                .attr('text-anchor', 'middle')
                .text(d.data.count + ' reports of media type ' + d.data.name);
            })
            .on('mouseout', function (e, d) {
              svg.selectAll('.slice').style('opacity', 1);
              svg.select('#desc-text').remove();
            });
        }
      }

      $scope.createTimelineChart = function () {
        var padding = {
          l: 50,
          r: 20,
          t: 50,
          b: 0
        }
        var svg = d3.select('#time-view').append('g').attr('class', 'container-group');

        var width = 400;
        var height = 200;

        if ($scope.timeData.length == 0) {
          svg.append('text')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('text-anchor', 'middle')
            .text('No data to visualize');
        } else {
          var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          var timeline_data = $scope.timeData;
          for (var i = 0; i < timeline_data.length; i++) {
            var time = timeline_data[i];
            var year = time.year;
            var month = (time.month < 10 ? '0' + time.month : time.month);
            var day = (time.day < 10 ? '0' + time.day : time.day);
            var hour = (time.hour < 10 ? '0' + time.hour : time.hour)
            var date = year + '-' + month + '-' + day + 'T' + hour + ':00:00';
            timeline_data[i].datef = new Date(date);
          }

          var date_range = d3.extent(timeline_data, function (d) {
            return d.datef;
          });

          var xScale = d3.scaleTime()
            .domain(date_range)
            .range([padding.l, width - padding.r]);

          var yScale = d3.scaleLinear()
            .domain([0, d3.max(timeline_data, function (d) {
              return d.count
            })])
            .range([height - padding.b, padding.t]);

          svg.append('g')
            .attr('class', 'axis')
            .call(
              d3.axisBottom()
              .scale(xScale)
              .ticks(4) 
            )
            .attr('transform', 'translate(0,' + (height - padding.b) + ')');

          svg.append('g')
            .attr('class', 'axis')
            .call(
              d3.axisLeft()
              .scale(yScale)
              .ticks(4)
            )
            .attr('transform', 'translate(' + padding.l + ', 0)');

          timeline_data = timeline_data.sort(function (a, b) {
            return a.datef.getTime() - b.datef.getTime()
          });

          // svg.append('path')
          //   .datum(timeline_data)
          //   .attr('fill', '#009446')
          //   .attr('stroke', 'black')
          //   .attr('stroke-width', 1.5)
          //   .attr('d', d3.area()
          //     .x(d => xScale(d.datef.getTime() / 1000))
          //     .y0(d => yScale(0))
          //     .y1(d => yScale(d.count))

          var colorScale = d3.scaleOrdinal()
            .domain(d3.extent(timeline_data, function (d) {
              return d.count
            }))
            .range(d3.schemeGreens[4]);
          //   );

          svg.selectAll('.time-bar')
            .data(timeline_data)
            .enter()
            .append('rect')
            .attr('class', 'time-bar')
            .attr('x', function (d) {
              return xScale(d.datef);
            })
            .attr('y', function (d) {
              return yScale(d.count)
            })
            .attr('height', function (d) {
              return height - padding.b - yScale(d.count)
            })
            .attr('width', 4)
            .attr('fill', function (d) {
              if (d.datef.toString() != 'Invalid Date') {
                return colorScale(d.count)
              } else {
                return 'none';
              }
            })
            .on('mouseover', function (e, d) {
              svg.selectAll('.time-bar').attr('opacity', 0.2);
              d3.select(this).attr('opacity', 1);

              svg.append('text')
                .attr('transform', 'translate(' + width / 2 + ',' + (height + padding.t) + ')')
                .attr('id', 'desc-text')
                .text(d.count + ' reports on')
                .attr('text-anchor', 'middle');

              svg.append('text')
                .attr('transform', 'translate(' + width / 2 + ',' + (height + padding.t + 20) + ')')
                .attr('id', 'desc-text')
                .text(d.datef.toString())
                .attr('text-anchor', 'middle');
            })
            .on('mouseout', function (e, d) {
              svg.selectAll('.time-bar').attr('opacity', 1);
              svg.selectAll('#desc-text').remove();
            });

          svg.append('text')
            .attr('class', 'axis-label')
            .text('Time Posted')
            .attr('transform', 'translate(' + width / 2 + ',' + (height + padding.t / 2 + 5) + ')')
            .style("text-anchor", "middle");
          svg.append("text")
            .attr('class', 'axis-label')
            .attr("transform", "rotate(-90)")
            .attr("y", padding.l / 4)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("No. of reports");
        }
      }

      $scope.createWordCloud = function () {
        var svg = d3.select('#word-view').append('g').attr('class', 'container-group');

        var width = 1600;
        var height = 900;

        if ($scope.wordData.length == 0) {
          svg.append('text')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('text-anchor', 'middle')
            .text('No data to visualize');
        } else {
          $scope.wordData.sort(function (a, b) {
            return (a.count - b.count);
          });

          var wordScale = d3.scaleLinear()
            .domain(d3.extent($scope.wordData, function (d) {
              return d.count
            }))
            .range([12, 120]);

          var draw = function (words) {
            svg.selectAll('.words')
              .data(words)
              .enter()
              .append('text')
              .attr('class', 'words')
              .style("font-size", function (d) {
                return d.size;
              })
              .attr("text-anchor", "middle")
              .attr("transform", function (d) {
                return "translate(" + [d.x + width / 2, d.y + height / 2] + ")";
              })
              .text(function (d) {
                return d.text;
              })
              .attr('fill', 'green');
          }

          var layout = d3.layout.cloud()
            .size([width, height])
            .words($scope.wordData.map(function (d) {
              return {
                text: d.name,
                size: wordScale(d.count),
                test: d.name
              }
            }))
            .padding(24)
            .fontSize(function (d) {
              return d.size
            })
            .on('end', draw);

          layout.start();
        }


      }

      $scope.clear = function () {
        d3.selectAll('.container-group').remove();
      }

      $scope.refresh = function () {
        $scope.clear();
        $scope.loadData();
        $scope.drawAllGraphs();
      }

      $scope.drawAllGraphs = function () {
        $scope.createTimelineChart();
        $scope.createWordCloud();
        $scope.createAuthorChart();
        $scope.createMediaChart();
      }

      var init = function () {
        $scope.updateTimestamp();
        $scope.loadData();
        $scope.createTagChart();
        $scope.drawAllGraphs();
      }

      init();
    },
  ]);