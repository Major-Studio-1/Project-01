export async function drawMapChart(containerSelector, data) {
    const width = 800;
    const height = 500;
    const tooltip = d3.select("#tooltip");

    // Clear previous renders
    d3.select(containerSelector).html("");

    const svg = d3.select(containerSelector)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "100%"); // <-- CHANGE THIS LINE to "100%"

    const dataMap = new Map(data.map(d => [d.label, d.value]));
    
    const maxVal = d3.max(data, d => d.value) || 1;
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, maxVal]);

    // --- Build the Side Legend ---
    const legendContainer = d3.select("#mapLegend");
    legendContainer.html(""); // Clear previous renders

    // Filter out locations with 0 tags and bind data
    const validData = data.filter(d => d.value > 0);
    const legendItems = legendContainer.selectAll(".legend-item")
        .data(validData)
        .join("div")
        .attr("class", "legend-item");
        
    const labelGroup = legendItems.append("div")
        .attr("class", "legend-label-group");
        
    // Append colored swatch
    labelGroup.append("div")
        .attr("class", "legend-color")
        .style("background-color", d => colorScale(d.value));
        
    // Append state name
    labelGroup.append("span")
        .text(d => d.label);
        
    // Append tag count
    legendItems.append("span")
        .attr("class", "legend-count")
        .text(d => d.value);

    // --- Build the Map ---
    try {
        const geojson = await d3.json("https://gist.githubusercontent.com/michellechandra/0b2ce4923dc9b5809922/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json");
        
        const projection = d3.geoAlbersUsa().fitSize([width, height], geojson);
        const path = d3.geoPath().projection(projection);

        svg.append("g")
            .selectAll("path")
            .data(geojson.features)
            .join("path")
            .attr("d", path)
            .attr("class", "state")
            .attr("fill", d => {
                const stateName = d.properties.name;
                const value = dataMap.get(stateName) || 0;
                return value > 0 ? colorScale(value) : "#e6e6e6"; 
            })
            .attr("stroke", "#ffffff") 
            .attr("stroke-width", "1px")
            .on("mouseover", (event, d) => {
                const stateName = d.properties.name;
                const value = dataMap.get(stateName) || 0;
                
                d3.select(event.currentTarget)
                  .attr("stroke", "#333")
                  .attr("stroke-width", "2px");

                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`<strong>${stateName}</strong><br/>Artifacts: ${value}`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget)
                  .attr("stroke", "#ffffff")
                  .attr("stroke-width", "1px");

                tooltip.transition().duration(500).style("opacity", 0);
            });
            
    } catch (error) {
        console.error("Error drawing map:", error);
        d3.select(containerSelector).html("<p>Error loading map data.</p>");
    }
}