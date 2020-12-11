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
        this.canvas = $('#isocanvas');
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
        var offX = entity.x * this.tileColumnOffset / 2 + entity.y * this.tileColumnOffset / 2 + this.originX + entity.sprite.width / 2;
        var offY = entity.y * this.tileRowOffset / 2 - entity.x * this.tileRowOffset / 2 + this.originY - entity.sprite.height / 2 - this.tileRowOffset / 2;
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
        this.context.textAlign = 'center';
        this.context.fillText(button.text, button.offX + button.sprite.width / 2, button.offY + button.sprite.height / 2 + 5);

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

    // to put in utils
    tileWithinEntityRange(x, y, entity) {
        if (Math.abs(entity.x - x) + Math.abs(entity.y - y) <= entity.PM) {
            return true;
        }
        return false;
    }

    drawPMDiamondsForEntity(entity, map) {
        for (var Xi = 0; Xi < map.mapArray.length; Xi++) {
            for (var Yi = 0; Yi < map.mapArray[0].length; Yi++) {
                var path = map.pathFromEntityToTile(Xi, Yi, entity);
                if (path.length > 0 && path.length <= entity.PM) {
                    this.drawDiamond(Xi, Yi, 'green', true, 'green', 0.5);
                }
            }
        }
    }

    isometricToCartesian(x, y) {
        return [x * this.tileColumnOffset / 2 + y * this.tileColumnOffset / 2 + this.originX, y * this.tileRowOffset / 2 - x * this.tileRowOffset / 2 + this.originY];
    }

    displayTextTopLeft(text) {
        this.context.fillStyle = 'white';
        this.context.font = '14pt Arial';
        this.context.fillText(text, 20, 30);
    }

    run(entities, buttons, map, phase) {
        var self = this;
        $(window).on('resize', function() {
            self.updateCanvasSize();
            self.redrawTiles(entities, "green", map);
            self.drawEntities(entities);
        });

        var endOfTurnButton = document.getElementById("endOfTurn");
        var actionButtons = document.getElementsByClassName("action");

        endOfTurnButton.onclick = endOfTurn;
        for (var i = 0; i < actionButtons.length; i++) {
            actionButtons[i].onclick = action;
        }

        function endOfTurn() {
            //alert("Evènement de click détecté");
            if (phase == "PLAYER_TURN_MOVE" || phase == "PLAYER_TURN_ACTION") {
                // phase = "ENEMY_TURN"; // change phase
                // do enemy stuff
                // this to be put at the end of ennemies phase
                entities[0].PM = entities[0].basePM;
                entities[0].PA = entities[0].basePA;
                phase = "PLAYER_TURN_MOVE";
            }
        }

        function action() {
            if (phase == "PLAYER_TURN_MOVE") {
                phase = "PLAYER_TURN_ACTION"
                self.chosenAction = entities[0].actions[parseInt(this.value - 1)];
            }
        }

        $(window).on('mousemove', function(e) {
            e.pageX = e.pageX - self.tileColumnOffset / 2 - self.originX;
            e.pageY = e.pageY - self.tileRowOffset / 2 - self.originY;
            var tileX = Math.round(e.pageX / self.tileColumnOffset - e.pageY / self.tileRowOffset);
            var tileY = Math.round(e.pageX / self.tileColumnOffset + e.pageY / self.tileRowOffset);
            self.selectedTileX = tileX;
            self.selectedTileY = tileY;

            var targetTileColor = "green";
            if (phase == "PLAYER_TURN_ACTION") {
                targetTileColor = "blue";
            }

            self.redrawTiles(entities, targetTileColor, map);
            if (self.isCursorOnMap()) {
                // if entity there, draw its PM diamonds
                var entity = self.entityAtThisPosition(self.selectedTileX, self.selectedTileY, entities)
                if (phase == "PLAYER_TURN_MOVE") {
                    if (entity != null) {
                        self.drawPMDiamondsForEntity(entity, map);
                    }
                    // else if no entity, check if within player's PM range (if player's turn, in not in action mode)
                    else {
                        var path = map.pathFromEntityToTile(self.selectedTileX, self.selectedTileY, entities[0]);
                        if (path.length > 0 && path.length <= entities[0].PM) {
                            self.drawDiamond(entities[0].x, entities[0].y, 'green', true, 'green', 0.5);
                            for (var i = 0; i < path.length; i++) {
                                self.drawDiamond(path[i].x, path[i].y, 'green', true, 'green', 0.5);
                            }
                        }
                    }
                }
            }
            self.drawEntities(entities);

            if (phase == "PLAYER_TURN_MOVE") {
                self.displayTextTopLeft("It's your turn now");
            }

        });

        $("#isocanvas").on('click', function(e) {
            //self.showCoordinates = !self.showCoordinates;
            if (phase == "PLAYER_TURN_MOVE") {
                self.displayTextTopLeft("It's your turn now");
            }

            if (phase == "PLAYER_TURN_MOVE") {
                // if cursor on map, check for path
                if (self.isCursorOnMap()) {
                    if (self.entityAtThisPosition(self.selectedTileX, self.selectedTileY, entities) == null) {
                        var path = map.pathFromEntityToTile(self.selectedTileX, self.selectedTileY, entities[0]);
                        if (path.length > 0 && path.length <= entities[0].PM) {
                            map.graph.grid[entities[0].x][entities[0].y].weight = 1
                            entities[0].x = self.selectedTileX;
                            entities[0].y = self.selectedTileY;
                            map.graph.grid[entities[0].x][entities[0].y].weight = 0
                            entities[0].PM = entities[0].PM - path.length
                        }
                    }
                }
            }

            if (phase == "PLAYER_TURN_ACTION") {
                if (self.isCursorOnMap()) {
                    var entity = self.entityAtThisPosition(self.selectedTileX, self.selectedTileY, entities);
                    if (self.chosenAction.costPA <= entities[0].PA) {
                        if (entity != null) {
                            self.applyActionToEntity(self.chosenAction, entity)
                        }
                        entities[0].PA = entities[0].PA - self.chosenAction.costPA
                    } else {
                        self.displayTextTopLeft("Not enough action points (PA)");
                        console.log("Not enough action points (PA)");
                    }
                }
            }
            phase = "PLAYER_TURN_MOVE";

            self.redrawTiles(entities, "green", map);
            self.drawEntities(entities);
        });

        this.updateCanvasSize();
        this.redrawTiles(entities, "green", map);
        this.drawEntities(entities);
    }


    updateCanvasSize() {
        var width = $(window).width();
        var height = $(window).height() - 120;

        this.context.canvas.width = width;
        this.context.canvas.height = height;

        this.originX = width / 2 - this.Xtiles * this.tileColumnOffset / 2;
        this.originY = height / 2;
    }

    redrawTiles(entities, targetTileColor, map) {
        this.context.canvas.width = this.context.canvas.width;

        for (var Xi = (this.Xtiles - 1); Xi >= 0; Xi--) {
            for (var Yi = 0; Yi < this.Ytiles; Yi++) {
                var imageIndex = map.mapArray[Xi][Yi];
                this.drawTile(Xi, Yi, imageIndex);
            }
        }
        this.drawDiamond(this.selectedTileX, this.selectedTileY, targetTileColor, true, targetTileColor, 0.75);
        if (this.isCursorOnMap()) {
            this.context.fillStyle = 'yellow';
            var idx = map.mapArray[this.selectedTileX][this.selectedTileY];
            this.context.font = '14pt Arial';
            var entity = this.entityAtThisPosition(this.selectedTileX, this.selectedTileY, entities)
            if (entity != null) {
                this.context.fillText(entity.name.concat(", ", entity.PV, "/", entity.basePV, " PV, ", entity.PA, "/", entity.basePA, " PA, ", entity.PM, "/", entity.basePM, " PM"), 20, 60);
            }
        }
    }

    isCursorOnMap() {
        return (this.selectedTileX >= 0 && this.selectedTileX < this.Xtiles &&
            this.selectedTileY >= 0 && this.selectedTileY < this.Ytiles);
    }

    drawTile(Xi, Yi, imageIndex) {
        var offX = Xi * this.tileColumnOffset / 2 + Yi * this.tileColumnOffset / 2 + this.originX;
        var offY = Yi * this.tileRowOffset / 2 - Xi * this.tileRowOffset / 2 + this.originY;

        this.context.drawImage(this.tileImages[imageIndex], offX, offY);

        if (this.showCoordinates) {
            this.context.fillStyle = 'orange';
            this.context.fillText(Xi + ", " + Yi, offX + this.tileColumnOffset / 2 - 9, offY + this.tileRowOffset / 2 + 3);
        }
    }

    drawDiamond(Xi, Yi, color, fill = false, fillColor = undefined, fillAlpha = undefined) {
        var offX = Xi * this.tileColumnOffset / 2 + Yi * this.tileColumnOffset / 2 + this.originX;
        var offY = Yi * this.tileRowOffset / 2 - Xi * this.tileRowOffset / 2 + this.originY;

        color = typeof color !== 'undefined' ? color : 'white';
        this.context.strokeStyle = color;
        this.context.beginPath()
        this.context.moveTo(offX, offY + this.tileRowOffset / 2, offX + this.tileColumnOffset / 2, offY, color);
        this.context.lineTo(offX + this.tileColumnOffset / 2, offY, offX + this.tileColumnOffset, offY + this.tileRowOffset / 2, color);
        this.context.lineTo(offX + this.tileColumnOffset, offY + this.tileRowOffset / 2, offX + this.tileColumnOffset / 2, offY + this.tileRowOffset, color);
        this.context.lineTo(offX + this.tileColumnOffset / 2, offY + this.tileRowOffset, offX, offY + this.tileRowOffset / 2, color);
        this.context.closePath()
        if (fill) {
            this.context.globalAlpha = fillAlpha;
            this.context.fillStyle = fillColor;
            this.context.fill()
        }
        this.context.stroke();
        this.context.lineWidth = 2;
        this.context.globalAlpha = 1;
    }
};

export class Game {
    constructor(isometric, entities, buttons, map) {
        this.isometric = isometric;
        this.entities = entities;
        this.buttons = buttons;
        this.map = map
        this.phase = "PLAYER_TURN_MOVE";
    }

    load() {

        this.chosenAction = undefined;
        this.map.loadEntitiesOnGraph(this.entities);
        this.isometric.load(this.map);
        this.isometric.run(this.entities, this.buttons, this.map, this.phase);
    }

    applyActionToEntity(action, entity) {
        entity.PV = Math.max(entity.PV - action.damages, 0);
        if (entity.PV == 0) {
            var index = this.entities.indexOf(entity);
            this.entities.splice(index, 1); // remove entity
            console.log("entity is dead");
        }
    }
}
