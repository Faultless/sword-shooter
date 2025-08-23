export enum Orientation {
  LEFT,
  RIGHT,
}

export default class DialogueBubble extends Phaser.GameObjects.Container {
  avatar: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;
  nextBtn: Phaser.GameObjects.Triangle;
  currentIdx: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    orientation: Orientation,
    // goNext: (idx: number) => void,
  ) {
    super(scene, x, y);

    this.setScrollFactor(0);
    const textHeight = 200;
    const avatarSize = 96;

    scene.add.existing(this);
    const bgX = 20,
      bgY = -textHeight - 20,
      bgWidth = scene.scale.width - 40,
      bgHeight = textHeight;

    const bg = scene.add.graphics()
      .fillStyle(0x000000, 0.8)
      .fillRoundedRect(bgX, bgY, bgWidth, bgHeight, 8)
      .lineStyle(2, 0xffffff)
      .strokeRoundedRect(bgX, bgY, bgWidth, bgHeight, 8);

    this.avatar = scene.add.image(
      orientation === Orientation.LEFT
        ? avatarSize + 20
        : width - avatarSize - 20,
      -textHeight - avatarSize - 20,
      "avatar",
    )
      .setDisplaySize(avatarSize, avatarSize);

    this.text = scene.add.text(120, -textHeight, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#fff",
      wordWrap: { width: width - 140 },
    });

    this.nextBtn = new Phaser.GameObjects.Triangle(
      scene,
      width - 64,
      -64,
      0,
      0, // top-left
      32,
      0, // top-right
      16,
      24, // bottom (centered)
      0xffffff,
    )
      .setOrigin(0.5)
      .setInteractive(
        Phaser.Geom.Triangle.BuildEquilateral(0, 0, 16),
        Phaser.Geom.Triangle.Contains,
      )
      .on("pointerdown", () => console.log("PRESS"));

    scene.tweens.chain({
      targets: this.nextBtn,
      loop: -1, // repeat forever
      tweens: [
        {
          y: -64, // move up
          duration: 900, // slower (50% longer than down)
          ease: "Sine.easeOut",
        },
        {
          y: -48, // move down
          duration: 600, // faster
          ease: "Sine.easeIn",
        },
      ],
    });
    scene.add.existing(this.nextBtn);

    this.add([bg, this.avatar, this.text, this.nextBtn]);
  }

  setAvatar(path: string) {
    this.avatar.setTexture(path);
  }

  setDialogue(dialogue: string) {
    this.text.setText(dialogue);
    let i = 0;
    let txt = "";
    this.scene.time.addEvent({
      delay: 30,
      repeat: dialogue.length - 1,
      callback: () => {
        txt += dialogue[i++];
        this.text.setText(txt);
        // if (i === dialogue.length) this.nextBtn.setVisible(true);
      },
    });
  }
}
