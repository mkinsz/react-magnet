import React, { useState, useEffect, createRef, useCallback } from 'react';
import { isRect, stdRect, diffRect } from './rect';
import {
  isset,
  tobool,
  tonum,
  tostr,
  isarray,
  objForEach,
  objMap,
  getStyle,
  stdDoms,
  isbool,
  iselem,
  isfunc
} from './stdlib';

const toPx = p => `${p}px`;
const toPreg = p => `${100 * p}%`;
const getEventXY = ({
  clientX,
  clientY,
  touches: [{ clientX: x = clientX, clientY: y = clientY } = {}] = []
}) => ({ x, y });
const getParent = d => {
  for (let r = d.parentElement; r; r = r.parentElement) {
    if ('static' !== getStyle(r).position) {
      return r;
    }
  }
  return document;
};
const NEAR_DISTANCE = 15;
const MOUSE_MARGIN = 15;

const ALIGNMENT_PROPS = {
  tt: 'topToTop',
  rr: 'rightToRight',
  bb: 'bottomToBottom',
  ll: 'leftToLeft',
  tb: 'topToBottom',
  bt: 'bottomToTop',
  rl: 'rightToLeft',
  lr: 'leftToRight',
  xx: 'xCenter',
  yy: 'yCenter'
};

const RESIZE_PROPS = {
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

const ALIGNMENT_OUTER = [
  ALIGNMENT_PROPS.tb,
  ALIGNMENT_PROPS.rl,
  ALIGNMENT_PROPS.bt,
  ALIGNMENT_PROPS.lr
];

const ALIGNMENT_INNER = [
  ALIGNMENT_PROPS.tt,
  ALIGNMENT_PROPS.rr,
  ALIGNMENT_PROPS.bb,
  ALIGNMENT_PROPS.ll
];

const ALIGNMENT_CENTER = [ALIGNMENT_PROPS.xx, ALIGNMENT_PROPS.yy];

const Magnet = props => {
  const ref = createRef();
  const [cursor, setCursor] = useState(RESIZE_PROPS.m);

  const handleMouseDown = evt => {
    props.onChosed({ win: this, dom: ref.current, op: cursor }, evt);
    console.log(stdRect(evt.target))
  };

  const handleMouseUp = evt => {};

  const handleMouseMove = evt => {
    const { clientX: mouseX, clientY: mouseY } = evt;
    const {
      offsetLeft: boxLeft,
      offsetTop: boxTop,
      offsetWidth: boxWidth,
      offsetHeight: boxHeight
    } = evt.target;

    // console.log(mouseX, mouseY, boxLeft, boxTop, boxWidth, boxHeight)

    if (
      mouseX < boxLeft + MOUSE_MARGIN &&
      mouseY > boxTop + MOUSE_MARGIN &&
      mouseY < boxTop + boxHeight - MOUSE_MARGIN
    )
      setCursor(RESIZE_PROPS.l);
    else if (
      mouseX > boxLeft + boxWidth - MOUSE_MARGIN &&
      mouseY > boxTop + MOUSE_MARGIN &&
      mouseY < boxTop + boxHeight - MOUSE_MARGIN
    )
      setCursor(RESIZE_PROPS.r);
    else if (
      mouseY < boxTop + MOUSE_MARGIN &&
      mouseX > boxLeft + MOUSE_MARGIN &&
      mouseX < boxLeft + boxWidth - MOUSE_MARGIN
    )
      setCursor(RESIZE_PROPS.t);
    else if (
      mouseY > boxTop + boxHeight - MOUSE_MARGIN &&
      mouseX > boxLeft + MOUSE_MARGIN &&
      mouseX < boxLeft + boxWidth - MOUSE_MARGIN
    )
      setCursor(RESIZE_PROPS.b);
    else if (mouseX < boxLeft + MOUSE_MARGIN && mouseY < boxTop + MOUSE_MARGIN)
      setCursor(RESIZE_PROPS.tl);
    else if (
      mouseX > boxLeft + boxWidth - MOUSE_MARGIN &&
      mouseY < boxTop + MOUSE_MARGIN
    )
      setCursor(RESIZE_PROPS.tr);
    else if (
      mouseX < boxLeft + MOUSE_MARGIN &&
      mouseY > boxTop + boxHeight - MOUSE_MARGIN
    )
      setCursor(RESIZE_PROPS.bl);
    else if (
      mouseX > boxLeft + boxWidth - MOUSE_MARGIN &&
      mouseY > boxTop + boxHeight - MOUSE_MARGIN
    )
      setCursor(RESIZE_PROPS.br);
    else setCursor(RESIZE_PROPS.m);
  };

  const style = {
    left: props.x,
    top: props.y,
    width: props.w,
    height: props.h,
    position: 'absolute',
    backgroundColor: props.color,
    opacity: props.opacity ? props.opacity : 1,
    cursor: cursor
  };

  return (
    <div
      ref={ref}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {props.children}
    </div>
  );
};

const Magnets = props => {
  const ref = createRef();
  const cref = createRef();

  const [layout, setLayout] = useState(3);

  const ori = {};

  useEffect(() => {
    renderGrid();
  });

  const handleMouseMove = evt => {
    evt.stopPropagation();
    if (!ori.win) return;

    // const rect = stdRect(ori.win.dom);
    const { x, y } = getEventXY(evt);

    const diffX = x - ori.pos.x;
    const diffY = y - ori.pos.y;
    const newX = diffX + ori.rect.left;
    const newY = diffY + ori.rect.top;
    const newRect = stdRect(ori.win.dom);

    console.log(newRect);

    switch (ori.win.op) {
      case RESIZE_PROPS.l:
      case RESIZE_PROPS.bl:
      case RESIZE_PROPS.tl:
        newRect.left = newX;
        newRect.width = ori.rect.width - diffX;
        break;

      case RESIZE_PROPS.r:
      case RESIZE_PROPS.br:
      case RESIZE_PROPS.tr:
        newRect.width = ori.rect.width + diffX;
        break;
      case RESIZE_PROPS.m:
        newRect.left = newX;
        break;
    }

    switch (ori.win.op) {
      case RESIZE_PROPS.t:
      case RESIZE_PROPS.tl:
      case RESIZE_PROPS.tr:
        newRect.top = newY;
        newRect.height = ori.rect.height - diffY;
        break;

      case RESIZE_PROPS.b:
      case RESIZE_PROPS.bl:
      case RESIZE_PROPS.br:
        newRect.height = ori.rect.height + diffY;
        break;
      case RESIZE_PROPS.m:
        newRect.top = newY;
        break;
    }
    newRect.right = newRect.left + newRect.width;
    newRect.bottom = newRect.top + newRect.height;

    handle(newRect);

    evt.stopPropagation();
  };

  const handleMouseDown = evt => {
    evt.stopPropagation();
  };

  const handleMouseUp = evt => {
    evt.stopPropagation();
    for (let key in ori) delete ori[key];
  };

  const check = (refDom, refRect) => {
    if (!ref.current) return;

    const dom = ref.current;

    const alignmentProps = [].concat(ALIGNMENT_OUTER, ALIGNMENT_INNER);
    const parentDom = getParent(refDom);
    const parentRect = stdRect(parentDom);
    const targets = Array.from(dom.children)
      .filter(i => i.tagName === 'DIV' && i !== ori.win.dom)
      .filter(dom => dom !== refDom)
      .map(dom => diffRect(refRect, dom, { alignments: alignmentProps }));
    const results = targets.reduce((results, diff) => {
      objForEach(diff.results, (_, prop) => {
        results[prop] = results[prop] || [];
        results[prop].push(diff);
      });
      return results;
    }, {});
    const rankings = objMap(results, (arr, prop) =>
      arr.concat().sort((a, b) => a.results[prop] - b.results[prop])
    );
    return {
      source: { rect: refRect, element: refDom },
      parent: { rect: parentRect, element: parentDom },
      targets,
      results,
      rankings,
      mins: objMap(rankings, arr => arr[0]),
      maxs: objMap(rankings, arr => arr[arr.length - 1])
    };
  };

  const handle = rect => {
    if (!ori.win) return;

    const dom = ori.win.dom;

    const { top, left, width, height } = rect;
    const { parent, targets } = check(dom, rect);
    const { rect: parentRect, element: parentElement } = parent;
    const newPosition = { x: left, y: top };
    const { x: attractedX, y: attractedY } = targets.reduce(
      ({ x, y }, diff) => {
        const { target, results, ranking } = diff;
        return ranking.reduce(
          ({ x, y }, prop) => {
            let value = results[prop];
            if (value <= NEAR_DISTANCE) {
              switch (prop) {
                case ALIGNMENT_PROPS.rr:
                case ALIGNMENT_PROPS.ll:
                case ALIGNMENT_PROPS.rl:
                case ALIGNMENT_PROPS.lr:
                case ALIGNMENT_PROPS.xx:
                  if (!x || value < x.value) {
                    x = { prop, value, target };
                  }
                  break;

                case ALIGNMENT_PROPS.tt:
                case ALIGNMENT_PROPS.bb:
                case ALIGNMENT_PROPS.tb:
                case ALIGNMENT_PROPS.bt:
                case ALIGNMENT_PROPS.yy:
                  if (!y || value < y.value) {
                    y = { prop, value, target };
                  }
                  break;
              }
            }
            return { x, y };
          },
          { x, y }
        );
      },
      { x: null, y: null }
    );

    if (attractedX) {
      const {
        prop,
        target: { rect }
      } = attractedX;
      switch (prop) {
        case ALIGNMENT_PROPS.rr:
          newPosition.x = rect.right - width;
          break;
        case ALIGNMENT_PROPS.ll:
          newPosition.x = rect.left;
          break;
        case ALIGNMENT_PROPS.rl:
          newPosition.x = rect.left - width;
          break;
        case ALIGNMENT_PROPS.lr:
          newPosition.x = rect.right;
          break;
        case ALIGNMENT_PROPS.xx:
          newPosition.x = (rect.left + rect.right - width) / 2;
          break;
      }
    }
    if (attractedY) {
      const {
        prop,
        target: { rect }
      } = attractedY;
      switch (prop) {
        case ALIGNMENT_PROPS.tt:
          newPosition.y = rect.top;
          break;
        case ALIGNMENT_PROPS.bb:
          newPosition.y = rect.bottom - height;
          break;
        case ALIGNMENT_PROPS.tb:
          newPosition.y = rect.bottom;
          break;
        case ALIGNMENT_PROPS.bt:
          newPosition.y = rect.top - height;
          break;
        case ALIGNMENT_PROPS.yy:
          newPosition.y = (rect.top + rect.bottom - height) / 2;
          break;
      }
    }

    let targetRect = ((x, y) =>
      stdRect({
        top: y,
        right: x + width,
        bottom: y + height,
        left: x,
        width,
        height
      }))(newPosition.x - parentRect.left, newPosition.y - parentRect.top);

    dom.style.top = toPx(targetRect.top);
    dom.style.left = toPx(targetRect.left);
    dom.style.width = toPx(targetRect.width);
    dom.style.height = toPx(targetRect.height);
  };

  const onChosed = (box, evt) => {
    if (ori.win === box) return;
    ori.win && (ori.win.dom.style.zIndex = 0);
    ori.win && (box.dom.style.zIndex = 10);

    ori.win = box;
    ori.pos = (({ x: x, y: y }) => ({ x, y }))(getEventXY(evt));
    ori.rect = (({ left: left, top: top, width: width, height: height }) => ({
      left,
      top,
      width,
      height
    }))(stdRect(box.dom));

    // const border = (({
    //   borderTopWidth: t,
    //   borderRightWidth: r,
    //   borderBottomWidth: b,
    //   borderLeftWidth: l
    // }) => ({ t, r, b, l }))(getStyle(box));
    // console.log(border);
    // console.log(box.getBoundingClientRect())
    // console.log(getStyle(box.current))

    // console.log(window.innerHeight, window.innerWidth);
    // console.log(box.parentElement);
    // if(box)
    //   console.log(box.style.top, box.style.height);
    // box.style.top = '300px';
  };

  const children = React.Children.map(props.children, child =>
    React.cloneElement(child, {
      onChosed: onChosed,
      ...child.props
    })
  );

  const renderGrid = useCallback(() => {
    const canvas = cref.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'lightgray';
    ctx.setLineDash([8, 4]);

    for (let i = 1; i < layout; i++) {
      const gwidth = canvas.width;
      const gheight = canvas.height;
      const width = (i / layout) * gwidth;
      const height = (i / layout) * gheight;

      ctx.moveTo(width, 0);
      ctx.lineTo(width, gheight);

      ctx.moveTo(0, height);
      ctx.lineTo(gwidth, height);
    }
    ctx.stroke();
  }, [cref, layout]);

  const style = {
    width: props.width,
    height: props.height,
    background: '#F5F8FA',
    border: '1px solid lightgray',
  };

  return (
    <div
      ref={ref}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {props.grid && (
        <canvas ref={cref} width={props.width} height={props.height} />
      )}
      {children}
    </div>
  );
};

export { Magnets, Magnet };
