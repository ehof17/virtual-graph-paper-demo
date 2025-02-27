import { Coordinate } from "./types/graphPaper";

// https://stackoverflow.com/questions/6860853/generate-random-string-for-div-id
export function createPointID(){
    const S4 = () => {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
     };
     return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

//https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
export function capitalizeFirstLetter(val: string) {
    return val.charAt(0).toUpperCase() + val.slice(1);
}

export function formatAction(action: string) {
    return action
        .split("_")
        .map(word => capitalizeFirstLetter(word)) 
        .join(" "); 
}


export function canvasToGrid(CANVAS_SIZE: number, STEP_SIZE: number, inputX: number, inputY: number):Coordinate {
    const x = (inputX - (CANVAS_SIZE / 2)) / STEP_SIZE
    const y = ((CANVAS_SIZE / 2) - inputY) / STEP_SIZE
    return {x, y}
}
export function gridToCanvas(CANVAS_SIZE: number, STEP_SIZE: number, inputX: number, inputY: number):Coordinate {
    const x = (inputX * STEP_SIZE) + (CANVAS_SIZE / 2)
    const y = (CANVAS_SIZE / 2) - (inputY * STEP_SIZE)
    return {x,y}
}

export function hexToRgba(hexColor: string, alpha: number): string {
    const color = hexColor.replace('#', '');
    const numericValue = parseInt(color, 16);
    const r = (numericValue >> 16) & 0xff;
    const g = (numericValue >> 8) & 0xff;
    const b = numericValue & 0xff;
  
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
