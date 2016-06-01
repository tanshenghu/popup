## `popup` By TanShenghu

<br>

**popup弹框组件在阿里巴巴(财资系统)，支付宝(数据枢纽、元数据管控平台、芝麻管控平台、数据模型平台、数据质量分析、ide与数据回流一体化等好几个项目都用到此组件)，都用到。该组件能记录事件源，并提供常用API，满足一般项目需求**

[demo](http://www.tanshenghu.com/widget/popup/examples/popup.html)

```javascript
seajs.use(['popup'], function( Popup ) {
    
    var oele = Popup({
        
        hand: 'button', // (必选) 事件触发点 支持事件委托['body', 'button']
        box: '#odiv', // (必选) 浮层div
        cover: true, // 是否有灰色遮挡层
        zIndex: 1000, // 浮层的层级
        drag: false, // 是否可拖动
        fixed: 'absolute', // 定位的方式absolute 或 fixed
        width: 320, // 宽度 (可选，不填写此参数时宽度自动)
        height: 120, // 高度 (可选，不填写此参数时高度自动)
        callback: function( box ){ // 浮层展开时触发
            // this => 指向触发浮层的那个button按钮
        },
        okfn: function( hand, box ){ // 浮层点击“确定”或“提交”类按钮触发
            // this => 指向触发浮层的那个button按钮
        },
        hidefn: function(){ // 浮层关闭时触发
            
        }
        
    });
    
    
    
})
```

### 完
The End