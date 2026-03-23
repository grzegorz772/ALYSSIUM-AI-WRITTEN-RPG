<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	import { misc } from '../../stores'
	import { game } from '../../stores'
	import Maintenance from './Maintenance.svelte'

	import { supabase } from '$lib/supabaseClient'

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})

		$game.gameData.event.shopMode = null
	}

	let mapOn: any

	//song (can be arranged using webAudioApi to make it loop seemlessly)
	let audioElement: any
	let audioClicked: boolean = false
	async function startSong() {
		if (!audioElement && !audioClicked) {
			audioClicked = true
			const { data: song, error } = await supabase.storage
				.from('audios/chad-rpg')
				.download('tavernLoopOne.mp3')

			audioElement = new Audio(URL.createObjectURL(song))
			audioElement.loop = true
			audioElement.play()
		} else if (audioElement) {
			audioElement.paused ? audioElement.play() : audioElement.pause()
		} else return
	}

	function toggleFullScreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen()
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen()
			}
		}
	}
</script>

<div>
	{#if $misc.maintenanceWindow}
		<div class="maintenance-box">
			<Maintenance />
		</div>
	{/if}
	<!--  map and places  -->
	<div class="map-and-places">
		{#if $misc.started && !$misc.death}
			<button transition:fade={{ duration: 500 }} on:click={() => (mapOn = !mapOn)}>
				<img src="images/map.svg" alt="map button" />
			</button>
		{/if}
		{#if mapOn}
			<div class="places-to-go">
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Tavern to rest.")}
					transition:fade={{ delay: 0, duration: 100 }}
					><img src="images/landscape-svgs/tavern.svg" alt="go tavern button" />
					<p transition:fade={{ delay: 0, duration: 100 }}>Tavern</p></button
				>
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Town.")}
					transition:fade={{ delay: 100, duration: 100 }}
					><img src="images/landscape-svgs/town.svg" alt="go town button" />
					<p transition:fade={{ delay: 100, duration: 100 }}>Town</p></button
				>

				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Woods.")}
					transition:fade={{ delay: 200, duration: 100 }}
					><img src="images/landscape-svgs/forest.svg" alt="go woods button" />
					<p transition:fade={{ delay: 200, duration: 100 }}>Woods</p></button
				>
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to nearest Harbor.")}
					transition:fade={{ delay: 300, duration: 100 }}
					><img src="images/landscape-svgs/dock.svg" alt="go harbor button" />
					<p transition:fade={{ delay: 300, duration: 100 }}>Harbor</p></button
				>
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to weaponsmith.")}
					transition:fade={{ delay: 400, duration: 100 }}
					><img src="images/landscape-svgs/shop1.svg" alt="go weaponsmith button" />
					<p transition:fade={{ delay: 400, duration: 100 }}>Weaponsmith</p></button
				>
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to spell shop.")}
					transition:fade={{ delay: 500, duration: 100 }}
					><img src="images/landscape-svgs/shop2.svg" alt="go spell shop button" />
					<p transition:fade={{ delay: 500, duration: 100 }}>Spell Shop</p></button
				>
				<button
					disabled={$misc.loading || $game.gameData.event.inCombat}
					on:click={() => emitAnswer("I'll go to potion shop.")}
					transition:fade={{ delay: 600, duration: 100 }}
					><img src="images/landscape-svgs/shop3.svg" alt="go potion shop button" />
					<p transition:fade={{ delay: 600, duration: 100 }}>Potion Shop</p></button
				>
			</div>
		{/if}
	</div>

	<div class="bottom-right-buttons">
		<!-- audio play button -->
		{#if $misc.started}
			<button class="util-btn song-icon" transition:fade={{ duration: 500 }} on:click={() => startSong()}>
				<img src="images/music.svg" alt="music button" />
			</button>
			<button
				transition:fade={{ duration: 500 }}
				class="util-btn fullscreen-icon"
				on:click={() => toggleFullScreen()}
			>
				<img src="images/fullscreen.svg" alt="fullscreen button" />
			</button>
		{/if}

		<!--  bug window button  -->
		<button class="util-btn bug-button" on:click={() => ($misc.bugWindow = !$misc.bugWindow)}>
			<img src="images/bug.svg" alt="info button" />
		</button>

		<!--  game info button  -->
		<button
			class="util-btn game-info-button"
			on:click={() => ($misc.showInfoWindow = !$misc.showInfoWindow)}
		>
			<img src="images/info.svg" alt="info button" />
		</button>
	</div>

	<!-- game info window -->
	{#if $misc.showInfoWindow}
		<div class="modal-overlay" transition:fade={{ duration: 300 }}>
			<div class="glass-modal info-window">
				<button class="close-btn" on:click={() => ($misc.showInfoWindow = !$misc.showInfoWindow)}>
					<span class="icon">✕</span>
				</button>

				<header class="modal-header">
					<h2 class="title">SYSTEM ARCHIVE</h2>
					<p class="subtitle">ALYSSIUM Interface Documentation</p>
				</header>

				<div class="modal-grid">
					<section class="info-section">
						<h3 class="section-title"><span class="emoji">⚔️</span> CORE LOGIC</h3>
						<ul class="info-list">
							<li>Interactive RPG driven by advanced Neural Networks.</li>
							<li>AI shapes the reality based on your tactical decisions.</li>
							<li>Custom actions use Neural Energy to influence the narrative.</li>
							<li>Survival depends on Health (HP) and Mana (MP) management.</li>
							<li>Combat efficiency scales with weapon and spell complexity.</li>
						</ul>
					</section>

					<section class="info-section">
						<h3 class="section-title"><span class="emoji">🔮</span> SYSTEM STATUS</h3>
						<ul class="info-list">
							<li>Alpha v0.2.1: Procedural World Generation enabled.</li>
							<li>AI-enhanced regional descriptions and unique biomes.</li>
							<li>Refined Liquid Glass UI with immersive blur effects.</li>
							<li>Real-time inventory and spell cooldown systems.</li>
							<li>Experimental: Dynamic AI-generated NPC interactions.</li>
						</ul>
					</section>
				</div>

				<footer class="modal-footer">
					<div class="footer-line"></div>
					<p class="copyright">© 2026 ALYSSIUM PROTOCOL | SECURE CONNECTION ESTABLISHED</p>
				</footer>
			</div>
		</div>
	{/if}

	<!-- bug report window -->
	{#if $misc.bugWindow}
		<div class="modal-overlay" transition:fade={{ duration: 300 }}>
			<div class="glass-modal bug-window">
				<button class="close-btn" on:click={() => ($misc.bugWindow = !$misc.bugWindow)}>
					<span class="icon">✕</span>
				</button>
				
				<header class="modal-header">
					<h2 class="title">BUG REPORT</h2>
					<p class="subtitle">Interface Anomaly Detection</p>
				</header>

				<div class="bug-content">
					<div class="warning-icon">⚠️</div>
					<p class="bug-desc">
						The ALYSSIUM interface is in active development. If you encounter any logic loops, 
						visual glitches, or neural desyncs, please report them via our central repository.
					</p>
					<div class="protocol-status">
						<span class="status-label">DIAGNOSTIC MODE:</span>
						<span class="status-value">ACTIVE</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:root {
		--glass-bg: rgba(15, 18, 25, 0.8);
		--glass-border: rgba(255, 255, 255, 0.1);
		--accent-primary: #00f2ff;
		--accent-secondary: #7000ff;
		--text-main: #f0f0f0;
		--text-dim: rgba(240, 240, 240, 0.5);
	}

	/* Modal Overlays */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(10px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.glass-modal {
		background: var(--glass-bg);
		backdrop-filter: blur(40px) saturate(150%);
		-webkit-backdrop-filter: blur(40px) saturate(150%);
		border: 1px solid var(--glass-border);
		border-radius: 32px;
		padding: 3rem;
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
		scrollbar-width: thin;
		scrollbar-color: var(--accent-primary) transparent;
	}

	.glass-modal::-webkit-scrollbar { width: 4px; }
	.glass-modal::-webkit-scrollbar-thumb { background: var(--accent-primary); border-radius: 10px; }

	.bug-window {
		max-width: 500px;
		text-align: center;
	}

	/* Header */
	.modal-header {
		margin-bottom: 2.5rem;
		padding-right: 3rem;
	}

	.title {
		font-size: clamp(1.4rem, 5vw, 2.2rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		background: linear-gradient(to right, #fff, var(--text-dim));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin: 0;
	}

	.subtitle {
		font-size: clamp(0.7rem, 2vw, 0.9rem);
		color: var(--accent-primary);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0.5rem 0 0 0;
	}

	/* Grid & Sections */
	.modal-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
	}

	.section-title {
		font-size: 1rem;
		font-weight: 800;
		color: #fff;
		margin-bottom: 1.2rem;
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}

	.info-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.info-list li {
		font-size: clamp(0.85rem, 2.5vw, 1rem);
		color: var(--text-dim);
		line-height: 1.6;
		margin-bottom: 0.8rem;
		padding-left: 1.2rem;
		position: relative;
	}

	.info-list li::before {
		content: "";
		position: absolute;
		left: 0;
		top: 0.7rem;
		width: 4px;
		height: 4px;
		background: var(--accent-primary);
		border-radius: 50%;
		box-shadow: 0 0 8px var(--accent-primary);
	}

	/* Bug Content */
	.bug-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.warning-icon {
		font-size: clamp(2rem, 8vw, 3rem);
		filter: drop-shadow(0 0 15px rgba(255, 200, 0, 0.3));
	}

	.bug-desc {
		color: var(--text-dim);
		line-height: 1.6;
		font-size: clamp(0.9rem, 2.5vw, 1.1rem);
	}

	.protocol-status {
		background: rgba(0, 0, 0, 0.3);
		padding: 0.8rem 1.5rem;
		border-radius: 12px;
		border: 1px solid var(--glass-border);
		display: flex;
		gap: 1rem;
		font-size: 0.8rem;
		font-weight: 800;
	}

	.status-label { color: var(--text-dim); }
	.status-value { color: #00ffaa; text-shadow: 0 0 10px rgba(0, 255, 170, 0.4); }

	/* Footer */
	.modal-footer {
		margin-top: 3rem;
	}

	.footer-line {
		height: 1px;
		background: linear-gradient(to right, transparent, var(--glass-border), transparent);
		margin-bottom: 1.5rem;
	}

	.copyright {
		font-size: clamp(0.6rem, 1.5vw, 0.75rem);
		color: var(--text-dim);
		text-align: center;
		letter-spacing: 0.1em;
		font-family: monospace;
	}

	/* Close Button */
	.close-btn {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--glass-border);
		width: 44px;
		height: 44px;
		border-radius: 50%;
		color: #fff;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
		z-index: 10;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: rotate(90deg);
		color: #ff3e3e;
		border-color: #ff3e3e;
	}

	/* Top Buttons */
	.song-icon, .fullscreen-icon {
		position: fixed;
		right: 15px;
		width: 44px;
		height: 44px;
		background: var(--glass-bg);
		backdrop-filter: blur(25px) saturate(180%);
		-webkit-backdrop-filter: blur(25px) saturate(180%);
		border: 1px solid var(--glass-border);
		border-radius: 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.song-icon:hover, .fullscreen-icon:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--accent-primary);
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(0, 242, 255, 0.1);
	}

	.song-icon { top: 15px; }
	.fullscreen-icon { top: 69px; }

	.song-icon img, .fullscreen-icon img {
		width: 22px;
		height: 22px;
		opacity: 0.9;
	}

	/* Map Controls */
	.map-and-places {
		position: fixed;
		left: 15px;
		top: 15px;
		z-index: 150;
	}

	.map-and-places > button {
		width: 44px;
		height: 44px;
		background: var(--glass-bg);
		backdrop-filter: blur(25px) saturate(180%);
		-webkit-backdrop-filter: blur(25px) saturate(180%);
		border: 1px solid var(--glass-border);
		border-radius: 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.map-and-places > button:hover {
		border-color: var(--accent-primary);
		background: rgba(255, 255, 255, 0.1);
		transform: scale(1.05);
	}

	/* Bottom Buttons */
	.bottom-right-buttons {
		position: fixed;
		right: 15px;
		bottom: 85px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		z-index: 100;
	}

	.bug-button, .game-info-button {
		width: 44px;
		height: 44px;
		background: var(--glass-bg);
		backdrop-filter: blur(25px) saturate(180%);
		-webkit-backdrop-filter: blur(25px) saturate(180%);
		border: 1px solid var(--glass-border);
		border-radius: 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.bug-button:hover, .game-info-button:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: scale(1.1);
		border-color: var(--accent-primary);
		box-shadow: 0 10px 20px rgba(0, 242, 255, 0.1);
	}

	.bug-button img, .game-info-button img {
		width: 22px;
		height: 22px;
		opacity: 0.9;
	}

	/* Places List */
	.places-to-go {
		position: absolute;
		top: 55px;
		left: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
		background: rgba(15, 18, 25, 0.9);
		backdrop-filter: blur(35px) saturate(200%);
		-webkit-backdrop-filter: blur(35px) saturate(200%);
		padding: 12px;
		border-radius: 20px;
		border: 1px solid var(--glass-border);
		min-width: 220px;
		max-height: 70vh;
		overflow-y: auto;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1);
		scrollbar-width: thin;
		scrollbar-color: var(--accent-primary) transparent;
	}

	.places-to-go::-webkit-scrollbar {
		width: 4px;
	}
	
	.places-to-go::-webkit-scrollbar-thumb {
		background: var(--accent-primary);
		border-radius: 10px;
	}

	.places-to-go button {
		display: flex;
		align-items: center;
		gap: 12px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.05);
		padding: 10px 14px;
		border-radius: 14px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		text-align: left;
		width: 100%;
	}

	.places-to-go button:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.12);
		border-color: var(--accent-primary);
		transform: translateX(6px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.places-to-go button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.places-to-go img {
		width: 32px;
		height: 32px;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.places-to-go p {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--text-main);
		letter-spacing: 0.02em;
	}

	/* Responsive */
	@media (max-width: 800px) {
		.modal-grid { grid-template-columns: 1fr; gap: 1.5rem; }
		.glass-modal { padding: 2rem 1.5rem; border-radius: 24px; margin: 10px; }
		.modal-header { margin-bottom: 1.5rem; }
		.section-title { margin-bottom: 0.8rem; }
		.modal-footer { margin-top: 2rem; }
		
		/* Smaller buttons on mobile */
		.song-icon, .fullscreen-icon, .map-and-places > button, .bug-button, .game-info-button {
			width: 40px;
			height: 40px;
			border-radius: 12px;
		}
		
		.bottom-right-buttons {
			bottom: 110px;
			right: 12px;
			gap: 10px;
		}
		
		.map-and-places {
			left: 12px;
			top: 12px;
		}
		
		.song-icon {
			top: 12px;
			right: 12px;
		}
		
		.fullscreen-icon {
			top: 60px;
			right: 12px;
		}

		.places-to-go {
			min-width: 200px;
			max-height: 55vh;
			border-radius: 16px;
			padding: 10px;
		}
		
		.places-to-go button {
			padding: 8px 12px;
			gap: 10px;
		}
		
		.places-to-go p {
			font-size: 0.85rem;
		}
		
		.places-to-go img {
			width: 28px;
			height: 28px;
		}
	}

	@media (max-height: 600px) {
		.glass-modal { padding: 1.5rem; }
		.modal-header { margin-bottom: 1rem; }
		.modal-grid { gap: 1rem; }
		.places-to-go { max-height: 50vh; }
	}
</style>

