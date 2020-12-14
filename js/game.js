import { Effect } from "/actions.js";

export class Game {
    constructor(isometric, entities, buttons, map) {
        this.isometric = isometric;
        this.entities = entities;
        this.buttons = buttons;
        this.map = map;
        this.phase = "PLAYER_TURN_MOVE";
    }

    load() {
        this.chosenAction = undefined;
        this.map.loadEntitiesOnGraph(this.entities);
        this.isometric.load(this.map);

        //var endOfTurnButton = document.getElementById("endOfTurn");
        var actionButtons = document.getElementsByClassName("action");
        //endOfTurnButton.onclick = this.endOfTurn;
        for (var i = 0; i < actionButtons.length; i++) {
            actionButtons[i].onclick = this.action;
        }

        this.run();
    }

    applyActionToEntity(action, entity) {
        for (var i = 0; i < action.effects.length; i++) {
            var effect = action.effects[i];
            //var clonedEffect = JSON.parse(JSON.stringify(effect)); // this is to allow applying multiple times the same effect
            var clonedEffect = new Effect(
                effect.type,
                effect.duration,
                effect.allowMultiple,
                effect.probability,
                effect.deltaPV,
                effect.deltaPM,
                effect.deltaPA,
                effect.deltaPO
            );
            entity.addEffect(clonedEffect);
        }

        // this checks needs to be somewhere else (like after applying effects)
        if (entity.PV == 0) {
            var index = this.entities.indexOf(entity);
            this.entities.splice(index, 1); // remove entity
            console.log("entity is dead");
        }
    }

    run() {
        var self = this;

        var action = function () {
            if (self.phase == "PLAYER_TURN_MOVE" || self.phase == "PLAYER_TURN_ACTION") {
                self.phase = "PLAYER_TURN_ACTION";
                self.chosenAction = self.entities[0].actions[parseInt(this.value - 1)];
            }
        };

        var endOfTurn = function () {
            if (self.phase == "PLAYER_TURN_MOVE" || self.phase == "PLAYER_TURN_ACTION") {
                // phase = "ENEMY_TURN"; // change phase
                // do enemy stuff
                // this to be put at the end of ennemies phase
                self.entities[0].PM = self.entities[0].basePM;
                self.entities[0].PA = self.entities[0].basePA;
                self.phase = "PLAYER_TURN_MOVE";
                for (var i = 0; i < self.entities.length; i++) {
                    self.entities[i].applyDefinitiveEffects(true);
                    self.entities[i].applyTemporaryEffects(true);
                }
            }
        };

        // button clicking
        $(".action").on("click", action);
        $("#endOfTurn").on("click", endOfTurn);

        // resize event
        $(window).on("resize", function () {
            self.isometric.updateCanvasSize();
            self.isometric.redrawTiles(self.entities, "orange", self.map);
            self.isometric.drawEntities(self.entities);
        });

        // mousemouve event
        $("#isocanvas").on("mousemove", function (e) {
            e.pageX = e.pageX - self.isometric.tileColumnOffset / 2 - self.isometric.originX;
            e.pageY = e.pageY - self.isometric.tileRowOffset / 2 - self.isometric.originY;
            self.isometric.selectedTileX = Math.round(
                e.pageX / self.isometric.tileColumnOffset - e.pageY / self.isometric.tileRowOffset
            );
            self.isometric.selectedTileY = Math.round(
                e.pageX / self.isometric.tileColumnOffset + e.pageY / self.isometric.tileRowOffset
            );

            var targetTileColor = "orange";
            if (self.phase == "PLAYER_TURN_ACTION") {
                targetTileColor = "blue";
            }

            self.isometric.redrawTiles(self.entities, targetTileColor, self.map);
            if (self.isometric.isCursorOnMap()) {
                // if entity there, draw its PM diamonds
                var entity = self.isometric.entityAtThisPosition(
                    self.isometric.selectedTileX,
                    self.isometric.selectedTileY,
                    self.entities
                );
                if (self.phase == "PLAYER_TURN_MOVE") {
                    if (entity != null) {
                        self.isometric.drawPMDiamondsForEntity(entity, self.map);
                    }
                    // else if no entity, check if within player's PM range (if player's turn, in not in action mode)
                    else {
                        var path = self.map.pathFromEntityToTile(
                            self.isometric.selectedTileX,
                            self.isometric.selectedTileY,
                            self.entities[0]
                        );
                        if (path.length > 0 && path.length <= self.entities[0].PM) {
                            self.isometric.drawDiamond(
                                self.entities[0].x,
                                self.entities[0].y,
                                "orange",
                                true,
                                "orange",
                                0.5
                            );
                            for (var i = 0; i < path.length; i++) {
                                self.isometric.drawDiamond(path[i].x, path[i].y, "orange", true, "orange", 0.5);
                            }
                        }
                    }
                } else if (self.phase == "PLAYER_TURN_ACTION") {
                    self.isometric.drawPODiamondsForAction(self.entities[0], self.chosenAction, self.map);
                }
            }
            self.isometric.drawEntities(self.entities);

            if (self.phase == "PLAYER_TURN_MOVE") {
                self.isometric.displayTextTopLeft("It's your turn now");
            }
        });

        $("#isocanvas").on("click", function (e) {
            //self.showCoordinates = !self.showCoordinates;
            if (self.phase == "PLAYER_TURN_MOVE") {
                self.isometric.displayTextTopLeft("It's your turn now");
            }

            if (self.phase == "PLAYER_TURN_MOVE") {
                // if cursor on map, check for path
                if (self.isometric.isCursorOnMap()) {
                    if (
                        self.isometric.entityAtThisPosition(
                            self.isometric.selectedTileX,
                            self.isometric.selectedTileY,
                            self.entities
                        ) == null
                    ) {
                        var path = self.map.pathFromEntityToTile(
                            self.isometric.selectedTileX,
                            self.isometric.selectedTileY,
                            self.entities[0]
                        );
                        if (path.length > 0 && path.length <= self.entities[0].PM) {
                            self.map.graph.grid[self.entities[0].x][self.entities[0].y].weight = 1;
                            self.entities[0].x = self.isometric.selectedTileX;
                            self.entities[0].y = self.isometric.selectedTileY;
                            self.map.graph.grid[self.entities[0].x][self.entities[0].y].weight = 0;
                            self.entities[0].PM = self.entities[0].PM - path.length;
                        }
                    }
                }
            }

            if (self.phase == "PLAYER_TURN_ACTION") {
                if (self.isometric.isCursorOnMap()) {
                    if (
                        self.isometric.tileWithinActionRange(
                            self.isometric.selectedTileX,
                            self.isometric.selectedTileY,
                            self.entities[0],
                            self.chosenAction
                        )
                    ) {
                        var entity = self.isometric.entityAtThisPosition(
                            self.isometric.selectedTileX,
                            self.isometric.selectedTileY,
                            self.entities
                        );
                        if (self.chosenAction.costPA <= self.entities[0].PA) {
                            if (entity != null) {
                                // applies definitive effect, add temporary effects
                                self.applyActionToEntity(self.chosenAction, entity);
                                //entity.applyDefinitiveEffects(false);
                                //entity.applyTemporaryEffects(false);
                            }
                            self.entities[0].PA = self.entities[0].PA - self.chosenAction.costPA;
                        } else {
                            self.isometric.displayTextTopLeft("Not enough action points (PA)");
                            console.log("Not enough action points (PA)");
                        }
                    }
                }
            }
            self.phase = "PLAYER_TURN_MOVE";

            self.isometric.redrawTiles(self.entities, "orange", self.map);
            self.isometric.drawEntities(self.entities);
        });

        this.isometric.updateCanvasSize();
        this.isometric.redrawTiles(this.entities, "orange", this.map);
        this.isometric.drawEntities(this.entities);
    }
}
