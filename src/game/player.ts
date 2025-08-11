import { GameObjects } from "phaser";
import Enemy from "./enemy";
import Inventory from "./inventory";

class Player extends Phaser.Physics.Arcade.Sprite {
  isDying: boolean = false;
  health = 5;
  private weapon!: Phaser.GameObjects.Sprite;
  movKeys: any;
  speed: number = 200;
  inventory: Inventory;
  atk = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, scale: number) {
    super(scene, x, y, "player_idle");

    this.inventory = new Inventory(scene);
    this.setScale(scale);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.play("player_idle");

    this.weapon = scene.add.sprite(x + 60, y - 5, "weapon_sprite");
    this.weapon.setScale(scale);

    this.movKeys = scene.input.keyboard!.addKeys("W,S,A,D");

    // this.play("thunder_summon");

    // scene.tweens.add({
    //   targets: this,
    //   scaleX: 1,
    //   scaleY: 1,
    //   ease: "Sine.easeInOut",
    //   duration: 150,
    // });
  }
  // Override setPosition to move weapon with player
  setPosition(x?: number, y?: number): this {
    super.setPosition(x, y);
    if (this.weapon) {
      this.weapon.setPosition(this.x + 60, this.y - 5);
    }
    return this;
  }

  attack(enemies: Phaser.GameObjects.Group) {
    this.play("thunder_summon");
    this.weapon.play("sword_slash");

    this.once("animationcomplete-thunder_summon", () => {
      this.play("player_idle");
    });

    this.weapon.once("animationcomplete-sword_slash", () => {
      this.weapon.setTexture("weapon_sprite");
      const hitEnemies = enemies.getChildren().filter((e: Enemy) => {
        return Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y) < 100;
      });

      hitEnemies.forEach((enemy: Enemy) => {
        enemy.hit(this.atk);
      });
    });
  }

  lootCoins(amount: number) {
    this.inventory.gold += amount;
  }

  upgradePower() {
    this.atk++;
  }

  die() {
    if (this.isDying) return;

    this.isDying = true;

    // this.setVelocity(0, 0);
    // (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.setAngle(0);

    this.play("lightning_strike");

    this.once("animationcomplete-lightning_strike", () => {
      this.health--;
      if (this.health === 0) this.destroy();
    });
  }

  update() {
    let velocityX = 0, velocityY = 0;

    if (this.movKeys.W.isDown) velocityY = -this.speed;
    if (this.movKeys.A.isDown) velocityX = -this.speed;
    if (this.movKeys.S.isDown) velocityY = this.speed;
    if (this.movKeys.D.isDown) velocityX = this.speed;

    this.setPosition(
      this.x + velocityX * (1 / 60),
      this.y + velocityY * (1 / 60),
    );
  }
}

export default Player;
