'use client';
import React, { useState, useRef, useEffect} from 'react';
import { GraphPaperAction, ActionType, GraphPaperPoint,ConnectPointsType, LineStyle} from '../../../lib/types/graphPaper';
import styles from '../../styles/GraphPaper.module.css';
import { useGraphPaper } from '../../../contexts/GraphPaperContext';
import ActionToolbar from './ActionToolbar';
import { canvasToGrid, createPointID, gridToCanvas, hexToRgba } from '@/lib/utils';
import TypesSelectorWrapper from './TypesSelectorWrapper';
import PlotPointInput from './PlotPointInput';
import ColorSelector from './ColorSelector';


const GraphPaper: React.FC = () => {
  const { actions, addAction, removeAction, addPoint, selectedPointStyle, points, addSelectedPoint, removeSelectedPoint, selectedPoints, selectedConnectPointsType, selectedLineStyle, selectedTwoPointFunction, selectedColor} = useGraphPaper();
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [xInput, setXInput] = useState<string>("");
  const [yInput, setYInput] = useState<string>("");

  // this will be replaced with the actual graph paper
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSelectAction = (action: ActionType) => {
    setSelectedAction(action);
  };

  // Eventually these will need to be dynamic
  // for demo purposes we are just going 10x10 in each direction  
  const RANGE = 10;
  const CANVAS_SIZE = 400;

  const STEP_SIZE = CANVAS_SIZE / (RANGE * 2)


  useEffect(() => {
    drawGrid(); 
  }, []);

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

  
    // Ensure the grid lines are not dashed/dotted
    ctx.setLineDash([]); 
    // Clear whatever was on the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;   
    const height = canvas.height; 
    const centerX = width / 2;    
    const centerY = height / 2;   

    for (let i = -RANGE; i <= RANGE; i++) {
      ctx.beginPath();
      const x = centerX + i * STEP_SIZE;

      // If i = 0, draw the Y-axis thicker
      if (i === 0) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1;
      }

      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let j = -RANGE; j <= RANGE; j++) {
      ctx.beginPath();
      const y = centerY + j * STEP_SIZE;

      // If j = 0, draw the X-axis thicker
      if (j === 0) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1;
      }

      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };



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

          if (pointAlreadySelected){
            removeSelectedPoint(existingPoint)
            // redraw with unselected color
            drawPointNew(existingPoint, existingPoint.color || "red");

            // if theres a connection between the two points
            // and removing this point breaks the connection
            // then redraw that connection in red
            

          }
          else{
           
            // add to selected list
            addSelectedPoint(existingPoint)
            // redraw with selected color
            drawSelectedPointNew(existingPoint);

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
    drawPointNew(newPoint, selectedColor);

    const newAction = {
      actionType: "plot_point" as ActionType,
      points: [newPoint],
      style: { pointStyle: selectedPointStyle, color: selectedColor },
      
      timestamp: new Date().toISOString(),
    };
    addAction(newAction);

  };

  // old function needs the actual canvas coordinates
  // while this one will try and draw it based on the grid
  const drawPointNew = (point: GraphPaperPoint, color:string) => {
    console.log(point)
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        const updated = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point.x, point.y)
        ctx.arc(updated.x, updated.y, 5, 0, Math.PI * 2);
        
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

  // Draws a selected point
  // Really just draws two points, the bottom one is just black and a smaller one on top of it
  // Might need to fix this later. If the color is black
    // and it its filled then to show its selected it will be orange
    // and if its unfilled it will be orange
  const drawSelectedPointNew = (point: GraphPaperPoint) => {
    let colorToUse = point.color || "red"
    if (point.color === '#000000'){
      colorToUse = 'orange'
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const updated = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point.x, point.y);
  
    const outerRadius = 5;
    const innerRadius = 4; 

    // if it is filled
    switch(point.pointStyle){
      case 'filled':
        // 1) Draw the "outline" in black
        ctx.beginPath();
        ctx.arc(updated.x, updated.y, outerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();

        // 2) Draw the normal circle in the point’s color on top
        ctx.beginPath();
        ctx.arc(updated.x, updated.y, innerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = colorToUse; 
        ctx.fill();
      break;

      case 'unfilled':
        ctx.beginPath();
        ctx.arc(updated.x, updated.y, outerRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = "orange"; 
        ctx.lineWidth = 2;
        ctx.stroke();
      break;

      default:
      break;
    }

  
   
    
  };



  const drawConnection = (point1: GraphPaperPoint, point2: GraphPaperPoint, connectionType: ConnectPointsType, lineStyle: LineStyle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    ctx.beginPath();
    const point1Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point1.x, point1.y)
    const point2Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point2.x, point2.y)
    ctx.moveTo(point1Norm.x, point1Norm.y);

    // Set line styles
    switch (lineStyle) {
      case "dashed":
        ctx.setLineDash([10, 5]); // Dash pattern
        break;
      case "dotted":
        // todo: fix this
        // this throws off the grid pattern
        ctx.setLineDash([2, 4]); // Dotted pattern
        break;
      default:
        ctx.setLineDash([]); 
        break;
    }

    // handle linear vs exponential
    switch (selectedTwoPointFunction) {

      case "linear":
        console.log("linear")
        switch (connectionType) {
          case "finite":
            ctx.lineTo(point2Norm.x, point2Norm.y);
            break;
          case "semi_infinite":
            extendRay(ctx, point1, point2);
            break;
          case "continuous":
            extendLine(ctx, point1, point2);
            break;
          default:
            break;
        }
      break;
      // todo: make this work with the connection type
      case "exponential":
        const x1 = point1.x;
        const y1 = point1.y;
        const x2 = point2.x;
        const y2 = point2.y;
      
        if (y1 === 0 || y2 === 0) {
          alert("Exponential requires non-zero y-values.");
          return; // stop drawing
        }
        // If signs differ (one positive, one negative) => fail
        if ((y1 < 0 && y2 > 0) || (y1 > 0 && y2 < 0)) {
          alert("Exponential requires both points' y-values to have the same sign.");
          return; 
        }
        // Also ensure x1 !== x2 so we don't divide by zero
        if (x1 === x2) {
          alert("Exponential requires two distinct x-values.");
          return;
        }
      



        // 2. Solve for a and b
        const b = (y2 / y1) ** (1 / (x2 - x1));
        const a = y1 / (b ** x1);
      
        let startX = Math.min(x1, x2);
        let endX   = Math.max(x1, x2);

        if (connectionType === "semi_infinite") {
          startX = Math.min(x1, x2);
          endX = RANGE;
        }
        if (connectionType === "finite") {
          // Draw only between the two points
          startX = Math.min(x1, x2);
          endX = Math.max(x1, x2);
        }
        if (connectionType === "continuous") {
          // Draw between the two points
          startX = -RANGE;
          endX = RANGE;
        }


      
        // How many steps? More steps => smoother curve
        const steps = 500; 
        const stepSize = (endX - startX) / steps;
      
        const currentX = startX;
        const currentY = a * (b ** currentX);
      
        // Convert that to canvas coords
        const startCanvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
        ctx.moveTo(startCanvas.x, startCanvas.y);
      
        for (let i = 1; i <= steps; i++) {
          const nextX = startX + i * stepSize;
          const nextY = a * (b ** nextX);
      
          const nextCanvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, nextX, nextY);
          console.log(nextCanvas)
      
          ctx.lineTo(nextCanvas.x, nextCanvas.y);
        }
      
        break;


      default:
        break;

    }


  
    // todo: fix this so only connections between the selected points are blue
    // when points become selected/deselected update the connection colors
    ctx.strokeStyle = selectedColor; 

    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  
  


  // Todo... add arrowheads for lines and rays
  const extendRay = (ctx: CanvasRenderingContext2D, p1: GraphPaperPoint, p2: GraphPaperPoint) => {
    const p1Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, p1.x, p1.y)
    const p2Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, p2.x, p2.y)

    const dx = p2Norm.x - p1Norm.x;
    const dy = p2Norm.y - p1Norm.y;
    const scale = 1000; 
    const endX = p2Norm.x + dx * scale;
    const endY = p2Norm.y + dy * scale;
  
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };
  
  // Extend a full line both directions and add arrows on both ends
  const extendLine = (ctx: CanvasRenderingContext2D, p1: GraphPaperPoint, p2: GraphPaperPoint) => {
    const p1Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, p1.x, p1.y)
    const p2Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, p2.x, p2.y)

    const dx = p2Norm.x - p1Norm.x;
    const dy = p2Norm.y - p1Norm.y;
    const scale = 1000; 
  
    const startX = p1Norm.x - dx * scale;
    const startY = p1Norm.y - dy * scale;
    const endX = p2Norm.x + dx * scale;
    const endY = p2Norm.y + dy * scale;
  
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

    drawGrid();

    points.forEach(point =>{
      drawPointNew(point, point.color || "red")
    })

    selectedPoints.forEach(point => {
      drawSelectedPointNew(point)
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