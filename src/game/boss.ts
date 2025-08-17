import { createHitArea } from "../helpers/createHitArea";
import Player from "./player";
import { Game } from "./scenes/Game";

class Boss extends Phaser.Physics.Arcade.Sprite {
  private isDying: boolean = false;
  health = 15;
  declare scene: Game;

  constructor(scene: Phaser.Scene, x: number, y: number, scale: number) {
    super(scene, x, y, "boss_idle");

    this.setScale(scale);
    this.setDepth(1);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.play("boss_idle");
  }
  hit(atk: number = 1, atkNb: number = 1) {
    this.play("boss_hit");
    Array.from({ length: atkNb }, (_, idx) => {
      const overlay = this.scene.add.sprite(
        this.x + idx * 10,
        this.y,
        "lightning_strike",
      ).setDepth(2);

      overlay.play("lightning_strike");

      overlay.once("animationcomplete-lightning_strike", () => {
        overlay.destroy();
        if (!this.isDying) this.play("boss_idle");
      });
    });
    this.health = Math.max(0, this.health - (atkNb * atk));
    if (this.health === 0) this.die();
  }

  charge(player: Player) {
    const area = createHitArea(
      this.scene,
      this,
      player,
      100,
      200,
      0xff0000,
      500,
    );

    const rotationAngle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      player.x,
      player.y,
    ) - Phaser.Math.DegToRad(90);
    console.log("rotationAngle", rotationAngle);

    const startX = this.x;
    const startY = this.y;

    const dashDistance = 200;
    const targetX = this.x + Math.cos(
      rotationAngle +
      Phaser.Math.DegToRad(90),
    ) * dashDistance;
    const targetY = this.y + Math.sin(
      rotationAngle +
      Phaser.Math.DegToRad(90),
    ) * dashDistance;

    this.scene.tweens.chain({
      targets: [this, area, this, this],
      tweens: [
        {
          rotation: rotationAngle,
          duration: 500,
        },
        {
          height: 200,
          duration: 500,
          onComplete: () => {
            area.destroy();
          },
        },
        {
          x: targetX,
          y: targetY,
          duration: 500,
          ease: "Power2",
        },
        {
          x: startX,
          y: startY,
          duration: 500,
          ease: "Power2",
        },
      ],
    });
  }

  die() {
    this.isDying = true;
    this.play("boss_die");
    this.once("animationcomplete-boss_die", () => {
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
}

export default Boss;
