import { CANVAS_SIZE, RANGE, STEP_SIZE } from "./constants";
import { drawShadedRegion } from "./shadedRegion";
import { drawFourPointConnection } from "./fourPointCanvas";
import { drawThreePointConnection } from "./threePointCanvas";
import { drawTwoPointConnection } from "./twoPointCanvas";
import { GraphPaperPoint,  TwoPointFunctionType, ThreePointFunctionType, FourPointFunctionType, GraphPaperAction } from "./types/graphPaper";
import { gridToCanvas } from "./utils";

 // old function needs the actual canvas coordinates
  // while this one will try and draw it based on the grid
export const drawPoint = (ctx: CanvasRenderingContext2D, point: GraphPaperPoint) => {
      if (ctx) {
        ctx.beginPath();
        const updated = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point.x, point.y)
        ctx.arc(updated.x, updated.y, 5, 0, Math.PI * 2);
        
        switch(point.pointStyle){
          case 'filled':
            ctx.fillStyle = point.color || 'red'; 
            ctx.fill();
          break;

          case 'unfilled':
            ctx.strokeStyle = point.color || 'red'; 
            ctx.lineWidth = 2;
            ctx.stroke();
          break;

          default:
          break;
        }
      
      }
  };


  // Draws a selected point
  // Really just draws two points, the bottom one is just black and a smaller one on top of it
  // Might need to fix this later. If the color is black
    // and it its filled then to show its selected it will be orange
    // and if its unfilled it will be orange
export const drawSelectedPoint = (ctx: CanvasRenderingContext2D, point: GraphPaperPoint) => {
      
    let colorToUse = point.color || "red"
    if (point.color === '#000000'){
      colorToUse = 'orange'
    }
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

  
  export const drawGrid = (canvas:HTMLCanvasElement) => {

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

  export function redrawAllExcept(ctx: CanvasRenderingContext2D, actions: GraphPaperAction[], points: GraphPaperPoint[], selectedPoints: GraphPaperPoint[], actionToIgnore: GraphPaperAction) {
    const actionsToDraw = actions.filter((a) => a !== actionToIgnore);
    redrawAll(ctx, actionsToDraw, points, selectedPoints);
  }
  export function redrawAll(ctx: CanvasRenderingContext2D, actions: GraphPaperAction[], points: GraphPaperPoint[], selectedPoints: GraphPaperPoint[]) {
   // Clear canvas or drawGrid
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGrid(ctx.canvas);
  
    // 2) Draw all connections (lines, curves, etc.)
    actions.forEach((action) => {
      if (action.actionType.startsWith("connect")) {
        if (!action.points || action.points.length < 2) {
          console.error("Invalid connect_x_points action 1 : ", action);
          return;
        }
        if (!action.connectionType){
          console.error("Invalid connect_x_points action 2 : ", action);
          return;
        }
        if (!action.functionType) {
          console.error("Invalid connect_x_points action 3 : ", action);
          return;
        }
        if (!action.style?.lineStyle) {
          console.error("Invalid connect_x_points action 4 : ", action);
          return;
        }
        if (!action.functionType){
          console.error("Invalid connect_x_points action 5 : ", action);
          return;
        }
        switch (action.actionType) {
            case "connect_2_points":
                drawTwoPointConnection(ctx, action.points[0], action.points[1], action.connectionType, action.style.lineStyle, action.functionType as TwoPointFunctionType);
                break;
            case "connect_3_points":
                drawThreePointConnection(ctx, action.points[0], action.points[1], action.points[2], action.connectionType, action.style.lineStyle, action.functionType as ThreePointFunctionType, action.style?.color || action.points[0].color || 'red');
                break;
            case "connect_4_points":
                drawFourPointConnection(ctx, action.points[0], action.points[1], action.points[2], action.points[3], action.connectionType, action.style.lineStyle, action.functionType as FourPointFunctionType, action.style?.color || action.points[0].color || 'red');
                break;
       
      }
    }

    else if (action.actionType === "shade_region") {
      if (!action.points || action.points.length < 2) {
        console.error("Invalid shade_region action: ", action);
        return;
      }
      let connectionAction;
      if (action.points.length === 2) {
        connectionAction = actions.find((a) => a.actionType === "connect_2_points" && a.points && a.points.length === 2 && a.points[0].id === action.points![0].id && a.points[1].id === action.points![1].id);
      }
      else if (action.points.length === 3) {
        connectionAction = actions.find((a) => a.actionType === "connect_3_points" && a.points && a.points.length === 3 && a.points[0].id === action.points![0].id && a.points[1].id === action.points![1].id && a.points[2].id === action.points![2].id);
      }

      if (connectionAction){
        drawShadedRegion(ctx, connectionAction, action.ShadeType || 'above');
      }



    }
    }
  );

  
    // 3) Draw shading (if any "shade_region" actions exist)
    
  
    // 4) Draw all points
    points.forEach(p => drawPoint(ctx, p));
  
    // 5) Draw selected points
    selectedPoints.forEach(p => drawSelectedPoint(ctx, p));
  }




