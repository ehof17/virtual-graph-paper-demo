import { CANVAS_SIZE, RANGE, STEP_SIZE } from "./constants";
import { FunctionParams, GraphPaperAction, GraphPaperPoint, ShadeType } from "./types/graphPaper";
import { gridToCanvas } from "./utils";



export function computeQuadratic3Points(
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number
  ): FunctionParams {

    // If any two x-values are the same, then it fails the vertical line test
    console.log({x1, y1, x2, y2, x3, y3})
    if (x1 === x2 || x2 === x3 || x1 === x3) {
      return { valid: false, message: "Points have duplicate x-values. Does not pass the vertical line test", type:"quadratic" };
    }
  
    // [ x1^2  x1  1 ] [ a ]   [ y1 ]
    // [ x2^2  x2  1 ] [ b ] = [ y2 ]
    // [ x3^2  x3  1 ] [ c ]   [ y3 ]
  
    const denom = 
       (x1 - x2)*(x1 - x3)*(x2 - x3); 
    if (denom === 0) {
      return { valid: false, message: "Determinant is zero; no unique quadratic", type:"quadratic"  };
    }
 
    const A = (
      y1*(x2 - x3) + 
      y2*(x3 - x1) + 
      y3*(x1 - x2)
    ) / denom;
  
    const B = -(
      y1*( (x2**2) - (x3**2) ) +
      y2*( (x3**2) - (x1**2) ) +
      y3*( (x1**2) - (x2**2) )
    ) / denom;
  
    const C = (
      y1*( x2*x3*(x2 - x3) ) +
      y2*( x3*x1*(x3 - x1) ) +
      y3*( x1*x2*(x1 - x2) )
    ) / denom; 
  
    return { valid: true, A, B, C, type:"quadratic"  };
  }


export function drawQuadraticCurve(
    ctx: CanvasRenderingContext2D,
    a: number,
    b: number,
    c: number,
    xStart: number,
    xEnd: number,
    color: string
  ) {
    const steps = 300;
    const dx = (xEnd - xStart) / steps;
  
    ctx.beginPath();
  
    let currentX = xStart;
    let currentY = a*currentX*currentX + b*currentX + c;
    const startCoords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
    ctx.moveTo(startCoords.x, startCoords.y);
  
    for (let i = 1; i <= steps; i++) {
      currentX = xStart + i*dx;
      currentY = a*currentX*currentX + b*currentX + c;
  
      const coords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
      ctx.lineTo(coords.x, coords.y);
    }
  
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  export function drawShadedQuadraticRegion(
    ctx: CanvasRenderingContext2D,
    A: number,
    B: number,
    C: number,
    xMin: number,
    xMax: number,
    shadeType: ShadeType,

  ) {
    const steps = 300;
    xMin = -RANGE;
    xMax = RANGE;
    const dx = (xMax - xMin) / steps;

    ctx.beginPath();
  
    // Start
    let currentX = xMin;
    let currentY = A * currentX * currentX + B * currentX + C;
    let start = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
    ctx.moveTo(start.x, start.y);
  
    // Plot the curve
    for (let i = 1; i <= steps; i++) {
      currentX = xMin + i * dx;
      currentY = A * currentX * currentX + B * currentX + C;
      const coords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
      ctx.lineTo(coords.x, coords.y);
    }
    // draw the curve
    ctx.stroke();
  
    // Decide if we shade "above" or "below"
    if (shadeType === 'above') {
      // This doesn't work and the line is not drawdn

      // Connect from the last curve point to top boundary,
      // then over to top boundary at xMin,
      // and back down to the start curve point
      const lastCurveX = xMax;
      const lastCurveY = A* xMax * xMax + B * xMax + C;
      //const lastPt = gridToCanvas(CANVAS_SIZE, STEP_SIZE, lastCurveX, lastCurveY);
  
      // We'll draw a line to (xMax, +RANGE)
      const topRight = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMax, RANGE);
      ctx.lineTo(topRight.x, topRight.y);
  
      // line across to xMin => (xMin, +RANGE)
      const topLeft = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMin, RANGE);
      ctx.lineTo(topLeft.x, topLeft.y);
  
      // back down to the first curve point => (xMin, f(xMin))
      const firstCurveX = xMin;
      const firstCurveY = A* xMin * xMin + B * xMin + C;
      const firstPt = gridToCanvas(CANVAS_SIZE, STEP_SIZE, firstCurveX, firstCurveY);
      ctx.lineTo(firstPt.x, firstPt.y);
  
      ctx.closePath();
      ctx.fill();
    } else {
      // shadeType === 'below'
      // Connect from the last curve point down to (xMax, -RANGE),
      // across to (xMin, -RANGE),
      // and back up to the first curve point
      //const lastCurveX = xMax;
     //const lastCurveY = A* xMax * xMax + B * xMax + C;
      const bottomRight = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMax, -RANGE);
      ctx.lineTo(bottomRight.x, bottomRight.y);
  
      const bottomLeft = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMin, -RANGE);
      ctx.lineTo(bottomLeft.x, bottomLeft.y);
  
      // back up to the initial curve point
      const firstPtX = xMin;
      const firstPtY = A* xMin * xMin + B * xMin + C;
      const firstPt = gridToCanvas(CANVAS_SIZE, STEP_SIZE, firstPtX, firstPtY);
      ctx.lineTo(firstPt.x, firstPt.y);
  
      ctx.closePath();
      ctx.fill();
    }
  }