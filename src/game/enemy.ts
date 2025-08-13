import { Game } from "./scenes/Game";

class Enemy extends Phaser.Physics.Arcade.Sprite {
  isDying: boolean = false;
  health = 5;
  declare scene: Game;

  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, "enemy_idle");
    this.setDepth(1);
  }

  spawn(x: number, y: number) {
    this.setScale(0);

    this.x = x;
    this.y = y;

    this.play("enemy_idle").setScale(0.25);

    this.scene.tweens.add({
      targets: this,
      scaleX: 2,
      scaleY: 2,
      ease: "Sine.easeInOut",
      duration: 150,
    });
  }

  hit(atk: number = 1, atkNb: number = 1) {
    this.play("enemy_hit");
    Array.from({ length: atkNb }, (_, idx) => {
      const overlay = this.scene.add.sprite(
        this.x + idx * 10,
        this.y,
        "lightning_strike",
      ).setDepth(2);

      overlay.play("lightning_strike");

      overlay.once("animationcomplete-lightning_strike", () => {
        overlay.destroy();
        if (!this.isDying) this.play("enemy_idle");
      });
    });
    this.health = Math.max(0, this.health - (atkNb * atk));
    if (this.health === 0) this.die();
  }

  die() {
    this.isDying = true;
    this.play("enemy_die");
    this.once("animationcomplete-enemy_die", () => {
      this.dropLoot();
      this.destroy();
    });
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
