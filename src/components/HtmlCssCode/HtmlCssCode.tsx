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
      <div id="card">
    <h1 id="profile-image">Logo</h1>
    <h2 id="profile-name">Tasniem</h2>
    <p id="description">Web Developer & Designer</p>
    <a id="contact-button" href="https://github.com/TasniemFataloun">Contact Me</a>
  </div>
`.trim();

const defultCss = `
#card {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
      background: gray;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 300px;
    }

    #profile-image {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #357ab8;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 1rem;
    }

    #profile-name {
      margin: 0.5rem 0;
    }

    #description {
      color: black;
    }

    #contact-button {
      display: inline-block;
      margin-top: 1rem;
      text-decoration: none;
      background: #4a90e2;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: background 0.3s ease;
      cursor: pointer;
    }

    #contact-button:hover {
      background: #357ab8;
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
    ALLOWED_ATTR: ["id"],
    ADD_TAGS: [],
    ADD_ATTR: [],
    FORBID_TAGS: ["script", "iframe", "object", "embed"],
    FORBID_ATTR: [
      "class",
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
