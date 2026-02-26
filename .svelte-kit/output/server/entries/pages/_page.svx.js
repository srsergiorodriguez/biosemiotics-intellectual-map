import "clsx";
import { v as pop, t as push } from "../../chunks/index2.js";
import * as d3 from "d3";
import { r as readable } from "../../chunks/index.js";
readable("14px Arial");
readable(["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0", "#97421dff"]);
function getTextLines_(maxWidth, text, template = (cont) => cont.append("text")) {
  if (text === void 0 || text === null) return;
  const paragraphs = String(text).split(/\r\n|\n/);
  const lines = [];
  const measCont = d3.select(document.body).append("svg");
  const meas = template(measCont);
  paragraphs.forEach((para) => {
    if (para === "") {
      lines.push("");
      return;
    }
    const words = para.trim().split(/\s+/);
    let currentLine = "";
    words.forEach((word) => {
      const testLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;
      meas.text(testLine);
      const testLineWidth = meas.node().getComputedTextLength();
      if (testLineWidth < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
  });
  meas.text(lines[0] || "M");
  const bbox = meas.node().getBBox();
  measCont.remove();
  const leading = 1;
  const lineHeight = bbox.height * leading;
  const linesData = [];
  for (let i = 0; i < lines.length; i++) {
    linesData.push({ text: lines[i], y: i * lineHeight });
  }
  return linesData;
}
readable(getTextLines_);
function _page_svx($$payload, $$props) {
  push();
  $$payload.out.push(`<div class="general svelte-1tyyng2"><div class="main-title svelte-1tyyng2"><h1>An intellectual map of the Biosemiotics Journal</h1> <h4>Interactive dashboard</h4></div> <h2>How to use this dashboard</h2> <p>This interactive dashboard serves as a companion to the paper <em>An intellectual map of the Biosemiotics Journal: authors, topics and concepts</em> (INSERT URL WHEN PUBLISHED). While the manuscript details the theoretical and methodological frameworks used to map the <em>Biosemiotics</em> journal, this space allows you to directly explore the underlying data.</p> <p>The dashboard is divided into three sections: macroscopic summary insights (aggregate metrics), granular relationships (topological networks) and network dynamics.</p> <hr/> <h2>Macroscopic summary insights</h2> <p>These metrics establish a baseline overview of the journal’s dynamics, highlighting the most prolific researchers, the foundational vocabulary, and the distribution of article types. They represent the stabilized, aggregate output of the discipline over its seventeen-year history.</p> <h4>Article Types</h4> <p>This chart visualizes the distribution of article types within the journal. The high prevalence of original research articles demonstrates the field’s continuous empirical output, while the significant presence of target articles and peer commentaries reflects the community’s structural commitment to theoretical debate pointing out to the boundaries of the field.</p> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <h4>Authors by Publication Volume</h4> <p>This table identifies the researchers who have published most frequently within the journal. These authors often function as the structural pillars of the field, maintaining its internal cohesion.</p> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <h4>Most Cited Articles within Biosemiotics</h4> <p>This table highlights the papers published <em>by</em> the journal that have accumulated the most internal citations. We could interpret these texts as points of passage for the community, establishing a shared canon and signaling which theoretical interventions have successfully stabilized into accepted biosemiotic frameworks.</p> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <h4>Keyword Frequencies</h4> <p>By aggregating the most frequently used keywords, this table provides a preliminary index of the discipline’s core vocabulary. The salience of terms like <em>Umwelt</em>, <em>semiosis</em>, and <em>emergence</em> underscores the shared interpretive frameworks that unite the journal’s diverse empirical studies.</p> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <h4>Most Cited Bibliography</h4> <p>This table lists the references most frequently cited across all <em>Biosemiotics</em> articles. It reveals the historical depth of the field, showcasing the foundational texts (e.g., Uexküll, Peirce, Hoffmeyer), scaffolding contemporary texts, and external scientific paradigms that provide the conceptual basis for modern biosemiotic research.</p> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <hr/> <h2>Granular relationships insights</h2> <p>Moving beyond aggregate statistics, these visualizations map the structural topography of the journal. Using document embeddings and citation network analysis, they reveal how topics and authors group together to form the metatheoretical core, dense research mountains, and boundary-spanning frontiers of the discipline.</p> <h4>A Taxonomy of Biosemiotics Articles</h4> <p>This dendrogram represents the hierarchical taxonomy derived from the Doc2Vec semantic clustering. It illustrates how 19 highly specific sub-fields (such as bioacoustics or plant semiotics) aggregate into 10 broader domains, which finally resolve into the 5 foundational macro-categories of biosemiotics. Numbers in parentheses represent the quantity of papers that belong to each category in the dataset.</p> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <h4>Semantic Topography (Doc2Vec Clusters)</h4> <p>This dispersion plot maps the semantic similarities between articles based on their shared vocabulary.</p> <p><strong>Usage:</strong> Select a cluster resolution level (19, 10, or 5 categories). Use the legend to locate specific thematic clusters within the plot. Hover over individual data points to reveal the article’s title and its hierarchical categorization.</p> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <h4>Bibliographic Coupling Network</h4> <p>Bibliographic coupling links articles based on shared reference lists, visualizing the epistemic communities of the journal. Exploring this network allows you to identify deep, internally coherent research niches (<em>mountains</em>) alongside outward-facing discussions that engage with external scientific debates (<em>frontiers</em>).</p> <p><strong>Usage:</strong> Scroll or pinch to zoom, and click and drag to pan across the topography. Due to the high density of this graph, hover your cursor over any node to interactively isolate its cluster. This will fade the surrounding network into the background and reveal the specific article labels within that epistemic community.</p> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <h4>Co-citation Network</h4> <p>While bibliographic coupling maps concepts, co-citation maps the social infrastructure of the researchers themselves by linking authors who are frequently cited together. Within this network, look for <em>hubs</em>, authors who command concentrated attention within specific niches, and <em>bridges</em>, scholars who connect disparate domains to maintain the discipline’s cohesion.</p> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <hr/> <h2>Network Dynamics</h2> <h4>Citation Distribution</h4> <p>This histogram visualizes the distribution of citation frequencies across the journal’s corpus. It prominently displays a, so-called, long-tail distribution characteristic of scale-free networks. In such networks, a small number of foundational papers act as highly connected hubs, accumulate the vast majority of citations due to preferential attachment, while the majority of articles are cited only a few times. This underlying mathematical asymmetry is precisely what generates the dense topographical mountains and the stabilized metatheoretical core visualized in the networks above.</p> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <p>Last update 24/02/26</p></div>`);
  pop();
}
export {
  _page_svx as default
};
