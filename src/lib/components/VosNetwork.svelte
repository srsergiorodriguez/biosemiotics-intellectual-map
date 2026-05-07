<script>
  import { onMount } from 'svelte';
  import * as d3 from "d3";
  import { defaultFontFamily, getTextLines, categoricalPalette } from '$lib/stores/helpers';

  let canvasElement;
  export let nodes;
  export let links;
  export let nameThresh = 4;
  export let dense = false; 

  let ready = false;
  let hoveredNode = null;
  let hoveredCluster = null;
  
  // State to hold our legend data
  let clusters = [];

  // Global redraw trigger and handlers so the HTML can access them
  let triggerRedraw = () => {};

  function handleLegendEnter(clusterId) {
    hoveredCluster = clusterId;
    triggerRedraw();
  }

  function handleLegendLeave() {
    // Only reset if we aren't currently hovering a node directly on the canvas
    if (!hoveredNode) {
      hoveredCluster = null;
    } else {
      hoveredCluster = hoveredNode.cluster;
    }
    triggerRedraw();
  }

  onMount(async () => {
    if (!canvasElement) return;
    ready = true;
    render();
  });

  function render() {
    const { width, height } = canvasElement.getBoundingClientRect();
    const xScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.x)).range([0, width]).nice();
    const yScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.y)).range([0, height]).nice();
    const colorScale = d3.scaleOrdinal().domain(d3.range(d3.extent(nodes, d => d.cluster))).range($categoricalPalette);

    // Extract unique clusters and their colors for the legend
    clusters = [...new Set(nodes.map(d => d.cluster))]
      .sort((a, b) => a - b) // Ensure they are in numerical order
      .map(c => ({ id: c, color: colorScale(c) }));

    const formattedNodes = nodes.map(d => {
      return { ...d, X: xScale(d.x), Y: yScale(d.y) }
    });
    
    const rscale = d3.scaleLinear().domain(d3.extent(formattedNodes, d => d["weight<Links>"])).range([3, 12]);
    const nodeMap = new Map(formattedNodes.map(n => [n.id, n]));
    
    const formattedLinks = [];
    for (let d of links) {
      const Source = nodeMap.get(d.Source);
      const Target = nodeMap.get(d.Target);
      if (Source === undefined || Target === undefined) continue;
      formattedLinks.push({ Source, Target, data: d });
    }

    const linksByCluster = d3.group(formattedLinks, d => d.Source.cluster);

    const canvas = d3.select(canvasElement)
      .attr("width", width)
      .attr("height", height)
      .style("width", `${width}px`)
      .style("height", `${height}px`)
      .style("display", "block")
      .node();

    const ctx = canvas.getContext("2d");
    const host = d3.select(canvas);
    let transform = d3.zoomIdentity;

    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        transform = event.transform;
        scheduleDraw();
      });
      
    host.call(zoom);

    // Mouse tracking for canvas hover effects
    host.on("mousemove", (event) => {
      if (!dense) return; // Only run hover logic in dense mode
      
      const [mouseX, mouseY] = d3.pointer(event);
      // Translate screen coordinates to world coordinates accounting for zoom/pan
      const x = (mouseX - transform.x) / transform.k;
      const y = (mouseY - transform.y) / transform.k;

      let minDist = Infinity;
      let closest = null;

      // Find the closest node to the mouse cursor
      for (const n of formattedNodes) {
        const dx = n.X - x;
        const dy = n.Y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = rscale(n["weight<Links>"]);
        
        // Check if mouse is within the node's radius (with a small buffer for easy hovering)
        if (dist < minDist && dist < radius + (5 / transform.k)) {
          minDist = dist;
          closest = n;
        }
      }

      // If the hovered node changes, update state and trigger a redraw
      if (closest !== hoveredNode) {
        hoveredNode = closest;
        hoveredCluster = closest ? closest.cluster : null;
        
        // Change cursor to pointer if hovering over a node
        canvas.style.cursor = closest ? "pointer" : "grab";
        scheduleDraw();
      }
    });

    // Reset hover state if mouse leaves canvas
    host.on("mouseleave", () => {
      if (!dense) return;
      hoveredNode = null;
      hoveredCluster = null;
      canvas.style.cursor = "grab";
      scheduleDraw();
    });

    function draw() {
      const DPR = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, width * DPR, height * DPR);
      
      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // DRAW EDGES
      ctx.lineWidth = Math.max(0.1, 0.6 / transform.k);
      for (const [cluster, clusterLinks] of linksByCluster) {
        // Fade out edges not belonging to the hovered cluster
        if (hoveredCluster !== null && cluster !== hoveredCluster) {
          ctx.globalAlpha = 0.02; // Very faint
        } else {
          ctx.globalAlpha = 0.15; // Normal
        }

        ctx.beginPath();
        ctx.strokeStyle = colorScale(cluster);
        for (const e of clusterLinks) {
          ctx.moveTo(e.Source.X, e.Source.Y);
          ctx.lineTo(e.Target.X, e.Target.Y);
        }
        ctx.stroke();
      }
      
      // DRAW NODES
      for (const n of formattedNodes) {
        // Fade out non-hovered clusters
        if (hoveredCluster !== null && n.cluster !== hoveredCluster) {
          ctx.globalAlpha = 0.15;
        } else {
          ctx.globalAlpha = 1.0;
        }

        ctx.beginPath();
        const r = rscale(n["weight<Links>"]);
        ctx.arc(n.X, n.Y, r, 0, Math.PI * 2);
        ctx.fillStyle = colorScale(n.cluster);
        ctx.fill();
        
        ctx.lineWidth = 1 / transform.k;
        ctx.strokeStyle = "white";
        ctx.stroke();
      }

      // DRAW LABELS
      ctx.globalAlpha = 1.0; // Ensure text is always opaque
      let fontSize = Math.max(8, 12 / transform.k);
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      
      for (const n of formattedNodes) {
        let showLabel = false;
        
        if (dense) {
          if (hoveredCluster !== null) {
            // If hovering, show labels for the active cluster (filtering by threshold to avoid total overlap)
            showLabel = (n.cluster === hoveredCluster && (n["score<Norm. citations>"] > nameThresh || n === hoveredNode));
          } else {
            // If not hovering anything, only show the absolute most important hubs
            showLabel = (n["score<Norm. citations>"] > nameThresh);
          }
        } else {
          // Standard behavior for sparse networks
          showLabel = (n["score<Norm. citations>"] > nameThresh || n["score<Norm. citations>"] === undefined || transform.k > 2.5);
        }

        if (showLabel) {
          const r = rscale(n["weight<Links>"]);
          const textY = n.Y + r + (4 / transform.k);
          
          // Always draw the exact hovered node label slightly larger/bold
          if (n === hoveredNode) {
             ctx.font = `bold ${fontSize * 1.2}px Arial, sans-serif`;
          } else {
             ctx.font = `${fontSize}px Arial, sans-serif`;
          }

          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 3 / transform.k;
          ctx.lineJoin = "round";
          ctx.strokeText(n.label, n.X, textY);
          
          ctx.fillStyle = "#222222";
          ctx.fillText(n.label, n.X, textY);
        }
      }

      ctx.restore();
    }

    let raf = null;
    function scheduleDraw() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { draw(); raf = null; });
    }

    // Link the global trigger to this local drawing function
    triggerRedraw = scheduleDraw;

    scheduleDraw();
  }
</script>

<svelte:window on:resize={() => {if(ready) render()}} />

<div class="canvas-wrapper">
  <canvas bind:this={canvasElement}></canvas>
  
  {#if clusters.length > 0}
    <div class="legend">
      <div class="legend-title">Epistemic Clusters</div>
      <div class="legend-grid">
        {#each clusters as cluster}
          <div class="legend-item" 
               on:mouseenter={() => handleLegendEnter(cluster.id)}
               on:mouseleave={handleLegendLeave}>
            <span class="color-dot" style="background-color: {cluster.color}"></span>
            <span class="cluster-label">Cluster {cluster.id}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .canvas-wrapper {
    position: relative; /* Required for absolute positioning of the legend */
    width: 100%;
    height: 600px;
    border: 1px solid #eaeaea;
    border-radius: 4px;
    background-color: #ffffff;
    overflow: hidden;
  }
  
  canvas {
    width: 100%;
    height: 100%;
    cursor: grab;
  }
  
  canvas:active {
    cursor: grabbing;
  }

  /* Legend styles */
  .legend {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    pointer-events: none; /* Let clicks pass through the empty space */
    max-height: 90%;
    overflow-y: auto;
  }

  .legend-title {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.75rem;
  }

  .legend-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #555;
    pointer-events: auto; /* Catch the hover on the specific row */
    cursor: pointer;      /* Show the hand icon on hover */
    transition: opacity 0.2s;
  }

  .legend-item:hover {
    opacity: 0.7;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
</style>