'use client';
import React, { useState, useRef, useEffect} from 'react';
import { GraphPaperAction, ActionType, FunctionParams, TwoPointFunctionType, ThreePointFunctionType} from '../../../lib/types/graphPaper';
import styles from '../../styles/GraphPaper.module.css';
import { useGraphPaper } from '../../../contexts/GraphPaperContext';
import ActionToolbar from './ActionToolbar';
import {  canvasToGrid, createPointID } from '@/lib/utils';
import TypesSelectorWrapper from './TypesSelectorWrapper';
import PlotPointInput from './PlotPointInput';
import ColorSelector from './ColorSelector';
import { drawGrid, drawPoint, drawSelectedPoint, redrawAll, redrawAllExcept } from '@/lib/canvasUtils';
import { drawFourPointConnection } from '@/lib/fourPointCanvas';
import { drawThreePointConnection } from '@/lib/threePointCanvas';
import { CANVAS_SIZE, RANGE, STEP_SIZE } from '@/lib/constants';
import { drawTwoPointConnection } from '@/lib/twoPointCanvas';
import { drawShadedRegion } from '@/lib/shadedRegion';
import ErrorModal from './ErrorModal';
import FunctionDisplay from './FunctionDisplay';
import PointActions from './PointActions';



const GraphPaper: React.FC = () => {
  const { actions, addAction, removeAction, addPoint, selectedPointStyle, points, addSelectedPoint, removeSelectedPoint, selectedPoints, selectedConnectPointsType, selectedLineStyle, selectedTwoPointFunction, selectedThreePointFunction, selectedFourPointFunction, selectedColor, selectedShadeType} = useGraphPaper();
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [xInput, setXInput] = useState<string>("");
  const [yInput, setYInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  const [lastGraphedFunc, setLastGraphedFunc] = useState<FunctionParams>();

  // this will be replaced with the actual graph paper
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSelectAction = (action: ActionType) => {
    setSelectedAction(action);
  };




  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      drawGrid(canvas);
  
      points.forEach(point => drawPoint(ctx, point));
  
      selectedPoints.forEach(point => drawSelectedPoint(ctx, point));
    }
  }, [points]); 
  

const handleSelectPointsCanvasClick = (x: number, y: number) => {
  const updated = canvasToGrid(CANVAS_SIZE, STEP_SIZE, x, y)

  // if the click is close to multiple points, we want to select the closest one
  // maybe we can add a preference to the selected color later
  const closestPoints = points
  .filter(point => Math.abs(point.x - updated.x) < 1 && Math.abs(point.y - updated.y) < 1)
  .sort((a, b) => {
    const distA = Math.hypot(a.x - updated.x, a.y - updated.y);
    const distB = Math.hypot(b.x - updated.x, b.y - updated.y);
    return distA - distB; 
  });

  const existingPoint = closestPoints[0];
 


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

    }
    else{
     
      // add to selected list
      addSelectedPoint(existingPoint)
      // redraw with selected color
      drawSelectedPoint(ctx, existingPoint);

    }
  }
}


// connecting points when a region is shaded will remove the shade
function handleConnectTwoPointsClick(): GraphPaperAction | null {
  const [selectedPoint1, selectedPoint2] = selectedPoints;
  if (!selectedPoint1 || !selectedPoint2) return null; 

  const newAction: GraphPaperAction = {
    actionType: "connect_2_points",
    points: [selectedPoint1, selectedPoint2],
    style: { lineStyle: selectedLineStyle },
    connectionType: selectedConnectPointsType,
    functionType: selectedTwoPointFunction,
    timestamp: new Date().toISOString(),
  };

  // Find existing connection
  const existingConnectionIndex = actions.findIndex(a =>
    a.actionType === "connect_2_points" &&
    Array.isArray(a.points) && 
    a.points.length === 2 &&
    a.points.some(p => p.id === selectedPoint1.id) &&
    a.points.some(p => p.id === selectedPoint2.id)
  );

  const canvas = canvasRef.current;
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (existingConnectionIndex !== -1) {
    const existingConnection = actions[existingConnectionIndex];
    const sameStyle = (
      existingConnection.style?.lineStyle === selectedLineStyle &&
      existingConnection.connectionType === selectedConnectPointsType &&
      existingConnection.functionType === selectedTwoPointFunction
    );

    if (sameStyle) {
      alert("This connection already exists with the same style!");
      return null;
    } else {
      alert("The styles have changed");
      removeAction(existingConnection);
      redrawAll(ctx, actions, points, selectedPoints);
    }
  }

  // Now draw the new connection
  const drawResult = drawTwoPointConnection(
    ctx, 
    selectedPoint1, 
    selectedPoint2, 
    selectedConnectPointsType, 
    selectedLineStyle, 
    selectedTwoPointFunction
  );

  if (drawResult?.valid) {
    newAction.success = true;
    setLastGraphedFunc(drawResult); 
  } else {
    newAction.success = false;
    setErrorMessage(drawResult?.message || "Invalid connection");
    setShowError(true);
  }

  return newAction;
}
const handleConnectThreePointsClick = (): GraphPaperAction | null => {
  if (selectedPoints.length === 3) {
    const [point1, point2, point3] = selectedPoints;
    let res:FunctionParams|null;

    const newAction:GraphPaperAction = {
      actionType: "connect_3_points",
      points: [point1, point2, point3],
      style: { lineStyle: selectedLineStyle },
      functionType: selectedThreePointFunction,
      connectionType: selectedConnectPointsType,
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

    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;


    if (existingConnectionIndex !== -1) {
      const existingConnection = actions[existingConnectionIndex];
      const stylesChanged = (
        existingConnection.style?.lineStyle !== selectedLineStyle ||
        existingConnection.functionType !== selectedThreePointFunction ||
        existingConnection.connectionType !== selectedConnectPointsType
      );
     
      if (!stylesChanged) {
        alert("This connection already exists with the same style!");
        return null;
      } else {
        alert("The styles have changed");
        removeAction(existingConnection);
        clearConnection(existingConnection);
        res = drawThreePointConnection(ctx, point1, point2, point3, selectedConnectPointsType, selectedLineStyle, selectedThreePointFunction, selectedColor);
        
        if (res?.valid){
          setLastGraphedFunc(res);
          newAction.success = true;
        }
        else{
          setErrorMessage(res?.message || "Invalid connection");
          setShowError(true);
          newAction.success = false;
        }
      }
    } else {
      res = drawThreePointConnection(ctx, point1, point2, point3, selectedConnectPointsType, selectedLineStyle, selectedThreePointFunction, selectedColor);
      if (res?.valid){
        setLastGraphedFunc(res);
        newAction.success = true;
      }
      else{
        setErrorMessage(res?.message || "Invalid connection");
        setShowError(true);
        newAction.success = false;
      }
    }

    return newAction as GraphPaperAction;
  } else {
    alert("Please select exactly 3 points to connect.");
  }
  return null;
}

const handleConnectFourPointsClick = (): GraphPaperAction | null => {
  if (selectedPoints.length === 4) {
    const [point1, point2, point3, point4] = selectedPoints;
    let res: FunctionParams | null;

    const newAction: GraphPaperAction = {
      actionType: "connect_4_points",
      points: [point1, point2, point3, point4],
      style: { lineStyle: selectedLineStyle },
      connectionType: selectedConnectPointsType,
      functionType: selectedFourPointFunction, // Assuming you have this state
      timestamp: new Date().toISOString(),
    };

    const existingConnectionIndex = actions.findIndex(action =>
      action.actionType === "connect_4_points" &&
      Array.isArray(action.points) &&
      action.points.length === 4 &&
      action.points.some(p => p.id === point1.id) &&
      action.points.some(p => p.id === point2.id) &&
      action.points.some(p => p.id === point3.id) &&
      action.points.some(p => p.id === point4.id)
    );

    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (existingConnectionIndex !== -1) {
      const existingConnection = actions[existingConnectionIndex];
      const stylesChanged = (
        existingConnection.style?.lineStyle !== selectedLineStyle ||
        existingConnection.functionType !== selectedFourPointFunction ||
        existingConnection.connectionType !== selectedConnectPointsType
      );

      if (!stylesChanged) {
        alert("This connection already exists with the same style!");
        return null;
      } else {
        alert("The styles have changed");
        removeAction(existingConnection);
        clearConnection(existingConnection);
        res = drawFourPointConnection(ctx, point1, point2, point3, point4, selectedConnectPointsType, selectedLineStyle, selectedFourPointFunction, selectedColor);
        if (res?.valid) {
          setLastGraphedFunc(res);
          newAction.success = true;
        } else {
          setErrorMessage(res?.message || "Invalid connection");
          setShowError(true);
          newAction.success = false;
        }
      }
    } else {
      res = drawFourPointConnection(ctx, point1, point2, point3, point4, selectedConnectPointsType, selectedLineStyle, selectedFourPointFunction, selectedColor);
      if (res?.valid) {
        setLastGraphedFunc(res);
        newAction.success = true;
      } else {
        setErrorMessage(res?.message || "Invalid connection");
        setShowError(true);
        newAction.success = false;
      }
    }

    return newAction as GraphPaperAction;
  } else {
    alert("Please select exactly 4 points to connect.");
  }
  return null;
};

const onlyCareAboutSingleConnect = (): GraphPaperAction | null => {

  const connectionsAllSelected = actions.filter((action) => {
    if (
      action.actionType === "connect_2_points" ||
      action.actionType === "connect_3_points" ||
      action.actionType === "connect_4_points" 
    ) {

      if (!Array.isArray(action.points)) {
        return false;
      }

      // We want to confirm every selected point is in action.points
      const allSelectedAreInAction = selectedPoints.every((selPoint) =>
        action?.points?.some((actPoint) => actPoint.id === selPoint.id)
      );

      return allSelectedAreInAction;
    }
    return false;
  });
  const [connectionAction] = connectionsAllSelected;
  if (!connectionAction) return null;



  const canvas = canvasRef.current;
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;


  const existingShadeAction = actions.find((action) => {
    if (action.actionType !== "shade_region") return false;
    if (!Array.isArray(action.points)) return false;
    if (action.points.length !== connectionAction.points?.length) return false;
  
    return connectionAction.points?.every((connPoint) =>
      action.points?.some((shadedPoint) => shadedPoint.id === connPoint.id)
    );
  });

  if (existingShadeAction) {
    if (existingShadeAction.ShadeType === selectedShadeType) {
    // gotta Unshade it
    alert("This region is already shaded.");
    return null;
  }
  else{
    removeAction(existingShadeAction);
    redrawAllExcept(ctx, actions, points, selectedPoints, existingShadeAction);
    //redrawAll(ctx, actions, points, selectedPoints);
  }

  }

  const newAction: GraphPaperAction = {
    actionType: "shade_region",   
    points: connectionAction.points,
    style: { color: selectedColor }, 
    timestamp: new Date().toISOString(),
    ShadeType: selectedShadeType,
  };


  drawShadedRegion(ctx, connectionAction, selectedShadeType)
  return newAction;

}




// Todo... Handle multiple connections, like if a,b,c are selected and a->b, b->c

// for now.. just handle single connects
const handleShadeRegionClick = (): GraphPaperAction | null => {
  return onlyCareAboutSingleConnect()
}

  const handleCanvasClick = (x: number, y: number) => {
    if (!selectedAction) return;
    
    let newAction: GraphPaperAction | null = null;
    switch (selectedAction) {
      case "select_points":
        handleSelectPointsCanvasClick(x, y)
        break;

      case "connect_2_points":
        newAction = handleConnectTwoPointsClick();
        break

      case "connect_3_points":
        newAction = handleConnectThreePointsClick();
        break;

      case "connect_4_points":
        newAction = handleConnectFourPointsClick();
        break;

      case "shade_region":
        newAction = handleShadeRegionClick();
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



  // todo: Clean this up
  const clearConnection = (connectionToUpdate: GraphPaperAction) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    redrawAllExcept(ctx, actions, points, selectedPoints, connectionToUpdate);
    //redrawAllConnections(connectionToUpdate); 
    //redrawAll(ctx, actions, points, selectedPoints);
  };


// redraws all points 
// and connections based on the list of actions
// the connectionToUpdate will be drawn using the selected styles
  const redrawAllConnections = (connectionToUpdate: GraphPaperAction) =>{

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log("We Drawing Grid")
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
      let color = action.style?.color || 'red';
      let func = action.functionType || 'linear';

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
            if (selectedTwoPointFunction){
              func = selectedTwoPointFunction
            }
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
              func as TwoPointFunctionType,
            );
          }
        }
      }

      if (action.actionType === "connect_3_points") {
        if (action.points?.length === 3) {
          const [actionPoint, actionPoint2, actionPoint3] = action.points


          // If the action is a connect points action and it matches the points attached to the passed in 
          // action to update
          // Draw it with the new updated style, not the existing style
          if (
            Array.isArray(connectionToUpdate.points) &&
            connectionToUpdate.points.length === 2 &&
            connectionToUpdate.points.some(p => p.id === actionPoint.id) &&
            connectionToUpdate.points.some(p => p.id === actionPoint2.id) &&
            connectionToUpdate.points.some(p => p.id === actionPoint3.id)
          ) {
            connectionType = selectedConnectPointsType
            lineStyle = selectedLineStyle
            color = selectedColor
            func = selectedThreePointFunction

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
              func as ThreePointFunctionType,
              color
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
      {(selectedAction === "select_points" || selectedAction == "plot_point") && (
  <>
    <ColorSelector />
    <PointActions />
  </>
)}

      
      <ErrorModal
      show={showError}
      message={errorMessage}
      onClose={() => setShowError(false)}
      />
      {lastGraphedFunc && <FunctionDisplay params={lastGraphedFunc} />}
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