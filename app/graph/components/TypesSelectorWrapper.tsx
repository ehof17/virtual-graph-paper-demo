import React from "react";
import { ActionType } from "../../../lib/types/graphPaper";
import TypesSelector from "./TypesSelector";

interface TypesSelectorOuterProps {
  selectedAction: ActionType | null;
}

const TypesSelectorWrapper: React.FC<TypesSelectorOuterProps> = ({ selectedAction }) => {
  if (!selectedAction) return null; // If no action is selected, don't show anything

  return (
    <div>
      <h3>Customize Action</h3>

      {selectedAction === "plot_point" && <TypesSelector type="point_style" />}
      {selectedAction === "connect_points" && <>
        <TypesSelector type="connection_type" />
        <TypesSelector type='line_style'/>
      </>}
      {selectedAction === "draw_line" && <TypesSelector type="line_style" />}
      {selectedAction === "draw_parabola" && <TypesSelector type="line_style" />}
    </div>
  );
};

export default TypesSelectorWrapper;