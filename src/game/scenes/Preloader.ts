import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    const background = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "background",
    );
    background.setOrigin(0.5, 0.5);
    background.setScale(
      this.cameras.main.width / background.width,
      this.cameras.main.height / background.height,
    );

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      468,
      32,
    ).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(
      this.cameras.main.width / 2 - 230,
      this.cameras.main.height / 2,
      4,
      28,
      0xffffff,
    );

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + (460 * progress);
    });
  }

  preload() {
    // Load the plugin
    this.load.plugin(
      "rexvirtualjoystickplugin",
      "plugins/rexvirtualjoystickplugin.min.js",
      true,
    );

    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");

    this.load.audio("bgm", "dungeon.mp3");

    this.load.image("damageTiles", "damage_tilemap.png");
    this.load.image("dungeonTiles", "tilemap.png");
    this.load.tilemapTiledJSON("dungeonMap", "dungeon_map.tmj");

    this.load.spritesheet("lightning_strike", "lightning_strike.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("enemy_idle", "enemy_idle.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("enemy_hit", "enemy_hit.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("enemy_die", "enemy_death.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("thunder_summon", "thunder_summon.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("sword_slash", "axe_swing.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("slash", "slash.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player_idle", "player_idle.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("boss_idle", "boss_idle.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("boss_die", "boss_die.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player_death", "player_death.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image("weapon_sprite", "weapon.png");
    this.load.image("logo", "logo.png");
    this.load.image("joystick", "joystick.png");
    this.load.image("bullet", "bullet.png");
    this.load.image("more_bolts", "more_bolts.png");
    this.load.image("bigger_bolt", "bigger_bolt.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    this.anims.create({
      key: "player_idle",
      frames: this.anims.generateFrameNumbers("player_idle", {
        start: 0,
        end: 4,
      }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: "player_death",
      frames: this.anims.generateFrameNumbers("player_death", {
        start: 0,
        end: 12,
      }),
      frameRate: 12,
      repeat: 0,
    });
    this.anims.create({
      key: "boss_idle",
      frames: this.anims.generateFrameNumbers("boss_idle", {
        start: 0,
        end: 4,
      }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "boss_die",
      frames: this.anims.generateFrameNumbers("boss_die", {
        start: 0,
        end: 14,
      }),
      frameRate: 12,
      repeat: 0,
    });
    this.anims.create({
      key: "enemy_idle",
      frames: this.anims.generateFrameNumbers("enemy_idle", {
        start: 0,
        end: 3,
      }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "enemy_hit",
      frames: this.anims.generateFrameNumbers("enemy_hit", {
        start: 0,
        end: 2,
      }),
      frameRate: 9,
      repeat: 0,
    });
    this.anims.create({
      key: "enemy_die",
      frames: this.anims.generateFrameNumbers("enemy_die", {
        start: 0,
        end: 7,
      }),
      frameRate: 9,
      repeat: 0,
    });
    this.anims.create({
      key: "sword_idle",
      frames: this.anims.generateFrameNumbers("sword_idle", {
        start: 0,
        end: 8,
      }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: "sword_slash",
      frames: this.anims.generateFrameNumbers("sword_slash", {
        start: 0,
        end: 12,
      }),
      frameRate: 12,
      repeat: 0,
    });
    this.anims.create({
      key: "thunder_summon",
      frames: this.anims.generateFrameNumbers("thunder_summon", {
        start: 0,
        end: 13,
      }),
      frameRate: 9,
      repeat: 0,
    });
    this.anims.create({
      key: "lightning_strike",
      frames: this.anims.generateFrameNumbers("lightning_strike", {
        start: 0,
        end: 7,
      }),
      frameRate: 15,
      repeat: 0,
    });

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}
