import { BULLET_SPEED } from "./scenes/Game";

class Bullet extends Phaser.Physics.Arcade.Sprite {
  born: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "bullet");

    this.born = 0;
  }

  fire(shooter: any, bulletSpeed = BULLET_SPEED) {
    this.setRotation(shooter.rotation);

    // Offset the bullet to start a bit right of the shooter
    this.x = shooter.x + (50 * Math.cos(this.rotation));
    this.y = shooter.y + (50 * Math.sin(this.rotation));

    this.setVelocityX(bulletSpeed * Math.cos(Math.PI * this.angle / 180));
    this.setVelocityY(bulletSpeed * Math.sin(Math.PI * this.angle / 180));

    this.born = 0;
  }

  update(_time: number, delta: number) {
    this.born += delta;

    if (this.born > 1500) {
      this.destroy();
    }
  }
}

export default Bullet;
