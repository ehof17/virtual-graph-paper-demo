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




  // This  stuff not used right now. Maybe never

  
// export function allSelectedPointsAreConnected(selectedPoints: GraphPaperPoint[],adjacency: Map<string, Set<string>>): boolean {
    
    
//     if (selectedPoints.length < 2) return true;
  
//     const [firstPoint, ...rest] = selectedPoints;
//     const visited = new Set<string>();
//     const stack = [firstPoint.id];
  
//     while (stack.length > 0) {
//       const currentId = stack.pop()!;
//       if (!visited.has(currentId)) {
//         visited.add(currentId);
//         const neighbors = adjacency.get(currentId) || new Set();
//         neighbors.forEach((neighborId) => {
//           if (!visited.has(neighborId)) {
//             stack.push(neighborId);
//           }
//         });
//       }
//     }
  

//     return rest.every((p) => visited.has(p.id));
//   }

// export function buildAdjacencyMap(actions: GraphPaperAction[]): Map<string, Set<string>> {
//     // adjacency map: pointId -> set of neighbor pointIds
//     const adjacency = new Map<string, Set<string>>();
//     // Helper to register neighbors
//     function addNeighbor(a: string, b: string) {
//       if (!adjacency.has(a)) {
//         adjacency.set(a, new Set());
//       }
//       adjacency.get(a)?.add(b);
//     }
  
//     actions.forEach((action) => {
//       if (
//         action.actionType === 'connect_2_points' ||
//         action.actionType === 'connect_3_points' ||
//         action.actionType === 'connect_4_points'
//       ) {
//         const pts = action.points;
//         if (pts && pts.length > 1) {
//           for (let i = 0; i < pts.length; i++) {
//             for (let j = i + 1; j < pts.length; j++) {
//               addNeighbor(pts[i].id, pts[j].id);
//               addNeighbor(pts[j].id, pts[i].id);
//             }
//           }
//         }
//       }
//     });
  
//     return adjacency;
//   }


//   export interface NeighborEdge {
//     neighborId: string;
//     action: GraphPaperAction; // the connect_x_points action that links these two points
//   }
  
//   function buildAdjacencyMapWithActions(
//     actions: GraphPaperAction[]
//   ): Map<string, NeighborEdge[]> {
//     const adjacency = new Map<string, NeighborEdge[]>();
  
//     // Helper to add neighbor
//     function addNeighbor(a: string, b: string, action: GraphPaperAction) {
//       if (!adjacency.has(a)) {
//         adjacency.set(a, []);
//       }
//       adjacency.get(a)?.push({ neighborId: b, action });
//     }
  
//     for (const act of actions) {
//       if (
//         act.actionType === 'connect_2_points' ||
//         act.actionType === 'connect_3_points' ||
//         act.actionType === 'connect_4_points'
//       ) {
//         const pts = act.points;
//         if (pts && pts.length > 1) {
//           // For every pair of points in this action, link them
//           for (let i = 0; i < pts.length; i++) {
//             for (let j = i + 1; j < pts.length; j++) {
//               const aId = pts[i].id;
//               const bId = pts[j].id;
//               addNeighbor(aId, bId, act);
//               addNeighbor(bId, aId, act);
//             }
//           }
//         }
//       }
//     }
  
//     return adjacency;
//   }
//   export function findAllConnectionActionsForSelected(
//     selectedPoints: GraphPaperPoint[],
//     allActions: GraphPaperAction[]
//   ): GraphPaperAction[] | null {
//     if (selectedPoints.length <= 1) {
//       // With 1 or 0 points, no "connection" is really needed
//       return [];
//     }
  
//     // 1) Build the adjacency map
//     const adjacency = buildAdjacencyMapWithActions(allActions);
  
//     const visited = new Set<string>();
//     const actionsUsed = new Set<GraphPaperAction>();
//     const queue: string[] = [];
  
//     const startId = selectedPoints[0].id;
//     queue.push(startId);
//     visited.add(startId);
  
//     while (queue.length > 0) {
//       const currentId = queue.shift()!;
//       const edges = adjacency.get(currentId) || [];
  
//       for (const { neighborId, action } of edges) {
//         if (!visited.has(neighborId)) {
//           visited.add(neighborId);
//           actionsUsed.add(action);
//           queue.push(neighborId);
//         }
//       }
//     }
  
//     const allSelectedVisited = selectedPoints.every((p) => visited.has(p.id));
//     if (!allSelectedVisited) {
//       return null;
//     }
  
//     return Array.from(actionsUsed);
//   }

