'use client';
import React from 'react';
import { ActionType } from '../../../lib/types/graphPaper';
import styles from '../../styles/ActionToolbar.module.css';
import { useGraphPaper } from '../../../contexts/GraphPaperContext';
import { formatAction } from '@/lib/utils';

interface ActionToolbarProps {
  selectedAction: ActionType | null;
  onSelect: (action: ActionType) => void;
}

const availableActions: ActionType[] = [
  "plot_point",
  "select_points",
  "connect_2_points",
  "connect_3_points",
  "connect_4_points",
  "shade_region",

];

const ActionToolbar: React.FC<ActionToolbarProps> = ({ selectedAction, onSelect }) => {
  const { selectedPoints, points  } = useGraphPaper();
 
  const plottedPointCount = selectedPoints.length;
  const pointCount = points.length;

  return (
    <div className={styles.toolbar}>
      {availableActions.map(action => {
        let disabled = false;
        
        // if (action === "plot_point" && plotPointCount >= 5) {
        //   disabled = true;
        // }

        // need 2 selected points to connect them
        // right now it just checks if there are 2 points globally
        // either have them select the points to connect before enabling the button
        // or after they hit 'Complete action' they can select the points


        if (action == "connect_2_points" && plottedPointCount != 2) {
          disabled = true;
        }
        if (action == "select_points" && pointCount == 0) {
          disabled = true;
        }
      
        if (action == "connect_3_points"){
          disabled = true;
        }

        if (action == "connect_4_points"){
          disabled = true;
        }
        
        if (action == "shade_region"){
          disabled = true;
        }
  
    

        return (
          <button 
            key={action}
            className={selectedAction === action ? styles.selected : styles.button}
            onClick={() => onSelect(action)}
            disabled={disabled}
          >
            {formatAction(action)}
          </button>
        );
      })}
    </div>
  );
};

export default ActionToolbar;