class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 2;
        this.velocityY = (Math.random() - 0.5) * 2;
        this.lifetime = 50;
        this.color = color;
    }

    draw(context) {
        if (this.lifetime > 0) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, 2, 2);
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.lifetime--;
        }
    }
}