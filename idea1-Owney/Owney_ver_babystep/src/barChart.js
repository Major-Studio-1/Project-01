export function drawBarChart(containerSelector, data, fillColor) {
    // Increased bottom margin from 70 to 80 to fit the rotated year labels
    const margin = { top: 20, right: 20, bottom: 80, left: 40 }; 
    const width = 350 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Clear previous renders
    d3.select(containerSelector).html("");

    const svg = d3.select(containerSelector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width])
        .padding(0.2);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-12,5)rotate(-45)") // Adjusted rotation pivot slightly
        .style("text-anchor", "end")
        .attr("class", "axis-label");

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("d")));

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.label))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", fillColor)
        .attr("opacity", 0.8)
        .on("mouseover", function() { d3.select(this).attr("opacity", 1); })
        .on("mouseout", function() { d3.select(this).attr("opacity", 0.8); });
}