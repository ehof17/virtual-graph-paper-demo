import { computeThreePointAbsParams, drawThreePointAbs } from "./absCanvas";
import { CANVAS_SIZE, RANGE, STEP_SIZE } from "./constants";
import { computeQuadratic3Points, drawQuadraticCurve } from "./quadraticCanvas";
import {computeThreePointSqrtParams, drawSqrtCurve } from "./sqrtCanvas";
import { ConnectPointsType, GraphPaperPoint, LineStyle, ThreePointFunctionType, FunctionParams } from "./types/graphPaper";
import { gridToCanvas } from "./utils";

export const drawThreePointConnection = (ctx: CanvasRenderingContext2D, point1: GraphPaperPoint, point2: GraphPaperPoint, point3: GraphPaperPoint, connectionType: ConnectPointsType, lineStyle: LineStyle, selectedThreePointFunction: ThreePointFunctionType, selectedColor: string):FunctionParams | null => {
    if (!ctx) return null;
  
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 2;
    let xMin = Math.min(point1.x, point2.x, point3.x);
    let xMax = Math.max(point1.x, point2.x, point3.x);
    if (connectionType !== "finite") {
        xMax = RANGE;
    }
    if (connectionType === "continuous"){
        xMin = -RANGE;
    }

    let A, B, C, H, K;
    let valid = false;
    let params: FunctionParams | null = null;
    switch (selectedThreePointFunction){
        case "quadratic":
            params = computeQuadratic3Points(point1.x, point1.y, point2.x, point2.y, point3.x, point3.y);
            A = params.A;
            B = params.B;
            C = params.C;
            valid = params.valid;
              if (!valid || A === undefined || B === undefined || C === undefined) {
                console.warn("Quadratic solve failed:", params.message);
                return params;
              }
              console.log("Determined this function")
              console.log(`${A}*X^2+(${B}x)+${C}`)
          
              // 3) Draw the curve
              drawQuadraticCurve(ctx, A, B, C, xMin, xMax, selectedColor);
              break;
        case "absolute_value":
            params = computeThreePointAbsParams(point1, point2, point3);
            A = params.A;
            H = params.H;
            K = params.K;       
            if (!params.valid || A === undefined || H === undefined || K === undefined) {
                console.warn("Absolute Value solve failed:", params.message);
                return params;
            }
            console.log("Determined Absolute Value:");
            console.log(`f(x) = ${A} * |x - ${H}| + ${K}`);
            drawThreePointAbs(ctx, A, H, K, xMin, xMax, selectedColor);
            break;
        case "square_root":
            params = computeThreePointSqrtParams(point1.x, point1.y, point2.x, point2.y, point3.x, point3.y);
            A = params.A;
            B = params.B;
            C = params.C;
            if (!A || !B && B !== 0 || !C && C !== 0) {
                console.warn("drawShiftedSqrtCurve: invalid or incomplete params");
                console.log(params.message)
                return params;
            }
            console.log("Determined this function")
            console.log(`${A}*sqrt(x+${B})+${C}`)
        
            // Move to the first point in domain
            const initY = A * Math.sqrt(xMin + B) + C;
            const initCanvas = gridToCanvas(CANVAS_SIZE, STEP_SIZE, xMin, initY);
            ctx.moveTo(initCanvas.x, initCanvas.y);
        
            // 3) Draw
            drawSqrtCurve(ctx, params, xMin, xMax, selectedColor);
            break;
        default:

            ctx.setLineDash([]);
    }
    console.log(params)
  
    ctx.stroke();
    return params;
  };
  
  