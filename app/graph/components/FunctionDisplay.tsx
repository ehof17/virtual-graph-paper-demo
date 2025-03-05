"use client";
import React from "react";
import styles from "../../styles/ErrorModal.module.css";
import { FunctionParams } from "@/lib/types/graphPaper";
interface FunctionDisplay {
  params: FunctionParams;
}
const round = (num: number|undefined, places: number = 4) =>{
    if (num === undefined) {return 0};
    return Math.round(num * 10 ** places) / 10 ** places;
}

const FunctionDisplay: React.FC<FunctionDisplay> = ({ params }) => {
    let func = ""
  
    switch (params.type) {
        case "quadratic":
            func = `f(x) = ${params.A}x^2 + ${params.B}x + ${params.C}`;
            break;
        case "absolute_value":
            func = `f(x) = ${params.A}|x + ${params.H}| + ${params.K}`;
            break;
        case "square_root":
            func = `f(x) = ${round(params.A)} * sqrt(x + ${round(params.B)}) + ${round(params.C)}`;
            break;
        case "linear":
            func = `f(x) = ${params.M}x + ${params.B}`;
            break;
        case "cubic":
            func = `f(x) = ${params.A}x^3 + ${params.B}x^2 + ${params.C}x + ${params.D}`;
            break;
        default:
            func = "Invalid function type";
    }
    return (
      <div className={styles.functionDisplay}>
        <p className={styles.functionText}>{func}</p>
      </div>
    );
  };
  
  export default FunctionDisplay;
