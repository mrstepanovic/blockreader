function drawChart(blocks) {
    const margin = { top: 20, right: 30, bottom: 40, left: 250 };
    const width = 960 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom; // Increase the height
  
    const transactions = blocks.flatMap(block => block.transactions);
  
    transactions.sort((a, b) => b.value - a.value);
  
    const x = d3.scaleLinear()
      .domain([0, d3.max(transactions, d => d.value)]).nice()
      .range([margin.left, width - margin.right]);
  
    const y = d3.scaleBand()
      .domain(transactions.map(d => d.hash))
      .range([margin.top, height - margin.bottom])
      .padding(0.3); // Adjust the padding between the bars
  
    const svg = d3.select("#results")
      .append("svg")
      .attr("viewBox", [0, 0, width, height]);
  
    svg.append("g")
      .attr("fill", "red")
      .selectAll("rect")
      .data(transactions)
      .join("rect")
      .attr("x", x(0))
      .attr("y", d => y(d.hash))
      .attr("width", d => x(d.value) - x(0))
      .attr("height", y.bandwidth())
      .on("mouseover", function() { d3.select(this).attr("fill", "blue"); })
      .on("mouseout", function() { d3.select(this).attr("fill", "red"); });
  
    svg.append("g")
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .attr("transform", `translate(${x(0)},0)`);
  
    svg.append("g")
      .call(d3.axisTop(x).ticks(width / 80))
      .attr("transform", `translate(0,${margin.top})`);
  
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("ETH Value");
  }
  