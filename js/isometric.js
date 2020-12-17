// A simple isometric tile renderer
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
        var loadedImages = 0;
        var totalImages = map.tiles.length;
        // Load all the images before we run the app
        for (var i = 0; i < map.tiles.length; i++) {
            this.tileImages[i] = new Image();
            //this.tileImages[i].onload = function() {
            //    if (++loadedImages >= totalImages) {
            //        self.run(entities, buttons, phase);
            //    }
            //};
            this.tileImages[i].src = map.tiles[i];
        }
    }

    drawEntities(entities) {
        for (var i = 0; i < entities.length; i++) {
            this.drawEntity(entities[i]);
        }
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

    drawButtons(buttons) {
        for (var i = 0; i < buttons.length; i++) {
            this.drawButton(buttons[i]);
        }
    }

    drawButton(button) {
        var off = this.isometricToCartesian(button.x, button.y);
        var offX = off[0];
        var offY = off[1];
        button.offX = offX - button.sprite.width / 2 + this.tileColumnOffset / 2;
        button.offY = offY - button.sprite.height / 2 + this.tileRowOffset / 2;
        this.context.drawImage(button.sprite, button.offX, button.offY);
        this.context.font = button.font;
        this.context.fillStyle = button.color;
        this.context.textAlign = "center";
        this.context.fillText(
            button.text,
            button.offX + button.sprite.width / 2,
            button.offY + button.sprite.height / 2 + 5
        );
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

    // to put in entity.js
    tileWithinEntityRange(x, y, entity) {
        if (Math.abs(entity.x - x) + Math.abs(entity.y - y) <= entity.PM) {
            return true;
        }
        return false;
    }

    // to put in action.js
    tileWithinActionRange(x, y, entity, action) {
        var distanceX = Math.abs(entity.x - x);
        var distanceY = Math.abs(entity.y - y);
        if (action.rangeType == "diamond") {
            if (action.minPO <= distanceX + distanceY && distanceX + distanceY <= action.maxPO) {
                return true;
            }
        } else if (action.rangeType == "cross") {
            if (
                (distanceX == 0 && action.minPO <= distanceY && distanceY <= action.maxPO) ||
                (distanceY == 0 && action.minPO <= distanceX && distanceX <= action.maxPO)
            ) {
                return true;
            }
        } else if (action.rangeType == "circle") {
            if (
                Math.pow(action.minPO, 2) <= Math.pow(distanceX, 2) + Math.pow(distanceY, 2) &&
                Math.pow(distanceX, 2) + Math.pow(distanceY, 2) <= Math.pow(action.maxPO, 2)
            ) {
                return true;
            }
        }
        // TO DO: square
        return false;
    }

    // not use map but rather dimensions of isometric scene
    drawPODiamondsForAction(entity, action, map) {
        for (var Xi = 0; Xi < map.mapArray.length; Xi++) {
            for (var Yi = 0; Yi < map.mapArray[0].length; Yi++) {
                if (this.tileWithinActionRange(Xi, Yi, entity, action)) {
                    this.drawDiamond(Xi, Yi, "blue", true, "blue", 0.5);
                }
            }
        }
    }

    // not use map but rather dimensions of isometric scene
    drawPMDiamondsForEntity(entity, map) {
        for (var Xi = 0; Xi < map.mapArray.length; Xi++) {
            for (var Yi = 0; Yi < map.mapArray[0].length; Yi++) {
                var path = map.pathFromEntityToTile(Xi, Yi, entity);
                if (path.length > 0 && path.length <= entity.PM) {
                    this.drawDiamond(Xi, Yi, "orange", true, "orange", 0.5);
                }
            }
        }
    }

    isometricToCartesian(x, y) {
        return [
            (x * this.tileColumnOffset) / 2 + (y * this.tileColumnOffset) / 2 + this.originX,
            (y * this.tileRowOffset) / 2 - (x * this.tileRowOffset) / 2 + this.originY,
        ];
    }

    displayTextTopLeft(text) {
        this.context.fillStyle = "white";
        this.context.font = "14pt Arial";
        this.context.fillText(text, 20, 30);
    }

    updateCanvasSize() {
        var width = $(window).width();
        var height = $(window).height() - 250;

        this.context.canvas.width = width;
        this.context.canvas.height = height;

        this.originX = width / 2 - (this.Xtiles * this.tileColumnOffset) / 2;
        this.originY = height / 2;
    }

    redrawTiles(entities, targetTileColor, map) {
        this.context.canvas.width = this.context.canvas.width;

        // tile background
        //for (var Xi = 30; Xi >= -10; Xi--) {
        //    for (var Yi = -10; Yi < 30; Yi++) {
        //        this.drawTile(Xi, Yi, 2);
        //    }
        //}

        for (var Xi = this.Xtiles - 1; Xi >= 0; Xi--) {
            for (var Yi = 0; Yi < this.Ytiles; Yi++) {
                var imageIndex = map.mapArray[Xi][Yi];
                this.drawTile(Xi, Yi, imageIndex);
            }
        }

        if (this.isCursorOnMap()) {
            this.drawDiamond(this.selectedTileX, this.selectedTileY, targetTileColor, true, targetTileColor, 0.75);
            this.context.fillStyle = "yellow";
            var idx = map.mapArray[this.selectedTileX][this.selectedTileY];
            this.context.font = "14pt Arial";
            var entity = this.entityAtThisPosition(this.selectedTileX, this.selectedTileY, entities);

            // DISPLAY IN RIGHT-CONSOLE
            document.getElementById("console").innerHTML = "";
            if (entity != null) {
                // display entity info
                var entityStats = "".concat(
                    entity.name,
                    "<br><span style='color:green;'>",
                    entity.PV,
                    "/",
                    entity.initialPV,
                    " PV ",
                    "</span><span style='color:blue;'>",
                    entity.PA,
                    "/",
                    entity.initialPA,
                    " PA ",
                    "</span><span style='color:orange;'>",
                    entity.PM,
                    "/",
                    entity.initialPM,
                    " PM</span>"
                );

                // display effect info
                var effectStringForDelta = function (delta, pointName) {
                    if (delta > 0) {
                        return "".concat("+", delta, " ", pointName, ", ");
                    } else if (delta < 0) {
                        return "".concat(delta, " ", pointName, ", ");
                    } else {
                        return "";
                    }
                };
                var entityEffectsStats = "";
                for (var i = 0; i < entity.effects.length; i++) {
                    var effect = entity.effects[i];
                    if (effect.type == "temporary") {
                        var effectString = "";
                        effectString = effectString.concat(effectStringForDelta(effect.deltaPV, "PV"));
                        effectString = effectString.concat(effectStringForDelta(effect.deltaPA, "PA"));
                        effectString = effectString.concat(effectStringForDelta(effect.deltaPM, "PM"));
                        effectString = effectString.concat(effectStringForDelta(effect.deltaPO, "PO"));
                        effectString = effectString.slice(0, effectString.length - 2); // remove last comma and space
                        effectString = effectString.concat(" (", effect.duration, " turn(s) left)");
                        entityEffectsStats = entityEffectsStats.concat(effectString, "<br>");
                    }
                }
                document.getElementById("console").innerHTML = entityStats.concat("<br>", entityEffectsStats);
            }
        }
    }

    isTileOnMap(x, y) {
        return x >= 0 && x < this.Xtiles && y >= 0 && y < this.Ytiles;
    }

    isCursorOnMap() {
        return (
            this.selectedTileX >= 0 &&
            this.selectedTileX < this.Xtiles &&
            this.selectedTileY >= 0 &&
            this.selectedTileY < this.Ytiles
        );
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

    drawDiamond(Xi, Yi, color, fill = false, fillColor = undefined, fillAlpha = undefined) {
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
}
