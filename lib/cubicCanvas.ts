import { CANVAS_SIZE, RANGE, STEP_SIZE } from "./constants";
import { FunctionParams, ShadeType } from "./types/graphPaper";
import { gridToCanvas, hexToRgba } from "./utils";

export function computeFourPointCubicParams(
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    x4: number, y4: number
): FunctionParams {
    console.log({x1, y1, x2, y2, x3, y3, x4, y4});
    
    if (x1 === x2 || x1 === x3 || x1 === x4 || x2 === x3 || x2 === x4 || x3 === x4) {
        return { valid: false, message: "Points have duplicate x-values. Does not pass the vertical line test", type: "cubic" };
    }

    // Construct the coefficient matrix and the result vector
    const matrix = [
        [x1 ** 3, x1 ** 2, x1, 1],
        [x2 ** 3, x2 ** 2, x2, 1],
        [x3 ** 3, x3 ** 2, x3, 1],
        [x4 ** 3, x4 ** 2, x4, 1]
    ];
    
    const results = [y1, y2, y3, y4];

    // Solve the linear system Ax = B to find coefficients A, B, C, D
    const coefficients = solveLinearSystem(matrix, results);
    
    if (!coefficients) {
        return { valid: false, message: "Could not compute cubic parameters", type: "cubic" };
    }

    const [A, B, C, D] = coefficients;

    return { valid: true, A, B, C, D, type: "cubic" };
}

// Function to solve Ax = B using Gaussian elimination
function solveLinearSystem(matrix: number[][], results: number[]): number[] | null {
    const n = results.length;
    const augmentedMatrix = matrix.map((row, i) => [...row, results[i]]);

    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmentedMatrix[k][i]) > Math.abs(augmentedMatrix[maxRow][i])) {
                maxRow = k;
            }
        }

        [augmentedMatrix[i], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[i]];

        if (Math.abs(augmentedMatrix[i][i]) < 1e-10) return null;

        for (let k = i + 1; k < n; k++) {
            const factor = augmentedMatrix[k][i] / augmentedMatrix[i][i];
            for (let j = i; j <= n; j++) {
                augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
            }
        }
    }

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = augmentedMatrix[i][n] / augmentedMatrix[i][i];
        for (let k = i - 1; k >= 0; k--) {
            augmentedMatrix[k][n] -= augmentedMatrix[k][i] * x[i];
        }
    }
    return x;
}

export function drawCubicCurve(
    ctx: CanvasRenderingContext2D,
    a: number,
    b: number,
    c: number,
    d: number,
    xStart: number,
    xEnd: number,
    color: string
) {
    const steps = 300;
    const dx = (xEnd - xStart) / steps;

    ctx.beginPath();

    let currentX = xStart;
    let currentY = a * currentX ** 3 + b * currentX ** 2 + c * currentX + d;
    const startCoords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
    ctx.moveTo(startCoords.x, startCoords.y);

    for (let i = 1; i <= steps; i++) {
        currentX = xStart + i * dx;
        currentY = a * currentX ** 3 + b * currentX ** 2 + c * currentX + d;

        const coords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
        ctx.lineTo(coords.x, coords.y);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}
export function drawShadedCubic(
    ctx: CanvasRenderingContext2D,
    a: number,
    b: number,
    c: number,
    d: number,
    xStart: number,
    xEnd: number,
    color: string,
    shadeType: ShadeType
  ) {
    const steps = 300;
    const dx = (xEnd - xStart) / steps;
  
    ctx.beginPath();
  
    let currentX = xStart;
    let currentY = a * currentX**3 + b * currentX**2 + c * currentX + d;
    let coords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
    ctx.moveTo(coords.x, coords.y);
  
    for (let i = 1; i <= steps; i++) {
      currentX = xStart + i * dx;
      currentY = a * currentX**3 + b * currentX**2 + c * currentX + d;
  
      coords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
      ctx.lineTo(coords.x, coords.y);
    }
  
    if (shadeType === "above") {

      const topRight = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xEnd, RANGE);
      ctx.lineTo(topRight.x, topRight.y);
  
      const topLeft = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xStart, RANGE);
      ctx.lineTo(topLeft.x, topLeft.y);
  
    } else {
      const bottomRight = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xEnd, -RANGE);
      ctx.lineTo(bottomRight.x, bottomRight.y);
  
      const bottomLeft = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xStart, -RANGE);
      ctx.lineTo(bottomLeft.x, bottomLeft.y);

    }
  
    ctx.closePath();
  
    ctx.save();
    
    ctx.globalCompositeOperation = "multiply"; 
    ctx.fillStyle = hexToRgba(color, 0.35);
    ctx.fill();
    ctx.restore();
  
    ctx.beginPath();
    currentX = xStart;
    currentY = a * currentX**3 + b * currentX**2 + c * currentX + d;
    const firstCoords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
    ctx.moveTo(firstCoords.x, firstCoords.y);
    for (let i = 1; i <= steps; i++) {
      currentX = xStart + i * dx;
      currentY = a * currentX**3 + b * currentX**2 + c * currentX + d;
      coords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
      ctx.lineTo(coords.x, coords.y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }