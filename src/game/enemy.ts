import { ENEMY_SPEED } from "./scenes/Game";

class Enemy extends Phaser.Physics.Arcade.Sprite {
  born: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy_idle");

    this.born = 0;
  }

  spawn(player: any, enemySpeed = ENEMY_SPEED) {
    this.setScale(0);

    // face opposite way from the player
    this.setRotation(player.rotation - 180);

    // Offset the bullet to start a bit right of the shooter
    this.x = player.x + (500 * Math.cos(this.rotation));
    this.y = player.y + (500 * Math.sin(this.rotation));

    this.setVelocityX(enemySpeed * Math.cos(Math.PI * this.angle / 180));
    this.setVelocityY(enemySpeed * Math.sin(Math.PI * this.angle / 180));

    this.born = 0;

    this.play("enemy_idle");

    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      ease: "Sine.easeInOut",
      duration: 200,
    });
  }

  update(_time: number, delta: number) {
    this.born += delta;

    if (this.born > 1500) {
      this.destroy();
    }
  }
}

export default Enemy;
