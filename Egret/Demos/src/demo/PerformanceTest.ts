class PerformanceTest extends BaseTest {
    private _addingArmature: boolean = false;
    private _removingArmature: boolean = false;
    private readonly _armatures: Array<dragonBones.EgretArmatureDisplay> = [];
    private _text: egret.TextField;

    public constructor() {
        super();

        this._resources.push(
            "resource/assets/dragon_boy_ske.dbbin",
            "resource/assets/dragon_boy_tex.json",
            "resource/assets/dragon_boy_tex.png"
        );
    }

    protected _onStart(): void {
        this.stage.addEventListener(egret.Event.ENTER_FRAME, this._enterFrameHandler, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._touchHandler, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this._touchHandler, this);
        //
        this._text = this.createText("");

        for (let i = 0; i < 300; ++i) {
            this._addArmature();
        }

        this._resetPosition();
        this._updateText();
    }

    private _enterFrameHandler(event: egret.Event): void {
        if (this._addingArmature) {
            for (let i = 0; i < 10; ++i) {
                this._addArmature();
            }

            this._resetPosition();
            this._updateText();
        }

        if (this._removingArmature) {
            for (let i = 0; i < 10; ++i) {
                this._removeArmature();
            }

            this._resetPosition();
            this._updateText();
        }
    }

    private _touchHandler(event: egret.TouchEvent): void {
        switch (event.type) {
            case egret.TouchEvent.TOUCH_BEGIN:
                const touchRight = event.stageX > this.stageWidth * 0.5;
                this._addingArmature = touchRight;
                this._removingArmature = !touchRight;
                break;

            case egret.TouchEvent.TOUCH_END:
                this._addingArmature = false;
                this._removingArmature = false;
                break;
        }
    }

    private _addArmature(): void {
        const factory = dragonBones.EgretFactory.factory;
        if (this._armatures.length === 0) {
            factory.parseDragonBonesData(RES.getRes("resource/assets/dragon_boy_ske.dbbin"));
            factory.parseTextureAtlasData(RES.getRes("resource/assets/dragon_boy_tex.json"), RES.getRes("resource/assets/dragon_boy_tex.png"));
        }

        const armatureDisplay = factory.buildArmatureDisplay("DragonBoy");
        armatureDisplay.armature.cacheFrameRate = 24;
        armatureDisplay.animation.play("walk", 0);
        armatureDisplay.scaleX = armatureDisplay.scaleY = 0.7;
        this.addChild(armatureDisplay);

        this._armatures.push(armatureDisplay);
    }

    private _removeArmature(): void {
        if (this._armatures.length === 0) {
            return;
        }

        const armatureDisplay = this._armatures.pop();
        this.removeChild(armatureDisplay);
        armatureDisplay.dispose();

        if (this._armatures.length === 0) {
            dragonBones.EgretFactory.factory.clear(true);
            dragonBones.BaseObject.clearPool();
        }
    }

    private _resetPosition(): void {
        const armatureCount = this._armatures.length;
        if (armatureCount === 0) {
            return;
        }

        const paddingH = 50;
        const paddingV = 150;
        const gapping = 100;
        const stageWidth = this.stageWidth - paddingH * 2;
        const columnCount = Math.floor(stageWidth / gapping);
        const paddingHModify = (this.stageWidth - columnCount * gapping) * 0.5;
        const dX = stageWidth / columnCount;
        const dY = (this.stageHeight - paddingV * 2) / Math.ceil(armatureCount / columnCount);

        for (let i = 0, l = armatureCount; i < l; ++i) {
            const armatureDisplay = this._armatures[i];
            const lineY = Math.floor(i / columnCount);
            armatureDisplay.x = (i % columnCount) * dX + paddingHModify;
            armatureDisplay.y = lineY * dY + paddingV;
        }
    }

    private _updateText(): void {
        this._text.text = "Count: " + this._armatures.length + " \nTouch screen left to decrease count / right to increase count.";
        this._text.width = this.stageWidth;
        this._text.x = 0;
        this._text.y = this.stageHeight - 60;
        this.addChild(this._text);
    }
}