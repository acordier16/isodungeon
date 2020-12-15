import { Effect } from "/js/actions.js";

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

    moveEntityIfPossible(x, y, entity) {
        var path = this.map.pathFromEntityToTile(x, y, entity);
        if (path.length > 0 && path.length <= entity.PM) {
            this.map.graph.grid[entity.x][entity.y].weight = 1;
            this.map.graph.grid[x][y].weight = 0;
            entity.move(x, y, path.length);
        }
    }

    applyActionToEntity(action, entity) {
        for (var i = 0; i < action.effects.length; i++) {
            var effect = action.effects[i];
            var clonedEffect = new Effect(
                effect.type,
                effect.duration,
                effect.allowMultiple,
                effect.probability,
                effect.deltaPV,
                effect.deltaPM,
                effect.deltaPA,
                effect.deltaPO
            ); // clone the effect to allow applying multiple times the same effect, and sampling
            clonedEffect.sample_deltas(); // samples randomness of effect if any
            entity.addEffect(clonedEffect); // add effect to entities effect
            entity.applyEffect(clonedEffect); // immediately apply effect
            this.removeEntityIfDead(entity); // remove entity if dead
        }
    }

    removeEntityIfDead(entity) {
        if (entity.PV == 0) {
            var index = this.entities.indexOf(entity);
            this.entities.splice(index, 1);
            console.log("entity", entity, "is dead");
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
                self.phase = "ENEMIES_TURN";
                for (var i = 1; i < self.entities.length; i++) {
                    // restore PA/PM at the beggining of the entity turn
                    // then remove finished effects and apply currently applying effects
                    self.entities[i].restorePMAndPA();
                    self.entities[i].updateEffects();
                    self.removeEntityIfDead(self.entities[i]);

                    // AI - go towards player
                    var tilesNextToPlayer = [
                        [self.entities[0].x - 1, self.entities[0].y],
                        [self.entities[0].x + 1, self.entities[0].y],
                        [self.entities[0].x, self.entities[0].y - 1],
                        [self.entities[0].x, self.entities[0].y + 1],
                    ];
                    var shortestPath = undefined;
                    for (var j = 0; j < tilesNextToPlayer.length; j++) {
                        // if already on a tile next to player, do nothing
                        if (
                            self.entities[i].x == tilesNextToPlayer[j][0] &&
                            self.entities[i].y == tilesNextToPlayer[j][1]
                        ) {
                            shortestPath = [];
                            break;
                        }
                        // if not try to find shortest route to player
                        if (self.isometric.isTileOnMap(tilesNextToPlayer[j][0], tilesNextToPlayer[j][1])) {
                            var path = self.map.pathFromEntityToTile(
                                tilesNextToPlayer[j][0],
                                tilesNextToPlayer[j][1],
                                self.entities[i]
                            );
                            if (shortestPath == undefined) {
                                shortestPath = path;
                            }
                            if (path.length < shortestPath.length && 0 < path.length) {
                                shortestPath = path;
                            }
                        }
                    }
                    // walk towards the player using shorted route
                    if (shortestPath.length > 0) {
                        shortestPath = shortestPath.slice(0, self.entities[i].PM);
                        var x = shortestPath[shortestPath.length - 1].x;
                        var y = shortestPath[shortestPath.length - 1].y;
                        self.moveEntityIfPossible(x, y, self.entities[i]);
                    }
                }
                // do enemy stuff
                // this to be put at the end of ennemies phase
                //
                self.phase = "PLAYER_TURN_MOVE";
                // restore PA/PM at the beggining of the entity turn
                // then remove finished effects and apply currently applying effects
                self.entities[0].restorePMAndPA();
                self.entities[0].updateEffects();
                self.removeEntityIfDead(self.entities[0]);
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
            if (self.phase == "PLAYER_TURN_MOVE") {
                if (self.isometric.isCursorOnMap()) {
                    // if entity there, draw its PM diamonds
                    var entity = self.isometric.entityAtThisPosition(
                        self.isometric.selectedTileX,
                        self.isometric.selectedTileY,
                        self.entities
                    );
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
                }
            } else if (self.phase == "PLAYER_TURN_ACTION") {
                self.isometric.drawPODiamondsForAction(self.entities[0], self.chosenAction, self.map);
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
                        self.moveEntityIfPossible(
                            self.isometric.selectedTileX,
                            self.isometric.selectedTileY,
                            self.entities[0]
                        );
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
                                self.applyActionToEntity(self.chosenAction, entity);
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
