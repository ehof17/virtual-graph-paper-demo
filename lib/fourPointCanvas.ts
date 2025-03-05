import { RANGE } from "./constants";
import { computeFourPointCubicParams, drawCubicCurve } from "./cubicCanvas";
import { ConnectPointsType, GraphPaperPoint, LineStyle, FourPointFunctionType, FunctionParams } from "./types/graphPaper";

export const drawFourPointConnection = (
    ctx: CanvasRenderingContext2D,
    point1: GraphPaperPoint,
    point2: GraphPaperPoint,
    point3: GraphPaperPoint,
    point4: GraphPaperPoint,
    connectionType: ConnectPointsType,
    lineStyle: LineStyle,
    selectedFourPointFunction: FourPointFunctionType,
    selectedColor: string
): FunctionParams | null => {
    if (!ctx) return null;

    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 2;

    let xMin = Math.min(point1.x, point2.x, point3.x, point4.x);
    let xMax = Math.max(point1.x, point2.x, point3.x, point4.x);
    if (connectionType !== "finite") {
        xMax = RANGE;
    }
    if (connectionType === "continuous") {
        xMin = -RANGE;
    }

    let A, B, C, D;
    let valid = false;
    let params: FunctionParams | null = null;

    switch (selectedFourPointFunction) {
        case "cubic":
            params = computeFourPointCubicParams(
                point1.x, point1.y,
                point2.x, point2.y,
                point3.x, point3.y,
                point4.x, point4.y
            );
            
            A = params.A;
            B = params.B;
            C = params.C;
            D = params.D;
            valid = params.valid;
            
            if (!valid || A === undefined || B === undefined || C === undefined || D === undefined) {
                console.warn("Cubic solve failed:", params.message);
                return params;
            }
            console.log("Determined Cubic Function:");
            console.log(`f(x) = ${A}*x^3 + ${B}*x^2 + ${C}*x + ${D}`);
            
            // Draw the curve
            drawCubicCurve(ctx, A, B, C, D, xMin, xMax, selectedColor);
            break;

        default:
            ctx.setLineDash([]);
    }
    
    console.log(params);
    ctx.stroke();
    return params;
};
