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
    // tb: 'topToBottom',
    // bt: 'bottomToTop',
    // rl: 'rightToLeft',
    // lr: 'leftToRight',
    // xx: 'xCenter',
    // yy: 'yCenter'
};

// const ALIGN_OUTER = [ALIGN.tb, ALIGN.rl, ALIGN.bt, ALIGN.lr]
const ALIGN_INNER = [ALIGN.tt, ALIGN.rr, ALIGN.bb, ALIGN.ll]
// const ALIGN_CENTER = [ALIGN.xx, ALIGN.yy]

const MARGIN = 10
const NEAR = 6

const toPx = p => `${p}px`;

const getEventXY = ({
    clientX,
    clientY,
    touches: [{ clientX: x = clientX, clientY: y = clientY } = {}] = [],
}) => ({ x, y });

const isset = (o) => ('undefined' !== typeof o);

export const Box = props => {
    const [cursor, setCursor] = useState(RESIZE.m);
    const [pressed, setPressed] = React.useState(false)
    const [moveable, setMoveable] = React.useState(true)
    const ref = React.createRef();

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
        // onChoose(ref)
        // console.log(e.target.getBoundingClientRect())
    }

    const handleMouseUp = e => {
        setPressed(false)
        // onChoose(null)
    }

    const style = {
        left: props.x, top: props.y, width: props.w, height: props.h, cursor: cursor,
        position: 'absolute', background: props.color, opacity: props.opacity ? props.opacity : 1,
        zIndex: 0
    };

    return <div ref={ref} className={moveable ? 'box' : 'cell'}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={style}>
    </div>
}

const getStyle = (d) => (d.currentStyle || window.getComputedStyle(d));
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
    const calc = (absDis ?Math.abs : ((n)=>n));
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

export const Boxs = props => {
    const [pressed, setPressed] = React.useState(false)
    const [target, setTarget] = React.useState()
    const [rect, setRect] = React.useState(null)
    const [pos, setPos] = React.useState()
    const ref = React.createRef();

    React.useEffect(() => {
        if(!target) return
        target.style.zIndex = 100;
        const l = tonum(target.style.left);
        const t = tonum(target.style.top);
        const w = tonum(target.style.width);
        const h = tonum(target.style.height);

        setRect({left: l, top: t, width: w, height: h, right: l + w, bottom: t + h})
    }, [target])

    const handleMouseDown = e => {
        e.preventDefault();
        e.stopPropagation();
        
        setPressed(true)
        setPos({x: e.clientX,y: e.clientY})
        setTarget(e.target.className == 'box' && e.target)
    };

    const handleMouseUp = e => {
        e.preventDefault();
        e.stopPropagation();
        target && (target.style.zIndex = 0)

        setPos()
        setRect()
        setTarget()
        setPressed(false)
    };

    const handleMouseMove = e => {
        if (!pressed || !target) return true;
        e.preventDefault();
        e.stopPropagation();

        const diffX = e.clientX - pos.x
        const diffY = e.clientY - pos.y

        const newRect = { ...rect }

        switch (target.style.cursor) {
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

        switch (target.style.cursor) {
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

        handle(newRect)
    };

    const handle = rect => {
        const { targets, results } = check(rect)
        const { top, left, width, height } = rect
        const newPosition = { x: left, y: top };
        const { x: attractedX, y: attractedY } = targets.reduce(({ x, y }, diff) => {
            const { target, results, ranking } = diff;

            return ranking.reduce(({ x, y }, prop) => {
                let value = results[prop];
                if (value <= NEAR) {
                    switch (prop) {
                        case ALIGN.rr:
                        case ALIGN.ll:
                            if (!x || value < x.value) x = { prop, value, target };
                            break;

                        case ALIGN.tt:
                        case ALIGN.bb:
                            if (!y || value < y.value) y = { prop, value, target };
                            break;
                    }
                }
                return { x, y };
            }, { x, y });
        }, { x: null, y: null })

        console.log(attractedX, attractedY)

        if (attractedX) {
            const { prop, target: { rect } } = attractedX;
            switch (prop) {
                case ALIGN.rr: newPosition.x = (rect.right - width); break;
                case ALIGN.ll: newPosition.x = rect.left; break;
            }
        }
        if (attractedY) {
            const { prop, target: { rect } } = attractedY;
            switch (prop) {
                case ALIGN.tt: newPosition.y = rect.top; break;
                case ALIGN.bb: newPosition.y = (rect.bottom - height); break;
            }
        }

        let targetRect = ((x, y) => ({
            top: y,
            right: (x + width),
            bottom: (y + height),
            left: x,
            width,
            height,
        }))((newPosition.x), (newPosition.y));

        target.style.top = toPx(targetRect.top);
        target.style.left = toPx(targetRect.left);
        target.style.width = toPx(targetRect.width);
        target.style.height = toPx(targetRect.height);
    }

    const check = rect => {
        const aligns = [].concat(ALIGN_INNER)
        const targets = Array.from(ref.current.children).
            filter(m => m != target).
            map(m => diffRect(rect, m, { aligns }));
        const results = targets.reduce((results, diff) => {
            eachs(diff.results, (_, prop) => {
                results[prop] = results[prop] || []
                results[prop].push(diff)
            })
            return results;
        }, {})
        const ranking = maps(results, (arr, prop) => arr.concat().sort((a, b) => (a.results[prop] - b.results[prop])))

        return {
            targets, results, ranking, mins: maps(ranking, arr => arr[0]), maxs: maps(ranking, arr => arr[arr.length - 1])
        }
    }

    const style = {
        width: 800,
        height: 600,
        background: '#F5F8FA',
        border: '1px solid lightgray',
        position: 'relative',
    };

    return (
        <div style={style} ref={ref}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}>
            {props.children}
        </div>
    );
}