import { CANVAS_SIZE, STEP_SIZE } from "./constants";
import { ConnectPointsType, FunctionParams, GraphPaperPoint, LineStyle, TwoPointFunctionType } from "./types/graphPaper";
import { gridToCanvas } from "./utils";

export const drawTwoPointConnection = (ctx: CanvasRenderingContext2D, point1: GraphPaperPoint, point2: GraphPaperPoint, connectionType: ConnectPointsType, lineStyle: LineStyle, selectedTwoPointFunction: TwoPointFunctionType): FunctionParams |null => {
    if (!ctx) return null;
  
    ctx.beginPath();
    const M = (point2.y - point1.y) / (point2.x - point1.x);
    const B = point1.y - M * point1.x;
    const point1Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point1.x, point1.y)
    const point2Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, point2.x, point2.y)

    ctx.moveTo(point1Norm.x, point1Norm.y);

    // Set line styles
    switch (lineStyle) {
      case "dashed":
        ctx.setLineDash([10, 5]); // Dash pattern
        break;
      case "dotted":
        ctx.setLineDash([2, 4]); // Dotted pattern
        break;
      default:
        ctx.setLineDash([]); 
        break;
    }
    ctx.strokeStyle = point1.color || 'red';

    // handle linear vs exponential
    switch (selectedTwoPointFunction) {

      case "linear":
        console.log("linear")
        switch (connectionType) {
          case "finite":
            ctx.lineTo(point2Norm.x, point2Norm.y);
            break;
          case "semi_infinite":
            extendRay(ctx, point1, point2);
            break;
          case "continuous":
            extendLine(ctx, point1, point2);
            break;
          default:
            break;
        }
      ctx.stroke();
      return {M, B, type:"linear", valid:true};
  };
}
  



  // Todo... add arrowheads for lines and rays
  export const extendRay = (ctx: CanvasRenderingContext2D, p1: GraphPaperPoint, p2: GraphPaperPoint) => {
    const p1Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, p1.x, p1.y)
    const p2Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, p2.x, p2.y)

    const dx = p2Norm.x - p1Norm.x;
    const dy = p2Norm.y - p1Norm.y;
    const scale = 1000; 
    const endX = p2Norm.x + dx * scale;
    const endY = p2Norm.y + dy * scale;
  
    ctx.lineTo(endX, endY);
    
  };

  
  // Extend a full line both directions and add arrows on both ends
  const extendLine = (ctx: CanvasRenderingContext2D, p1: GraphPaperPoint, p2: GraphPaperPoint) => {
    const p1Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, p1.x, p1.y)
    const p2Norm = gridToCanvas(CANVAS_SIZE, STEP_SIZE, p2.x, p2.y)

    const dx = p2Norm.x - p1Norm.x;
    const dy = p2Norm.y - p1Norm.y;
    const scale = 1000; 
  
    const startX = p1Norm.x - dx * scale;
    const startY = p1Norm.y - dy * scale;
    const endX = p2Norm.x + dx * scale;
    const endY = p2Norm.y + dy * scale;
  
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    
  };
  