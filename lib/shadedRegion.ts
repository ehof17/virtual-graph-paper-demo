import { CANVAS_SIZE, RANGE, STEP_SIZE } from "./constants";
import { GraphPaperAction, ShadeType } from "./types/graphPaper";
import { gridToCanvas, hexToRgba } from "./utils";

export const drawShadedRegion = (ctx: CanvasRenderingContext2D, action: GraphPaperAction, shadeType: ShadeType) => {
    if (!ctx) return;
  
    ctx.beginPath();

    if (!action.points || action.points.length !== 2) {
        console.warn('drawShadedRegion: Only handles two-point linear shading.');
        return;
      }
    const { points } = action;
    const [point1, point2] = points;
    console.log("Points in canvasUtils")
    console.log(points)
   
    //const p1Canvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point1.x, point1.y);
    //const p2Canvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point2.x, point2.y);
  
    ctx.setLineDash([]);

    // ctx save should save this and then multiply to make blue +red = purple
    // but it messes everything up
    ctx.save();
    ctx.globalCompositeOperation = 'multiply'; // lighter or screen or multiply
    ctx.strokeStyle =  point1.color || 'red';
    ctx.fillStyle =  point1.color
      ? hexToRgba(point1.color, 0.35) 
      : 'rgba(255, 0, 0, 0.5)';
  
    const connectionType = action.connectionType || 'finite'; 
    const functionType = action.functionType;
  
    if (functionType === 'linear') {
  
      const dx = point2.x - point1.x;
      const dy = point2.y - point1.y;
      if (dx === 0) {
        console.warn('Vertical line shading not handled here.');
        return;
      }
      const m = dy / dx;
      const b = point1.y - m * point1.x;
  
      // 2. Decide the x-range to shade
      let xMin = Math.min(point1.x, point2.x);
      let xMax = Math.max(point1.x, point2.x);
  
      switch (connectionType) {
        case 'continuous':
          xMin = -RANGE;
          xMax = RANGE;
          break;
        case 'semi_infinite':
          // If p1 < p2 in x, we shade from xMin to RANGE. If p1 > p2, we shade from -RANGE to xMax.
          if (point1.x < point2.x) {
            xMin = point1.x;
            xMax = RANGE;
          } else {
            xMin = -RANGE;
            xMax = point1.x;
          }
          break;
        case 'finite':
        default:
          // Already set to the min / max of the two points
          break;
      }

      const steps = 200;
      const stepSize = (xMax - xMin) / steps;
  
      ctx.beginPath();
  
      let currentX = xMin;
      let currentY = m * currentX + b;
  
      const { x: startCanvasX, y: startCanvasY } = gridToCanvas(
        CANVAS_SIZE,
        STEP_SIZE,
        currentX,
        currentY
      );
      ctx.moveTo(startCanvasX, startCanvasY);
  
      for (let i = 1; i <= steps; i++) {
        currentX = xMin + i * stepSize;
        currentY = m * currentX + b;
        const canvasCoords = gridToCanvas(
          CANVAS_SIZE,
          STEP_SIZE,
          currentX,
          currentY
        );
        ctx.lineTo(canvasCoords.x, canvasCoords.y);
      }
  
      if (shadeType === 'above') {
        // For 'above', we connect from (xMax, lineY) up to (xMax, +RANGE),
        // then across to (xMin, +RANGE), then back down
       // const xMaxCanvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMax, m*xMax + b);
        const topRight = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMax, RANGE);
        const topLeft = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMin, RANGE);
  
        ctx.lineTo(topRight.x, topRight.y);
        ctx.lineTo(topLeft.x, topLeft.y);
        const xMinCanvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMin, m*xMin + b);
        ctx.lineTo(xMinCanvas.x, xMinCanvas.y);
        ctx.closePath();
        ctx.fill();
      } else {
        // shadeType === 'below'
        // For 'below', we connect from (xMax, lineY) down to (xMax, -RANGE),
        // then across to (xMin, -RANGE), then back up
       // const xMaxCanvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMax, m*xMax + b);
        const bottomRight = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMax, -RANGE);
        const bottomLeft = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMin, -RANGE);
  
        ctx.lineTo(bottomRight.x, bottomRight.y);
        ctx.lineTo(bottomLeft.x, bottomLeft.y);
        // up to line at xMin
        const xMinCanvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMin, m*xMin + b);
        ctx.lineTo(xMinCanvas.x, xMinCanvas.y);
        ctx.closePath();
        ctx.fill();
      }
    } 
    ctx.restore();
  };
  
