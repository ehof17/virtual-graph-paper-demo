"use client";

import React from "react";
import styles from "../../styles/PointActions.module.css"; // New CSS file
import { useGraphPaper } from "../../../contexts/GraphPaperContext";

const PointActions: React.FC = () => {
  const { selectedPoints, deleteSelectedPoints } = useGraphPaper();

  return (
    <div className={styles.pointActionsContainer}>
      {selectedPoints.length > 0 && (
        <button className={styles.deleteButton} onClick={deleteSelectedPoints}>
          Delete 
        </button> //delete button appears when point is selected
      )}

      {/* add undo and redo here */}
      
    </div>
  );
};

export default PointActions;
