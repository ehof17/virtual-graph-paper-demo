'use client';
import React, { useState, useRef} from 'react';
import { GraphPaperAction, ActionType, GraphPaperPoint,ConnectPointsType, LineStyle} from '../../../lib/types/graphPaper';
import styles from '../../styles/GraphPaper.module.css';
import { useGraphPaper } from '../../../contexts/GraphPaperContext';
import ActionToolbar from './ActionToolbar';
import { createPointID } from '@/lib/utils';
import TypesSelectorWrapper from './TypesSelectorWrapper';


const GraphPaper: React.FC = () => {
  const { actions, addAction, removeAction, addPoint, selectedPointStyle, points, addSelectedPoint, removeSelectedPoint, selectedPoints, selectedConnectPointsType, selectedLineStyle} = useGraphPaper();
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);

  // this will be replaced with the actual graph paper
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSelectAction = (action: ActionType) => {
    setSelectedAction(action);
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (!selectedAction) return;
    
    let newAction: GraphPaperAction | null = null;
    switch (selectedAction) {

      case "plot_point":

      // if the point already exists globally
        const existingPoint = points.find(
          (point) => Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5
        );
      

        if (existingPoint) {
          const pointAlreadySelected = selectedPoints.find(
            (point) => point.id === existingPoint.id
          );

          // todo: fix drawing different pointstyles on top of eachother
          // drawing unfilled point on top of filled point doesn't remove the point below

          if (pointAlreadySelected){
            removeSelectedPoint(existingPoint)
            // redraw with unselected color
            drawPoint(existingPoint, "red");
          }
          else{
            // add to selected list
            addSelectedPoint(existingPoint)
            // redraw with selected color
            drawPoint(existingPoint, "blue");

          }
          break;
        }


      
        // add the point and id to a list of points
        const newPoint = { x, y, id: createPointID(), pointStyle: selectedPointStyle };
        // add the point to the context (backend)
        addPoint(newPoint);
        // add the point to the canvas (frontend)
        drawPoint(newPoint, "red");



        // does this make sense
        // action type of plot point has a point and it is the point that was plotted
        newAction = {
          actionType: "plot_point",
          points: [newPoint],
          style: { pointStyle: selectedPointStyle, color: "#FF0000" },
          
          timestamp: new Date().toISOString(),
        };
        break;


     

      case "connect_points":
        const selectedPoint1 = selectedPoints[0]
        const selectedPoint2 = selectedPoints[1]
        // only draw the connection if it wasn't drawn before
        newAction = {
          actionType: "connect_points",
          points: [selectedPoint1, selectedPoint2 ],
          style: { lineStyle: selectedLineStyle },
          connectionType: selectedConnectPointsType,
          timestamp: new Date().toISOString(),
        };

        const existingConnectionIndex = actions.findIndex(action => 
          action.actionType === "connect_points" &&
          Array.isArray(action.points) &&
          action.points.length === 2 &&
          action.points.some(p => p.id === selectedPoint1.id) &&
          action.points.some(p => p.id === selectedPoint2.id)
        );
        
        if (existingConnectionIndex !== -1) {
          const existingConnection = actions[existingConnectionIndex];
        
          // If the styles are different we are going to need to update everything
          // Do we need the old action to send to inks?
          // right now it will remove the existing one
          // and the canvas is redrawn with every connection besides the one removed
          const stylesChanged = (
            existingConnection.style?.lineStyle !== selectedLineStyle || 
            existingConnection.connectionType !== selectedConnectPointsType
          );
        
          // if its the same line, same style don't add an action to the list
          if (!stylesChanged) {
            alert("This connection already exists with the same style!");
            return;
          }
          else{ 
            alert("The styles have changed");
            removeAction(existingConnection); 
            clearConnection(existingConnection)
          }
    
        }
        else{
          drawConnection(selectedPoint1, selectedPoint2, selectedConnectPointsType, selectedLineStyle)
        }
        break



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
  const drawPoint = (point: GraphPaperPoint, color:string) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);

        switch(point.pointStyle){
          case 'filled':
            ctx.fillStyle = color; 
            ctx.fill();
          break;

          case 'unfilled':
            ctx.strokeStyle = color; 
            ctx.lineWidth = 2;
            ctx.stroke();
          break;

          default:
          break;
        }
      
      }
    }
  };

  const drawConnection = (point1: GraphPaperPoint, point2: GraphPaperPoint, connectionType: ConnectPointsType, lineStyle: LineStyle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
  
    // Set line styles
    switch (lineStyle) {
      case "dashed":
        ctx.setLineDash([10, 5]); // Dash pattern
        break;
      case "dotted":
        ctx.setLineDash([2, 4]); // Dotted pattern
        break;
      default:
        ctx.setLineDash([]); 
        break;
    }
  
    // Handle connection type
    switch (connectionType) {
      case "line_segment":
        ctx.lineTo(point2.x, point2.y);
        break;
      case "ray":
        extendRay(ctx, point1, point2);
        break;
      case "line_from_points":
        extendLine(ctx, point1, point2);
        break;
      default:
        break;
    }
  
    // todo: fix this so only connections between the selected points are blue
    // when points become selected/deselected update the connection colors
    ctx.strokeStyle = "blue"; // Connection color since selected is blue

    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  
  


  // Todo... add arrowheads for lines and rays
  const extendRay = (ctx: CanvasRenderingContext2D, p1: GraphPaperPoint, p2: GraphPaperPoint) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const scale = 1000; 
    const endX = p2.x + dx * scale;
    const endY = p2.y + dy * scale;
  
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };
  
  // Extend a full line both directions and add arrows on both ends
  const extendLine = (ctx: CanvasRenderingContext2D, p1: GraphPaperPoint, p2: GraphPaperPoint) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const scale = 1000; 
  
    const startX = p1.x - dx * scale;
    const startY = p1.y - dy * scale;
    const endX = p2.x + dx * scale;
    const endY = p2.y + dy * scale;
  
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };

  const clearConnection = (connectionToUpdate: GraphPaperAction) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    redrawAllConnections(connectionToUpdate); 
  };


// redraws all points 
// and connections based on the list of actions
// the connectionToUpdate will be drawn using the selected styles
  const redrawAllConnections = (connectionToUpdate: GraphPaperAction) =>{



    points.forEach(point =>{
      drawPoint(point, 'red')
    })

    selectedPoints.forEach(point => {
      drawPoint(point, 'blue')
    })


    actions.forEach((action) => {
      // Draw the existing connections the same way that they were drawn originally
      let connectionType = action.connectionType;
      let lineStyle = action.style?.lineStyle;
      if (action.actionType === "connect_points") {
        if (action.points?.length === 2) {
          const actionPoint = action.points[0]
          const actionPoint2 = action.points[1]

          // If the action is a connect points action and it matches the points attached to the passed in 
          // action to update
          // Draw it with the new updated style, not the existing style
          if (
            Array.isArray(connectionToUpdate.points) &&
            connectionToUpdate.points.length === 2 &&
            connectionToUpdate.points.some(p => p.id === actionPoint.id) &&
            connectionToUpdate.points.some(p => p.id === actionPoint2.id)
          ) {
            connectionType = selectedConnectPointsType
            lineStyle = selectedLineStyle
          }

    
          if (connectionType && lineStyle) {
            drawConnection(
              action.points[0],
              action.points[1],
              connectionType,
              lineStyle
            );
          }
        }
      }
    });
  }
  
  return (
    <div className={styles.graphPaperContainer}>
      <h1>Virtual Graph Paper</h1>
      <ActionToolbar selectedAction={selectedAction} onSelect={handleSelectAction} />
      <TypesSelectorWrapper selectedAction={selectedAction} />

      

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