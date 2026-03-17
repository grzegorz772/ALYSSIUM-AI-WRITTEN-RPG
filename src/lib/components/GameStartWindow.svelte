<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte'
	import { fade, fly } from 'svelte/transition'

	import CharacterClasses from '$lib/components/CharacterClasses.svelte'

	import { misc } from '../../stores'
	import { character } from '../../stores'

	import medievalTavernStarter from '$lib/gamedata/gamestarters/medievalTavernStarter.json'

	function getRandomValueFromArray(array: any) {
		const randomIndex = Math.floor(Math.random() * array?.length)
		return array[randomIndex]
	}

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		$character.stats[0].hp = 1
		dispatch('emittedAnswer', { answer })
	}

	let gameStarterPrompt: string = ''
	let gameModeSelected: boolean = false

	async function handleGameMode(answer: any) {
		const el = document.getElementById('game-start-window')
		let oldHeight = 'auto'

		if (el) {
			oldHeight = `${el.clientHeight}px`
			el.style.height = oldHeight // Lock height temporarily
		}

		gameModeSelected = true
		gameStarterPrompt = answer

		await tick() // Wait for DOM update and svelte transitions

		if (el) {
			// Find the old fading element to temporarily hide it so we can measure ONLY the new content
			const oldContent = el.querySelector('.start-content') as HTMLElement | null
			let oldDisplay = ''
			if (oldContent) {
				oldDisplay = oldContent.style.display
				oldContent.style.display = 'none'
			}

			// Release lock to get new natural height
			el.style.height = 'auto'
			const newHeight = `${el.clientHeight}px`

			// Restore old element for the fade transition
			if (oldContent) {
				oldContent.style.display = oldDisplay
			}

			// Animate smoothly between old and new heights
			el.style.height = oldHeight
			const animation = el.animate([{ height: oldHeight }, { height: newHeight }], {
				duration: 400,
				easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
			})

			animation.onfinish = () => {
				el.style.height = 'auto' // Set to auto after animation so it remains responsive
			}
		}
	}
</script>

<div class="start-overlay" transition:fade={{ duration: 500 }}>
	<div class="start-window" id="game-start-window" in:fly={{ y: 30, duration: 600, delay: 200 }}>
		{#if gameModeSelected}
			<div class="character-select" transition:fade={{ duration: 400 }}>
				<CharacterClasses
					on:emittedAnswer={() => {
						emitAnswer(gameStarterPrompt)
					}}
				/>
			</div>
		{:else}
			<div class="start-content" transition:fade={{ duration: 400 }}>
				<!-- Dekoracyjny element tła -->
				<div class="ambient-glow"></div>
				<div class="ambient-particles">
					<span></span><span></span><span></span><span></span><span></span>
					<span></span><span></span><span></span><span></span><span></span>
				</div>
				
				<!-- Header z efektownym tytułem -->
				<header class="start-header">
					<div class="title-decoration">
						<span class="line"></span>
						<span class="diamond">✦</span>
						<span class="line"></span>
					</div>
					<h1>
						<span class="gradient-text">Alyssium</span>
						<span class="title-sub">Begins</span>
					</h1>
					<p class="tagline">Enter to the world</p>
				</header>

				<!-- Główna karta z opisem i przyciskiem -->
				<div class="modes-grid">
					<!-- FRPG Starter -->
					<div class="mode-card available">
						<div class="card-bg-image" style="background-image: url('images/landscape-svgs/background-splashart.jpg')"></div>
						<div class="card-overlay"></div>
						
						<div class="mode-icon">
							<img src="images/landscape-svgs/background-splashart.jpg" alt="FRPG" />
						</div>
						
						<div class="mode-info">
							<div class="mode-tag">Main Story</div>
							<h3>Zero Point</h3>
							<p class="mode-description">
								Begin your journey in a post-apocalyptic world ruled by unknown forces. Here, the law is above the law, and magic fights against domination
							</p>
							
							<div class="mode-details">
								<div class="detail-item">
									<span class="detail-icon">⚔️</span>
									<span>Fight</span>
								</div>
								<div class="detail-item">
									<span class="detail-icon">🔮</span>
									<span>Magic</span>
								</div>
								<div class="detail-item">
									<span class="detail-icon">🤖</span>
									<span>Technology</span>
								</div>
							</div>
							
							<button
								class="play-btn primary"
								on:click={() => handleGameMode(getRandomValueFromArray([...medievalTavernStarter]))}
							>
								<span class="btn-text">Start Game</span>
								<span class="btn-icon">→</span>
							</button>
						</div>
					</div>
				</div>

				<!-- Stopka z dodatkowymi informacjami -->
				<footer class="start-footer">
					<div class="footer-decoration">
						<span class="dot"></span>
						<span class="dot"></span>
						<span class="dot"></span>
					</div>
					<p class="version-info">Version 0.2 alpha, 2026</p>
				</footer>
			</div>
		{/if}
	</div>
</div>

<style>
	.start-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		background: radial-gradient(circle at center, rgba(20, 15, 30, 0.8) 0%, rgba(5, 3, 10, 0.95) 100%);
	}

	.start-window {
		width: min(90%, 900px);
		max-height: 90vh;
		background: rgba(15, 12, 25, 0.65);
		backdrop-filter: blur(40px) saturate(150%);
		-webkit-backdrop-filter: blur(40px) saturate(150%);
		border: 1px solid rgba(200, 180, 255, 0.15);
		border-radius: 32px;
		overflow: hidden;
		box-shadow: 
			0 20px 40px -10px rgba(0, 0, 0, 0.8),
			0 0 0 1px rgba(200, 180, 255, 0.1) inset,
			0 0 40px rgba(120, 80, 200, 0.2);

		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		position: relative;
	}

	.start-window::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 32px;
		padding: 2px;
		background: linear-gradient(135deg, rgba(200, 180, 255, 0.3), rgba(120, 80, 200, 0.1), rgba(200, 180, 255, 0.3));
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
	}

	.start-content,
	.character-select {
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		position: relative;
		z-index: 1;
	}

	.start-content {
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		height: auto;
		max-height: 100%;
	}

	/* Efektowne tło */
	.ambient-glow {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: 
			radial-gradient(circle at 20% 30%, rgba(140, 100, 255, 0.15) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(80, 160, 255, 0.1) 0%, transparent 50%);
		pointer-events: none;
		z-index: 0;
	}

	.ambient-particles {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 0;
	}

	.ambient-particles span {
		position: absolute;
		width: 2px;
		height: 2px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		box-shadow: 0 0 10px rgba(140, 100, 255, 0.5);
		animation: float 15s infinite linear;
	}

	@keyframes float {
		0% { transform: translateY(0) translateX(0); opacity: 0; }
		10% { opacity: 0.5; }
		90% { opacity: 0.5; }
		100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
	}

	.ambient-particles span:nth-child(1) { left: 10%; animation-delay: 0s; }
	.ambient-particles span:nth-child(2) { left: 20%; animation-delay: 2s; }
	.ambient-particles span:nth-child(3) { left: 30%; animation-delay: 5s; }
	.ambient-particles span:nth-child(4) { left: 40%; animation-delay: 1s; }
	.ambient-particles span:nth-child(5) { left: 50%; animation-delay: 7s; }
	.ambient-particles span:nth-child(6) { left: 60%; animation-delay: 3s; }
	.ambient-particles span:nth-child(7) { left: 70%; animation-delay: 9s; }
	.ambient-particles span:nth-child(8) { left: 80%; animation-delay: 4s; }
	.ambient-particles span:nth-child(9) { left: 90%; animation-delay: 6s; }
	.ambient-particles span:nth-child(10) { left: 95%; animation-delay: 8s; }

	/* Header */
	.start-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding-bottom: var(--space-md);
		position: relative;
		z-index: 2;
	}

	.title-decoration {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-xs);
	}

	.line {
		width: 60px;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(200, 180, 255, 0.5), transparent);
	}

	.diamond {
		color: rgba(200, 180, 255, 0.8);
		font-size: 1.2rem;
		text-shadow: 0 0 10px rgba(140, 100, 255, 0.5);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.8; transform: scale(1); }
		50% { opacity: 1; transform: scale(1.1); }
	}

	.start-header h1 {
		font-family: 'MedievalSharp', serif;
		font-size: clamp(2.2rem, 6vw, 3.2rem);
		font-weight: 400;
		margin: 0;
		text-align: center;
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}

	.gradient-text {
		background: linear-gradient(135deg, #c8b4ff, #9d7aff, #7c5ce0);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-shadow: 0 0 30px rgba(140, 100, 255, 0.3);
	}

	.title-sub {
		font-size: 0.5em;
		color: rgba(255, 255, 255, 0.7);
		letter-spacing: 4px;
		text-transform: uppercase;
	}

	.tagline {
		font-size: 0.9rem;
		color: rgba(200, 180, 255, 0.6);
		letter-spacing: 1px;
		margin-top: var(--space-xs);
	}

	/* Game Modes Grid */
	.modes-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
		flex: 1;
		align-content: center;
		position: relative;
		z-index: 2;
	}

	.mode-card {
		display: flex;
		gap: var(--space-xl);
		padding: var(--space-xl);
		background: rgba(20, 15, 30, 0.6);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(200, 180, 255, 0.1);
		border-radius: 24px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
		position: relative;
		overflow: hidden;
	}

	.card-bg-image {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		opacity: 0.1;
		transition: opacity 0.5s ease;
		filter: blur(2px);
		transform: scale(1.1);
	}

	.mode-card:hover .card-bg-image {
		opacity: 0.2;
		transform: scale(1.15);
	}

	.card-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(140, 100, 255, 0.1), transparent);
		pointer-events: none;
	}

	.mode-card.available:hover {
		transform: translateY(-5px) scale(1.02);
		border-color: rgba(200, 180, 255, 0.3);
		box-shadow: 
			0 20px 40px -10px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(200, 180, 255, 0.2) inset,
			0 0 30px rgba(140, 100, 255, 0.3);
	}

	.mode-icon {
		flex-shrink: 0;
		width: 120px;
		height: 120px;
		border-radius: 20px;
		overflow: hidden;
		background: rgba(0, 0, 0, 0.3);
		border: 2px solid rgba(200, 180, 255, 0.2);
		box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.5);
		position: relative;
		z-index: 2;
		transition: all 0.3s ease;
	}

	.mode-card:hover .mode-icon {
		border-color: rgba(200, 180, 255, 0.5);
		transform: scale(1.05);
	}

	.mode-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.mode-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		position: relative;
		z-index: 2;
	}

	.mode-tag {
		display: inline-block;
		padding: 4px 12px;
		background: linear-gradient(135deg, rgba(140, 100, 255, 0.2), rgba(100, 70, 200, 0.2));
		border: 1px solid rgba(200, 180, 255, 0.3);
		border-radius: 20px;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 1px;
		color: #c8b4ff;
		text-transform: uppercase;
		margin-bottom: var-space-xs;
		width: fit-content;
	}

	.mode-info h3 {
		margin: 0;
		font-size: 1.8rem;
		font-weight: 600;
		background: linear-gradient(135deg, #fff, #e0d0ff);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		line-height: 1.2;
	}

	.mode-description {
		margin: 0;
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.6;
		max-width: 500px;
	}

	.mode-details {
		display: flex;
		gap: var(--space-md);
		margin: var(--space-sm) 0;
	}

	.detail-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 20px;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.detail-icon {
		font-size: 1rem;
	}

	.play-btn {
		align-self: flex-start;
		margin-top: var(--space-sm);
		padding: 12px 24px;
		border: none;
		border-radius: 40px;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.5px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		gap: 8px;
		backdrop-filter: blur(5px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		position: relative;
		overflow: hidden;
	}

	.play-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	.play-btn:hover::before {
		left: 100%;
	}

	.play-btn.primary {
		background: linear-gradient(135deg, #7c5ce0, #9d7aff);
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 5px 15px rgba(124, 92, 224, 0.4);
	}

	.play-btn.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(124, 92, 224, 0.6);
	}

	.btn-icon {
		transition: transform 0.3s ease;
	}

	.play-btn:hover .btn-icon {
		transform: translateX(5px);
	}

	/* Footer */
	.start-footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		padding-top: var(--space-md);
		position: relative;
		z-index: 2;
	}

	.footer-decoration {
		display: flex;
		gap: 8px;
	}

	.dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: rgba(200, 180, 255, 0.3);
		animation: dotPulse 2s infinite;
	}

	.dot:nth-child(2) { animation-delay: 0.3s; }
	.dot:nth-child(3) { animation-delay: 0.6s; }

	@keyframes dotPulse {
		0%, 100% { opacity: 0.3; transform: scale(1); }
		50% { opacity: 1; transform: scale(1.5); background: rgba(200, 180, 255, 0.8); }
	}

	.version-info {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.3);
		letter-spacing: 1px;
	}

	/* Character Select */
	.character-select {
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		z-index: 2;
	}

	/* Responsive */
	@media (max-width: 700px) {
		.mode-card {
			flex-direction: column;
			align-items: center;
			text-align: center;
			padding: var-space-lg;
		}

		.mode-icon {
			width: 100px;
			height: 100px;
		}

		.mode-info {
			align-items: center;
		}

		.mode-details {
			justify-content: center;
		}

		.play-btn {
			align-self: center;
		}

		.start-content {
			padding: var(--space-lg);
		}
	}

	@media (max-width: 480px) {
		.start-header h1 {
			font-size: clamp(1.8rem, 5vw, 2.2rem);
		}

		.mode-info h3 {
			font-size: 1.4rem;
		}

		.mode-details {
			flex-wrap: wrap;
			justify-content: center;
		}
	}
</style>