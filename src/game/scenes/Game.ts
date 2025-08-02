import { Scene } from "phaser";
import Bullet from "../bullet";
import Enemy from "../enemy";

const MAX_PLAYER_SPEED = 200;
export const BULLET_SPEED = 800;
export const ENEMY_SPEED = 100;

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  player: any;
  movementJoyStick: any;
  shootJoyStick: any;
  bullets: any;
  bulletCooldown: any;
  enemySpawnCooldown: any;
  enemies: any;

  constructor() {
    super("Game");
  }

  create() {
    // Create player
    this.player = this.physics.add.sprite(200, 200, "sword_idle");
    this.player.setCollideWorldBounds(true);
    this.player.setOrigin(0.5, 0.72); // Set origin for bullet fire start

    // Create sword idle animation
    this.anims.create({
      key: "sword_idle",
      frames: this.anims.generateFrameNumbers("sword_idle", {
        start: 0,
        end: 3,
      }),
      frameRate: 9,
      repeat: -1,
    });

    // Create enemy idle animation
    this.anims.create({
      key: "enemy_idle",
      frames: this.anims.generateFrameNumbers("enemy_idle", {
        start: 0,
        end: 3,
      }),
      frameRate: 9,
      repeat: -1,
    });

    this.player.play("sword_idle");

    // Create movement joystick
    this.movementJoyStick = this.plugins.get("rexvirtualjoystickplugin").add(
      this.scene,
      {
        x: 100,
        y: this.cameras.main.height - 125,
        radius: 40,
        forceMin: 0,
        base: this.add.circle(0, 0, 60, 0x888888).setDepth(100).setAlpha(0.25),
        thumb: this.add.image(0, 0, "joystick").setDisplaySize(80, 80).setDepth(
          100,
        ).setAlpha(0.5),
      },
    ).on("update", () => {}, this);

    // Create shooting joystick
    this.shootJoyStick = this.plugins.get("rexvirtualjoystickplugin").add(
      this.scene,
      {
        x: this.cameras.main.width - 100,
        y: this.cameras.main.height - 125,
        radius: 20,
        forceMin: 0,
        base: this.add.circle(0, 0, 60, 0x888888, 0.5).setDepth(100).setAlpha(
          0.25,
        ),
        thumb: this.add.image(0, 0, "joystick").setDisplaySize(80, 80).setDepth(
          100,
        ).setAlpha(0.5),
      },
    ).on("update", () => {}, this);

    // Move joysticks dynamically based on pointer-down
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.x <= this.cameras.main.width * 0.4) {
        this.movementJoyStick.base.setPosition(pointer.x, pointer.y).setAlpha(
          0.5,
        );
        this.movementJoyStick.thumb.setPosition(pointer.x, pointer.y).setAlpha(
          1,
        );
      }
      if (pointer.x >= this.cameras.main.width * 0.6) {
        this.shootJoyStick.base.setPosition(pointer.x, pointer.y).setAlpha(0.5);
        this.shootJoyStick.thumb.setPosition(pointer.x, pointer.y).setAlpha(1);
      }
    });

    // Add transparency to joysticks on pointer-up
    this.input.on("pointerup", (_pointer: Phaser.Input.Pointer) => {
      if (!this.movementJoyStick.force) {
        this.movementJoyStick.base.setAlpha(0.25);
        this.movementJoyStick.thumb.setAlpha(0.5);
      }
      if (!this.shootJoyStick.force) {
        this.shootJoyStick.base.setAlpha(0.25);
        this.shootJoyStick.thumb.setAlpha(0.5);
      }
    });

    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });

    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });
    this.bulletCooldown = 0;
    this.enemySpawnCooldown = 0;

    this.physics.add.collider(this.bullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      enemy.destroy();
    });

    this.physics.add.collider(this.player, this.enemies, () => {
      this.scene.restart();
    });
  }

  update(_time: number, delta: number) {
    if (this.bulletCooldown > 0) {
      // Reduce bullet cooldown
      this.bulletCooldown -= delta;
    }
    if (this.enemySpawnCooldown > 0) {
      this.enemySpawnCooldown -= delta;
    }

    if (this.enemySpawnCooldown <= 0) {
      const enemy = this.enemies.get().setActive(true).setVisible(true);
      if (enemy) {
        enemy.spawn(this.player);
        this.enemySpawnCooldown = 500;
      }
    }

    if (this.shootJoyStick.force) {
      // Rotate according to joystick
      this.player.setAngle(this.shootJoyStick.angle);

      // Fire bullet according to joystick
      if (
        this.shootJoyStick.force >= this.shootJoyStick.radius &&
        this.bulletCooldown <= 0
      ) {
        const bullet = this.bullets.get().setActive(true).setVisible(true);
        bullet.fire(this.player);

        this.bulletCooldown = 100;
      }
    }

    if (this.movementJoyStick.force) {
      // Calculate speed based on joystick force
      let speedMultiplier =
        (this.movementJoyStick.force < this.movementJoyStick.radius)
          ? this.movementJoyStick.force / this.movementJoyStick.radius
          : 1;
      let speed = MAX_PLAYER_SPEED * speedMultiplier;

      // Move player according to movement joystick
      this.player.setVelocityX(
        speed * Math.cos(Math.PI * this.movementJoyStick.angle / 180),
      );
      this.player.setVelocityY(
        speed * Math.sin(Math.PI * this.movementJoyStick.angle / 180),
      );
    } else {
      // Stop moving
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
    }
  }
}
