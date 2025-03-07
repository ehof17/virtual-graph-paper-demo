import { CANVAS_SIZE, RANGE, STEP_SIZE } from "./constants";
import { FunctionParams, ShadeType } from "./types/graphPaper";
import { gridToCanvas, hexToRgba } from "./utils";


  
export function computeThreePointSqrtParams(
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number
  ): FunctionParams {
    const Cfound = solveForC(x1, y1, x2, y2, x3, y3);
    if (Cfound === null) {
      return { valid: false, message: "for y = A*sqrt(x+B)+C, No valid C found", type:"square_root" };
    }
  
    // With the solution for C in hand, compute A^2 from eq1
    const num1 = (y2 - Cfound)**2 - (y1 - Cfound)**2;
    const den1 = (x2 - x1);
    if (den1 === 0) return { valid: false, message: "Denominator is zero", type:"square_root" };
  
    const A2 = num1 / den1;
    if (A2 <= 0) return { valid: false, message: "A^2 is non-positive", type:"square_root" };
  
    const A = Math.sqrt(A2);
  
    // (x1 + B) = ((y1 - C)^2) / A^2
    const B = ((y1 - Cfound)**2) / A2 - x1;
  
    
    return { valid: true, A, B, C: Cfound, type:"square_root" };
  }

  function solveForC(
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number
  ): number | null {
    // We guess a range for C, e.g. min & max based on y-values
    let left = Math.min(y1, y2, y3) - 10;
    let right = Math.max(y1, y2, y3) + 10;
  
    for (let iter = 0; iter < 100; iter++) {
      const mid = (left + right) / 2;
      const valMid = fOfC(mid, x1, y1, x2, y2, x3, y3);
      const valLeft = fOfC(left, x1, y1, x2, y2, x3, y3);
  
      if (Math.abs(valMid) < 1e-7) {
        return mid; // found a root
      }
  
      // If sign changes
      if (valMid * valLeft < 0) {
        right = mid;
      } else {
        left = mid;
      }
    }
    return null; // didn't converge
  }

  function fOfC(C: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
    const num1 = (y2 - C)**2 - (y1 - C)**2;
    const den1 = (x2 - x1);
    const num2 = (y3 - C)**2 - (y1 - C)**2;
    const den2 = (x3 - x1);

    if (den1 === 0 || den2 === 0) {
      return 999999; 
    }
  
    const A2_1 = num1 / den1;
    const A2_2 = num2 / den2;
    return A2_1 - A2_2;
  }

  export function drawSqrtCurve(
    ctx: CanvasRenderingContext2D,
    params: FunctionParams,
    xStart: number,
    xEnd: number,
    color: string
  ) {
    // Destructure parameters from the provided object
    const { A, B, C } = params;
  
    // Safety checks for missing values
    if (!ctx || !A || !B && B !== 0 || !C && C !== 0) {
      console.warn("drawSqrtCurve: invalid or incomplete params");
      return;
    }
  
    // Number of steps for incremental plotting
    const steps = 300;
    const dx = (xEnd - xStart) / steps;
  
    // Begin drawing path
    ctx.beginPath();
  
    // Move to the first valid point within [xStart, xEnd]
    let currentX = xStart;
    let domainX = currentX + B;
    // If the initial domain is negative, skip forward until we find x >= -B
    while (domainX < 0 && currentX <= xEnd) {
      currentX += dx;
      domainX = currentX + B;
    }
  
    // If we've exceeded xEnd, nothing to draw
    if (currentX > xEnd) {
      console.warn("No valid domain portion found to draw the square root curve.");
      return;
    }
  
    // Evaluate the function at the initial domain
    const currentY = A * Math.sqrt(domainX) + C;
    const { x: canvasX, y: canvasY } = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
    ctx.moveTo(canvasX, canvasY);
  
    // Incrementally connect points
    for (let i = 1; i <= steps; i++) {
      currentX = xStart + i * dx;
      if (currentX > xEnd) break; // stay in our range
  
      const checkDomainX = currentX + B;
      if (checkDomainX < 0) {
        // skip negative domain portion
        continue;
      }
  
      const nextY = A * Math.sqrt(checkDomainX) + C;
      const coords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, nextY);
      ctx.lineTo(coords.x, coords.y);
    }
  
    // Apply stroke styling
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  export function drawShadedSqrtCurve(
    ctx: CanvasRenderingContext2D,
    params: FunctionParams,
    xStart: number,
    xEnd: number,
    color: string,
    shadeType: ShadeType
  ) {
    const { A, B, C } = params;
  
    // Basic checks
    if (!ctx || !A && A !== 0 || !B && B !== 0 || !C && C !== 0) {
      console.warn("drawShadedSqrtCurve: invalid or incomplete params", params);
      return;
    }
  
    // We do N steps to draw the curve
    const steps = 300;
    const dx = (xEnd - xStart) / steps;
  
    // Start by finding the first valid domain portion: x + B >= 0
    ctx.beginPath();
  
    let currentX = xStart;
    let domainX = currentX + B;
    while (domainX < 0 && currentX <= xEnd) {
      currentX += dx;
      domainX = currentX + B;
    }
  
    // If we've gone past xEnd, no valid domain
    if (currentX > xEnd) {
      console.warn("No valid domain portion found to draw the sqrt curve.");
      return;
    }
  
    // Evaluate function at first domain point
    let currentY = A * Math.sqrt(domainX) + C;
    let { x: canvasX, y: canvasY } = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
    ctx.moveTo(canvasX, canvasY);
  
    // Draw the function curve
    for (let i = 1; i <= steps; i++) {
      const testX = xStart + i * dx;
      if (testX > xEnd) break;
  
      const domainTestX = testX + B;
      if (domainTestX < 0) {
        // skip negative domain portion
        continue;
      }
  
      const testY = A * Math.sqrt(domainTestX) + C;
      const coords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, testX, testY);
      ctx.lineTo(coords.x, coords.y);
  
      // Update currentX/currentY for shading steps
      currentX = testX;
      currentY = testY;
      canvasX = coords.x;
      canvasY = coords.y;
    }
  
    // At this point, we have a path from (first valid X) to (last valid X)
    // Decide how to shade
    if (shadeType === "above") {
      // line up to (xMax, +RANGE), across to (xMin, +RANGE), back to start
      const topRight = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, RANGE);
      ctx.lineTo(topRight.x, topRight.y);
  
      const topLeft = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xStart, RANGE);
      ctx.lineTo(topLeft.x, topLeft.y);
  
  
    } else {
      // shadeType === "below"
      // line down to (xMax, -RANGE), across to (xMin, -RANGE), back up
      const bottomRight = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, -RANGE);
      ctx.lineTo(bottomRight.x, bottomRight.y);
  
      const bottomLeft = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xStart, -RANGE);
      ctx.lineTo(bottomLeft.x, bottomLeft.y);
    }
  
    ctx.closePath();
  
    // Fill the region
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';  
    ctx.fillStyle = hexToRgba(color, 0.35);     
    ctx.fill();
    ctx.restore();
  
    
    ctx.beginPath();
    currentX = xStart;
    domainX = currentX + B;
    while (domainX < 0 && currentX <= xEnd) {
      currentX += dx;
      domainX = currentX + B;
    }
    if (currentX <= xEnd) {
      currentY = A * Math.sqrt(domainX) + C;
      let cCoords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
      ctx.moveTo(cCoords.x, cCoords.y);
  
      for (let i = 1; i <= steps; i++) {
        const tX = xStart + i * dx;
        if (tX > xEnd) break;
        const dX = tX + B;
        if (dX < 0) continue;
  
        const tY = A * Math.sqrt(dX) + C;
        cCoords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, tX, tY);
        ctx.lineTo(cCoords.x, cCoords.y);
      }
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }