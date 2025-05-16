import React, { useState, useEffect } from "react";
import styles from "./HtmlCssCode.module.css";
import DOMPurify from "dompurify";
import Editor from "@monaco-editor/react";
import { useAppDispatch } from "../../redux/store";
import { addElement } from "../../redux/slices/elementsSlice";

type HtmlCssCodeProps = {
  onSave: (html: string, css: string) => void;
  onCancel: () => void;
};

const defultHtml = `
<div class="custom-shape">
  <div class="circle"></div>
</div>
`.trim();

const defultCss = `
.custom-shape {
  position: relative;
  width: 100px;
  height: 100px;
}
    
.circle {
  position: absolute;
  width: 50px;
  height: 50px;
  background: green;
  border-radius: 50%;
  left: 0;
  top: 0;
  animation: moveCircle 2s infinite;

}
`.trim();

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

    dispatch(
      addElement({
        id: crypto.randomUUID(),
        type: "custom",
        html: sanitizedHtml,
        css, 
      })
    );

    onSave(sanitizedHtml, css);
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
