import { displayEntityInfo } from "/js/utils.js";

// The isometric tile renderer
export class Isometric {
    constructor() {
        this.tileColumnOffset = 100; // pixels
        this.tileRowOffset = 50; // pixels
        this.originX = 0; // offset from left
        this.originY = 0; // offset from top
        this.Xtiles = 0; // Number of tiles in X-dimension
        this.Ytiles = 0; // Number of tiles in Y-dimension
        this.selectedTileX = 0;
        this.selectedTileY = 0;
        this.context = undefined;
        this.canvas = undefined;
        this.graph = undefined;
        this.tileImages = undefined;
        this.showCoordinates = false;
    }

    load(map) {
        this.canvas = $("#isocanvas");
        this.context = this.canvas[0].getContext("2d");
        this.Xtiles = map.mapArray.length;
        this.Ytiles = map.mapArray[0].length;
        this.tileImages = new Array();
        for (var i = 0; i < map.tiles.length; i++) {
            this.tileImages[i] = new Image();
            this.tileImages[i].src = map.tiles[i];
        }
    }

    // to put in utils
    entityAtThisPosition(x, y, entities) {
        for (var i = 0; i < entities.length; i++) {
            if (x == entities[i].x && y == entities[i].y) {
                return entities[i];
            }
        }
        return null;
    }

    // in action.js
    getPODiamondsForAction(entity, action, map) {
        var PODiamondsTiles = [];
        for (var Xi = 0; Xi < map.mapArray.length; Xi++) {
            for (var Yi = 0; Yi < map.mapArray[0].length; Yi++) {
                if (entity.tileWithinActionRange(Xi, Yi, action)) {
                    PODiamondsTiles.push([Xi, Yi]);
                }
            }
        }
        return PODiamondsTiles;
    }

    // in entity.js
    getPMDiamondsForEntity(entity, map) {
        var PMDiamondsTiles = [];
        for (var Xi = 0; Xi < map.mapArray.length; Xi++) {
            for (var Yi = 0; Yi < map.mapArray[0].length; Yi++) {
                var path = map.pathFromEntityToTile(Xi, Yi, entity);
                if (path.length > 0 && path.length <= entity.PM) {
                    PMDiamondsTiles.push([Xi, Yi]);
                }
            }
        }
        return PMDiamondsTiles;
    }

    isometricToCartesian(x, y) {
        return [
            (x * this.tileColumnOffset) / 2 + (y * this.tileColumnOffset) / 2 + this.originX,
            (y * this.tileRowOffset) / 2 - (x * this.tileRowOffset) / 2 + this.originY,
        ];
    }

    updateCanvasSize() {
        var width = $(window).width();
        var height = $(window).height() - 250;

        this.context.canvas.width = width;
        this.context.canvas.height = height;

        this.originX = width / 2 - (this.Xtiles * this.tileColumnOffset) / 2;
        this.originY = height / 2;
    }

    isCursorOnMap() {
        return (
            this.selectedTileX >= 0 &&
            this.selectedTileX < this.Xtiles &&
            this.selectedTileY >= 0 &&
            this.selectedTileY < this.Ytiles
        );
    }

    isTileOnMap(x, y) {
        return x >= 0 && x < this.Xtiles && y >= 0 && y < this.Ytiles;
    }

    drawTile(Xi, Yi, imageIndex) {
        var offX = (Xi * this.tileColumnOffset) / 2 + (Yi * this.tileColumnOffset) / 2 + this.originX;
        var offY = (Yi * this.tileRowOffset) / 2 - (Xi * this.tileRowOffset) / 2 + this.originY;

        this.context.drawImage(this.tileImages[imageIndex], offX, offY);

        if (this.showCoordinates) {
            this.context.fillStyle = "orange";
            this.context.fillText(
                Xi + ", " + Yi,
                offX + this.tileColumnOffset / 2 - 9,
                offY + this.tileRowOffset / 2 + 3
            );
        }
    }

    drawDiamond(Xi, Yi, color) {
        var fill = true;
        var fillColor = color;
        var fillAlpha = 0.5;

        var offX = (Xi * this.tileColumnOffset) / 2 + (Yi * this.tileColumnOffset) / 2 + this.originX;
        var offY = (Yi * this.tileRowOffset) / 2 - (Xi * this.tileRowOffset) / 2 + this.originY;

        color = typeof color !== "undefined" ? color : "white";
        this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.moveTo(offX, offY + this.tileRowOffset / 2, offX + this.tileColumnOffset / 2, offY, color);
        this.context.lineTo(
            offX + this.tileColumnOffset / 2,
            offY,
            offX + this.tileColumnOffset,
            offY + this.tileRowOffset / 2,
            color
        );
        this.context.lineTo(
            offX + this.tileColumnOffset,
            offY + this.tileRowOffset / 2,
            offX + this.tileColumnOffset / 2,
            offY + this.tileRowOffset,
            color
        );
        this.context.lineTo(
            offX + this.tileColumnOffset / 2,
            offY + this.tileRowOffset,
            offX,
            offY + this.tileRowOffset / 2,
            color
        );
        this.context.closePath();
        if (fill) {
            this.context.globalAlpha = fillAlpha;
            this.context.fillStyle = fillColor;
            this.context.fill();
        }
        this.context.stroke();
        this.context.lineWidth = 2;
        this.context.globalAlpha = 1;
    }

    drawEntity(entity) {
        var offX =
            (entity.x * this.tileColumnOffset) / 2 +
            (entity.y * this.tileColumnOffset) / 2 +
            this.originX +
            entity.sprite.width / 2;
        var offY =
            (entity.y * this.tileRowOffset) / 2 -
            (entity.x * this.tileRowOffset) / 2 +
            this.originY -
            entity.sprite.height / 2 -
            this.tileRowOffset / 2;
        this.context.drawImage(entity.sprite, offX, offY);
    }

    cleanCanvas() {
        this.context.canvas.width = this.context.canvas.width;
    }

    redrawScene(entities, map, phase, chosenAction) {
        this.cleanCanvas();

        // pre-computing path to target cell and PO diamonds
        var entityAtTargetedCell = null;
        var pathToTargetedCell = [];
        var PMDiamondsTiles = [];
        var PODiamondsTiles = [];
        var selectedTileColor = "orange";
        if (this.isCursorOnMap()) {
            if (phase == "PLAYER_TURN_MOVE") {
                entityAtTargetedCell = this.entityAtThisPosition(this.selectedTileX, this.selectedTileY, entities);
                if (entityAtTargetedCell == null) {
                    pathToTargetedCell = map.pathFromEntityToTileWithEntityPMConstraint(
                        this.selectedTileX,
                        this.selectedTileY,
                        entities[0]
                    );
                    pathToTargetedCell = pathToTargetedCell.map((element) => [element.x, element.y]);
                } else {
                    PMDiamondsTiles = this.getPMDiamondsForEntity(entityAtTargetedCell, map);
                    // display entity info
                    displayEntityInfo(entityAtTargetedCell);
                }
            } else if (phase == "PLAYER_TURN_ACTION") {
                PODiamondsTiles = this.getPODiamondsForAction(entities[0], chosenAction, map);
                selectedTileColor = "blue";
            }
        }

        //drawing of tiles (respecting z-order), looping from cartesian-top to cartesian-bottom from cartesian-left to cartesian-right
        var N = Math.max(this.Xtiles, this.Ytiles);
        for (var i = 0; i < 2 * N - 1; i++) {
            var coordinatesList = new Array(i + 1).fill(0).map((x, j) => [N - i + j - 1, j]);
            coordinatesList = coordinatesList.filter(
                (coordinate) =>
                    0 <= coordinate[0] &&
                    coordinate[0] < this.Xtiles &&
                    0 <= coordinate[1] &&
                    coordinate[1] < this.Ytiles
            );
            // coordinatesList will successively be (for a map of size (10, 10)):
            // [[9, 0]] top tile
            // [[8, 0], [9, 1]]
            // [[7, 0], [8, 1], [9, 2]]
            // [[6, 0], [7, 1], [8, 2], [9, 3]]
            // etc. until bottom
            for (var j = 0; j < coordinatesList.length; j++) {
                var [x, y] = coordinatesList[j];
                var imageIndex = map.mapArray[x][y];
                // draw the tile
                this.drawTile(x, y, imageIndex);
                // draw diamond if in possible path, or in selected action range
                var isTileInPathToTargetedCell = pathToTargetedCell.find(
                    (element) => element[0] == x && element[1] == y
                );
                var isTileInPMDiamonds = PMDiamondsTiles.find((element) => element[0] == x && element[1] == y);
                var isTileInPODiamonds = PODiamondsTiles.find((element) => element[0] == x && element[1] == y);
                if (isTileInPathToTargetedCell || isTileInPMDiamonds) {
                    this.drawDiamond(x, y, "orange");
                }
                if (isTileInPODiamonds) {
                    this.drawDiamond(x, y, "blue");
                }
                // draw diamond for selected tile
                if (x == this.selectedTileX && y == this.selectedTileY) {
                    this.drawDiamond(x, y, selectedTileColor);
                }
                // draw any existing entity at tile
                var entity = this.entityAtThisPosition(x, y, entities);
                if (entity != null) {
                    this.drawEntity(entity);
                }
            }
        }
    }
}
