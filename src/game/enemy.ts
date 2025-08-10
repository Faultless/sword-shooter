import { ENEMY_SPEED } from "./scenes/Game";

class Enemy extends Phaser.Physics.Arcade.Sprite {
  isDying: boolean = false;
  health = 5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy_idle");
  }

  spawn(_player: any, enemySpeed = ENEMY_SPEED) {
    this.setScale(0);

    // Get canvas center
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    // Calculate angle from object to center
    const angleToCenter = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      centerX,
      centerY,
    );

    // Convert to degrees and set angle
    this.setAngle(Phaser.Math.RadToDeg(angleToCenter) + 135);

    // Offset the enemy to spawn at a distance from the player
    let x = 0,
      y = this.scene.cameras.main.height * Math.random(),
      offset = 500 * Math.random();

    if (Math.random() > 0.5) {
      offset = -500 * Math.random();
      x = this.scene.cameras.main.width;
      this.setAngle(Phaser.Math.RadToDeg(angleToCenter - 45));
    }
    this.x = x + offset;
    this.y = y + offset;

    // this.setVelocityX(-enemySpeed * Math.cos(this.rotation));
    // this.setVelocityY(-enemySpeed * Math.sin(this.rotation));

    this.play("enemy_idle").setScale(0.25);

    this.scene.tweens.add({
      targets: this,
      scaleX: 0.5,
      scaleY: 0.5,
      ease: "Sine.easeInOut",
      duration: 150,
    });
  }

  die() {
    if (this.isDying) return;

    this.isDying = true;

    this.setVelocity(0, 0);
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.setAngle(0);

    this.play("lightning_strike");

    this.once("animationcomplete-lightning_strike", () => {
      this.health--;
      if (this.health === 0) this.destroy();
    });
  }

  update(_time: number, _delta: number) {
    if (
      this.x > this.scene.cameras.main.width || this.x < 0 ||
      this.y > this.scene.cameras.main.height || this.y < 0
    ) {
      this.destroy();
    }
  }
}

export default Enemy;
