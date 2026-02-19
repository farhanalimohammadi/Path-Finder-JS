import Vue from 'vue';
import Router from 'vue-router';
import PathfindingVisualizer from './components/PathfindingVisualizer.vue';
import AboutPage from './views/About.vue';

Vue.use(Router);

export default new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			name: 'Home',
			component: PathfindingVisualizer,
		},
		{
			path: '/about',
			name: 'About',
			component: AboutPage,
		},
	],
});


