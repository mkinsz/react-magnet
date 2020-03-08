import React from 'react';
import { Magnets, Magnet } from './magnet';
import Boxs  from './box';

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

    return (
        <>
            <button id='box-m' onClick={handleClick}>Magnet</button>
            <button id='box-b' onClick={handleClick}>Box</button>

            <div className='box-contain'
                style={{
                    width: '100%',
                    height: '100%',
                    border: '1px solid lightgray',
                    boxShadow: '0 0 5px 1px #CCC inset',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around'
                }}
            >
                {
                    magneted ? <Magnets width={800} height={500} grid>
                        {children}
                    </Magnets> : <Boxs />
                }

            </div>
        </>
    );
};

export default Home