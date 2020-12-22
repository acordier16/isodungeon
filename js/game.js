import { Effect } from "/js/actions.js";
import { addTextLineToConsole, addPositiveDurationEffectTextLineToConsole } from "/js/utils.js";

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

    splashEffect(text, x, y) {
        var context = this.isometric.context;
        var self = this;
        function fadeOut(text, x, y) {
            $("#isocanvas").off("mousemove");
            var [alpha, textYpos] = [1.0, y],
                interval = setInterval(function () {
                    // drawing the scene
                    self.isometric.drawScene(self.entities, self.map);
                    context.fillStyle = "rgba(255, 0, 0, " + alpha + ")";
                    context.font = "25pt Arial";
                    context.fillText(text, x, textYpos);
                    context.textAlign = "center";
                    textYpos -= 5;
                    alpha = alpha - 0.05; // fade out
                    if (alpha < 0) {
                        clearInterval(interval);
                        // enable back mouse moving event
                        $("#isocanvas").on("mousemove", (e) => self.mouseMoveCanvas(e));
                    }
                }, 30);
        }
        fadeOut(text, x, y);
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
            if (clonedEffect.duration > 0) {
                addPositiveDurationEffectTextLineToConsole(effect, entity.name);
            }
            entity.applyEffect(clonedEffect); // immediately apply effect

            var [offX, offY] = this.isometric.isometricToCartesian(entity.x, entity.y);
            offX += this.isometric.tileRowOffset / 2;
            offY -= entity.sprite.height / 2;

            this.splashEffect("-5", offX, offY);
            this.removeEntityIfDead(entity); // remove entity if dead
        }
    }

    removeEntityIfDead(entity) {
        if (entity.PV == 0) {
            var index = this.entities.indexOf(entity);
            this.entities.splice(index, 1);
            addTextLineToConsole("<b>".concat(entity.name, "</b> is dead."));
        }
    }

    mouseMoveInterface(e) {
        document.getElementById("console").innerHTML = "";
    }

    mouseMoveAction(e) {
        // display action info (could be in utils)
        document.getElementById("console").innerHTML = "";
        var action = this.entities[0].actions[parseInt(e.target.value) - 1];
        var actionText = "";
        actionText = actionText.concat("<div class='entity-info'>", action.name, "</div>");
        actionText = actionText.concat(
            "<div class='entity-info' style='font-size: 0.7em'>",
            action.description,
            "</div>"
        );
        actionText = actionText.concat(
            "<div class='entity-info' style='font-size: 0.7em'>Cost: ",
            action.costPA,
            " PA. Range: ",
            action.minPO,
            "-",
            action.maxPO,
            ".</div>"
        );
        document.getElementById("console").innerHTML = actionText;
    }

    mouseMoveCanvas(e) {
        var self = this;
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
    }

    clickCanvas(e) {
        var self = this;
        //self.showCoordinates = !self.showCoordinates;

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
                            addTextLineToConsole(
                                "".concat(
                                    "<b>",
                                    self.entities[0].name,
                                    "</b>",
                                    " uses <span style='font-style: italic;'>",
                                    self.chosenAction.name,
                                    "</span>."
                                )
                            );
                            self.applyActionToEntity(self.chosenAction, entity);
                        }
                        self.entities[0].PA = self.entities[0].PA - self.chosenAction.costPA;
                    } else {
                        addTextLineToConsole("Not enough action points (PA) for the desired action.");
                    }
                }
            }
        }
        self.phase = "PLAYER_TURN_MOVE";

        self.isometric.drawScene(self.entities, self.map);
    }

    run() {
        var self = this;

        var actionElements = document.getElementsByClassName("action");
        for (var i = 0; i < Math.min(self.entities[0].actions.length, actionElements.length); i++) {
            actionElements[i].style.backgroundImage = "".concat(
                "url('../",
                self.entities[0].actions[i].spritePath,
                "')"
            );
        }

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
                    addTextLineToConsole("It is ".concat("<b>", self.entities[i].name, "</b> turn now."));
                    // restore PA/PM at the beggining of the entity turn
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
                    var shortestPath = [];
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
                            if (0 < path.length) {
                                if (shortestPath.length == 0) {
                                    shortestPath = path;
                                }
                                if (path.length < shortestPath.length) {
                                    shortestPath = path;
                                }
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
                addTextLineToConsole("It is ".concat("<b>", self.entities[0].name, "</b> turn now."));
                // restore PA/PM at the beggining of the entity turn
                // then remove finished effects and apply currently applying effects
                self.entities[0].restorePMAndPA();
                self.entities[0].updateEffects();
                self.removeEntityIfDead(self.entities[0]);
            }
        };

        $(".action").on("click", action);
        $(".action").on("mousemove", (e) => self.mouseMoveAction(e));
        $("#endOfTurn").on("click", endOfTurn);
        $("#isocanvas").on("mousemove", (e) => self.mouseMoveCanvas(e));
        $("#isocanvas").on("click", (e) => self.clickCanvas(e));
        $(window).on("resize", function () {
            self.isometric.updateCanvasSize();
            self.isometric.drawScene(self.entities, self.map);
        });
        self.isometric.updateCanvasSize();
        self.isometric.drawScene(self.entities, self.map);
    }
}
