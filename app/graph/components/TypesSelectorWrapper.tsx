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
      {selectedAction === "connect_2_points" && <>
        <TypesSelector type="connection_type" />
        <TypesSelector type="two_function_style" />
        <TypesSelector type='line_style'/>
        
      </>}
      {selectedAction === "connect_3_points" && <>
      <TypesSelector type="three_function_style" />
      <TypesSelector type="connection_type" />
      <TypesSelector type="line_style" />
      </>
      }
      {selectedAction === "connect_4_points" && 
      <>
        <TypesSelector type="four_function_style" />
        <TypesSelector type="line_style" />
      </>

      }
      {selectedAction === "shade_region" && <TypesSelector type="shade_style" />}
    </div>
  );
};

export default TypesSelectorWrapper;