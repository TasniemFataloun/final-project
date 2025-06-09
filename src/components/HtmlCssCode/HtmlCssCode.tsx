import React, { useState, useEffect } from "react";
import styles from "./HtmlCssCode.module.css";
import DOMPurify from "dompurify";
import Editor from "@monaco-editor/react";

type HtmlCssCodeProps = {
  onSave: (html: string, css: string) => void;
  onCancel: () => void;
};

const defultHtml = `
<div id="egg"></div>
`.trim();

const defultCss = `
#egg {
  display: block;
  width: 126px;
  height: 180px;
  background-color: red;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

`.trim();

export const getWidthHeightFromCss = (css: string) => {
  const widthMatch = css.match(/width\s*:\s*([^;]+);/);
  const heightMatch = css.match(/height\s*:\s*([^;]+);/);

  return {
    width: widthMatch ? widthMatch[1].trim() : null,
    height: heightMatch ? heightMatch[1].trim() : null,
  };
};

const HtmlCssCode: React.FC<HtmlCssCodeProps> = ({ onSave, onCancel }) => {
  const [html, setHtml] = useState(defultHtml);
  const [css, setCss] = useState(defultCss);
  const [preview, setPreview] = useState("");

  const purifyConfig = {
    ALLOWED_ATTR: ["id", "class"],
    ADD_TAGS: [],
    ADD_ATTR: [],
    FORBID_TAGS: ["script", "iframe", "object", "embed"],
    FORBID_ATTR: [
      "style",
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onfocus",
      "oninput",
      "onchange",
    ],
  };

  const handleHtmlChange = (value: string | undefined) => {
    if (value === undefined) return;
    setHtml(value);
  };
  const handleCssChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCss(value);
  };

  useEffect(() => {
    const sanitizedHtml = DOMPurify.sanitize(html, purifyConfig);
    const combinedStyles = `<style>${css}</style>${sanitizedHtml}`;
    setPreview(combinedStyles);

    // Dynamically add the CSS to the document head
    const styleTag = document.createElement("style");
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    // Cleanup style tag when component unmounts
    return () => {
      styleTag.remove();
    };
  }, [html, css]);

  const handleSave = () => {
    const sanitizedHtml = DOMPurify.sanitize(html, purifyConfig);

    // Create a temporary element to compute styles
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = sanitizedHtml;
    document.body.appendChild(tempDiv);

    document.body.removeChild(tempDiv);

    onSave(sanitizedHtml, css); // Add style to save parameters
  };

  return (
    <div className={styles.editor}>
      <div className={styles.codeContainer}>
        <div className={styles.codeSection}>
          <h3>HTML</h3>
          <Editor
            defaultLanguage="html"
            theme="vs-dark"
            options={{
              fontFamily:
                "JetBrains Mono, Menlo, Monaco, Courier New, monospace",
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              autoClosingQuotes: "languageDefined",
              hover: { enabled: false },
              quickSuggestions: false,
            }}
            defaultValue={html}
            onChange={handleHtmlChange}
          />
        </div>
        <div className={styles.codeSection}>
          <h3>CSS</h3>
          <Editor
            defaultLanguage="css"
            theme="vs-dark"
            options={{
              fontFamily:
                "JetBrains Mono, Menlo, Monaco, Courier New, monospace",
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              autoClosingQuotes: "languageDefined",
              hover: { enabled: false },
            }}
            defaultValue={css}
            onChange={handleCssChange}
          />
        </div>
      </div>

      <div className={styles.previewContainer}>
        <h3>Preview</h3>
        <div
          className={styles.preview}
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </div>

      <div className={styles.toolbar}>
        <button onClick={handleSave} className={styles.button}>
          Save
        </button>
        <button onClick={onCancel} className={styles.button}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default HtmlCssCode;
