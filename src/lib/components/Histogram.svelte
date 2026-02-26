<script>
  import { onMount } from 'svelte';
  import * as d3 from "d3";

  let svgElement;
  export let data = [];
  export let value; // The numerical column to bin (e.g., "Citations")
  export let binsCount = 100; // Controls how many bins to divide the data into

  let ready = false;
  onMount(async () => {
    if (!svgElement) return;
    ready = true;
    render();
  });

  function render() {
    const { width, height } = svgElement.getBoundingClientRect();
    const svg = d3.select(svgElement).attr("viewBox", [0, 0, width, height]);

    svg.selectAll("g").remove();
    svg.selectAll("text").remove();

    // Space calculations
    const graphSpace = height;  
    const graphMargin = {l: 80, r: 50, t: 50, b: 70}; // Reduced bottom margin since numbers don't need steep rotation
    const graphWidth = width - graphMargin.l - graphMargin.r;
    const graphHeight = graphSpace - graphMargin.t - graphMargin.b;

    // 1. Create the continuous X scale based on the min/max of your data
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => +d[value]))
      .range([0, graphWidth])
      .nice();

    // 2. Set up the D3 histogram binning generator
    const histogram = d3.bin()
      .value(d => +d[value])   // The numerical value to evaluate
      .domain(x.domain())      // The domain of the X scale
      .thresholds(x.ticks(binsCount)); // Approximate number of bins

    // 3. Generate the bins from the data
    const bins = histogram(data);

    // 4. Create the Y scale based on the maximum frequency (length) of the bins
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([graphHeight, 0])
      .nice();
    
    // Graph container
    const gGraph = svg.append("g")
        .attr("transform", `translate(${graphMargin.l},${graphMargin.t})`);

    const gBars = gGraph.append("g");

    // 5. Draw the histogram rectangles
    gBars.selectAll("rect")
      .data(bins)
      .join("rect")
      // x0 is the start value of the bin
      .attr("x", d => x(d.x0) + 1) // +1px gap between bars
      // length is the number of items in that bin
      .attr("y", d => y(d.length))
      // width is the distance between the start and end of the bin
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("height", d => graphHeight - y(d.length))
      .attr("fill", "black");

    // X-Axis
    const gx = gGraph.append("g")
      .attr("transform", `translate(0,${graphHeight})`)
      .call(d3.axisBottom(x));

    // Y-Axis
    const gy = gGraph.append("g")
      .call(d3.axisLeft(y));      

    // --- ADD AXIS LABELS ---

    // X-Axis Label (The variable being binned)
    gGraph.append("text")
      .attr("x", graphWidth / 2)
      .attr("y", graphHeight + graphMargin.b - 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text(value.charAt(0).toUpperCase() + value.slice(1)); 

    // Y-Axis Label (Always represents Frequency/Count in a histogram)
    gGraph.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -graphMargin.l / 2)
      .attr("x", -(graphHeight / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Frequency");
  }
</script>

<svelte:window on:resize={() => { if(ready) render() }} />

<div class="histogram-container">
  <div class="viz-container">
    <svg bind:this={svgElement} width="100%" height="400"></svg>
  </div>
</div>

<style>
  svg {
    background: white;
  }
</style>