<template>
	<div class="pathfinding-visualizer" @click="clearFocus">
		<VisualizerCanvas
			ref="visualizer"
			:nodeDimensions="nodeDimensions"
			:rows="rows"
			:cols="cols"
			:grid="grid"
			:start="start"
			:finish="finish"
			:visualizerState="visualizerState"
			:colors="colors"
			:controlType="controlType"
			:worldSetup="worldSetup"
			:selectedAlgorithm="selectedAlgorithm"
			:streaming="streaming"
			:thresholdValue="thresholdValue"
			@clickEvent="onClick"
			@groundInitialized="ground = $event"
			@switchWorldSetup="worldSetup = !worldSetup"
			@switchControlType="controlType = controlType == 'Orbit' ? 'PointerLock' : 'Orbit'"
			@updateEnds="updateEnds"
		/>
		<transition-group name="slide" mode="out-in" tag="div" class="header py-1">
			<select
				id="algorithms"
				v-model="selectedAlgorithm"
				:disabled="visualizerState == 'running'"
				key="algo-select"
				v-if="!worldSetup"
			>
				<option :value="algo" v-for="algo in algorithms" :key="algo.algorithm">{{
					algo.displayName
				}}</option>
			</select>
			<Button
				class="accent"
				@click="visualizeAlgorithm()"
				:disabled="visualizerState == 'running' || worldSetup"
				key="visualize"
				v-if="!worldSetup"
			>
				<img class="fallback-icon" src="@/assets/icons/path.svg" alt="" />
				<span class="lg">اجرای الگوریتم</span>
			</Button>
			<Button class="danger" @click="clearPath" key="clear-path" :disabled="visualizerState == 'running'">
				<img class="fallback-icon" src="@/assets/icons/cross.svg" alt="" />
				<span class="lg">حذف مسیر</span>
				<span class="sm">مسیر</span>
			</Button>
			<Button class="danger" @click="clearWalls" key="clear-walls" :disabled="visualizerState == 'running'">
				<img class="fallback-icon" src="@/assets/icons/cross.svg" alt="" />
				<span class="lg">حذف دیوارها</span>
				<span class="sm">دیوارها</span>
			</Button>
			<div class="maze-dropdown" key="maze-select">
				<Button class="info btn-maze" @click="onMazeDropdownClick">
					<img class="fallback-icon" src="@/assets/icons/maze.svg" alt="" />
					<span class="lg">الگوریتم‌های ماز</span>
				</Button>
				<div class="dropdown" v-if="dropdownOpen">
					<div
						class="dropdown-item"
						v-for="algo in mazeAlgorithms"
						:key="algo"
						@click="generateMaze(algo)"
					>
						{{ algo }}
					</div>
				</div>
			</div>
			<select
				id="algorithms"
				v-model="selectedSpeed"
				:disabled="visualizerState == 'running'"
				key="speed-select"
				v-if="!worldSetup"
			>
				<option :value="speed" v-for="speed in speeds" :key="speed.text">{{ speed.text }}</option>
			</select>
		</transition-group>
		<Button
			class="hover btn-setup warning"
			:class="{ setup: worldSetup }"
			key="setup"
			v-if="controlType != 'PointerLock'"
			@click="worldSetup = !worldSetup"
		>
			<img src="@/assets/icons/setup.svg" alt="" />
			<span class="lg">{{ worldSetup ? "اتمام تنظیمات" : "تنظیم محیط" }}</span>
		</Button>
		<Button
			class="hover btn-controls warning"
			key="switch-controls"
			v-if="!worldSetup"
			@click="switchControl"
		>
			<img src="@/assets/icons/street-view.svg" alt="" v-if="controlType == 'Orbit'" />
			<img src="@/assets/icons/perspective.svg" alt="" v-else />
			<span class="lg">{{ controlType == "Orbit" ? "نمای اول‌شخص" : "نمای پرسپکتیو" }}</span>
		</Button>
		<Button
			class="hover btn-camera warning"
			key="reset-camera"
			v-if="controlType == 'Orbit'"
			@click="$refs.visualizer.resetCamera()"
		>
			<img src="@/assets/icons/reset-camera.svg" alt="" />
			<span class="lg">بازنشانی دوربین</span>
		</Button>
		<Button
			class="hover btn-device-cam warning"
			:class="{ active: deviceCamInput }"
			key="device-camera"
			v-if="worldSetup"
			@click="deviceCamInput = !deviceCamInput"
		>
			<img src="@/assets/icons/camera.svg" alt="" />
			<span class="lg">{{ "ورودی دوربین" }}</span>
		</Button>

		<canvas id="video-canvas"></canvas>
		<video id="video" autoplay></video>
		<input id="threshold" ref="threshold" v-if="deviceCamInput" type="range" min="0" max="255" v-model="thresholdValue">

		<Info ref="info" :colors="colors" @unlockSwarm="unlockSwarm"></Info>
	</div>
</template>

<script>
import VisualizerCanvas from "./VisualizerCanvas.vue";
import Info from '@/components/UI/Info.vue';
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

import { getNodesInShortestPathOrder, tweenToColor } from "./algorithms/helpers.js";
import { weightedSearchAlgorithm } from "./algorithms/weightedSearchAlgorithm.js";
import { unweightedSearchAlgorithm } from "./algorithms/unweightedSearchAlgorithm.js";
import { randomMaze, recursiveDivisionMaze } from "./algorithms/mazeAlgorithms.js";


export default {
	components: {
		VisualizerCanvas,
		Info
	},
	data: () => ({
		visualizerState: "clear", // clear/running/finished
		algorithms: [
			{
				algorithm: "dijkstra",
				heuristic: "",
				displayName: "Dijkstra's Algorithm",
				type: "weighted",
				info: {
					heading: "Dijkstra's Algorithm",
					text: `Dijkstra یکی از پایه‌ای‌ترین و مهم‌ترین الگوریتم‌های مسیریابی است که یک درخت از کوتاه‌ترین مسیرها را از رأس شروع (مبدأ) تا تمام نقاط دیگر گراف ایجاد می‌کند.
					<br><br>
					این الگوریتم از نوع <b>وزن‌دار (weighted)</b> است و <b>کوتاه‌ترین مسیر</b> را تضمین می‌کند!`
				}
			},
			{
				algorithm: "astar",
				heuristic: "poweredManhattanDistance",
				displayName: "A* Search",
				type: "weighted",
				info: {
					heading: "A* Search Algorithm",
					text: `A* یکی از قدرتمندترین و محبوب‌ترین الگوریتم‌ها برای مسیریابی و پیمایش گراف است. این الگوریتم با اضافه‌کردن یک تابع تخمینی (heuristic) به جست‌وجوی معمولی در گراف، در هر قدم کمی جلوتر را بررسی می‌کند تا تصمیم‌های بهینه‌تری بگیرد.
					<br><br>
					این الگوریتم از نوع <b>وزن‌دار (weighted)</b> است و <b>کوتاه‌ترین مسیر</b> را تضمین می‌کند!`
				}
			},
			{
				algorithm: "bfs",
				heuristic: "",
				displayName: "Breadth-first Search",
				type: "unweighted",
				info: {
					heading: "Breadth-first Search",
					text: `Breadth-first Search الگوریتمی برای پیمایش یا جست‌وجوی درخت و گراف است. این الگوریتم از ریشه شروع می‌کند و ابتدا تمام گره‌های هم‌سطح (در یک عمق) را بررسی می‌کند، سپس به سراغ سطح بعدی می‌رود.
					<br><br>
					این الگوریتم از نوع <b>بدون‌وزن (unweighted)</b> است و <b>کوتاه‌ترین مسیر</b> را تضمین می‌کند!`
				}
			},
			{
				algorithm: "dfs",
				heuristic: "",
				displayName: "Depth-first Search",
				type: "unweighted",
				info: {
					heading: "Depth-first Search",
					text: `Depth-first Search الگوریتمی برای پیمایش یا جست‌وجوی درخت و گراف است. الگوریتم از ریشه شروع می‌کند و تا جایی که ممکن باشد در هر شاخه به عمق می‌رود، سپس به عقب برمی‌گردد و شاخه‌های دیگر را ادامه می‌دهد.
					<br><br>
					این الگوریتم از نوع <b>بدون‌وزن (unweighted)</b> است و <b>کوتاه‌ترین مسیر را تضمین نمی‌کند</b>!`
				}
			},
		],
		swarm: {
			algorithm: "CLA",
			heuristic: "manhattanDistance",
			displayName: "Swarm Algorithm",
			type: "weighted",
			info: {
				heading: "Swarm Algorithm",
				text: `Swarm Algorithm (به‌احتمال زیاد توسعه‌یافته توسط Clément Mihailescu و Hussein Farah) در اصل ترکیبی از Dijkstra و A* است. به‌طور دقیق‌تر، در حالی که مانند A* به سمت گره هدف همگرا می‌شود، همچنان شبیه Dijkstra تعداد قابل‌توجهی از گره‌های همسایه اطراف گره شروع را نیز کاوش می‌کند.
				<br><br>
				این الگوریتم از نوع <b>وزن‌دار (weighted)</b> است و <b>کوتاه‌ترین مسیر را تضمین نمی‌کند</b>!`
			}
		},
		selectedAlgorithm: null,
		speeds: [
			{
				text: "سریع",
				value: 15,
			},
			{
				text: "متوسط",
				value: 25,
			},
			{
				text: "کند",
				value: 45,
			},
			{
				text: "خیلی کند",
				value: 80,
			},
		],
		selectedSpeed: null,
		mazeAlgorithms: ["Random Maze", "Recursive Division"],
		dropdownOpen: false,
		nodeDimensions: {
			height: 8,
			width: 8,
		},
		rows: 30,
		cols: 30,
		grid: [],
		ground: null,
		controlType: "Orbit", // Orbit/PointerLock
		start: {
			row: 3,
			col: 5,
		},
		finish: {
			row: 16,
			col: 22,
		},
		worldSetup: false,
		deviceCamInput: false,
		streaming: false,
		thresholdValue: 100,
		colors: {
			default: { r: 1, g: 1, b: 1 },
			start: { r: 0, g: 1, b: 0 },
			finish: { r: 1, g: 0, b: 0 },
			wall: { r: 0.109, g: 0.109, b: 0.45 },
			visited: { r: 0.329, g: 0.27, b: 0.968 },
			path: { r: 1, g: 1, b: 0 },
		},
		infoStatus: '',
		infoObject: {
			heading: "",
			text: ""
		}
	}),
	watch: {
		selectedAlgorithm: function(newVal, oldVal) {
			if (newVal.type == "unweighted") {
				this.clearWalls();
			}
			this.dropdownOpen = false;
			this.$refs.info.resetToLegends();
		},
		worldSetup: function(newVal, oldVal) {
			if(newVal) {
				this.clearPath();
			} else {
				this.deviceCamInput = false;
			}
		},
		deviceCamInput: function(newVal, oldVal) {
			if(newVal) {
				function hasGetUserMedia() {
					return !!(navigator.mediaDevices &&
						navigator.mediaDevices.getUserMedia);
				}

				this.clearWalls();

				const videoCanvas = document.querySelector('#video-canvas');
				let videoCtx = videoCanvas.getContext("2d");
				const video = document.querySelector('video');
				this.thresholdValue = 100;
				const scale = 17;
				const width = 512;
				const height = 512;
				if (hasGetUserMedia()) {
					videoCanvas.width = width/scale;
					videoCanvas.height = height/scale;
					const constraints = {
						video: { width: { exact: width/scale }, height: { exact: height/scale } }
					};

					navigator.mediaDevices.getUserMedia(constraints)
						.then((stream) => {
							video.srcObject = stream;
							this.streaming = true;
						});
				} else {
					alert('getUserMedia() توسط مرورگر شما پشتیبانی نمی‌شود.');
				}
			} else {
				const video = document.querySelector('video');
				const stream = video.srcObject;
				const tracks = stream.getTracks();

				tracks.forEach(function(track) {
					track.stop();
				});

				video.srcObject = null;
				this.streaming = false;
			}
		}
	},
	created() {
		this.selectedAlgorithm = this.algorithms[0];
		this.start.gridId = this.start.row * this.cols + this.start.col;
		this.finish.gridId = this.finish.row * this.cols + this.finish.col;
		this.selectedSpeed = this.speeds[0];
	},
	methods: {
		onClick(node) {
			let vm = this;
			if (this.visualizerState == "running") return;
			if(this.selectedAlgorithm.type == "unweighted") {
				this.$refs.info.error({
					heading: "اوه!",
					text: "در الگوریتم‌های بدون‌وزن (unweighted) امکان اضافه کردن دیوار وجود ندارد."
				});
				return;
			}
			if (node.status != "wall") {
				if (node.status == "start" || node.status == "finish") return;
				node.status = "wall";
			} else {
				node.status = "default";
			}
		},

		onMazeDropdownClick() {
			if(this.selectedAlgorithm.type != 'unweighted') {
				this.dropdownOpen = !this.dropdownOpen;
			} else {
				this.dropdownOpen = false;
				this.$refs.info.error({
					heading: "اوه!",
					text: "در الگوریتم‌های بدون‌وزن (unweighted) امکان اضافه کردن دیوار وجود ندارد."
				});
			}
		},

		updateEnds(obj) {
			if (obj.start) {
				this.start = obj.start;
				this.start.gridId = obj.start.row * this.cols + obj.start.col;
			} else {
				this.finish = obj.finish;
				this.finish.gridId = obj.finish.row * this.cols + obj.finish.col;
			}
		},

		unlockSwarm() {
			console.log('Unlocked Swarm');
			this.algorithms.push(this.swarm);
		},

		clearWalls() {
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < this.cols; j++) {
					let status = "default";
					if (this.grid[i][j].status == "wall") {
						this.$set(this.grid[i][j], "status", status);
					}
				}
			}
		},

		clearPath() {
			TWEEN.removeAll();
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < this.cols; j++) {
					let status = "default";
					if (i == this.start.row && j == this.start.col) {
						status = "start";
					} else if (i == this.finish.row && j == this.finish.col) {
						status = "finish";
					}
					if (this.grid[i][j].status != "wall") {
						this.$set(this.grid[i][j], "status", status);
					}
					this.$set(this.grid[i][j], "distance", Infinity);
					this.$set(this.grid[i][j], "totalDistance", Infinity);
					this.$set(this.grid[i][j], "heuristicDistance", null);
					this.$set(this.grid[i][j], "direction", null);
					this.$set(this.grid[i][j], "previousNode", null);
				}
			}
			this.visualizerState = "clear";
		},

		switchControl() {
			if (this.controlType == "Orbit") {
				this.controlType = "PointerLock";
				setTimeout(() => {
					this.$refs.info.alert({
						heading: "شروع نمای اول‌شخص",
						text: "برای شروع حرکت ماوس در نمای اول‌شخص، روی هر نقطه از بوم (Canvas) کلیک کنید. برای خروج از این حالت، کلید Esc را فشار دهید."
					});
				}, 2000)
			} else {
				this.controlType = "Orbit";
				this.$refs.info.resetToLegends();
			}
		},

		moveCamera() {
			this.$refs.visualizer.controls.enabled = false;
			new TWEEN.Tween(this.$refs.visualizer.camera.position)
				.to({ x: -100, y: 200, z: 100 }, 2000)
				.easing(TWEEN.Easing.Exponential.Out)
				.onUpdate(() => {
					this.$refs.visualizer.camera.lookAt(this.$refs.visualizer.scene.position);
					// this.$refs.visualizer.controls.update();
				})
				.onComplete(() => {
					this.$refs.visualizer.controls.enabled = true;
				})
				.start();
			// new TWEEN.Tween(this.$refs.visualizer.camera.rotation)
			// 	.to({ x: -(Math.PI/3), y: -(Math.PI/8), z: 0 }, 2000)
			// 	.easing(TWEEN.Easing.Exponential.Out)
			// 	.start();
		},

		visualizeAlgorithm() {
			let timerDelay = this.selectedSpeed.value;
			this.clearPath();
			// this.moveCamera();
			this.$nextTick(() => {
				this.visualizerState = "running";
				const startNode = this.grid[this.start.row][this.start.col];
				const finishNode = this.grid[this.finish.row][this.finish.col];
				let nodesToAnimate = [];
				let success;
				if (this.selectedAlgorithm.type == "weighted") {
					success = weightedSearchAlgorithm(
						this.grid,
						startNode,
						finishNode,
						nodesToAnimate,
						this.selectedAlgorithm.algorithm,
						this.selectedAlgorithm.heuristic,
					);
				} else {
					this.clearWalls();
					success = unweightedSearchAlgorithm(
						this.grid,
						startNode,
						finishNode,
						nodesToAnimate,
						this.selectedAlgorithm.algorithm
					);
				}
				console.log("success:", success);
				if (success == false) {
					this.clearPath();
					this.visualizerState = "finished";
					this.$refs.info.error({
						heading: "مسیر پیدا نشد",
						text: "وقتی یکی از نقاط شروع یا پایان غیرقابل‌دسترسی باشد، مسیری بین آن‌ها پیدا نخواهد شد."
					});
					return;
				}
				const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
				this.$nextTick(() => {
					this.animateAlgorithm(nodesToAnimate, nodesInShortestPathOrder, timerDelay);
				});
			});
		},

		animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, timerDelay) {
			for (let i = 0; i <= visitedNodesInOrder.length; i++) {
				if (i === visitedNodesInOrder.length) {
					setTimeout(() => {
						this.animateShortestPath(nodesInShortestPathOrder, 5 * timerDelay);
					}, timerDelay * i);
					return;
				}
				if (
					(visitedNodesInOrder[i].row == this.start.row &&
						visitedNodesInOrder[i].col == this.start.col) ||
					(visitedNodesInOrder[i].row == this.finish.row &&
						visitedNodesInOrder[i].col == this.finish.col)
				) {
					continue;
				}
				setTimeout(() => {
					const node = visitedNodesInOrder[i];
					if (!node) return;
					tweenToColor(
						node,
						this.ground.geometry,
						[{ r: 1.0, g: 0.321, b: 0.784 }, this.colors.visited],
						300,
						{ position: false }
					);
				}, timerDelay * i);
			}
		},

		animateShortestPath(nodesInShortestPathOrder, timerDelay) {
			let vm = this;
			for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
				setTimeout(() => {
					const node = nodesInShortestPathOrder[i];
					tweenToColor(node, this.ground.geometry, [this.colors.path], undefined, {
						position: false,
					});
					if (i == nodesInShortestPathOrder.length - 1) {
						vm.visualizerState = "finished";
						vm.$refs.info.alert(this.selectedAlgorithm.info);
					}
				}, timerDelay * i);
			}
		},

		generateMaze(algo) {
			this.dropdownOpen = false;
			this.clearWalls();
			this.clearPath();
			let nodesToAnimate = [];
			if (algo == "Random Maze") {
				randomMaze(this.grid, nodesToAnimate, "wall");
			} else {
				recursiveDivisionMaze(
					this.grid,
					2,
					this.grid.length - 3,
					2,
					this.grid[0].length - 3,
					"horizontal",
					false,
					nodesToAnimate,
					"wall"
				);
			}
			this.animateMaze(nodesToAnimate, "wall", 30);
		},

		animateMaze(visitedNodesInOrder, type, timerDelay) {
			for (let i = 0; i < visitedNodesInOrder.length; i++) {
				setTimeout(() => {
					const node = visitedNodesInOrder[i];
					node.status = type;
				}, timerDelay * i);
			}
		},

		clearFocus() {
			document.getElementsByClassName("header")[0].click();
		},
	},
};
</script>

<style lang="scss">
@import '@/scss/variables.scss';

.pathfinding-visualizer {
	width: 100vw;
	height: 100vh;
	overflow: hidden;

	.header {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		transition: all 500ms ease-out;
		z-index: 1;

		&::before {
			content: '';
			position: absolute;
			top: -100%;
			left: 0;
			height: 100%;
			width: 100%;
			box-shadow: 1px 10px 50px rgba(0, 0, 0, 1);
			z-index: -1;
		}

		select {
			height: 40px;
			background: white;
			color: rgb(0, 0, 0);
			padding: 10px;
			margin: 2px;
			border-radius: 3px;
			border: none;
			width: fit-content;
		}
	}

	.btn {
		margin: 2px;
		font-size: 0.7em;
		font-weight: 600;
		text-transform: uppercase;
		.lg {
			display: block;
		}
		.sm {
			display: none;
		}
	}
	.btn-setup {
		top: 60px;
		&.setup {
			background: $success-low;
			&:hover {
				background: $success;
			}
		}
	}
	.btn-controls {
		top: 115px;
	}
	.btn-camera {
		top: 170px;
	}
	.btn-device-cam {
		top: 225px;
		&.active {
			background: $success-low;
			&:hover {
				background: $success;
			}
		}
	}
	.fallback-icon {
		display: none;
	}

	.maze-dropdown {
		position: relative;

		.dropdown {
			position: absolute;
			top: 100%;
			left: 0;
			width: 100%;
			min-width: fit-content;
			z-index: 2;

			.dropdown-item {
				padding: 10px;
				font-size: 0.8em;
				font-weight: 600;
				color: white;
				background: $secondary;
				cursor: pointer;
				&:hover {
					filter: brightness(0.9);
				}
			}
		}
	}

	@media (max-width: 792px) {
		.btn {
			.lg {
				display: none;
			}
			.sm {
				display: block;
				font-size: 0.7em;
			}
			&.hover {
				&:hover {
					width: 55px;
				}
			}
		}
		.btn-camera {
			top: 115px;
		}
		.btn-device-cam {
			top: 170px;
		}
		.fallback-icon {
			display: block;
		}
		.btn-controls {
			display: none;
		}
		.header {
			select {
				padding: 2px;
				font-size: 0.7em;
			}
		}
	}

	#video-canvas {
		position: absolute;
		bottom: 10px;
		left: 0;
		width: 80px;
		height: 80px;
		visibility: hidden;
	}
	#video {
		position: absolute;
		bottom: 80px;
		left: 4px;
		width: 80px;
		height: 80px;
		transform: rotateY(180deg);
    -webkit-transform:rotateY(180deg); /* Safari and Chrome */
    -moz-transform:rotateY(180deg); /* Firefox */
	}
	#threshold {
		position: absolute;
		bottom: 55px;
		left: 3px;
		width: 80px;
	}

	.slide-enter-active,
	.slide-leave-active {
		transition: all 500ms ease-in-out;
	}
	.slide-leave-active {
		position: absolute;
	}
	.slide-enter,
	.slide-leave-to {
		opacity: 0;
		transform: translateY(-50%);
	}
	.slide-move {
		transition: all 500ms ease-in-out;
	}
}
</style>
