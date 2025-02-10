// TypesSelector.tsx
import React from 'react';
import { useGraphPaper } from '../../../contexts/GraphPaperContext';
import { PointStyle, ConnectPointsType, LineStyle} from '../../../lib/types/graphPaper'
import styles from '../../styles/TypesSelector.module.css';
import { formatAction } from '@/lib/utils';
interface TypesSelectorProps {
  type: "point_style" | "connection_type" | "line_style";
}


const availableOptions = {
  pointStyle: ["filled", "unfilled"] as PointStyle[],
  connectPointsType: ["line_segment", "ray", "line_from_points"] as ConnectPointsType[],
  lineStyle: ["solid", "dashed", "dotted", "broken"] as LineStyle[],
};

const TypesSelector: React.FC<TypesSelectorProps> = ({ type }) => {
  const {
    selectedPointStyle,
    setSelectedPointStyle,
    selectedConnectPointsType,
    setSelectedConnectPointsType,
    selectedLineStyle,
    setSelectedLineStyle,
  } = useGraphPaper();


  let selected, options;
  if (type === "point_style") {
    selected = selectedPointStyle;
    options = availableOptions.pointStyle;
  } else if (type === "connection_type") {
    selected = selectedConnectPointsType;
    options = availableOptions.connectPointsType;
  } else {
    selected = selectedLineStyle;
    options = availableOptions.lineStyle;
  }

  return (
    <div className ={styles.outer} >
        <h4> {formatAction(type)} </h4>
        <div className={styles.selector} >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => {
            if (type === "point_style") {
              setSelectedPointStyle(option as PointStyle);
            } else if (type === "connection_type") {
              setSelectedConnectPointsType(option as ConnectPointsType);
            } else {
              setSelectedLineStyle(option as LineStyle);
            }
          }}
          className={selected === option ? styles.selected : styles.unselected}
        >

          {formatAction(option)}
        </button>
      ))}
    </div>
    </div>
  );
};

export default TypesSelector;