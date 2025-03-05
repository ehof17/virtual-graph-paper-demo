import { CANVAS_SIZE, RANGE, STEP_SIZE } from "./constants";
import { computeQuadratic3Points, drawShadedQuadraticRegion } from "./quadraticCanvas";
import { drawShadedLinearRegion } from "./twoPointCanvas";
import { GraphPaperAction, ShadeType } from "./types/graphPaper";
import { gridToCanvas, hexToRgba } from "./utils";

export const drawShadedRegion = (ctx: CanvasRenderingContext2D, action: GraphPaperAction, shadeType: ShadeType) => {
    if (!ctx) return;
  
    ctx.beginPath();

    if (!action.points || action.points.length < 2) {
        console.warn('drawShadedRegion: Only handles two-point linear shading.');
        return;
      }
    const { points } = action;
    const [point1, point2] = points;
    let point3;
    if (points.length === 3) {
      point3 = points[2];
    }
      
   
    //const p1Canvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point1.x, point1.y);
    //const p2Canvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point2.x, point2.y);
  
    ctx.setLineDash([]);

    // ctx save should save this and then multiply to make blue +red = purple
    // but it messes everything up
    ctx.save();
    // options here
    //"source-over",
    //"source-in",
    //"source-out",
    //"source-atop",
    //"destination-over",
    //"destination-in",
    //"destination-out",
    //"destination-atop",
    //"lighter",
    //"copy",
    //"xor",
    //"multiply",
    //"screen",
    //"overlay",
    //"darken",
    //"lighten",
    //"color-dodge",
    //"color-burn",
    //"hard-light",
    //"soft-light",
    //"difference",
    //"exclusion",
    //"hue",
    //"saturation",
    //"color",
    //"luminosity",

    ctx.globalCompositeOperation = 'multiply'; 
    ctx.strokeStyle =  point1.color || 'red';
    ctx.fillStyle =  point1.color
      ? hexToRgba(point1.color, 0.35) 
      : 'rgba(255, 0, 0, 0.5)';
  
    const connectionType = action.connectionType || 'finite'; 
    const functionType = action.functionType;
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


    let params;
    switch (functionType) {
      case 'linear':
        // Linear shading handled below
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        if (dx === 0) {
          console.warn('Vertical line shading not handled here.');
          return;
        }
        const m = dy / dx;
        const b = point1.y - m * point1.x;
  
        drawShadedLinearRegion(ctx, m, b, xMin, xMax, shadeType);

        break;
      case 'quadratic':
        // Quadratic shading handled in quadraticCanvas
        if (point3){
          params = computeQuadratic3Points(point1.x, point1.y, point2.x, point2.y, point3.x, point3.y);
          const { A, B, C } = params;
          if (!params.valid || A === undefined || B === undefined || C === undefined) {
            console.warn("Quadratic solve failed:", params.message);
            return params;
          }
          
          drawShadedQuadraticRegion(ctx, A, B, C, xMin, xMax, shadeType);

        }
  
        // drawShadedQuadraticRegion(ctx, point1, point2, point3, shadeType);
        break;
      }
   

     
    ctx.restore();
  };
  
