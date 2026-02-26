<script>
  import { onMount } from 'svelte';
  import * as d3 from "d3";
  import { defaultFontFamily, getTextLines } from '$lib/stores/helpers';

  let svgElement;
  export let data;

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

    const m = {l: width * 0.1, r: width * 0.35, t: height * 0.05, b: height * 0.05};
    const mWidth = width - m.l - m.r;
    const mHeight = height - m.t - m.b;

    // Prepare tree data structure
    const levels = ["cluster_5", "cluster_10", "cluster_19", "cluster_40"].slice(0, -1);
    const colorsNum = levels.length + 1;
    const colorScale = d3.scaleOrdinal().domain(d3.range(0, colorsNum)).range([...d3.schemeBlues[colorsNum + 2]].reverse());

    const rootObj = getRootObj(data, levels);

    // Convert to d3.hierarchy and set values
    const root = d3.hierarchy(rootObj)
                  .sum(d => d.count || 0) // ensures values are present on nodes
                  .sort((a, b) => (b.value || 0) - (a.value || 0));

    const tree = d3.tree().size([mHeight, mWidth]).separation((a,b) => a.parent == b.parent ? 1 : 0.9);
    tree(root);

    const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
    // g.append("rect").attr("width", mWidth).attr("height", mHeight).attr("stroke", "black").attr("fill", "none");

    /// Links
    const linkGen = d3.linkHorizontal().x(d => d.y).y(d => d.x);
    const linkG = g.append("g").append("g").attr("fill", "none").attr("stroke", "#bbb").attr("stroke-width", 3);
    
    linkG
      .selectAll("path")
      .data(root.links())
        .join("path")
        .attr("d", d => linkGen({source: d.source, target: d.target}));

    /// Nodes
    const nodesG = g.append("g");

    const nodeG = nodesG.selectAll("g")
      .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    nodeG.append("circle")
      .attr("r", width/180)
      .attr("fill", d => colorScale(d.depth))
      .attr("stroke", d => colorScale(d.depth));

    const textsG = g.append("g");

    const textG = textsG.selectAll("g")
      .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    textG.each(function(d, j) {
      d3.select(this).call(setText, d)
    })

    function setText(selection, d) {
      const text =  d.children ? `${d.data.name} \n (${d.data.count})` : `${d.data.name} (${d.data.count})`;
      const template = cont => cont.append("text").style("font", $defaultFontFamily);
      const textLines = $getTextLines(240, text, template);

      for (let line of textLines) {
        selection
          .append("text")
          .attr("dy", "0.31em")
          .attr("x", d => d.children ? -10 : 10)
          .attr("y", d => (d.children ? 15 : 0) + line.y)
          .attr("text-anchor", d => d.children ? "middle" : "start")
          .attr("stroke", "white")
          .attr("stroke-width", 4)
          .attr("stroke-linecap","round")
          .attr("stroke-linejoin","round")
          .attr("paint-order", "stroke")
          .text(d => line.text)
          .style("font", $defaultFontFamily);
      }
    }
  }

  function getRootObj(data, levels) {
    const rootObj = { name: "Biosemiotics", id: "root", children: [] };

    // helper to find or create child by composite id
    function findOrCreateChild(parent, levelName, idValue, label) {
      parent.children = parent.children || [];
      const compId = `${levelName}:${idValue}`;
      let child = parent.children.find(c => c.id === compId);
      if (!child) {
        child = { name: label, id: compId, level: levelName, children: [] };
        parent.children.push(child);
      }
      return child;
    }

    // For each article row, walk down the levels and increment `count` at the deepest level
    for (const d of data) {
      let node = rootObj;
      for (const level of levels) {
        // prefer a friendly name if available (e.g. cluster_19_name), else use the numeric id
        const idVal = (d[level] === undefined || d[level] === null) ? "unknown" : String(d[level]);
        const labelField = `${level}_name`;
        const label = (d[labelField] !== undefined && d[labelField] !== null && String(d[labelField]).trim() !== "")
                      ? String(d[labelField])
                      : idVal;
        node = findOrCreateChild(node, level, idVal, label);
      }
      // node is now the deepest cluster node (the selected-leaf). Count articles per leaf.
      node.count = (node.count || 0) + 1;
    }

    
    // Post-order sum of counts so every internal node gets the total articles below it
    function sumCounts(n) {
      if (!n.children || n.children.length === 0) {
        // leaf: keep its explicit count (may be zero if no direct article assigned)
        n.count = n.count || 0;
        return n.count;
      }
      n.count = n.children.reduce((s, c) => s + sumCounts(c), 0);
      return n.count;
    }
    sumCounts(rootObj);

    return rootObj
  }
</script>

<svelte:window on:resize={() => {render()}} />

<div class="hierarchy-container">
  <div class="viz-container">
    <svg bind:this={svgElement} width="100%" height="1200"></svg>
  </div>
</div>
