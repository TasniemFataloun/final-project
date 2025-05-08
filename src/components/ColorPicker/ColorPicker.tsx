import React, { useState } from "react";
import { SketchPicker } from "react-color";

type ColorPickerProps = {
  color: string;
  onChange: (newColor: string) => void;
};

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (colorResult: { hex: string }) => {
    onChange(colorResult.hex);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowPicker((prev) => !prev)}
        style={{
          backgroundColor: color,
          color: "#fff",
          padding: "5px 10px",
          border: "none",
          cursor: "pointer",
        }}
      >
        {" "}
      </button>

      {showPicker && (
        <div>
          <SketchPicker color={color} onChangeComplete={handleColorChange} />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
