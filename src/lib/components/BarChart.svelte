<script>
  import { onMount } from 'svelte';
  import * as d3 from "d3";
  import { categoricalPalette, defaultFontFamily } from '$lib/stores/helpers';

  let svgElement;
  export let data;
  export let category;
  export let value;

  let ready = false;
  onMount(async () => {
    if (!svgElement) return;
    ready = true;
    render();
  });

  function render() {
    const { width, height} = svgElement.getBoundingClientRect();
    const svg = d3.select(svgElement).attr("viewBox", [0, 0, width, height]);

    svg.selectAll("g").remove();

    // Space calculations
    const graphSpace = height;  
    const graphMargin = {l: 80, r: 50, t: 50, b: 130};
    const graphWidth = width - graphMargin.l - graphMargin.r;
    const graphHeight = graphSpace - graphMargin.t - graphMargin.b;

    // Scales
    const x = d3.scaleBand().domain([... new Set(data.map(d => d[category]))]).range([0, graphWidth]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d[value])]).range([graphHeight, 0]).nice();
    
    // Graph
    const gGraph = svg.append("g")
        .attr("transform", `translate(${0},${0})`)
        .append("g")
        .attr("transform", `translate(${graphMargin.l},${graphMargin.t})`)


    const gBars = gGraph.append("g");

    const bars = gBars
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("transform", d => `translate(${x(d[category])},${y(d[value])})`)
      .append("rect")
        .attr("width", x.bandwidth())
        .attr("height", d => graphHeight -  y(d[value]))
        .attr("fill", "black")

    const gx = gGraph.append("g")
      .attr("transform", `translate(0,${graphHeight})`)
      .call(d3.axisBottom(x))

    gx.selectAll("text")
      .style("text-anchor", "end")      // Align the end of the text to the tick
      // .attr("dx", "-0.8em")             // Shift slightly left
      .attr("dy", "1em")             // Shift slightly down
      .attr("transform", "rotate(-30)") // Rotate 45 degrees counter-clockwise
      .style("font-size", "12px");      // Make the text bigger
    
    const gy = gGraph.append("g")
      .call(d3.axisLeft(y))      

    // X-Axis Label
    gGraph.append("text")
      .attr("x", graphWidth / 2)
      .attr("y", graphHeight + graphMargin.b - 20) // Placed near the bottom edge
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      // Capitalizes the 'category' prop string
      .text(category.charAt(0).toUpperCase() + category.slice(1)); 

    // Y-Axis Label
    gGraph.append("text")
      .attr("transform", "rotate(-90)") // Rotate sideways
      .attr("y", -graphMargin.l / 2)   // Shift it left of the axis
      .attr("x", -(graphHeight / 2))    // Center it vertically
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      // Capitalizes the 'value' prop string
      .text(value.charAt(0).toUpperCase() + value.slice(1));
  }
</script>

<svelte:window on:resize={() => {render()}} />

<div class="barchart-container">
  <div class="viz-container">
    <svg bind:this={svgElement} width="100%" height="400"></svg>
  </div>
</div>

<style>
  svg {
    background: white;
  }
</style>