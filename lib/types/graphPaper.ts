// lib/types/graphPaper.ts

export type ActionType =
  | "plot_point"
  | "select_points"
  | "connect_points"
  | "draw_line"
  | "draw_parabola"
  | "shade_region"



export type PointStyle = "filled" | "unfilled";

export type ConnectPointsType = 
| "continuous"     
| "semi_infinite"  
| "finite";  

export type LineStyle = "solid" | "dashed" | "dotted";

export type TwoPointFunctionType= "linear" | "exponential";
export type ThreePointFunctionType = "cubic" | "quadratic" | "square_root" | "absolute_value";  

export interface Coordinate {
  x: number;
  y: number;
}

// This interface represents a plotted point with an ID so that it can be referenced by the connect action
export interface GraphPaperPoint extends Coordinate {
  id: string;
  pointStyle: PointStyle;
}

export interface ActionStyle {
  pointStyle?: PointStyle
  lineStyle?: LineStyle
  color?: string;
  thickness?: number;
  opacity?: number;
}

export interface GraphPaperAction {
  actionType: ActionType;
  coordinates?: Coordinate[];
  // For actions like connect_points, we want references to already-plotted points
  points?: GraphPaperPoint[];
  style?: ActionStyle;
  connectionType?: ConnectPointsType;
  functionType?: TwoPointFunctionType;
  timestamp: string;
 
}

export interface GraphPaperSession {
  actions: GraphPaperAction[];
  sessionId?: string;
}