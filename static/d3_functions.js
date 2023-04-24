// drawBubblePlot function to create a bubble plot visualization of transactions
function drawBubblePlot(transactions) {
  // Define dimensions, margins, and scales
  const margin = { top: 20, right: 30, bottom: 40, left: 250 };
  const width = 960 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  const maxTransactionValue = d3.max(transactions, d => d.value);
  const minTransactionValue = d3.min(transactions, d => d.value);

  const x = d3.scaleLinear()
    .domain([0, maxTransactionValue]).nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, maxTransactionValue]).nice()
    .range([height - margin.bottom, margin.top]);

  const radius = d3.scaleSqrt()
    .domain([0, maxTransactionValue])
    .range([1, 30]);

  // Color scale for bubbles based on ETH value
  const color = d3.scaleSequential()
    .domain([minTransactionValue, maxTransactionValue])
    .interpolator(d3.interpolateViridis);

  // Create the SVG element
  const svg = d3.select("#results")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

  // Create a force simulation for bubble positioning
  const simulation = d3.forceSimulation(transactions)
    .force("charge", d3.forceManyBody().strength(5))
    .force("x", d3.forceX().x(d => x(d.value)))
    .force("y", d3.forceY().y(d => y(d.value)))
    .force("collision", d3.forceCollide().radius(d => radius(d.value) + 1))
    .on("tick", ticked);

  function ticked() {
    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);
  }

  // Create the bubbles (circle elements)
  const node = svg.selectAll("circle")
    .data(transactions)
    .join("circle")
    .attr("r", d => radius(d.value))
    .attr("fill", d => color(d.value))
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .on("mouseover", function() { d3.select(this).attr("stroke-width", 2); })
    .on("mouseout", function() { d3.select(this).attr("stroke-width", 1); })
    .on("click", d => window.open(`https://etherscan.io/tx/${d.hash}`, "_blank"));

  // Add abbreviated transaction hash labels inside the bubbles
  svg.selectAll("text")
    .data(transactions)
    .join("text")
    .attr("x", d => x(d.value))
    .attr("y", d => y(d.value))
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("font-size", "10px")
    .attr("fill", "white")
    .text(d => d.hash.substring(0, 6) + "...");

  // Add X and Y axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("ETH Value");

  // Add X and Y axes
  const xAxis = d3.axisBottom(x).ticks(width / 80);
  const yAxis = d3.axisLeft(y).ticks(height / 80);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);
}
