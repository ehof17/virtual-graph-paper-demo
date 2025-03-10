// TypesSelector.tsx
import React from 'react';
import { useGraphPaper } from '../../../contexts/GraphPaperContext';
import { PointStyle, ConnectPointsType, LineStyle, TwoPointFunctionType, ThreePointFunctionType, FourPointFunctionType, ShadeType} from '../../../lib/types/graphPaper'
import styles from '../../styles/TypesSelector.module.css';
import { formatAction } from '@/lib/utils';
interface TypesSelectorProps {
  type: "point_style" | "connection_type" | "line_style" | "two_function_style" | "three_function_style" | "four_function_style" | "shade_style";
}


const availableOptions = {
  pointStyle: ["filled", "unfilled"] as PointStyle[],
  connectPointsType: ["continuous", "semi_infinite", "finite"] as ConnectPointsType[],
  lineStyle: ["solid", "dashed", "dotted"] as LineStyle[],
  // todo: add sqrt here
  twoPointFunction: ["linear"] as TwoPointFunctionType[],
  threePointFunction: ["quadratic",  "absolute_value", "square_root"] as ThreePointFunctionType[],
  fourPointFunction: ["cubic"] as FourPointFunctionType[],

  shadeStyle: ["above", "below"] as ShadeType[],
};

const TypesSelector: React.FC<TypesSelectorProps> = ({ type }) => {
  const {
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
    selectedShadeType,
    setSelectedShadeType
  } = useGraphPaper();


  let selected, options;
  if (type === "point_style") {
    selected = selectedPointStyle;
    options = availableOptions.pointStyle;
  } else if (type === "connection_type") {
    selected = selectedConnectPointsType;
    options = availableOptions.connectPointsType;
  } else if (type === "line_style") {
    selected = selectedLineStyle;
    options = availableOptions.lineStyle;
  }
  else if (type == "two_function_style") {
    selected = selectedTwoPointFunction;
    options = availableOptions.twoPointFunction;
  }
  else if (type == "three_function_style") {
    selected = selectedThreePointFunction;
    options = availableOptions.threePointFunction;
  }
  else if (type == "four_function_style") {
    selected = selectedFourPointFunction;
    options = availableOptions.fourPointFunction;
  }
  else {
    selected = selectedShadeType;
    options = availableOptions.shadeStyle;
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
            } else if (type === "line_style") {
              setSelectedLineStyle(option as LineStyle);
            }
            else if (type === "two_function_style") {
              setSelectedTwoPointFunction(option as TwoPointFunctionType);
            }
            else if (type === "three_function_style") {
              setSelectedThreePointFunction(option as ThreePointFunctionType);
            }
            else if (type == "four_function_style") {
              setSelectedFourPointFunction(option as FourPointFunctionType);
            }
            else if (type == "shade_style") {
               setSelectedShadeType(option as ShadeType);
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