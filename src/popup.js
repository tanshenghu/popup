define(function(require,exports,module){
    var $ = require('$'),
    doc   = document,
    body  = 'body',
    // 弹出 浮层
    popup = function( param ){
        var hand= (param.hand instanceof Array) ? param.hand[1] : $( param.hand ), // 考虑到事件委托，所以param可传['body', '.okbtn']
            box = $( param.box ),
            cover = typeof param.cover == 'undefined' ? true : param.cover,
            zIndex = param.zIndex || 1000,
            drag   = param.drag,
            fixed  = param.fixed===true?'fixed':'absolute',
            CW  = 0,
            CH  = 0,
            boxW= parseInt( param.width ),
            boxH= parseInt( param.height ),
            sclT= 0,
            sclL=0,
            callback = param.callback,
            hidefn = param.hidefn,
            okfn   = param.okfn,
            trigger = null, // 当前浮层对应的hand
            Body = $(body);
            
        if ( !box.length ){
            window.console&&console.log( "error:not "+param.box );
            return;
        }
        // 是否外层判断并处理
        if ( box.parent().prop('nodeName').toLowerCase()!=body ){
            Body.append( box );
        }
        
        // 该层是否有遮挡层 在关闭层时会用到
        box.attr('cover', cover);
        
        
        var bgDiv = $('#coverPop').length ? $('#coverPop') : $('<div id="coverPop"></div>');
        bgDiv.css({position:'fixed','z-index':zIndex-1,left:'0',top:'0',right:'0',bottom:'0',display:'none','background-color':'black',opacity:'0.5'});
        
        var posFn = function( resetPos ){
            CW  = doc.documentElement.clientWidth;
            CH  = doc.documentElement.clientHeight;
            sclT= $(doc).scrollTop() || 0;
            sclL= $(doc).scrollLeft() || 0;
            
            if( !(param.width) ){
                //box.css({'display':'inline-block'});// fuck Chrome
                boxW = box.show().css('visibility', resetPos===true?'':'hidden').width();
                
            }if( !(param.height) ){
                //box.css({'display':'inline-block'});
                boxH = box.show().css('visibility',resetPos===true?'':'hidden').height();
            }
           
            var left = ( ( CW - boxW )*0.5 < 0 ) ? 0 : ( ( CW - boxW )*0.5 > (CW-boxW) ) ? CW-boxW : ( CW - boxW )*0.5;
            var top = ( ( CH - boxH )*0.5 < 0 ) ? 0 : ( ( CH - boxH )*0.5 > (CH-boxH) ) ? CH-boxH : ( CH - boxH )*0.5;

            var css = {
                "position":fixed,
                "z-index":zIndex,
                "display":resetPos===true?'block':"none",
                "left":left+sclL,
                "background-color":"white",
                "top":top+sclT
            };
            
            // 上面把box显示出来算宽高了，现在要把它隐藏起来.
            resetPos!==true && box.hide().css('visibility','');
            
            return css;
        };

        var css = posFn();

        if ( param.width ){
            css.width = param.width;
        }else{
            css.width = 'auto';
        }
        if ( param.height ){
            css.height = param.height;
        }else{
            css.height = 'auto';
        }

        box.css( css );
        if ( cover ){
            box.before( bgDiv );
        }
        
        // 事件处理
        var _show = function( targ ){
            // disabled 不能点击
            var isEnabled = !$(targ).hasClass('disabled');
            if( typeof targ===undefined || isEnabled ){
                box.css( posFn() );
                cover && bgDiv.css('z-index',box.css('z-index')-1).fadeIn( 300 );
                box.fadeIn( 500 );
                isEnabled && typeof callback === 'function' && callback.apply(targ, [box]);
            }
            return box;
            
        },
        _hide = function( _curHideBtn ){
            // 检查页面中是否存在浮层里再弹层，并将要执行关闭操作
            var $this = $( _curHideBtn ),
            total = Body.children( '[poptype="tsh-popbox"]' ),
            surplus = total.not(box),
            ispop = total.length-1 === total.filter(':hidden').length || surplus.filter('[cover="true"]:visible').length===0;
            
            // 判断 关闭 事件来源于按钮
            if( ($this.prop('nodeName')+'').toLowerCase()!=='i' && $this.hasClass('disabled') ){
                return 'input is disabled!';
            }
            
            // 如果 页面有遮层并且页面中已经没有其它浮层了就要关闭遮层
            if ( cover && ispop ){
                bgDiv.fadeOut( 500 );
            }
            // 如果还有其它遮层存在
            else if( !ispop ){
                var tallVal = 0;
                surplus.filter('[cover="true"]:visible').each(function(){
                    tallVal = Math.max( tallVal, $(this).css('zIndex') );
                });
                tallVal && bgDiv.css('zIndex',tallVal-1);
            }
            box.fadeOut( 300 );
            typeof hidefn === 'function' && hidefn.apply( trigger, [this, box, !!(_curHideBtn && _curHideBtn.nodeName)] ); // 第三个参数主要是判断是否手动调用hide方法
            
            return box;
        };
        
        // 委托方式 去操作浮层
        typeof hand === 'string' ? $( param.hand[0] ).on('click', hand, function(){
            
            trigger = this;
            _show( this );
            
        }):
        hand.on('click', function(){
            
            trigger = this;
            _show( this );
            
        });
        
        // 拖动
        function dragger(){
                
            var dragBar = box.find('.dialog-title'), _O = {ON:false};
            
            $(doc).on('mouseup', function(){
                dragBar.css('cursor','default');
                _O.ON = false;
                
            }).on('mousemove', function( ev ){
                ev = ev || event;
                if( _O.ON ){
                    
                    var l = Math.min(ev.clientX - _O.L, _O.BW),
                        t = Math.min(ev.clientY - _O.T, _O.BH);
                        l = Math.max( l, 0 );
                        t = Math.max( t, 0 );
                    _O.dialog.css({left:l+'px', top:t+'px'});
                    
                }
                
            });
            dragBar.on('mousedown', function( ev ){
                ev        = ev || event;
                var $this = $( this );
                $this.css('cursor','move');
                
                _O.L      = ev.clientX - $this.offset().left;
                _O.T      = ev.clientY - $this.offset().top;
                _O.dialog = dragBar.closest('[poptype="tsh-popbox"]');
                _O.BW     = doc.documentElement.clientWidth - _O.dialog.outerWidth( true );
                _O.BH     = doc.documentElement.clientHeight - _O.dialog.outerHeight( true );
                _O.ON     = true;
                
                
            });
            
        }
        
        drag&&dragger();
        
        box.on('click', '.ui-okBtn', function(){
            typeof okfn === 'function' && okfn.apply( trigger, [this, box] );
        });

        box.on('click', '.closeMe', function(){
            
            _hide( this );
            
        });
        
        // 类似jquery一样jquery1238657234 给元素添加一个标识
        box.attr('poptype', 'tsh-popbox');
        
        // 对外提供一些常用方法
        box.Show = _show;
        box.Hide = _hide;
        box.reSetPos = function( o ){
            return box.css( $.extend(posFn( true ),o) );
        }
        
        return box;
    };
    module.exports = popup;
})