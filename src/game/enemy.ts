import { ENEMY_SPEED } from "./scenes/Game";

class Enemy extends Phaser.Physics.Arcade.Sprite {
  born: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy_idle");

    this.born = 0;
  }

  spawn(player: any, enemySpeed = ENEMY_SPEED) {
    this.setScale(0);

    // Face the player
    this.setAngle(player.angle - 180);

    // Offset the enemy to spawn at a distance from the player
    this.x = player.x + (500 * Math.cos(this.rotation));
    this.y = player.y + (500 * Math.sin(this.rotation));

    this.setVelocityX(-enemySpeed * Math.cos(this.rotation));
    this.setVelocityY(-enemySpeed * Math.sin(this.rotation));

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
