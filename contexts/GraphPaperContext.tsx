'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GraphPaperAction, GraphPaperPoint, PointStyle, ConnectPointsType, LineStyle, TwoPointFunctionType, ThreePointFunctionType, FourPointFunctionType, ShadeType } from '../lib/types/graphPaper';
import { COLOR_OPTIONS } from '../lib/constants';

interface GraphPaperContextProps {
  selectedPointStyle: PointStyle;
  setSelectedPointStyle: (style: PointStyle) => void;
  selectedConnectPointsType: ConnectPointsType;
  setSelectedConnectPointsType: (type: ConnectPointsType) => void;
  selectedLineStyle: LineStyle;
  setSelectedLineStyle: (style: LineStyle) => void;
  selectedTwoPointFunction: TwoPointFunctionType;
  setSelectedTwoPointFunction: (func: TwoPointFunctionType) => void;
  selectedThreePointFunction: ThreePointFunctionType;
  setSelectedThreePointFunction: (func: ThreePointFunctionType) => void;
  selectedFourPointFunction: FourPointFunctionType;
  setSelectedFourPointFunction: (func: FourPointFunctionType) => void;
  selectedShadeType: ShadeType;
  setSelectedShadeType: (type: ShadeType) => void;

  selectedPoints: GraphPaperPoint[];
  addSelectedPoint: (point: GraphPaperPoint) => void;
  removeSelectedPoint: (point: GraphPaperPoint) => void;

  selectedColor: string;
  setSelectedColor: (color: string) => void;

  actions: GraphPaperAction[];
  points: GraphPaperPoint[];
  addAction: (action: GraphPaperAction) => void;
  addPoint: (point: GraphPaperPoint) => void;
  removeAction: (action: GraphPaperAction) => void;
  clearActions: () => void;
  deleteSelectedPoints: () => void;
}

const GraphPaperContext = createContext<GraphPaperContextProps | undefined>(undefined);

interface GraphPaperProviderProps {
  children: ReactNode;
}

export const GraphPaperProvider: React.FC<GraphPaperProviderProps> = ({ children }) => {
  const [actions, setActions] = useState<GraphPaperAction[]>([]);
  const [points, setPoints] = useState<GraphPaperPoint[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<GraphPaperPoint[]>([]);
  const [selectedPointStyle, setSelectedPointStyle] = useState<PointStyle>("filled");
  const [selectedConnectPointsType, setSelectedConnectPointsType] = useState<ConnectPointsType>("finite");
  const [selectedLineStyle, setSelectedLineStyle] = useState<LineStyle>("solid");
  const [selectedTwoPointFunction, setSelectedTwoPointFunction] = useState<TwoPointFunctionType>("linear");
  const [selectedThreePointFunction, setSelectedThreePointFunction] = useState<ThreePointFunctionType>("quadratic");
  const [selectedFourPointFunction, setSelectedFourPointFunction] = useState<FourPointFunctionType>("cubic");
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_OPTIONS[0].value);
  const [selectedShadeType, setSelectedShadeType] = useState<ShadeType>("above");


  // Maybe we can handle this better
  // If selected color changes, then selected points are cleared
  useEffect(() => {
    setSelectedPoints([]);
  }, [selectedColor]);
  


  const addAction = (action: GraphPaperAction) => {
    setActions(prev => [...prev, action]);
  };

  const addPoint = (point: GraphPaperPoint) => {
    setPoints(prev => [...prev, point]);
  };
  const addSelectedPoint = (point: GraphPaperPoint) =>{
    setSelectedPoints(prev => [...prev, point])
  }
  const removeSelectedPoint = (point: GraphPaperPoint) =>{
    setSelectedPoints(prev => prev.filter(p =>p.id !== point.id))
  }

  const removeAction = (action: GraphPaperAction) => {
    setActions(prev => prev.filter(a => a.timestamp !== action.timestamp));
  };


  const deleteSelectedPoints = () => {
    setPoints(prevPoints => {
      const updatedPoints = prevPoints.filter(
        point => !selectedPoints.some(selected => selected.id === point.id)
      );
  
      // Trigger rerender
      return updatedPoints;
    });
  
    setSelectedPoints([]); // Clear selected points after deletion
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
    selectedPoints,
    addSelectedPoint,
    removeSelectedPoint,
    removeAction,
    clearActions,
    deleteSelectedPoints,
    selectedPointStyle,
    setSelectedPointStyle,
    selectedConnectPointsType,
    setSelectedConnectPointsType,
    selectedLineStyle,
    setSelectedLineStyle,
    selectedTwoPointFunction,
    setSelectedTwoPointFunction,
    selectedThreePointFunction,
    setSelectedThreePointFunction,
    selectedFourPointFunction,
    setSelectedFourPointFunction,
    selectedColor,
    setSelectedColor,
    selectedShadeType,
    setSelectedShadeType
    
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