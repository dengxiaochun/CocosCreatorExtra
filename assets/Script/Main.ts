const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(String)
    scenelist:string[] = [];

    getSceneName(search:string)
    {
        /** ?scene=ScrollView */
        let scene = '';
        const reg = /\?scene=(\w+)/
        if (reg.test(search)) {
            // cc.log(reg.exec(search))
            scene = reg.exec(search)[1];
        }
        return scene;
    }

    start () {
        const scene = this.getSceneName(document.location.search)
        scene && cc.director.loadScene(scene);
    }

    // update (dt) {}
}
