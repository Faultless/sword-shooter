import { Game } from "./scenes/Game";

class Enemy extends Phaser.Physics.Arcade.Sprite {
  isDying: boolean = false;
  health = 5;
  declare scene: Game;

  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "enemy_idle");
    this.setDepth(1);
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

    this.play("enemy_idle").setScale(0.25);

    this.scene.tweens.add({
      targets: this,
      scaleX: 0.5,
      scaleY: 0.5,
      ease: "Sine.easeInOut",
      duration: 150,
    });
  }

  hit(atk: number = 1, atkNb: number = 1) {
    console.log("atk", atk);
    Array.from({ length: atkNb }, (_, idx) => {
      const overlay = this.scene.add.sprite(
        this.x + idx * 10,
        this.y,
        "lightning_strike",
      ).setDepth(2);

      overlay.play("lightning_strike");

      overlay.once("animationcomplete-lightning_strike", () => {
        this.health = Math.max(0, this.health - atk);
        overlay.destroy();
      });
    });
    if (this.health === 0) this.die();
  }

  die() {
    this.dropLoot();
    this.destroy();
  }

  dropLoot() {
    const isCoin = Math.random() < 0.3;

    const loot = isCoin
      ? this.scene.add.rectangle(this.x, this.y, 20, 20, 0xffd700).setData(
        "name",
        "coin",
      )
      : this.scene.add.rectangle(this.x, this.y, 20, 34, 0xff00a0).setData(
        "name",
        "scroll",
      );
    this.scene.loots.add(loot);
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
