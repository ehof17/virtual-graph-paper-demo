import { CANVAS_SIZE, RANGE, STEP_SIZE } from "./constants";
import { GraphPaperPoint, FunctionParams, ShadeType } from "./types/graphPaper";
import { gridToCanvas } from "./utils";

export function computeThreePointAbsParams(
    p1: GraphPaperPoint,
    p2: GraphPaperPoint,
    p3: GraphPaperPoint
  ): FunctionParams {
    const sorted = [p1, p2, p3].sort((A, B) => A.x - B.x);
    const [left, mid, right] = sorted;

    const H = mid.x;
    const K = mid.y;
  
    // If left.x === mid.x => can't define slope
    // If right.x === mid.x => same issue

    if (left.x === mid.x || right.x === mid.x) {
      return {
        valid: false,
        message: "Cannot define absolute value if the 'vertex' x is same as left or right",
        type: "absolute_value",
      };
    }
  
    // 1) Solve for 'a' from left
    // y = a |x - h| + k
    // => left.y = a |left.x - h| + k
    // => a = (left.y - k)/|left.x - h|
    const denomLeft = Math.abs(left.x - H);
    if (denomLeft === 0) {
      return {
        valid: false,
        message: "Left and mid have same x",
        type: "absolute_value",
      };
    }
    const a1 = (left.y - K) / denomLeft; // could be negative if left is below vertex
  
    // 2) Check with right point
    const denomRight = Math.abs(right.x - H);
    if (denomRight === 0) {
      return {
        valid: false,
        message: "Right and mid have same x",
        type: "absolute_value",
      };
    }
    const a2 = (right.y - K) / denomRight;
  
    // For a perfect absolute-value shape, a1 should ~ a2. 
    // They might be negative or positive, but typically we expect them to match in magnitude if 
    // the left & right are symmetric. If not, we take an average or declare invalid.
    const EPS = 1e-6;
    if (Math.abs(a1 - a2) > EPS) {
      return {
        valid: false,
        message: `Absolute Value mismatch: a1=${a1}, a2=${a2}`,
        type: "absolute_value",
      };
    }
  
    const A = a1; // or (a1 + a2)/2
  
    return {
      valid: true,
      type: "absolute_value", 
      A,
      H,
      K,
    };
  }

  export function drawThreePointAbs(
    ctx: CanvasRenderingContext2D,
    a: number,
    h: number,
    k: number,
    xMin: number,
    xMax: number,
    color: string
  ) {
    const steps = 300;
    const dx = (xMax - xMin) / steps;
  
    ctx.beginPath();
  
    let currentX = xMin;
    let currentY = a * Math.abs(currentX - h) + k;
    const startCoords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
    ctx.moveTo(startCoords.x, startCoords.y);
  
    for (let i = 1; i <= steps; i++) {
      currentX = xMin + i * dx;
      currentY = a * Math.abs(currentX - h) + k;
  
      const coords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
      ctx.lineTo(coords.x, coords.y);
    }
  
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  export function drawShadedThreePointAbs(
    ctx: CanvasRenderingContext2D,
    a: number,
    h: number,
    k: number,
    xMin: number,
    xMax: number,
    color: string,
    shadeType: ShadeType
) {
    const steps = 300;
    const dx = (xMax - xMin) / steps;
  
    ctx.beginPath();
  
    let currentX = xMin;
    let currentY = a * Math.abs(currentX - h) + k;
    const startCoords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
    ctx.moveTo(startCoords.x, startCoords.y);
  
    for (let i = 1; i <= steps; i++) {
        currentX = xMin + i * dx;
        currentY = a * Math.abs(currentX - h) + k;
        const coords = gridToCanvas(CANVAS_SIZE, STEP_SIZE, currentX, currentY);
        ctx.lineTo(coords.x, coords.y);
    }

    if (shadeType === "above") {
        const topRight = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMax, RANGE);
        const topLeft = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMin, RANGE);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.lineTo(topLeft.x, topLeft.y);
    } else {
        const bottomRight = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMax, -RANGE);
        const bottomLeft = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMin, -RANGE);
        ctx.lineTo(bottomRight.x, bottomRight.y);
        ctx.lineTo(bottomLeft.x, bottomLeft.y);
    }

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3; 
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}