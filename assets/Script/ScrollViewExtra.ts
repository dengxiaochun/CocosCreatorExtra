const {ccclass,property,requireComponent} = cc._decorator;

@ccclass
@requireComponent(cc.ScrollView)
export default class ScrollViewExtra extends cc.Component {

    /** 是否增加子节点区间功能 */
    @property
    extraScrollChildIndex = true;

    /** 是否增加Scrollbar滑动功能 */
    @property
    extraScrollBar = true;

    nowOffsetY = 0;

    selectChildren:cc.Node[] = [];

    selectChildIndex = 0;

    newEventHandler(target:cc.Node,component:string,handler:string) {
        const e = new cc.Component.EventHandler();
        e.target = target;
        e.component = component;
        e.handler = handler;
        return e;
    }

    /** 增加scroll子节点区间功能 */
    addScrollChildIndex() {
        /** 禁用鼠标滚轮，滚轮在移动区间时ScrollEvent返回很怪异，没有SCROLL_ENDED事件回调 */
        this.node.off(cc.Node.EventType.MOUSE_WHEEL);
        const scroll = this.node.getComponent(cc.ScrollView);
        /** scroll事件监听 */
        scroll.scrollEvents.push(this.newEventHandler(this.node,'ScrollViewExtra','onScrollEvent'));

        this.nowOffsetY = scroll.getScrollOffset().y;

        /** 可选择区间子节点 */
        const children = scroll.content.children;
        for (let i = 1; i < children.length - 1; i++) {
            this.selectChildren[i - 1] = children[i];
        }

        cc.log(this.selectChildren)

        this.setSelectChildIndex(0)

    }

    /** 增加scrollbar滑动事件，让滑动方向跟浏览器一样 */
    /** 改方法只增加了竖轴滑动事件，横轴事件同理 */
    addScrollBarExtra() {
        const scroll = this.node.getComponent(cc.ScrollView);
        const scrollnode:any = this.node;

        /** 手动禁用scroll节点捕获事件_capturingListeners */
        scrollnode._bubblingListeners = scrollnode._capturingListeners;
        scrollnode._capturingListeners = undefined;

        const scrollbar = scroll.verticalScrollBar;
        let touching = false;
        const handlenode = scrollbar.handle.node;

        function getMoveInterval(node:cc.Node,parent:cc.Node) {
            const handlesize = node.getContentSize();
            const parentSize = parent.getContentSize();
            let maxY = 0,minY = 0;
            if (parentSize.height > handlesize.height) {
                maxY = parentSize.height / 2 - handlesize.height;
                minY = - parentSize.height / 2;
            } 
            // cc.log("getMoveInterval",minY,maxY,handlesize.height)
            return {minY,maxY};
        }

        handlenode.on(cc.Node.EventType.TOUCH_START,(e:cc.Event.EventTouch)=>{
            touching = true;
            e.stopPropagation();
        })
        handlenode.on(cc.Node.EventType.TOUCH_MOVE,(e:cc.Event.EventTouch)=>{
            const node = e.target;
            const {minY,maxY} = getMoveInterval(node,node.parent)
            node.y += e.getDelta().y
            if (node.y > maxY) {
                node.y = maxY;
            } else if (node.y < minY) {
                node.y = minY;
            }
            e.stopPropagation();
            let p = (node.y - minY) / (maxY - minY);
            scroll.scrollToPercentVertical(p)
            if (this.extraScrollChildIndex) {
                this.scrolling(scroll)
            }
        })
        handlenode.on(cc.Node.EventType.TOUCH_END,(e:cc.Event.EventTouch)=>{
            touching = false;
            e.stopPropagation();
            if (this.extraScrollChildIndex) {
                this.scrollToOffset(scroll)
            }
            
        })
        handlenode.on(cc.Node.EventType.TOUCH_CANCEL,(e:cc.Event.EventTouch)=>{
            touching = false;
            e.stopPropagation();
            if (this.extraScrollChildIndex) {
                this.scrollToOffset(scroll)
            }
        })
    }

    start () {
        this.extraScrollChildIndex && this.addScrollChildIndex();
        this.extraScrollBar && this.addScrollBarExtra();
    }

    getScrollChildOffset(scroll:cc.ScrollView) {
        /** 每个子节点高度，用来计算区间 */
        const height = 33;
        const maxoffset = scroll.getMaxScrollOffset().y;
        const offset = scroll.getScrollOffset().y;
        if (offset < 0) {
            return 0;
        } else if (offset > maxoffset) {
            return maxoffset;
        }

        let o = 0;
        let o2 = height;
        let i = 0;
        while(true) {
            if (Math.abs(o - offset) < Math.abs(o2 - offset)) {
                this.selectChildIndex = i;
                return o;
            }
            o += height;
            o2 += height;
            i ++;
        }
    }

    

    setSelectChildIndex(idx:number) {
        for (let i = 0; i < this.selectChildren.length; i++) {
            this.selectChildren[i].opacity = idx === i ? 255 : 255 * 0.3;
        }
    }

    scrolling(scroll:cc.ScrollView) {
        /** 每个子节点高度，用来计算区间 */
        const height = 33;
        const maxoffset = scroll.getMaxScrollOffset().y;
        const offset = scroll.getScrollOffset().y;
        if (offset <= 0) {
           return this.setSelectChildIndex(0)
        } else if (offset >= maxoffset) {
           return this.setSelectChildIndex(this.selectChildren.length - 1)
        }

        let o = 0;
        let o2 = height;
        let i = 0;
        while(true) {
            if (offset >= o && offset < o2) {
                const op = (offset - o) / height;
                this.selectChildren[i].opacity = Math.max(1-op,0.3) * 255;
                this.selectChildren[i + 1].opacity = Math.max(op, 0.3) * 255;
                return 
            }
            o += height;
            o2 += height;
            i ++;

            // if (i == 10) {
            //     cc.error('iiiiii',i,offset,o,o2)
            //     break;
            // }
        }
    }

    onScrollEvent(scroll:cc.ScrollView,scrollType:number) {
        if (scrollType === cc.ScrollView.EventType.SCROLL_ENDED) {
            this.scrollToOffset(scroll)
        } else if (scrollType === cc.ScrollView.EventType.SCROLLING) {
            this.scrolling(scroll);
        }
    }

    scrollToOffset(scroll:cc.ScrollView) {
        const offset = this.getScrollChildOffset(scroll)
        const scrollOffset =  scroll.getScrollOffset();
        if (Math.abs(this.nowOffsetY - scrollOffset.y) < 0.01) 
            return this.setSelectChildIndex(this.selectChildIndex);
        this.nowOffsetY = offset;
        scroll.scrollToOffset(cc.v2(scrollOffset.x,this.nowOffsetY),0.1);
    }
}
