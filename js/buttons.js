export class Button {
    constructor(x, y, text, spritePath, spritePressedPath) {
        this.text = text;
        this.spritePath = spritePath;
        this.spritePressedPath = spritePressedPath;
        this.x = x
        this.y = y
        this.offX = undefined;
        this.offY = undefined;
        this.font = '14pt Arial';
        this.color = 'yellow';
        this.sprite = new Image();
        this.sprite.src = this.spritePath;
    }

    hasCursorInside(x, y) {
        if ((x > this.offX && x < this.offX + this.sprite.width) &&
            (y > this.offY && y < this.offY + this.sprite.height)) {
            return true;
            return false;
        }
    }

    changeSpriteToPressed() {
        this.sprite = new Image();
        this.sprite.src = this.spritePressedPath;
    }

    changeSpriteToUnPressed() {
        this.sprite = new Image();
        this.sprite.src = this.spritePath;
    }
}
