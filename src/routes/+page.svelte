<script lang="ts">
	import Game from '$lib/components/Game.svelte'
	import UiButtons from '$lib/components/UiButtons.svelte'
	import { game, character, misc } from '../stores'
	import { onMount } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	
	let gameComponent: any;
	let miniMapGrid: any[] = [];
	let isPanelOpen = false;
	
	function updateMiniMap() {
		if (gameComponent && gameComponent.getMapGridFromGame) {
			const newGrid = gameComponent.getMapGridFromGame();
			if (newGrid && newGrid.length > 0) {
				miniMapGrid = newGrid;
				drawMiniMap();
			}
		}
	}
	
	function drawMiniMap() {
		const canvas = document.getElementById('miniMapCanvas') as HTMLCanvasElement | null;
		if (!canvas || !miniMapGrid.length) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		const size = miniMapGrid.length;
		const cellSize = canvas.width / size;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const tile = miniMapGrid[y]?.[x];
				if (tile) {
					ctx.fillStyle = tile.color;
					ctx.fillRect(x * cellSize, y * cellSize, cellSize - 0.5, cellSize - 0.5);
				}
			}
		}
	}
	
	function handleMiniMapClick(e: MouseEvent) {
		const canvas = document.getElementById('miniMapCanvas') as HTMLCanvasElement | null;
		if (!canvas || !miniMapGrid.length) return;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const mouseX = (e.clientX - rect.left) * scaleX;
		const mouseY = (e.clientY - rect.top) * scaleY;
		const size = miniMapGrid.length;
		const x = Math.floor(mouseX / (canvas.width / size));
		const y = Math.floor(mouseY / (canvas.height / size));
		
		if (x >= 0 && x < size && y >= 0 && y < size) {
			const tile = miniMapGrid[y]?.[x];
			if (tile) {
				console.log('📍 Selected tile:', tile);
			}
		}
	}
	
	function togglePanel() {
		isPanelOpen = !isPanelOpen;
	}
	
	onMount(() => {
		const interval = setInterval(() => {
			if (gameComponent && gameComponent.getMapGridFromGame && $misc.started) {
				const grid = gameComponent.getMapGridFromGame();
				if (grid && grid.length > 0 && miniMapGrid.length === 0) {
					miniMapGrid = grid;
					drawMiniMap();
				}
			}
		}, 500);
		
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Alyssium</title>
</svelte:head>

<main class="game-layout">
	<div class="game-content">
		<Game bind:this={gameComponent} />
		<UiButtons />
	</div>
	
	{#if $misc.started}
		<!-- CENTERED TOGGLE BUTTON -->
		<div class="bottom-controls-wrapper">
			<button class="center-toggle-btn" on:click={togglePanel} class:active={isPanelOpen}>
				<div class="btn-inner">
					<span class="icon">{isPanelOpen ? '✕' : 'MENU'}</span>
				</div>
			</button>
		</div>
		
		<!-- LIQUID GLASS SLIDE PANEL -->
		<div class="slide-panel" class:open={isPanelOpen}>
			<div class="panel-content glass-container">
				<div class="panel-layout">
					<!-- LEFT: STATS (COINS & TIME) -->
					<div class="panel-section stats-section">
						<div class="stat-item gold">
							<img src="images/gold.svg" alt="gold" class="stat-icon" />
							<span class="stat-value">{$character.gold}</span>
						</div>
						<div class="stat-item time">
							<img src="images/time.svg" alt="time" class="stat-icon" />
							<span class="stat-value">{$game.gameData.placeAndTime?.time || '00:00'}</span>
						</div>
					</div>
					
					<!-- MIDDLE: ACTIONS -->
					<div class="panel-section actions-section">
						<div class="action-buttons">
							<button class="action-btn glass-btn" on:click={() => console.log('Inventory')}>
								<img src="images/item.svg" alt="inv" />
								<span>EQUIPMENT</span>
							</button>
							<button class="action-btn glass-btn" on:click={() => console.log('Map')}>
								<img src="images/map.svg" alt="map" />
								<span>WORLD</span>
							</button>
						</div>
					</div>
					
					<!-- RIGHT: MINIMAP -->
					<div class="panel-section map-section">
						<div class="mini-map-container" on:click={handleMiniMapClick}>
							<canvas id="miniMapCanvas" width="120" height="120"></canvas>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	:root {
		--glass-bg: rgba(15, 18, 25, 0.7);
		--glass-border: rgba(255, 255, 255, 0.1);
		--accent-primary: #00f2ff;
		--accent-secondary: #7000ff;
		--text-main: #f0f0f0;
	}

	.game-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: #050508;
		position: relative;
		overflow: hidden;
	}
	
	.game-content {
		padding: 0 !important;
		flex: 1;
		width: 100%;
		max-width: 1000px;
		margin: 0 auto;
		z-index: 10;
	}
	
	/* ============================================
	BOTTOM CONTROLS & TOGGLE
	============================================ */
	.bottom-controls-wrapper {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 300;
		pointer-events: none;
	}
	
	.center-toggle-btn {
		pointer-events: auto;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.center-toggle-btn:hover {
		transform: scale(1.1);
	}
	
	.btn-inner {
		background: var(--glass-bg);
		backdrop-filter: blur(20px);
		border: 1px solid var(--glass-border);
		width: 80px;
		height: 40px;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
	}
	
	.btn-inner .icon {
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		color: var(--accent-primary);
		text-shadow: 0 0 10px rgba(0, 242, 255, 0.4);
	}
	
	.center-toggle-btn.active .btn-inner {
		border-color: var(--accent-secondary);
	}
	
	.center-toggle-btn.active .icon {
		color: #ff3e3e;
		text-shadow: 0 0 10px rgba(255, 62, 62, 0.4);
	}
	
	/* ============================================
	LIQUID GLASS SLIDE PANEL
	============================================ */
	.slide-panel {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		transform: translateY(100%);
		transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 200;
	}
	
	.slide-panel.open {
		transform: translateY(0);
	}
	
	.panel-content {
		background: var(--glass-bg);
		backdrop-filter: blur(40px) saturate(150%);
		-webkit-backdrop-filter: blur(40px) saturate(150%);
		border-top: 1px solid var(--glass-border);
		border-radius: 32px 32px 0 0;
		padding: 30px 40px 60px 40px;
		box-shadow: 0 -15px 50px rgba(0, 0, 0, 0.6);
	}
	
	.panel-layout {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		gap: 30px;
		align-items: center;
		max-width: 1000px;
		margin: 0 auto;
	}
	
	/* Stats Section */
	.stats-section {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 18px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 16px;
		transition: all 0.3s;
	}
	
	.stat-item:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.2);
	}
	
	.stat-icon {
		width: 20px;
		height: 20px;
	}
	
	.stat-value {
		font-size: 1.1rem;
		font-weight: 700;
		font-family: monospace;
		color: var(--text-main);
	}
	
	.stat-item.gold .stat-value { color: #fcc419; }
	.stat-item.time .stat-value { color: var(--accent-primary); }
	
	/* Actions Section */
	.action-buttons {
		display: flex;
		justify-content: center;
		gap: 20px;
	}
	
	.glass-btn {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 20px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		min-width: 120px;
	}
	
	.glass-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--accent-primary);
		transform: translateY(-5px);
		box-shadow: 0 10px 20px rgba(0, 242, 255, 0.1);
	}
	
	.glass-btn img {
		width: 32px;
		height: 32px;
		opacity: 0.8;
	}
	
	.glass-btn span {
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		color: var(--text-main);
	}
	
	/* Map Section */
	.mini-map-container {
		width: 120px;
		height: 120px;
		border-radius: 20px;
		overflow: hidden;
		border: 1px solid var(--glass-border);
		background: rgba(0, 0, 0, 0.4);
		cursor: pointer;
		transition: all 0.3s;
		margin: 0 auto;
	}
	
	.mini-map-container:hover {
		border-color: var(--accent-primary);
		box-shadow: 0 0 20px rgba(0, 242, 255, 0.2);
	}
	
	canvas {
		display: block;
		image-rendering: pixelated;
	}
	
	/* Responsive */
	@media (max-width: 900px) {
		.panel-layout {
			grid-template-columns: 1fr 1.5fr;
			gap: 20px;
		}
		.map-section { display: none; }
	}
	
	@media (max-width: 600px) {
		.panel-layout {
			grid-template-columns: 1fr;
			gap: 20px;
		}
		.panel-content {
			padding: 20px 20px 70px 20px;
		}
		.action-buttons {
			gap: 10px;
		}
		.glass-btn {
			min-width: 100px;
			padding: 15px;
		}
	}
</style>