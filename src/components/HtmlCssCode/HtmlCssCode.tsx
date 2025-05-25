import React, { useState, useEffect } from "react";
import styles from "./HtmlCssCode.module.css";
import DOMPurify from "dompurify";
import Editor from "@monaco-editor/react";
import { useAppDispatch } from "../../redux/store";

type HtmlCssCodeProps = {
  onSave: (html: string, css: string) => void;
  onCancel: () => void;
};

const defultHtml = `
  <div class="example"></div>
`.trim();

const defultCss = `
    
.example {
  width: 50px;
  height: 50px;
  background: green;
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

  const dispatch = useAppDispatch();

  const purifyConfig = {
    ALLOWED_ATTR: ["class", "style"],
    ADD_TAGS: ["style"],
    ADD_ATTR: ["class"],
    FORBID_TAGS: ["script", "iframe", "object", "embed"],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onfocus",
      "oninput",
      "onchange",
    ],
  };

  useEffect(() => {
    // Existing sanitizing, preview setup...

    const { width, height } = getWidthHeightFromCss(css);
    console.log("Extracted width:", width);
    console.log("Extracted height:", height);
  }, [html, css]);

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
    // Wrap the content in a container with a specific class
    const combinedStyles = `<style>${css}</style><div class="html-css-content">${sanitizedHtml}</div>`;
    setPreview(combinedStyles);

    const styleTag = document.createElement("style");
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    requestAnimationFrame(() => {
      const elements = document.querySelectorAll(".html-css-content *");
      elements.forEach((el) => {
        el.getBoundingClientRect();
      });
    });

    return () => styleTag.remove();
  }, [html, css]);

  const handleSave = () => {
    const sanitizedHtml = DOMPurify.sanitize(html, purifyConfig);
    onSave(sanitizedHtml, css);
    console.log("Sanitized HTML:", sanitizedHtml);
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
