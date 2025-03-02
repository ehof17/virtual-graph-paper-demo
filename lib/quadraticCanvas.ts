import { CANVAS_SIZE, STEP_SIZE } from "./constants";
import { FunctionParams } from "./types/graphPaper";
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

  