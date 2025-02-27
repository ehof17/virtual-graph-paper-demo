'use client';
import React, { useState, useRef, useEffect} from 'react';
import { GraphPaperAction, ActionType} from '../../../lib/types/graphPaper';
import styles from '../../styles/GraphPaper.module.css';
import { useGraphPaper } from '../../../contexts/GraphPaperContext';
import ActionToolbar from './ActionToolbar';
import { canvasToGrid, createPointID } from '@/lib/utils';
import TypesSelectorWrapper from './TypesSelectorWrapper';
import PlotPointInput from './PlotPointInput';
import ColorSelector from './ColorSelector';
import { drawGrid, drawPoint, drawSelectedPoint, drawThreePointConnection, drawTwoPointConnection } from '@/lib/canvasUtils';
import { CANVAS_SIZE, RANGE, STEP_SIZE } from '@/lib/constants';


const GraphPaper: React.FC = () => {
  const { actions, addAction, removeAction, addPoint, selectedPointStyle, points, addSelectedPoint, removeSelectedPoint, selectedPoints, selectedConnectPointsType, selectedLineStyle, selectedTwoPointFunction, selectedThreePointFunction, selectedColor} = useGraphPaper();
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [xInput, setXInput] = useState<string>("");
  const [yInput, setYInput] = useState<string>("");

  // this will be replaced with the actual graph paper
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSelectAction = (action: ActionType) => {
    setSelectedAction(action);
  };




  useEffect(() => {
    if (canvasRef.current) {
      drawGrid(canvasRef.current);
    }
  }, []);



  const handleCanvasClick = (x: number, y: number) => {
    if (!selectedAction) return;
    
    let newAction: GraphPaperAction | null = null;
    switch (selectedAction) {
      
    case "select_points":
      const updated = canvasToGrid(CANVAS_SIZE, STEP_SIZE, x, y)

        const existingPoint = points.find(
          (point) => Math.abs(point.x - updated.x) < 1 && Math.abs(point.y - updated.y) < 1
        );
      
        if (existingPoint) {
          if(existingPoint.color !== selectedColor){
            alert("Cannot select this point, it is not the same color as the selected color");
            return
          }

          const pointAlreadySelected = selectedPoints.find(
            (point) => point.id === existingPoint.id
          );

          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          if (pointAlreadySelected){
            removeSelectedPoint(existingPoint)
            // redraw with unselected color
            

            drawPoint(ctx, existingPoint);

            // if theres a connection between the two points
            // and removing this point breaks the connection
            // then redraw that connection in red
            

          }
          else{
           
            // add to selected list
            addSelectedPoint(existingPoint)
            // redraw with selected color
            drawSelectedPoint(ctx, existingPoint);

          }
          break;
        }

          break;
      case "connect_2_points":
        const selectedPoint1 = selectedPoints[0]
        const selectedPoint2 = selectedPoints[1]
        // only draw the connection if it wasn't drawn before
        newAction = {
          actionType: "connect_2_points",
          points: [selectedPoint1, selectedPoint2 ],
          style: { lineStyle: selectedLineStyle },
          connectionType: selectedConnectPointsType,
          functionType: selectedTwoPointFunction,
          timestamp: new Date().toISOString(),
        };

        const existingConnectionIndex = actions.findIndex(action => 
          action.actionType === "connect_2_points" &&
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
            existingConnection.connectionType !== selectedConnectPointsType ||
            existingConnection.functionType !== selectedTwoPointFunction

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
          
          const canvas = canvasRef.current;
          if (!canvas) return;
        
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          drawTwoPointConnection(ctx, selectedPoint1, selectedPoint2, selectedConnectPointsType, selectedLineStyle, selectedTwoPointFunction, selectedColor);
        }
        break

        case "connect_3_points":
          if (selectedPoints.length === 3) {
            const [point1, point2, point3] = selectedPoints;
    
            newAction = {
              actionType: "connect_3_points",
              points: [point1, point2, point3],
              style: { lineStyle: selectedLineStyle },
              functionType: selectedThreePointFunction, // Assuming you have this state
              timestamp: new Date().toISOString(),
            };
    
            const existingConnectionIndex = actions.findIndex(action =>
              action.actionType === "connect_3_points" &&
              Array.isArray(action.points) &&
              action.points.length === 3 &&
              action.points.some(p => p.id === point1.id) &&
              action.points.some(p => p.id === point2.id) &&
              action.points.some(p => p.id === point3.id)
            );
    
            if (existingConnectionIndex !== -1) {
              const existingConnection = actions[existingConnectionIndex];
              const stylesChanged = (
                existingConnection.style?.lineStyle !== selectedLineStyle ||
                existingConnection.functionType !== selectedThreePointFunction
              );
    
              if (!stylesChanged) {
                alert("This connection already exists with the same style!");
                return;
              } else {
                alert("The styles have changed");
                removeAction(existingConnection);
                clearConnection(existingConnection);
              }
            } else {
              const canvas = canvasRef.current;
              if (!canvas) return;
    
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
    
              drawThreePointConnection(ctx, point1, point2, point3, selectedConnectPointsType, selectedLineStyle, selectedThreePointFunction, selectedColor);
            }
          } else {
            alert("Please select exactly 3 points to connect.");
          }
          break;
    
        default:
          newAction = null;
          break;
      }
    
      if (newAction) {
        addAction(newAction);
      }
    };

  // The inputted numbers need to match the actual coordinates
  // But displaying it on the grid will need different numbers
  // On a graph, 0,0 is in the ceneter, but HTML canvas 0,0 is in the top left
  const handlePlotPointFromInput = () => {
    const xNum = parseFloat(xInput);
    const yNum = parseFloat(yInput);

    if (isNaN(xNum) || isNaN(yNum)) {
      alert("Please enter valid numbers for X and Y.");
      return;
    }
    if (xNum < -RANGE || xNum > RANGE || yNum < -RANGE || yNum > RANGE) {
      alert(`Please enter numbers between -${RANGE} and ${RANGE}.`);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;


    const pointID = createPointID();
    // backend needs inputted x and y
    const newPoint = { x:xNum, y:yNum, id: pointID, pointStyle: selectedPointStyle, color: selectedColor };

    //add point if it doesnt exist
    const existingPoint = points.find(
      (point) => (point.x  == newPoint.x) && (point.y == newPoint.y)
    );
    if (existingPoint) {
      alert("This point already exists!");
      return;
    }
    // add the point to the context (backend)
    addPoint(newPoint);

    // add the point to the canvas (frontend)
    // it uses the normalized x and y 
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawPoint(ctx, newPoint);

    const newAction = {
      actionType: "plot_point" as ActionType,
      points: [newPoint],
      style: { pointStyle: selectedPointStyle, color: selectedColor },
      
      timestamp: new Date().toISOString(),
    };
    addAction(newAction);

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

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(canvas);

    points.forEach(point =>{
      drawPoint(ctx, point)
    })

    selectedPoints.forEach(point => {
      drawSelectedPoint(ctx, point)
    })


    actions.forEach((action) => {
      // Draw the existing connections the same way that they were drawn originally
      let connectionType = action.connectionType;
      let lineStyle = action.style?.lineStyle;

      if (action.actionType === "connect_2_points") {
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
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            drawTwoPointConnection(
              ctx, 
              action.points[0],
              action.points[1],
              connectionType,
              lineStyle,
              selectedTwoPointFunction,
              selectedColor
            );
          }
        }
      }
      if (action.actionType === "connect_3_points") {
        if (action.points?.length === 3) {
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
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            drawThreePointConnection(
              ctx, 
              action.points[0],
              action.points[1],
              action.points[2],
              connectionType,
              lineStyle,
              selectedThreePointFunction,
              selectedColor
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
      {selectedAction === "plot_point" && (
        <PlotPointInput
          xValue={xInput}
          yValue={yInput}
          onXChange={setXInput}
          onYChange={setYInput}
          onPlotPointClick={handlePlotPointFromInput} />
       
      )}
      {(selectedAction === "select_points" || selectedAction == "plot_point") && <ColorSelector />}

      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={(e) => {
          const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          handleCanvasClick(x, y);
        }}
        />

      {/* display all actions to show off grammar */ }
      <pre>{JSON.stringify(actions, null, 2)}</pre>
    </div>
  );
};

export default GraphPaper;