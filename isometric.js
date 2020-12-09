// A simple isometric tile renderer
var Isometric = {
  tileColumnOffset: 100, // pixels
  tileRowOffset: 50, // pixels

  originX: 0, // offset from left
  originY: 0, // offset from top

  Xtiles: 0, // Number of tiles in X-dimension
  Ytiles: 0, // Number of tiles in Y-dimension

  selectedTileX: -1,
  selectedTileY: -1,

  context: undefined,
  canvas: undefined,

  hero: new Entity(x=1, y=4, name="hero", isPlayer=true, spritePath="images/hero.png", basePV=60, basePA=6, basePM=3),
  enemy: new Entity(x=2, y=4, name="monster", isPlayer=false, spritePath="images/hero.png", basePV=20, basePA=6, basePM=2),
  entities: [],
  graph: undefined,

  tileImages: undefined,

  showCoordinates: false,

  load: function() {
    this.entities = [this.hero, this.enemy]
    this.graph = this.convertMapToGraph(IsometricMap.map, IsometricMap.blockingIds);
    for (var i = 0; i < this.entities.length; i++) {
      this.graph.grid[this.entities[i].x][this.entities[i].y].weight = 0;
    }

    this.tileImages = new Array();
    var loadedImages = 0;
    var totalImages = IsometricMap.tiles.length;

    // Load all the images before we run the app
    var self = this;
    for(var i = 0; i < IsometricMap.tiles.length; i++) {
      this.tileImages[i] = new Image();
      this.tileImages[i].onload = function() {
        if(++loadedImages >= totalImages) {
          self.run();
        }
      };
      this.tileImages[i].src = IsometricMap.tiles[i];
    }
  },

  drawEntities: function() {
    for(var i =0; i < this.entities.length; i++) {
      this.entities[i].draw();
    }
  },

  entityAtThisPosition: function(x, y) {
    for(var i =0; i < this.entities.length; i++) {
      if (x == this.entities[i].x && y == this.entities[i].y){
         return this.entities[i];
      }
    }
    return null;
  },

  tileWithinEntityRange: function(x, y, entity) {
    if (Math.abs(entity.x - x) + Math.abs(entity.y - y) <= entity.PM) {
      return true;
    }
    return false;
  },

  drawPMDiamondsForEntity: function(entity) {
    for(var Xi = (entity.x - entity.PM); Xi <= (entity.x + entity.PM); Xi++) {
      for(var Yi = (entity.y - entity.PM); Yi <= (entity.y + entity.PM); Yi++) {
        if (this.tileWithinEntityRange(Xi, Yi, entity)) {
          this.drawDiamond(Xi, Yi, color='green', fill=true, fillColor='green', fillAlpha=0.5);
          }
         }
        }
  },

  convertMapToGraph: function(map, blockingIds) {
    var graph = new Graph(map)
    for (var i = 0; i < map.length; i++) {
      for (var j = 0; j < map[0].length; j++) {
        graph.grid[i][j].weight = 1;
        if (blockingIds.includes(map[i][j])) {
          graph.grid[i][j].weight = 0;
        }
      }
    }
    return graph;
  },

  pathFromEntityToTile: function(x, y, entity) {
    var start = this.graph.grid[entity.x][entity.y];
    var end = this.graph.grid[x][y];
    var path = astar.search(this.graph, start, end);
    return path;
  },

  run: function() {
    this.canvas = $('#isocanvas');
    this.context = this.canvas[0].getContext("2d");

    this.Xtiles = IsometricMap.map.length;
    this.Ytiles = IsometricMap.map[0].length;

    var self = this;
    $(window).on('resize', function(){
      self.updateCanvasSize();
      self.redrawTiles();
      self.drawEntities();
    });

   $(window).on('mousemove', function(e) {
     e.pageX = e.pageX - self.tileColumnOffset / 2 - self.originX;
     e.pageY = e.pageY - self.tileRowOffset / 2 - self.originY;
     tileX = Math.round(e.pageX / self.tileColumnOffset - e.pageY / self.tileRowOffset);
     tileY = Math.round(e.pageX / self.tileColumnOffset + e.pageY / self.tileRowOffset);
     self.selectedTileX = tileX;
     self.selectedTileY = tileY;

     self.redrawTiles();
     if(self.isCursorOnMap()) {
       // if entity there, draw its PM diamonds
       entity = self.entityAtThisPosition(self.selectedTileX, self.selectedTileY)
       if (entity != null) {
         self.drawPMDiamondsForEntity(entity);
       }
       // else if not entity, check if within player's PM range (if player's turn, in not in action mode)
       else {
         path = self.pathFromEntityToTile(self.selectedTileX, self.selectedTileY, self.hero);
         if (path.length > 0 && path.length <= self.hero.PM) {
           self.drawDiamond(self.hero.x, self.hero.y, color='green', fill=true, fill_color='green', fillAlpha=0.5);
           for (var i = 0; i < path.length; i++) {
              self.drawDiamond(path[i].x, path[i].y, color='green', fill=true, fill_color='green', fillAlpha=0.5);
           }
         }
       }
     }
     self.drawEntities();
   });

    $(window).on('click', function(e) {
      self.showCoordinates = !self.showCoordinates;
      if (self.entityAtThisPosition(self.selectedTileX, self.selectedTileY) == null) {
        path = self.pathFromEntityToTile(self.selectedTileX, self.selectedTileY, self.hero);
        if (path.length > 0 && path.length <= self.hero.PM) {
          self.graph.grid[self.hero.x][self.hero.y].weight = 1
          self.hero.x = tileX;
          self.hero.y = tileY;
          self.graph.grid[self.hero.x][self.hero.y].weight = 0
          self.hero.PM = self.hero.PM - path.length
        }
      }
      self.redrawTiles();
      self.drawEntities();
    });

    this.updateCanvasSize();
    this.redrawTiles();
    this.drawEntities();
  },

  updateCanvasSize: function() {
    var width = $(window).width();
    var height = $(window).height();

    this.context.canvas.width  = width;
    this.context.canvas.height = height;

    this.originX = width / 2 - this.Xtiles * this.tileColumnOffset / 2;
    this.originY = height / 2;
  },

  redrawTiles: function() {
    this.context.canvas.width = this.context.canvas.width;

    for(var Xi = (this.Xtiles - 1); Xi >= 0; Xi--) {
      for(var Yi = 0; Yi < this.Ytiles; Yi++) {
        this.drawTile(Xi, Yi);
      }
    }

    this.drawDiamond(this.selectedTileX, this.selectedTileY, color='green', fill=true, fillColor='green', fillAlpha=0.75);
    if(this.isCursorOnMap()) {
      this.context.fillStyle = 'yellow';
      var idx = IsometricMap.map[this.selectedTileX][this.selectedTileY];
      this.context.font = '14pt Arial';
      entity = this.entityAtThisPosition(this.selectedTileX, this.selectedTileY)
      if (entity != null) {
        this.context.fillText(entity.name.concat(", ", entity.PV, "/", entity.basePV, " PV, ", entity.PA, "/", entity.basePA, " PA, ", entity.PM, "/", entity.basePM, " PM"), 20, 30);
      }
    }
  },

  isCursorOnMap: function() {
    return (this.selectedTileX >= 0 && this.selectedTileX < this.Xtiles &&
            this.selectedTileY >= 0 && this.selectedTileY < this.Ytiles);
  },

  drawTile: function(Xi, Yi) {
    var offX = Xi * this.tileColumnOffset / 2 + Yi * this.tileColumnOffset / 2 + this.originX;
    var offY = Yi * this.tileRowOffset / 2 - Xi * this.tileRowOffset / 2 + this.originY;

    var imageIndex = IsometricMap.map[Xi][Yi];
    this.context.drawImage(this.tileImages[imageIndex], offX, offY);

    if(this.showCoordinates) {
      this.context.fillStyle = 'orange';
      this.context.fillText(Xi + ", " + Yi, offX + this.tileColumnOffset/2 - 9, offY + this.tileRowOffset/2 + 3);
    }
  },

  drawDiamond: function(Xi, Yi, color, fill=false, fillColor=undefined, fillAlpha=undefined) {
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
  },
};
