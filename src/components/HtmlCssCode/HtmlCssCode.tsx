import React, { useState, useEffect, useRef } from "react";
import styles from "./HtmlCssCode.module.css";
import DOMPurify from "dompurify";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import * as cssParser from "css";

type HtmlCssCodeProps = {
  onSave: (html: string, css: string) => void;
  onCancel: () => void;
};

const defaultHtml = `<div id="egg"></div>`;
const defaultCss = `#egg {\n       display: block;
      width: 126px;
      height: 180px;
      background-color: rgb(182, 88, 172);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;\n}`;

const HtmlCssCode: React.FC<HtmlCssCodeProps> = ({ onSave, onCancel }) => {
  const [html, setHtml] = useState(defaultHtml);
  const [css, setCss] = useState(defaultCss);
  const [preview, setPreview] = useState("");
  const [hasErrors, setHasErrors] = useState(false);

  const cssEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const purifyConfig = {
    ALLOWED_ATTR: ["id", "class"],
    FORBID_TAGS: ["script", "iframe", "object", "embed"],
    FORBID_ATTR: ["style", "onerror", "onclick"],
  };

  const handleHtmlChange = (value: string | undefined) => {
    if (value) setHtml(value);
  };

  const handleCssChange = (value: string | undefined) => {
    if (value) setCss(value);
  };
  const isValidCssSyntax = (css: string): boolean => {
    try {
      cssParser.parse(css);
      return false;
    } catch (e) {
      return true;
    }
  };
  const sanitizeCss = (cssText: string): string => {
    try {
      const ast = cssParser.parse(cssText);
      if (!ast.stylesheet) return "";

      // Keep only valid rules
      ast.stylesheet.rules = ast.stylesheet.rules.filter((rule) => {
        if (rule.type !== "rule") return false;

        // Only allow ID selectors (like #egg)
        const ruleSelectors = (rule as cssParser.Rule).selectors || [];
        return ruleSelectors.every((selector) =>
          /^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(selector)
        );
      });

      return cssParser.stringify(ast);
    } catch (e) {
      return "";
    }
  };
  const validateCss = (
    cssText: string
  ): monaco.editor.IModelDeltaDecoration[] => {
    const decorations: monaco.editor.IModelDeltaDecoration[] = [];
    const lines = cssText.split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;

      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith("/*")) continue;

      // Look for CSS selectors (anything before opening brace)
      const selectorMatch = line.match(/^([^{]*?)\s*\{/);
      if (selectorMatch) {
        const selectorsPart = selectorMatch[1].trim();

        // Split multiple selectors by comma
        const selectors = selectorsPart.split(",").map((s) => s.trim());

        for (const selector of selectors) {
          if (!selector) continue;

          // Check if selector is a valid ID selector
          const isValidIdSelector = /^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(selector);

          if (!isValidIdSelector) {
            // Find the position of this selector in the line
            const selectorStart = line.indexOf(selector);
            if (selectorStart !== -1) {
              decorations.push({
                range: new monaco.Range(
                  lineNumber,
                  selectorStart + 1,
                  lineNumber,
                  selectorStart + selector.length + 1
                ),
                options: {
                  inlineClassName: "css-error-decoration",
                  hoverMessage: {
                    value: `❌ Invalid selector: "${selector}"\n\nOnly ID selectors are allowed (e.g., #myId, #container, #header)`,
                  },
                },
              });
            }
          }
        }
      }
    }

    return decorations;
  };
  const updateCssDecorations = (css: string) => {
    if (!cssEditorRef.current) return;

    const decorations = validateCss(css);
    decorationsRef.current = cssEditorRef.current.deltaDecorations(
      decorationsRef.current,
      decorations
    );

    setHasErrors(decorations.length > 0 || isValidCssSyntax(css));
  };

  const handleCssMount: OnMount = (editor, _) => {
    cssEditorRef.current = editor;
    updateCssDecorations(editor.getValue());
    editor.onDidChangeModelContent(() => {
      const currentValue = editor.getValue();
      updateCssDecorations(currentValue);
    });
  };

  useEffect(() => {
    const cleanHtml = DOMPurify.sanitize(html, purifyConfig);
    const safeCss = sanitizeCss(css);
    setPreview(`<style>${safeCss}</style>${cleanHtml}`);
  }, [html, css]);

  const handleSave = () => {
    if (hasErrors) return;
    onSave(DOMPurify.sanitize(html, purifyConfig), css);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.codeContainer}>
        <div className={styles.codeSection}>
          <h3>HTML</h3>
          <Editor
            defaultLanguage="html"
            theme="vs-dark"
            defaultValue={html}
            onChange={handleHtmlChange}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>
        <div className={styles.codeSection}>
          <h3>CSS</h3>
          <Editor
            defaultLanguage="css"
            theme="vs-dark"
            defaultValue={css}
            onMount={handleCssMount}
            onChange={handleCssChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
            }}
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
        <button
          onClick={handleSave}
          className={`${styles.button} ${hasErrors && styles.btnError}`}
        >
          {hasErrors ? "Fix Errors First" : "Save"}
        </button>
        <button onClick={onCancel} className={styles.button}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default HtmlCssCode;
