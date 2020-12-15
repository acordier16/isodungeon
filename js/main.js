import { Game } from "/js/game.js";
import { Isometric } from "/js/isometric.js";
import { Entity } from "/js/entities.js";
import { Action, Effect } from "/js/actions.js";
import { Map } from "/js/maps.js";
var isometric = new Isometric();
// TO DO: make this a dico 0: "tile.png"?
var tiles = [
    "images/land.png", //0
    "images/water.png", //1
];
var map = [
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
];
var blockingIds = [1];
var map = new Map(tiles, map, blockingIds);
var action1 = new Action(
    "Corps-à-corps",
    2,
    "cross",
    1,
    1,
    // costPA, POmin, POmax
    //[new Effect("definitive", 0, true, 1, [-3, -1], 0, 0, 0)]
    [new Effect("definitive", 0, true, 1, -1, 0, 0, 0)]
);
// type, duration, allowMultiple, probability, PV, PM, PA, PO
var action2 = new Action("Ralentissement", 2, "diamond", 3, 5, [new Effect("temporary", 3, true, 1, 0, 0, -2, 0)]);
var action3 = new Action("Poison", 2, "diamond", 3, 5, [new Effect("definitive", 3, false, 1, -5, 0, 0, 0)]);

var hero = new Entity(1, 4, "hero", true, "images/hero.png", 60, 6, 3, 0, [action1, action2, action3]);
var enemy = new Entity(2, 4, "monster", false, "images/hero.png", 20, 6, 2, 0, []);
var entities = [hero, enemy];
//var endOfTurnButton = new Button(-2, 11, "End of turn", "images/uipack-rpg/PNG/buttonLong_blue.png", "images/uipack-rpg/PNG/buttonLong_blue_pressed.png");
var buttons = [];
var game = new Game(isometric, entities, buttons, map);
game.load();
