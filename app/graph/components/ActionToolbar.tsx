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
  "connect_points",
  "draw_line",
  "draw_parabola",
  "shade_region",
];

const ActionToolbar: React.FC<ActionToolbarProps> = ({ selectedAction, onSelect }) => {
  const { selectedPoints  } = useGraphPaper();
 
  const pointCount = selectedPoints.length;

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


        if (action == "connect_points" && pointCount != 2) {
          disabled = true;
        }
      
        if (action == "draw_line"){
          disabled = true;
        }

        if (action == "draw_parabola"){
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