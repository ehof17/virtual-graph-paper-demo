'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GraphPaperAction, GraphPaperPoint, PointStyle, ConnectPointsType, LineStyle } from '../lib/types/graphPaper';


interface GraphPaperContextProps {
  selectedPointStyle: PointStyle;
  setSelectedPointStyle: (style: PointStyle) => void;
  selectedConnectPointsType: ConnectPointsType;
  setSelectedConnectPointsType: (type: ConnectPointsType) => void;
  selectedLineStyle: LineStyle;
  setSelectedLineStyle: (style: LineStyle) => void;

  actions: GraphPaperAction[];
  points: GraphPaperPoint[];
  addAction: (action: GraphPaperAction) => void;
  addPoint: (point: GraphPaperPoint) => void;
  removeAction: (action: GraphPaperAction) => void;
  clearActions: () => void;
}

const GraphPaperContext = createContext<GraphPaperContextProps | undefined>(undefined);

interface GraphPaperProviderProps {
  children: ReactNode;
}

export const GraphPaperProvider: React.FC<GraphPaperProviderProps> = ({ children }) => {
  const [actions, setActions] = useState<GraphPaperAction[]>([]);
  const [points, setPoints] = useState<GraphPaperPoint[]>([]);
  const [selectedPointStyle, setSelectedPointStyle] = useState<PointStyle>("filled");
  const [selectedConnectPointsType, setSelectedConnectPointsType] = useState<ConnectPointsType>("line_segment");
  const [selectedLineStyle, setSelectedLineStyle] = useState<LineStyle>("solid");


  const addAction = (action: GraphPaperAction) => {
    setActions(prev => [...prev, action]);
  };

  const addPoint = (point: GraphPaperPoint) => {
    setPoints(prev => [...prev, point]);
  };

  const removeAction = (action: GraphPaperAction) => {
    setActions(prev => prev.filter(a => a.timestamp !== action.timestamp));
  };

  // undo last action
  const popAction = () => {
    setActions(prev => prev.slice(0, -1));
  }

  const clearActions = () => {
    setActions([]);
  };

  const value: GraphPaperContextProps = {
    actions,
    points,
    addAction,
    addPoint,
    removeAction,
    clearActions,
    selectedPointStyle,
    setSelectedPointStyle,
    selectedConnectPointsType,
    setSelectedConnectPointsType,
    selectedLineStyle,
    setSelectedLineStyle,
    
  };

  return (
    <GraphPaperContext.Provider value={value}>
      {children}
    </GraphPaperContext.Provider>
  );
};

export const useGraphPaper = (): GraphPaperContextProps => {
  const context = useContext(GraphPaperContext);
  if (!context) {
    throw new Error('error no context');
  }
  return context;
};

export default GraphPaperContext;