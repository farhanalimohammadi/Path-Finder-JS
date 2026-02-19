<template>
	<div class="info-container" ref="infoBox" :class="containerClasses">
		<button class="btn-close" @click="resetToLegends" v-if="status != ''">&#10006;</button>
		<h2>{{ current.heading }}</h2>
		<p class="main-content" v-html="current.text"></p>
		<div class="info-buttons">
			<router-link class="about-link" to="/about">
				<span>درباره پروژه و سازنده</span>
			</router-link>
		</div>
		<img class="info-icon" src="@/assets/icons/info.svg">
	</div>
</template>

<script>
export default {
	props: {
		info: Object,
		colors: Object
	},
	data: () => ({
		status: '',
		current: {
			heading: "",
			text: ""
		},
		legends: {
			heading: "ویژوالایزر مسیریابی",
			text: "" // Will be generated on created()
		}
	}),
	computed: {
		containerClasses() {
			let classes = {
				centered: false
			}
			classes[this.status] = true;
			return classes;
		}
	},
	created() {
		this.current = this.legends;
	},
	mounted() {
		this.constructLegends();
	},
	methods: {
		constructLegends() {
			//table
			this.legends.text += `<table class="legends-table">
				<tr>
					<td>
						<div class="square" style="background-color: ${this.getRGBString(this.colors.start)}"></div>
					</td>
					<td>گره شروع (Start Node)</td>
				</tr>
				<tr>
					<td>
						<div class="square" style="background-color: ${this.getRGBString(this.colors.finish)}"></div>
					</td>
					<td>گره پایان (Finish Node)</td>
				</tr>
				<tr>
					<td>
						<div class="square" style="background-color: ${this.getRGBString(this.colors.visited)}"></div>
					</td>
					<td>گره بازدید‌شده (Visited Node)</td>
				</tr>
				<tr>
					<td>
						<div class="square" style="background-color: ${this.getRGBString(this.colors.path)}"></div>
					</td>
					<td>گره مسیر (Path Node)</td>
				</tr>
			</table>
			`
		},

		getRGBString(color) {
			return `rgb(${color.r*255}, ${color.g*255}, ${color.b*255})`;
		},

		resetToLegends() {
			this.$refs.infoBox.classList.remove('error');
			this.current = this.legends;
			this.status = '';
		},

		alert(info) {
			this.$refs.infoBox.classList.remove('error');
			this.$refs.infoBox.classList.add('alert');
			if(info) {
				this.current = info;
			}
			setTimeout(() => {
				this.$refs.infoBox.classList.remove('alert');
			}, 1000);
		},

		error(info) {
			this.$refs.infoBox.classList.remove('error');
			setTimeout(() => {
				this.$refs.infoBox.classList.add('error');
			}, 0)
			if(info) {
				this.current = info;
			}
		}
	}
}
</script>

<style lang="scss">
@import '@/scss/variables.scss';

.info-container {
	position: absolute;
	right: 15px;
	bottom: 15px;
	width: 350px;
	max-height: 100%;
	max-width: 90%;
	display: flex;
	flex-direction: column;
	font-size: 0.9em;
	padding: 25px;
	border-radius: 5px;
	background: linear-gradient(0, $dark 0%, #000000 240%);
	color: white;
	box-shadow: 2px 10px 30px rgba(#000, 0.4);
	opacity: 0.4;
	z-index: 10000;
	clip-path: circle(30px at calc(100% - 30px) calc(100% - 30px));
	transition: all 400ms ease-in-out;

	&:hover {
		clip-path: circle(200% at calc(100% - 30px) calc(100% - 30px));
		opacity: 1;
		bottom: 20px;
	}

	&.centered {
		max-height: 90%;
		min-height: 50%;
		width: 600px;
		max-width: 95%;
		opacity: 1;
		font-size: 1em;
		text-align: center;
		right: 50%;
		bottom: 50%;
		transform: translate(50%, 50%);
		clip-path: circle(200% at calc(100% - 30px) calc(100% - 30px));
	}

	&.alert {
		animation: alert 1000ms ease-in-out;
	}
	@keyframes alert {
		0%, 100% {
			bottom: 15px;
			opacity: 0.4;
		}
		20%, 50% {
			bottom: 30px;
			opacity: 1;
		}
		40% {
			bottom: 25px;
			opacity: 1;
		}
	}

	&.error {
		background: linear-gradient(0, brown 0%, #000000 240%);
		animation: error 400ms ease-out;
	}
	@keyframes error {
		0%, 100% {
			right: 15px;
			opacity: 0.4;
		}
		20%, 60% {
			right: 25px;
			opacity: 1;
		}
		40%, 80% {
			right: 5px;
			opacity: 1;
		}
	}

	.main-content {
		opacity: 0.9;
		margin-bottom: 3em;
		overflow: auto;
	}
	&.attributions {
		.main-content {
			margin-bottom: 0;
		}
		#clem {
			cursor: pointer;
			user-select: none;
			-moz-user-select: none;
			-webkit-user-select: none;
		}
		.swarm-unlocked {
			width: fit-content;
			margin: 0 auto;
			padding: 5px;
			font-size: 0.8em;
			border-radius: 5px;
			color: #0f0;
			background: rgba(#0f0, 0.3);
		}
	}

	h2 {
		margin: 0.5em 0;
	}

	.btn-close {
		position: absolute;
		top: 10px;
		right: 10px;
		height: 30px;
		width: 30px;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: white;
		cursor: pointer;
		transition: background 200ms ease-out;
		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}
		&:focus {
			outline: none;
		}
	}

	a {
		color: rgb(255, 124, 124);
	}

	img {
		border-radius: 5px;
	}

	table {
		border-spacing: 0;
		font-size: 0.9em;

		&.camera-table {
			margin: 0 auto;

			td {
				width: 50%;
				border: solid 1px white;
				padding: 10px;
			}
		}
		&.legends-table {
			td {
				padding: 5px;

				.square {
					width: 30px;
					height: 30px;
					margin: 0 auto;
				}
			}
		}
	}

	.info-buttons {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		margin-top: auto;

		.tutorial-buttons {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			width: 95%;
		}

		.btn-group {
			display: flex;
			margin: 0 auto;
		}
		.btn-tutorial {
			padding: 0 1em;
		}
	}

	.about-link {
		margin-top: 10px;
		margin-right: auto;
		margin-left: auto;
		padding: 8px 14px;
		border-radius: 20px;
		text-decoration: none;
		font-size: 0.85em;
		color: #ffffff;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		transition: all 200ms ease-out;

		&:hover {
			background: rgba(0, 153, 255, 0.25);
			border-color: rgba(0, 153, 255, 0.5);
		}
	}

	.info-icon {
		position: absolute;
		right: 10px;
		bottom: 10px;
		height: 40px;
	}
}
</style>