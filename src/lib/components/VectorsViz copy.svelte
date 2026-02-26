<script>
  import { onMount } from 'svelte';
  import * as d3 from "d3";
  import { categoricalPalette, defaultFontFamily } from '$lib/stores/helpers';

  let svgElement;
  export let data;
  const clusterColumnOptions = [
    {name: "19 clusters", column: "cluster_19"},
    {name: "10 clusters", column: "cluster_10"},
    {name: "5 clusters", column: "cluster_5"},
  ];
  let clusterColumn = "cluster_10";

  function setClusterColumn(e) {
    const value = e.target.value;
    clusterColumn = value;
    clusterNames = getClusterNames();
    render();
  }

  let clusterNames = [];
  let z; // Categorical color scale
  let articleInformation = { show: false };

  let ready = false;
  onMount(async () => {
    if (!svgElement) return;
    ready = true;
    render();
    clusterNames = getClusterNames();
  });

  function getClusterNames() {
    const clusterNamesMemo = {};
    for (let d of data) {
      if (clusterNamesMemo[d[clusterColumn]] === undefined) {
        const e = {name: d[clusterColumn + "_name"], number: d[clusterColumn]}
        clusterNamesMemo[d[clusterColumn]] = e;
      }
    }
    return Object.values(clusterNamesMemo);
  }

  function render() {
    const { width, height} = svgElement.getBoundingClientRect();
    const svg = d3.select(svgElement).attr("viewBox", [0, 0, width, height]);

    svg.selectAll("g").remove();

    // Space calculations
  
    const graphSpace = height;  
    const graphMargin = {l: 30, r: 30, t: 10, b: 30};
    const graphWidth = width - graphMargin.l - graphMargin.r;
    const graphHeight = graphSpace - graphMargin.t - graphMargin.b;

    // Scales
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.x)).range([0, graphWidth]).nice();
    const y = d3.scaleLinear().domain(d3.extent(data, d => d.y)).range([graphHeight, 0]).nice();
    const categories = d3.range(...d3.extent(data, d => d[clusterColumn]));
    const turboPalette = d3.quantize(d3.interpolateTurbo, Math.max(1, categories.length + 2));
    z = d3.scaleOrdinal().domain(categories).range(categories.length > 10 ? turboPalette : $categoricalPalette) // Cluster color
    
    
    const zoom = d3.zoom()
      .scaleExtent([1, 5])
      .on("zoom", zoomed);

    // Graph
    const gGraph = svg.append("g")
        .attr("transform", `translate(${0},${0})`)
        .append("g")
        .attr("transform", `translate(${graphMargin.l},${graphMargin.t})`)


    const gDot = gGraph.append("g")
        .attr("fill", "none")
        .attr("stroke-linecap", "round")
        
    const gGroup = gDot.selectAll("g")
      .data(data)
      .join("g")
      .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`)

    gGroup.append("path")
        .attr("d", d => `M${0},${0}h0`)
        .attr("stroke", d => z(d[clusterColumn]));

    gGraph.append("rect").attr("width", graphWidth).attr("height", graphHeight).attr("stroke", "black").attr("fill", "none");

    const gx = gGraph.append("g");
    const xAxis = (g, x) => g
      .attr("transform", `translate(0,${graphHeight})`)
      .call(d3.axisBottom(x).ticks(12))
      .call(g => g.select(".domain").attr("display", "none"));
    
    const gy = gGraph.append("g");
    const yAxis = (g, y) => g
      .call(d3.axisLeft(y).ticks(12))
      .call(g => g.select(".domain").attr("display", "none"));

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    function zoomed({transform}) {
      const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
      const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
      gDot.attr("transform", transform).attr("stroke-width", 5 + (transform.k / 8));      
      gx.call(xAxis, zx);
      gy.call(yAxis, zy);
    }

    gGroup.on("mouseover", function (e, d) {
      articleInformation = {
        "Title": d.text,
        "Cluster": d[clusterColumn],
        "Cluster Hierarchy":`-->${d["cluster_5_name"]}\n---->${d["cluster_10_name"]}\n------>${d["cluster_19_name"]}`,
        show: true,
      }
    })
  }
</script>

<svelte:window on:resize={() => {render()}} />

<div class="network-container">
  <div class="viz-container">
    <svg bind:this={svgElement} width="100%" height="600"></svg>
  </div>
  <div class="legend-container">
    <div class="cluster-names-container">
        <label for="cluster-select">Cluster level:</label>
        <select on:change={setClusterColumn} id="cluster-select" value={clusterColumn}>
          {#each clusterColumnOptions as cluster}
            <option value={cluster.column}>{cluster.name}</option>
          {/each}
        </select>
        <p><strong>Legend</strong></p>
        {#each clusterNames as cluster,i (cluster)}
          <div class="legend-row">
            <span style={`background: ${z(cluster.number)};`} class="legend-color"></span>
            <span>{cluster.name}</span>
          </div>
        {/each}
    </div>
    <div class="information-container">
      {#if articleInformation.show}
        {#each Object.entries(articleInformation) as [key, value] }
          {#if key !== "show"}
            <div class="information-row">
              <span class="information-key">{key}: </span>
              <br>
              <span class="information-value">{value}</span>
            </div>
            <br>
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .network-container {
    display: grid;
    grid-gap: 0.1rem;
    grid-template-columns: 1fr 300px;
  }

  .legend-container {
    border: solid 1px black;
    padding: 0.5rem;
    font-size: 14px;
    display: grid;
    white-space: pre-line;
    grid-gap: 2rem;
  }

  .legend-row {
    display: grid;
    grid-template-columns: 20px 1fr;
    align-items: center;
    gap: 3px;
    margin-bottom: 2px;
  }

  .legend-color {
    width: 18px;
    height: 18px;
    border-radius: 20px;
  }

  .information-key {
    padding: 0.1rem;
    background: black;
    color: white;
  }

  .information-row {
    line-height: 1.4em;
  }

  .cluster-names-container {
    max-height: 300px;
    overflow: scroll;
    border-bottom: 1px solid black;
  }
</style>