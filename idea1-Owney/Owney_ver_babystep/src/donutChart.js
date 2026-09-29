export function drawDonutChart(containerSelector, data) {
    const width = 300;
    const height = 300;
    const margin = 20;

    const radius = Math.min(width, height) / 2 - margin;
    const tooltip = d3.select("#tooltip");

    // Clear previous renders
    d3.select(containerSelector).html("");

    const svg = d3.select(containerSelector)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const pie = d3.pie()
        .sort(null)
        .value(d => d.value);

    const data_ready = pie(data);

    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius);

    svg.selectAll('path')
        .data(data_ready)
        .join('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.label))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.9)
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 1);
            
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.data.label}</strong><br/>Count: ${d.data.value}`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).style("opacity", 0.9);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    const arcLabels = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.7);

    svg.selectAll('text')
        .data(data_ready)
        .join('text')
        // CRITICAL FIX: Only render text if the slice's angle is large enough to fit it (prevents overlap)
        .text(d => (d.endAngle - d.startAngle) > 0.35 ? d.data.label : "") 
        .attr("transform", d => `translate(${arcLabels.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "#fff")
        .style("font-weight", "bold")
        .style("pointer-events", "none");
}