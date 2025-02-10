// lib/types/graphPaper.ts

export type ActionType =
  | "plot_point"
  | "connect_points"
  | "draw_line"
  | "draw_parabola"
  | "shade_region"



export type PointStyle = "filled" | "unfilled";

export type ConnectPointsType = "line_segment" | "ray" | "line_from_points";
export type LineStyle = "solid" | "dashed" | "dotted";


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
  timestamp: string;
 
}

export interface GraphPaperSession {
  actions: GraphPaperAction[];
  sessionId?: string;
}