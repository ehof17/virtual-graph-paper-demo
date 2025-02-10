// lib/types/graphPaper.ts

export type ActionType =
  | "plot_point"
  | "connect_points"
  | "draw_line"
  | "draw_parabola"
  | "shade_region"



export type PointStyle = "filled" | "unfilled";

export type ConnectPointsType = "line_segment" | "ray" | "line_from_points";
export type LineStyle = "solid" | "dashed" | "dotted" | "broken";


export interface Coordinate {
  x: number;
  y: number;
}

// This interface represents a plotted point with an ID so that it can be referenced by the connect action
export interface GraphPaperPoint extends Coordinate {
  id: string;
}

export interface ActionStyle {
  pointStyle?: "filled" | "unfilled";
  lineStyle?: "solid" | "dashed" | "dotted" | "broken";
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
  timestamp: string;
  connectionType?: ConnectPointsType;
}

export interface GraphPaperSession {
  actions: GraphPaperAction[];
  sessionId?: string;
}