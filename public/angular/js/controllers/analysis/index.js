var _ = require("lodash");

angular
  .module("Aggie")

  .controller("AnalysisController", [
    "$scope",
    "Socket",
    "data",
    "reports",
    function ($scope, Socket, data, reports) {

      $scope.read_only = false;
      $scope.tagSelection = 'all-tags';
      $scope.graph = null;

      $scope.initiateText = function (textToShow) {
        d3.select('#time-text').html('Distribution of ' + textToShow + ' reports by time.');
        d3.select('#net_graph-text').html('Relationships of ' + textToShow + ' reports by author and report.');
        d3.select('#word-text').html('Distribution of ' + textToShow + ' reports by word.');
        d3.select('#author-text').html('Distribution of ' + textToShow + ' reports by author.');
        d3.select('#media-text').html('Distribution of ' + textToShow + ' reports by media.');
      };

      $scope.updateTimestamp = function () {
        var d = new Date();
        $scope.lastUpdated = new Intl.DateTimeFormat('en', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).format(d);
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
        //$scope.createNetworkGraphData();
      }

      $scope.createSocialGraphData = function ()
      {
        console.log("Create social graph data");

        // Get users who have tagged reports from filter that is set
        // If there are no tags set then don't display graph
        // Show scores over at least 1 deviation from standard deviation

      };

      $scope.createNetworkGraphData = function () {
        console.log("Hello");
        var graph = {"nodes": [], "links": []};
        var authors = new Set()
        var next_author_id = 0;
        var id_to_author = new Object();
        var author_to_id = new Object();
        var posts = new Set();
        var post_id = 0;
        var id_to_post = new Object();


        reports.results.forEach(function (item, idx) {
          // Check to see if the author has been seen before
          var author_id = null;
          if (!authors.has(item.author)) {
            authors.add(item.author);
            id_to_author[next_author_id] = {
              "name": item.author,
              "id": next_author_id,
              "num_posts": 0,
              "group": 1
            };
            author_id = next_author_id;
            author_to_id[item.author] = next_author_id;
            next_author_id += 1;
          } else {
            author_id = author_to_id[item.author];
          }
          // Classify post type
          if (!(item._id in id_to_post)) {
            var post_type = "Unknown";
            if ("metadata" in item) {
              if ("tweetID" in item["metadata"]) {
                //post_type = "Twitter";
                post_type = 0;
              } else if ("platform" in item["metadata"]
                  && item['metadata']['platform'] == "Facebook") {
                // post_type = "Facebook";
                post_type = 1;
              }
            }
            var the_post = {
              "id": item._id,
              "type": post_type,
              "name": "",
              "group": 2
            };
            posts.add(the_post._id);
            id_to_post[item._id] = the_post;
            id_to_author[author_id]["num_posts"] += 1;
          }

          // Link post to author
          graph["links"].push({"source": author_id, "target": the_post.id});

          console.log("Index: " + idx + ", " + "Item: " + item.author);
        });
        graph["nodes"] = graph["nodes"].concat(Object.values(id_to_author));
        graph["nodes"] = graph["nodes"].concat(Object.values(id_to_post));

        $scope.graph = graph;
      }

      $scope.createNetworkGraph = function () {

        var width = 400;
        var height = 250;

        var svg = d3.select('#net_graph-view').append('g').attr('class', 'container-group');
        var tagType = $scope.tagSelection;

        if(tagType == undefined || tagType == "all-tags") {
          svg.append('text')
              .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
              .attr('text-anchor', 'middle')
              .text('No network graph data to present; please select a tag.');
          return;
        }

        var graph_data = data.net_graph[tagType]["graph"];

        if (graph_data == undefined || graph_data == null) {
        //if ($scope.graph == undefined || $scope.graph == null) {
          svg.append('text')
              .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
              .attr('text-anchor', 'middle')
              .text('No network graph data to present');
          return;
        }



        //var color = d3.scaleOrdinal(d3.schemeCategory10);
        var color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"];

        var sn_colors = ["#1DA1F2", "#4267B2"]

        try {
          var label = {
            'nodes': [],
            'links': []
          };

          graph_data.nodes.forEach(function (d, i) {
            label.nodes.push({node: d});
            label.nodes.push({node: d});
            label.links.push({
              source: i * 2,
              target: i * 2 + 1
            });
          });


          var adjlist = [];

          graph_data.links.forEach(function (d) {
            adjlist[d.source.index + "-" + d.target.index] = true;
            adjlist[d.target.index + "-" + d.source.index] = true;
          });

          function neigh(a, b) {
            return a == b || adjlist[a + "-" + b];
          }

          svg.selectAll("*").remove();
          var container = svg.append("g");

          svg.call(
              d3.zoom()
                  .scaleExtent([.1, 4])
                  .on("zoom", function () {
                    container.attr("transform", d3.event.transform);
                  })
          );

          var link = container.append("g").attr("class", "links")
              .selectAll("line")
              .data(graph_data.links)
              .enter()
              .append("line")
              .attr("stroke", "#aaa")
              .attr("stroke-width", "1px");


          var node = container.append("g").attr("class", "nodes")
              .selectAll("g")
              .data(graph_data.nodes)
              .enter()
              .append("circle")
              .attr("r", 5)
              .attr("fill", function (d) {
                if ("author_type" in d && d.author_type === "taggedAuthor") {
                  return sn_colors[0];
                } else {
                  return color[1];
                }

              }).on("click", function (event, d)
              {
                // group: 1 - authors, 2 - posts

                if("author_type" in d && d.author_type === "taggedAuthor") {
                  $state.go('reports');
                }

                // Update the model of the selected worker/reviewer

                /*
                if (d.group === 1) {
                  $scope.selected_author = d.id;
                  $scope.selected_post = null;
                  $("#nDetails-author-name").text(d.name);
                  $("#nDetails-author-num-posts").text(d.num_posts);
                  // Get relevant posts filtered by author
                  var author_posts = reports.results.filter(
                      function (report) {
                        return report.author == d.name;
                      });
                  $("#author_posts_details").html("");

                  author_posts.forEach(function (post, idx) {

                    var post_type = "Unknown";
                    if ("metadata" in post) {
                      if ("tweetID" in post["metadata"]) {
                        post_type = "Twitter";
                      } else if ("platform" in post["metadata"]
                          && post['metadata']['platform'] == "Facebook") {
                        post_type = "Facebook";
                      }
                    }

                    $("#author_posts_details").append(
                        $(
                            "<tr><td>" + post._id + "</td>"
                            + "<td>" + post.content + "</td>"
                            + "<td>" + post_type +"</td>"
                            + "</tr>")
                    );
                  });

                  $("#nDetails-view").show()

                } else {
                  $scope.selected_post = d.id;
                  $scope.selected_author = null;
                  $("#nDetails-view").hide();
                }
                */

              });

          node.on("mouseover", focus).on("mouseout", unfocus);

          node.call(
              d3.drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended)
          );

          var labelNode = container.append("g").attr("class", "labelNodes")
              .selectAll("text")
              .data(label.nodes)
              .enter()
              .append("text")
              .text(function (d, i) {
                return i % 2 == 0 ? "" : d.node.name;
              })
              .style("fill", "#555")
              .style("font-family", "Arial")
              .style("font-size", 12)
              .style("pointer-events", "none"); // to prevent mouseover/drag capture

          node.on("mouseover", focus).on("mouseout", unfocus);

          var labelLayout = d3.forceSimulation(label.nodes)
              .force("charge", d3.forceManyBody().strength(-50))
              .force("link", d3.forceLink(label.links).distance(0).strength(2));

          var graphLayout = d3.forceSimulation(graph_data.nodes)
              .force("charge", d3.forceManyBody().strength(-3000))
              .force("center", d3.forceCenter(width / 2, height / 2))
              .force("x", d3.forceX(width / 2).strength(1))
              .force("y", d3.forceY(height / 2).strength(1))
              .force("link", d3.forceLink(graph_data.links).id(function (d) {
                return d.id;
              }).distance(50).strength(1))
              .on("tick", ticked);

          //window.addEventListener("resize", resize);
          //resize();

          //d3.select(window).on("onresize", resize);


          function ticked() {

            node.call(updateNode);
            link.call(updateLink);

            labelLayout.alphaTarget(0.3).restart();
            labelNode.each(function (d, i) {
              if (i % 2 == 0) {
                d.x = d.node.x;
                d.y = d.node.y;
              } else {
                var b = this.getBBox();

                var diffX = d.x - d.node.x;
                var diffY = d.y - d.node.y;

                var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                var shiftX = b.width * (diffX - dist) / (dist * 2);
                shiftX = Math.max(-b.width, Math.min(0, shiftX));
                var shiftY = 16;
                this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
              }
            });
            labelNode.call(updateNode);

          }

          function fixna(x) {
            if (isFinite(x)) return x;
            return 0;
          }

          function focus(event, d) {
            var index = d3.select(event.target).datum().index;
            node.style("opacity", function (o) {
              return neigh(index, o.index) ? 1 : 0.1;
            });
            labelNode.attr("display", function (o) {
              return neigh(index, o.node.index) ? "block" : "none";
            });
            link.style("opacity", function (o) {
              return o.source.index == index || o.target.index == index ? 1 : 0.1;
            });
          }

          function unfocus() {
            labelNode.attr("display", "block");
            node.style("opacity", 1);
            link.style("opacity", 1);
          }

          function updateLink(link) {
            link.attr("x1", function (d) {
              return fixna(d.source.x);
            })
                .attr("y1", function (d) {
                  return fixna(d.source.y);
                })
                .attr("x2", function (d) {
                  return fixna(d.target.x);
                })
                .attr("y2", function (d) {
                  return fixna(d.target.y);
                });
          }

          function updateNode(node) {
            node.attr("transform", function (d) {
              return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
            });
          }

          function dragstarted(event, d) {
            event.sourceEvent.stopPropagation();
            if (!event.active) graphLayout.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          }

          function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
          }

          function dragended(event, d) {
            if (!event.active) graphLayout.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }

        } catch (error) {

          console.log(error);

        }

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
                d3.select(this).select('circle')
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
              return d.data.color;
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

          // The arc generator
          var arc = d3.arc()
            .innerRadius(radius * 0.4) // This is the size of the donut hole
            .outerRadius(radius * 0.8)

          // Another arc that won't be drawn. Just for labels positioning
          var outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9)

          var data_ready = d3.pie()
            .value(function (d) {
              return d.count
            })
            ($scope.mediaData);

          g
            .selectAll('.slice')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('class', 'slice')
            .attr('d', arc)
            .attr('fill', function (d) {
              return (colorScale(d.data.name))
            })
            .attr("stroke", "white")
            .style("stroke-width", "1px")
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

          // g.selectAll('.slice')
          //   .data(data_ready)
          //   .enter()
          //   .append('path')
          //   .attr('class', 'slice')
          //   .attr('d', d3.arc()
          //     .innerRadius(0.5*radius)
          //     .outerRadius(radius)
          //   )
          //   .attr('fill', function (d) {
          //     return colorScale(d.data.name)
          //   })
          //   .style("opacity", 1);

          g.selectAll('.allLabels')
            .data(data_ready)
            .enter()
            .append('text')
            .text(function (d) {
              if (d.endAngle - d.startAngle < 0.25) {
                return ' ';
              } else {
                return d.data.name;
              }
            })
            .attr('class', 'allLabels axis-label')
            .attr('fill', function(d) {
              
            })
            .attr('transform', function (d) {
              var pos = outerArc.centroid(d);
              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
              pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
              return 'translate(' + pos + ')';
            })
            .style('text-anchor', function (d) {
              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
              return (midangle < Math.PI ? 'start' : 'end')
            })
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
                .text(function () {
                  return new Intl.DateTimeFormat('en', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: 'numeric',
                    hour12: true
                  }).format(d.datef);
                })
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
            .range([12, 72]);

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
            .padding(36)
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
        $scope.createNetworkGraph();
        //$scope.createTimelineChart();
        //$scope.createWordCloud();
        //$scope.createAuthorChart();
        //$scope.createMediaChart();
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