import { hot } from 'react-hot-loader/root';
import React, { Suspense } from 'react';

const Home = React.lazy(() => import('./components/home'));

const App = props => {
	return <div style={{ height: '100%' }}>
			<Suspense fallback={null}>
				<Home />
			</Suspense>
		</div>
};

export default hot(App);
