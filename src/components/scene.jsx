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

const ALIGN = {
    tt: 'topToTop',
    rr: 'rightToRight',
    bb: 'bottomToBottom',
    ll: 'leftToLeft',
};

// const ALIGN_OUTER = [ALIGN.tb, ALIGN.rl, ALIGN.bt, ALIGN.lr]
const ALIGN_INNER = [ALIGN.tt, ALIGN.rr, ALIGN.bb, ALIGN.ll]
// const ALIGN_CENTER = [ALIGN.xx, ALIGN.yy]

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
const keys = o => Object.keys(o)
const reduces = (o, f = (() => { }), r) => keys(o).reduce((t, p) => f(t, o[p], p, o), r)
const values = o => reduces(o, (a, v) => a.concat([v]), [])
const maps = (o, f = (() => { }), t = this) => reduces(o, (r, v, p) => ({ ...r, [p]: f.call(t, v, p, o) }), {})
const iselem = (e) => (isset(e) && (e instanceof Element || e instanceof Window || e instanceof Document));
const eachs = (o, f = (() => { }), t = this) => keys(o).forEach(p => f.call(t, o[p], p, o))

const stdRect = d => {
    const rect = {}
    rect.left = tonum(d.style.left)
    rect.top = tonum(d.style.top)
    rect.width = tonum(d.style.width)
    rect.height = tonum(d.style.height)
    rect.bottom = rect.top + rect.height
    rect.right = rect.left + rect.width
    return rect;
}

const diffRect = (refA, refB, { aligns = values(ALIGN) }) => {
    const rectA = refA
    const rectB = stdRect(refB)
    const source = { rect: rectA }
    const target = { rect: rectB }
    const absDis = true
    const calc = (absDis ? Math.abs : ((n) => n));
    const results = maps(reduces(ALIGN, (results, prop) => {
        return aligns.includes(prop) ? { ...results, [prop]: NaN } : results;
    }, {}), (_, prop) => {

        switch (prop) {
            case ALIGN.tt: return calc(rectA.top - rectB.top)
            case ALIGN.bb: return calc(rectB.bottom - rectA.bottom)
            case ALIGN.rr: return calc(rectB.right - rectA.right);
            case ALIGN.ll: return calc(rectA.left - rectB.left);
        }
    })

    const ranking = keys(results).sort((a, b) => (results[a] - results[b]));
    return {
        source,
        target,
        results,
        ranking,
        min: ranking[0],
        max: ranking[results.length - 1],
    };
}

export const Scene = props => {
    const [pressed, setPressed] = React.useState(false)
    const [current, setCurrent] = React.useState()
    const [rect, setRect] = React.useState(null)
    const [pos, setPos] = React.useState()
    const cref = React.createRef();

    React.useEffect(() => {
        // const canvas = cref.current;
        // const parent = canvas.parentElement || canvas.parentNode || document.body
        // canvas.style.width = toPx(parent.clientWidth)
        // canvas.style.height = toPx(parent.clientHeight)
        // canvas.width = parent.clientWidth;
        // canvas.height = parent.clientHeight;
        render();
    }, [])

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

        const newRect = { ...rect }

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

        current.style.top = toPx(newRect.top);
        current.style.left = toPx(newRect.left);
        current.style.width = toPx(newRect.width);
        current.style.height = toPx(newRect.height);
        current.style.bottom = 'auto'
        current.style.right = 'auto'
    };

    const render = () => {
        const layout = 3;
        const canvas = cref.current;
        const ctx = canvas.getContext('2d');
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(0.5,0.5);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'lightgray';
        ctx.setLineDash([8, 4]);
    
        for (let i = 1; i < layout; i++) {
          const gwidth = canvas.width;
          const gheight = canvas.height;
          const width = (i / layout) * gwidth;
          const height = (i / layout) * gheight;
          console.log(width, height)
    
          ctx.moveTo(width, 0);
          ctx.lineTo(width, gheight);
          ctx.moveTo(0, height);
          ctx.lineTo(gwidth, height);
        }
        ctx.stroke();
      };

    const style = {
        width: props.w,
        height: props.h,
        background: '#F5F8FA',
        border: '1px solid lightgray',
        position: 'relative',
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