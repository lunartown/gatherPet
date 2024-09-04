import { PriorityQueue } from "../utils/priorityQueue.js";

export const PathfindingMixin = {
  // A* 알고리즘을 사용한 경로 찾기
  findPath(start, goal) {
    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    openSet.enqueue(start, 0);
    gScore.set(this.pointToString(start), 0);
    fScore.set(this.pointToString(start), this.heuristic(start, goal));

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue();

      if (current.x === goal.x && current.y === goal.y) {
        return this.reconstructPath(cameFrom, current);
      }

      closedSet.add(this.pointToString(current));

      for (const neighbor of this.getNeighbors(current)) {
        if (closedSet.has(this.pointToString(neighbor))) continue;

        const tentativeGScore = gScore.get(this.pointToString(current)) + 1;

        if (
          !openSet.includes(neighbor) ||
          tentativeGScore < gScore.get(this.pointToString(neighbor))
        ) {
          cameFrom.set(this.pointToString(neighbor), current);
          gScore.set(this.pointToString(neighbor), tentativeGScore);
          fScore.set(
            this.pointToString(neighbor),
            gScore.get(this.pointToString(neighbor)) +
              this.heuristic(neighbor, goal)
          );
          if (!openSet.includes(neighbor)) {
            openSet.enqueue(neighbor, fScore.get(this.pointToString(neighbor)));
          }
        }
      }
    }

    return [];
  },

  // 이웃 노드 가져오기
  getNeighbors(point) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];
    for (const dir of directions) {
      const newX = point.x + dir.x;
      const newY = point.y + dir.y;
      if (
        newX >= 0 &&
        newX < 126 &&
        newY >= 0 &&
        newY < 60 &&
        this.grid[newY][newX] === 1
      ) {
        neighbors.push({ x: newX, y: newY });
      }
    }
    return neighbors;
  },

  // 휴리스틱 함수
  heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  },

  // 경로 재구성
  reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom.has(this.pointToString(current))) {
      current = cameFrom.get(this.pointToString(current));
      path.unshift(current);
    }
    return path;
  },
};
