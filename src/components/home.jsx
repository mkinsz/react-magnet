import React from 'react';
import { Magnets, Magnet } from './magnet';
import { Box, Boxs } from './box';
import { Scene, View } from './scene';

const Home = props => {
    const [magneted, setMagneted] = React.useState(true)

    const squares = [
        [300, 400, 100, 200],
        [300, 200, 100, 100],
        [500, 400, 100, 100]
    ];

    const children = squares.map(i => {
        const color =
            '#' +
            [1, 2, 3]
                .map(() =>
                    ('0' + parseInt(100 + Math.random() * 155).toString(16)).slice(-2)
                )
                .join('');
        const opacity = 0.25 + Math.random() * 0.75;
        return (
            <Magnet
                key={i}
                x={i[0]}
                y={i[1]}
                w={i[2]}
                h={i[3]}
                color={color}
                opacity={opacity}
            ></Magnet>
        );
    });

    const handleClick = e => {
        setMagneted('box-m' == e.target.id)
    }

    const data = [
        [0, 0, 200, 200],
        [200, 0, 200, 200],
        [0, 200, 200, 200],
        [200, 200, 200, 200],
    ];

    const boxes = data.map(i => {
        const color =
            '#' +
            [1, 2, 3]
                .map(() =>
                    ('0' + parseInt(100 + Math.random() * 155).toString(16)).slice(-2)
                )
                .join('');
        const opacity = 0.25 + Math.random() * 0.75;
        return (
            <Box
                key={i}
                x={i[0]}
                y={i[1]}
                w={i[2]}
                h={i[3]}
                color={color}
                opacity={opacity}
                moveable={false}
            ></Box>
        );
    });

    const base = {
        name: "大屏",
        id: 5,
        kvm: true,
        rate: 60,
        row: 2,
        col: 2,
        width: 1920,
        height: 1080,
        cellnum: 4
    }

    const _cells = [
        {
            "id": 3,
            "chnid": 0,
            "startx": 0,
            "starty": 1080,
            "width": 1920,
            "hight": 1080
        },
        {
            "id": 1,
            "chnid": 0,
            "startx": 0,
            "starty": 0,
            "width": 1920,
            "hight": 1080
        },
        {
            "id": 2,
            "chnid": 0,
            "startx": 1920,
            "starty": 0,
            "width": 1920,
            "hight": 1080
        },
        {
            "id": 4,
            "chnid": 0,
            "startx": 1920,
            "starty": 1080,
            "width": 1920,
            "hight": 1080
        }]

    const cells = [
        {
            "id": 1,
            "chnid": 0,
            "startx": 0,
            "starty": 0,
            "width": 810,
            "hight": 540
        }, {
            "id": 2,
            "chnid": 0,
            "startx": 810,
            "starty": 0,
            "width": 1920,
            "hight": 540
        }, {
            "id": 3,
            "chnid": 0,
            "startx": 2730,
            "starty": 0,
            "width": 1920,
            "hight": 540
        }, {
            "id": 4,
            "chnid": 0,
            "startx": 0,
            "starty": 540,
            "width": 810,
            "hight": 1080
        }, {
            "id": 5,
            "chnid": 0,
            "startx": 810,
            "starty": 540,
            "width": 1920,
            "hight": 1080
        }, {
            "id": 6,
            "chnid": 0,
            "startx": 2730,
            "starty": 540,
            "width": 1920,
            "hight": 1080
        }, {
            "id": 7,
            "chnid": 0,
            "startx": 0,
            "starty": 1620,
            "width": 810,
            "hight": 1080
        }, {
            "id": 8,
            "chnid": 0,
            "startx": 810,
            "starty": 1620,
            "width": 1920,
            "hight": 1080
        }, {
            "id": 9,
            "chnid": 0,
            "startx": 2730,
            "starty": 1620,
            "width": 1920,
            "hight": 1080
        }
    ]

    const br = cells.reduce(({ w = 0, h = 0 }, m) => {
        const r = m.startx + m.width
        const b = m.starty + m.hight
        return { w: w < r ? r : w, h: h < b ? b : h }
    })

    const w = 600; const h = 300;
    const radio = (w * br.h > h * br.w) ? h / br.h : w / br.w

    const width = br.w * radio;
    const height = br.h * radio;

    return (
        <>
            <button id='box-m' onClick={handleClick}>Magnet</button>
            <button id='box-b' onClick={handleClick}>Box</button>

            <div className='box-contain'
                style={{
                    width: '100%',
                    height: 300,
                    border: '1px solid lightgray',
                    boxShadow: '0 0 5px 1px #CCC inset',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around'
                }}
            >
                {
                    // magneted ? <Magnets width={800} height={500} grid>
                    //     {children}
                    // </Magnets> : 
                    magneted ? <Scene w={width} h={height} data={cells} radio={radio}>
                        <View x={200} y={200} w={100} h={100}></View>
                    </Scene> :
                        <Boxs>
                            {boxes}
                            <Box x={500} y={500} w={100} h={100} color={'steelblue'}></Box>
                        </Boxs>
                }
            </div>
        </>
    );
};

export default Home