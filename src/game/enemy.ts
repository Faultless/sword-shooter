import { Game } from "./scenes/Game";

class Enemy extends Phaser.Physics.Arcade.Sprite {
  isDying: boolean = false;
  health = 5;
  declare scene: Game;
  private overlay!: Phaser.GameObjects.Sprite;

  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "enemy_idle");
    this.setDepth(1);
    this.overlay = scene.add.sprite(x, y, "lightning_strike");
    this.overlay.setDepth(2);
    this.overlay.setVisible(false);
  }

  spawn(_player: any) {
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
    this.overlay.setPosition(this.x, this.y);

    this.play("enemy_idle").setScale(0.25);

    this.scene.tweens.add({
      targets: this,
      scaleX: 0.5,
      scaleY: 0.5,
      ease: "Sine.easeInOut",
      duration: 150,
    });
  }

  hit() {
    this.overlay.setVisible(true);
    this.overlay.play("lightning_strike");

    this.overlay.once("animationcomplete-lightning_strike", () => {
      this.health--;
      this.overlay.setVisible(false);
      if (this.health === 0) this.die();
    });
  }

  die() {
    this.dropLoot();
    this.destroy();
  }

  dropLoot() {
    const loot = this.scene.add.rectangle(this.x, this.y, 20, 20, 0xffd700);
    this.scene.loots.add(loot);
  }

  update(_time: number, _delta: number) {
    if (
      this.x > this.scene.cameras.main.width || this.x < 0 ||
      this.y > this.scene.cameras.main.height || this.y < 0
    ) {
      this.destroy();
    }
    this.overlay.setPosition(this.x, this.y);
  }
}

export default Enemy;
