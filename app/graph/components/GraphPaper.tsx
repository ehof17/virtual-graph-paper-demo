'use client';
import React, { useState, useRef } from 'react';
import { GraphPaperAction, ActionType } from '../../../lib/types/graphPaper';
import styles from '../../styles/GraphPaper.module.css';
import { useGraphPaper } from '../../../contexts/GraphPaperContext';
import ActionToolbar from './ActionToolbar';
import { createPointID } from '@/lib/utils';

const GraphPaper: React.FC = () => {
  const { actions, addAction, points, addPoint } = useGraphPaper();
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSelectAction = (action: ActionType) => {
    setSelectedAction(action);
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (!selectedAction) return;
    
    let newAction: GraphPaperAction | null = null;
    switch (selectedAction) {

      case "plot_point":
        newAction = {
          actionType: "plot_point",
          coordinates: [{ x, y }],
          style: { pointStyle: "filled", color: "#FF0000" },
          timestamp: new Date().toISOString(),
        };
        // add the point and id to a list of points
        const newPoint = { x, y, id: createPointID() };
        // add the point to the context (backend)
        addPoint(newPoint);
        // add the point to the canvas (frontend)
        drawPoint(x, y);
        break;


      // Todo: implement the rest of the actions
      default:
        // If a rule is broken
        newAction = null;
        break;
    }
    if (newAction) {
      addAction(newAction);
      
    }
  };

  // Draw a point on the canvas at (x, y)
  const drawPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  return (
    <div className={styles.graphPaperContainer}>
      <h1>Virtual Graph Paper</h1>
      <ActionToolbar selectedAction={selectedAction} onSelect={handleSelectAction} />
  

      {/* todo: make the actual graph paper component */}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={800}
        height={400}
        onClick={(e) => {
          const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          handleCanvasClick(x, y);
        }}
      ></canvas>


      {/* display all actions to show off grammar */ }
      <pre>{JSON.stringify(actions, null, 2)}</pre>
    </div>
  );
};

export default GraphPaper;