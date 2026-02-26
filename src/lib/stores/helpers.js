import { readable } from "svelte/store";
import * as d3 from 'd3';

export const defaultFontFamily = readable("14px Arial");
export const categoricalPalette = readable(["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0", "#97421dff"]);

function getTextLines_(maxWidth, text, template = cont => cont.append("text")) {
    if (text === undefined || text === null) return

    const paragraphs = String(text).split(/\r\n|\n/);
    const lines = [];
    let currentLine = '';
    let currentLineWidth = 0;

    const measCont =  d3.select(document.body).append("svg");
    const meas = template(measCont);

  // For each paragraph, run your existing greedy wrap
    paragraphs.forEach(para => {
      // empty paragraph -> force an empty line
      if (para === "") {
        lines.push("");
        return;
      }

      const words = para.trim().split(/\s+/);
      let currentLine = '';

      words.forEach(word => {
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
      linesData.push({text: lines[i], y: i * lineHeight});
    }
    
    return linesData
  }

  export const getTextLines = readable(getTextLines_);