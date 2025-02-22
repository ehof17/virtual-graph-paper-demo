import React from "react";

interface PlotPointInputProps {
  xValue: string;
  yValue: string;
  onXChange: (value: string) => void;
  onYChange: (value: string) => void;
  onPlotPointClick: () => void;
}

const PlotPointInput: React.FC<PlotPointInputProps> = ({
  xValue,
  yValue,
  onXChange,
  onYChange,
  onPlotPointClick,
}) => {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label>
        X:{" "}
        <input
          type="number"
          value={xValue}
          onChange={(e) => onXChange(e.target.value)}
        />
      </label>
      <label style={{ marginLeft: "1rem" }}>
        Y:{" "}
        <input
          type="number"
          value={yValue}
          onChange={(e) => onYChange(e.target.value)}
        />
      </label>
      <button onClick={onPlotPointClick} style={{ marginLeft: "1rem" }}>
        Plot Point
      </button>
    </div>
  );
};

export default PlotPointInput;