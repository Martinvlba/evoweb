function mirror_status(chart_id, data_url) {
    var jq_div = jQuery(chart_id);

    var draw_graph = function(data) {
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = jq_div.width() - margin.left - margin.right,
            height = jq_div.height() - margin.top - margin.bottom;

        var color = d3.scale.category20(),
            x = d3.time.scale.utc().range([0, width]),
            y = d3.scale.linear().range([height, 0]),
            x_axis = d3.svg.axis().scale(x).orient("bottom"),
            y_axis = d3.svg.axis().scale(y).orient("left");

        /* remove any existing graph first if we are redrawing after resize */
        d3.select(chart_id).select("svg").remove();
        var svg = d3.select(chart_id).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(d3.extent(data, function(d) { return d.check_time; })).nice(d3.time.hour);
        y.domain(d3.extent(data, function(d) { return d.duration; })).nice();

        /* build the axis lines... */
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Check Time (UTC)");

        svg.append("g")
            .attr("class", "y axis")
            .call(y_axis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Duration (seconds)");

        /* ...then the points themselves. */
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", function(d) { return x(d.check_time); })
            .attr("cy", function(d) { return y(d.duration); })
            .style("fill", function(d) { return color(d.url); });

        /* add a legend for good measure */
        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });
    };

    /* invoke the data-fetch + first draw */
    var cached_data = null;
    d3.json(data_url, function(json) {
        cached_data = jQuery.map(json['urls'],
            function(url, i) {
                return jQuery.map(url['logs'],
                    function(log, j) {
                        return {
                            url: url['url'],
                            duration: log['duration'],
                            check_time: new Date(log['check_time'])
                        };
                });
        });
        draw_graph(cached_data);
    });

    /* then hook up a resize handler to redraw if necessary */
    var resize_timeout = null;
    var real_resize = function() {
        resize_timeout = null;
        draw_graph(cached_data);
    };
    jQuery(window).resize(function() {
        if (resize_timeout) {
            clearTimeout(resize_timeout);
        }
        resize_timeout = setTimeout(real_resize, 200);
    });
}
