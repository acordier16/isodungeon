export class Map {
    constructor(tiles, mapArray, blockingIds) {
        this.tiles = tiles;
        this.mapArray = mapArray;
        this.blockingIds = blockingIds;
        this.graph = this.convertMapToGraph();
    }

    convertMapToGraph() {
        var graph = new Graph(this.mapArray);
        for (var i = 0; i < this.mapArray.length; i++) {
            for (var j = 0; j < this.mapArray[0].length; j++) {
                graph.grid[i][j].weight = 1;
                if (this.blockingIds.includes(this.mapArray[i][j])) {
                    graph.grid[i][j].weight = 0;
                }
            }
        }
        return graph;
    }

    loadEntitiesOnGraph(entities) {
        for (var i = 0; i < entities.length; i++) {
            this.graph.grid[entities[i].x][entities[i].y].weight = 0;
        }
    }

    pathFromEntityToTile(x, y, entity) {
        var start = this.graph.grid[entity.x][entity.y];
        var end = this.graph.grid[x][y];
        var path = astar.search(this.graph, start, end);
        return path;
    }

    pathFromEntityToTileWithEntityPMConstraint(x, y, entity) {
        var path = this.pathFromEntityToTile(x, y, entity);
        if (path.length <= entity.PM) {
            return path;
        } else {
            return [];
        }
    }
}
