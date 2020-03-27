import React, { useState, useEffect, createRef, useCallback } from 'react';

const RESIZE = {
    m: 'default',
    l: 'w-resize',
    r: 'e-resize',
    t: 'n-resize',
    b: 's-resize',
    tl: 'nw-resize',
    tr: 'ne-resize',
    br: 'se-resize',
    bl: 'sw-resize'
};

const MARGIN = 10
const NEAR = 6

const toPx = p => `${p}px`;
const isset = (o) => ('undefined' !== typeof o);

export const View = props => {
    const [cursor, setCursor] = useState(RESIZE.m);
    const [pressed, setPressed] = React.useState(false)
    const [moveable, setMoveable] = React.useState(true)

    React.useEffect(() => {
        isset(props.moveable) && setMoveable(props.moveable)
    }, [])

    const handleMouseMove = e => {
        if (pressed || !moveable) return true;
        e.stopPropagation()
        e.preventDefault()
        const { offsetX: x, offsetY: y } = e.nativeEvent;
        const {
            offsetLeft: ol,
            offsetTop: ot,
            offsetWidth: ow,
            offsetHeight: oh
        } = e.target;

        if (x < MARGIN && y > MARGIN && y < oh - MARGIN)
            setCursor(RESIZE.l);
        else if (x > ow - MARGIN && y > MARGIN && y < oh - MARGIN)
            setCursor(RESIZE.r);
        else if (y < MARGIN && x > MARGIN && x < ow - MARGIN)
            setCursor(RESIZE.t);
        else if (y > oh - MARGIN && x > MARGIN && x < ow - MARGIN)
            setCursor(RESIZE.b);
        else if (x < MARGIN && y < MARGIN) setCursor(RESIZE.tl);
        else if (x > ow - MARGIN && y < MARGIN) setCursor(RESIZE.tr);
        else if (x < MARGIN && y > oh - MARGIN) setCursor(RESIZE.bl);
        else if (x > ow - MARGIN && y > oh - MARGIN) setCursor(RESIZE.br);
        else setCursor(RESIZE.m);
    }

    const handleMouseDown = e => {
        setPressed(true)
    }

    const handleMouseUp = e => {
        setPressed(false)
    }

    const style = {
        left: props.x, top: props.y, width: props.w, height: props.h, cursor: cursor,
        position: 'absolute', opacity: props.opacity ? props.opacity : 1,
        zIndex: 0, border: '1px solid red', boxSizing: 'border-box'
    };

    return <div className={moveable ? 'box' : 'cell'}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={style}>
    </div>
}

const tonum = (n) => parseInt(n);

export const Scene = props => {
    const [pressed, setPressed] = React.useState(false)
    const [current, setCurrent] = React.useState()
    const [rect, setRect] = React.useState(null)
    const [pos, setPos] = React.useState()
    const cref = React.createRef();
    const [xs, setXs] = React.useState([]);
    const [ys, setYs] = React.useState([]);

    React.useEffect(() => {
        const { data, radio } = props;
        setXs([...new Set(data.map(m => m.startx*radio).concat(data.map(m => (m.startx+m.width)*radio)))])
        setYs([...new Set(data.map(m => m.starty*radio).concat(data.map(m => (m.starty+m.hight)*radio)))])
    }, [])

    React.useEffect(() => {
        const canvas = cref.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'lightgray';
    
        const gw = canvas.width;
        const gh = canvas.height;
        xs.map(m => {
            ctx.moveTo(m, 0);
            ctx.lineTo(m, gh);
            ctx.stroke();
        })
        ys.map(m => {
            ctx.moveTo(0, m);
            ctx.lineTo(gw, m);
            ctx.stroke();
        })
        ctx.closePath()
    }, [xs, ys])

    React.useEffect(() => {
        if (!current) return
        current.style.zIndex = 100;
        const l = tonum(current.style.left);
        const t = tonum(current.style.top);
        const w = tonum(current.style.width);
        const h = tonum(current.style.height);

        setRect({ left: l, top: t, width: w, height: h, right: l + w, bottom: t + h })
    }, [current])

    const handleMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
        setPressed(true)
        setPos({ x: e.clientX, y: e.clientY })
        setCurrent(e.target.className == 'box' && e.target)
    };

    const handleMouseUp = e => {
        e.preventDefault();
        e.stopPropagation();
        current && (current.style.zIndex = 0)

        setPos()
        setRect()
        setCurrent()
        setPressed(false)
    };

    const handleMouseMove = e => {
        if (!pressed || !current) return true;
        e.preventDefault();
        e.stopPropagation();

        const diffX = e.clientX - pos.x
        const diffY = e.clientY - pos.y

        let newRect = { ...rect }

        switch (current.style.cursor) {
            case RESIZE.l:
            case RESIZE.bl:
            case RESIZE.tl:
                newRect.left += diffX;
                newRect.width -= diffX;
                break;

            case RESIZE.r:
            case RESIZE.br:
            case RESIZE.tr:
                newRect.width += diffX;
                break;
            case RESIZE.m:
                newRect.left += diffX;
                break;
        }

        switch (current.style.cursor) {
            case RESIZE.t:
            case RESIZE.tl:
            case RESIZE.tr:
                newRect.top += diffY;
                newRect.height -= diffY;
                break;

            case RESIZE.b:
            case RESIZE.bl:
            case RESIZE.br:
                newRect.height += diffY
                break;
            case RESIZE.m:
                newRect.top += diffY;
                break;
        }
        newRect.right = newRect.left + newRect.width;
        newRect.bottom = newRect.top + newRect.height;

        newRect = handle(newRect)

        const {radio} = props;
        console.log(newRect.top/radio, newRect.left/radio, newRect.width/radio, newRect.height/radio)

        current.style.top = toPx(newRect.top);
        current.style.left = toPx(newRect.left);
        current.style.width = toPx(newRect.width);
        current.style.height = toPx(newRect.height);
        current.style.bottom = 'auto'
        current.style.right = 'auto'
    };

    const handle = rect => {
        if (-1 == current.style.cursor.search('resize')) {
            xs.some(m => {
                if(Math.abs(m - rect.left) < NEAR) {
                    rect.left=m;
                    return true;
                }
                if(Math.abs(m - rect.right) < NEAR) {
                    rect.left=m-rect.width;
                    return true;
                }
            })
            ys.some(m => {
                if(Math.abs(m-rect.top) < NEAR) {
                    rect.top = m
                    return true;
                }
                if(Math.abs(m-rect.bottom) < NEAR) {
                    rect.top = m-rect.height
                    return true;
                }
            })
            return rect;
        }else {
            xs.some(m => {
                if(Math.abs(m - rect.left) < NEAR) {
                    rect.left=m;
                    rect.width=rect.right-m;
                    return true;
                }
            })
            xs.some(m => {
                if(Math.abs(m - rect.right) < NEAR) {
                    rect.right=m;
                    rect.width=m-rect.left
                    return true;
                }
            })            
            ys.some(m => {
                if(Math.abs(m-rect.top) < NEAR) {
                    rect.top=m
                    rect.height=rect.bottom-m
                    return true;
                }
            })
            ys.some(m => {
                if(Math.abs(m-rect.bottom) < NEAR) {
                    rect.bottom = m
                    rect.height=m-rect.top
                    return true;
                }
            })
        }
        return rect;
    }

    const style = {
        width: props.w,
        height: props.h,
        background: '#F5F8FA',
        border: '1px solid lightgray',
        position: 'relative',
        boxShadow: '4px 4px 8px rgba(0,0,0,0.5)'
    };

    return (
        <div style={style} 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}>
            <canvas ref={cref} width={props.w} height={props.h} />
            {props.children}
        </div>
    );
}