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