<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { categoricalPalette } from "$lib/stores/helpers";

  let svgElement;
  export let data;

  const clusterColumnOptions = [
    { name: "19 specific sub-fields", column: "cluster_19" },
    { name: "10 broader domains", column: "cluster_10" },
    { name: "5 macro-categories", column: "cluster_5" },
  ];

  let clusterColumn = "cluster_5";

  let clusterNames = [];
  let z;
  let articleInformation = { show: false };
  let ready = false;
  let activeLegendCluster = null;
  let currentlyHoveredNode = null;
  let d3Dots;

  onMount(async () => {
    if (!svgElement) return;
    ready = true;
    render();
  });

  // REACTIVE BLOCK 1: Handle Dropdown Changes
  // Whenever clusterColumn changes, Svelte automatically runs this block
  $: if (ready && data && d3Dots) {
    // Rebuild scales (Note: d3.range needs max + 1 to include the highest cluster number)
    const [min, max] = d3.extent(data, (d) => d[clusterColumn]);
    const categories = d3.range(min, max + 1);
    const turboPalette = d3.quantize(
      d3.interpolateTurbo,
      Math.max(1, categories.length + 2),
    );
    z = d3
      .scaleOrdinal()
      .domain(categories)
      .range(categories.length > 10 ? turboPalette : $categoricalPalette);

    // Rebuild legend names
    const clusterNamesMemo = {};
    for (let d of data) {
      if (clusterNamesMemo[d[clusterColumn]] === undefined) {
        clusterNamesMemo[d[clusterColumn]] = {
          name: d[clusterColumn + "_name"],
          number: d[clusterColumn],
        };
      }
    }
    clusterNames = Object.values(clusterNamesMemo).sort(
      (a, b) => a.number - b.number,
    );

    // Update the dot colors using a NAMED transition ("colorUpdate") so it doesn't get canceled
    d3Dots
      .transition("colorUpdate")
      .duration(500)
      .attr("fill", (d) => z(d[clusterColumn]));
  }

  // REACTIVE BLOCK 2: Handle Legend Hover Opacity
  // Uses a different named transition ("opacityUpdate")
  $: if (ready && d3Dots) {
    d3Dots
      .transition("opacityUpdate")
      .duration(300)
      .attr("opacity", (d) =>
        activeLegendCluster === null || d[clusterColumn] === activeLegendCluster
          ? 0.85
          : 0.05,
      );
  }

  function render() {
    const { width, height } = svgElement.getBoundingClientRect();
    const svg = d3.select(svgElement).attr("viewBox", [0, 0, width, height]);

    svg.selectAll("*").remove();

    const graphMargin = { l: 20, r: 20, t: 20, b: 20 };
    const graphWidth = width - graphMargin.l - graphMargin.r;
    const graphHeight = height - graphMargin.t - graphMargin.b;

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.x))
      .range([0, graphWidth])
      .nice();
    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.y))
      .range([graphHeight, 0])
      .nice();

    // Initial scale setup
    const [min, max] = d3.extent(data, (d) => d[clusterColumn]);
    const categories = d3.range(min, max + 1);
    const turboPalette = d3.quantize(
      d3.interpolateTurbo,
      Math.max(1, categories.length + 2),
    );
    z = d3
      .scaleOrdinal()
      .domain(categories)
      .range(categories.length > 10 ? turboPalette : $categoricalPalette);

    const zoom = d3.zoom().scaleExtent([0.5, 8]).on("zoom", zoomed);

    const gGraph = svg
      .append("g")
      .attr("transform", `translate(${graphMargin.l},${graphMargin.t})`);

    const gDot = gGraph.append("g");

    d3Dots = gDot
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("class", "article-dot")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 4.5)
      .attr("fill", (d) => z(d[clusterColumn]))
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.85);

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    function zoomed({ transform }) {
      gDot.attr("transform", transform);
      d3Dots
        .attr("r", 4.5 / Math.sqrt(transform.k))
        .attr("stroke-width", 0.5 / transform.k);
    }

    function resetNodeStyle(nodeElement, datum) {
      const currentZoom = d3.zoomTransform(svg.node()).k;
      d3.select(nodeElement)
        .transition("nodeHover")
        .duration(200)
        .attr("r", 4.5 / Math.sqrt(currentZoom))
        .attr("stroke", "white")
        .attr("stroke-width", 0.5 / currentZoom)
        .attr(
          "opacity",
          activeLegendCluster === null ||
            datum[clusterColumn] === activeLegendCluster
            ? 0.85
            : 0.05,
        );
    }

    d3Dots
      .on("mouseover", function (e, d) {
        if (currentlyHoveredNode && currentlyHoveredNode !== this) {
          const previousDatum = d3.select(currentlyHoveredNode).datum();
          resetNodeStyle(currentlyHoveredNode, previousDatum);
        }
        currentlyHoveredNode = this;

        // Apply active highlight to the new node
        d3.select(this)
          .raise()
          .transition("nodeHover")
          .duration(100)
          .attr("r", 8)
          .attr("stroke", "#161616")
          .attr("stroke-width", 2)
          .attr("opacity", 1);

        articleInformation = {
          Title: d.text,
          Cluster: d[clusterColumn + "_name"],
          Hierarchy: `${d["cluster_5_name"]} \n↳ ${d["cluster_10_name"]} \n  ↳ ${d["cluster_19_name"]}`,
          show: true,
        };
      })
      .on("mouseout", function (e, d) {
        resetNodeStyle(this, d);

        // Clear the tracker if we are leaving the node
        if (currentlyHoveredNode === this) {
          currentlyHoveredNode = null;
        }
      });
  }
</script>

<svelte:window
  on:resize={() => {
    if (ready) render();
  }}
/>

<div class="network-container">
  <div class="viz-container">
    <svg bind:this={svgElement} width="100%" height="600"></svg>
  </div>

  <div class="sidebar-container">
    <div class="controls-container">
      <label for="cluster-select" class="dropdown-label"
        >Resolution Level:</label
      >

      <select bind:value={clusterColumn} id="cluster-select">
        {#each clusterColumnOptions as cluster}
          <option value={cluster.column}>{cluster.name}</option>
        {/each}
      </select>
    </div>

    <div class="cluster-names-container">
      <p class="section-title">Map Legend</p>
      <div class="legend-scroll">
        {#each clusterNames as cluster (cluster.number)}
          <div
            class="legend-row"
            on:mouseenter={() => (activeLegendCluster = cluster.number)}
            on:mouseleave={() => (activeLegendCluster = null)}
          >
            <span
              style={`background: ${z(cluster.number)};`}
              class="legend-color"
            ></span>
            <span class="legend-text">{cluster.name}</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="information-container">
      <p class="section-title">Document Inspector</p>
      {#if articleInformation.show}
        <div class="info-card">
          <div class="info-title">{articleInformation["Title"]}</div>
          <div class="info-label">Active Cluster:</div>
          <div class="info-value">{articleInformation["Cluster"]}</div>
          <div class="info-label">Taxonomic Hierarchy:</div>
          <div class="info-hierarchy">{articleInformation["Hierarchy"]}</div>
        </div>
      {:else}
        <p class="placeholder-text">
          Hover over a dot on the map to inspect the document.
        </p>
      {/if}
    </div>
  </div>
</div>

<style>
  .network-container {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: 1fr 320px;
    margin-bottom: 2rem;
  }

  .viz-container {
    border: 1px solid #e0e0e0;
    background-color: #ffffff;
    border-radius: 4px;
    overflow: hidden;
  }

  .sidebar-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .controls-container,
  .cluster-names-container,
  .information-container {
    background: #f4f4f4;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
  }

  .dropdown-label {
    display: block;
    font-size: 0.875rem;
    color: #525252;
    margin-bottom: 0.5rem;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #cccccc;
    border-radius: 2px;
    font-family: inherit;
    font-size: 0.95rem;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #161616;
    margin: 0 0 0.75rem 0;
    letter-spacing: 0.5px;
  }

  .legend-scroll {
    max-height: 220px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .legend-row {
    display: grid;
    grid-template-columns: 16px 1fr;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    cursor: pointer;
    padding: 2px 0;
    transition: opacity 0.2s;
  }

  .legend-row:hover {
    opacity: 0.7;
  }

  .legend-color {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .legend-text {
    font-size: 0.85rem;
    line-height: 1.2;
    color: #393939;
  }

  .info-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: #161616;
    line-height: 1.3;
    margin-bottom: 0.5rem;
  }

  .info-label {
    font-size: 0.75rem;
    color: #525252;
    text-transform: uppercase;
  }

  .info-value {
    font-size: 0.9rem;
    color: #161616;
  }

  .info-hierarchy {
    font-size: 0.85rem;
    color: #393939;
    white-space: pre-wrap;
    font-family: monospace;
    background: #e8e8e8;
    padding: 0.5rem;
    border-radius: 2px;
  }

  .placeholder-text {
    font-size: 0.9rem;
    color: #8d8d8d;
    font-style: italic;
    margin: 0;
  }
</style>
