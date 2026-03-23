<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import { cubicOut, elasticOut } from 'svelte/easing'

	import CharacterClasses from '$lib/components/CharacterClasses.svelte'

	import { misc } from '../../stores'
	import { character } from '../../stores'

	import medievalTavernStarter from '$lib/gamedata/gamestarters/medievalTavernStarter.json'
	import WorldCreator from './WorldCreator.svelte'
	import { LanguageSettingsData } from '$lib/config/constants'
	
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
	let worldCreationMode: boolean = false
	let configurationMode: boolean = false
	let customWorldPrompt: string = ''

	// Unified transition function to prevent layout jumps
	async function transitionTo(target: 'menu' | 'world' | 'config' | 'character') {
		const el = document.getElementById('game-start-window');
		if (!el) return;

		const oldHeight = `${el.clientHeight}px`;
		el.style.height = oldHeight;

		// Switch states
		if (target === 'menu') {
			worldCreationMode = false;
			configurationMode = false;
			gameModeSelected = false;
		} else if (target === 'world') {
			worldCreationMode = true;
			configurationMode = false;
		} else if (target === 'config') {
			configurationMode = true;
			worldCreationMode = false;
		} else if (target === 'character') {
			gameModeSelected = true;
			worldCreationMode = false;
			configurationMode = false;
		}

		await tick();

		// Measure new height
		el.style.height = 'auto';
		const newHeight = `${el.clientHeight}px`;
		el.style.height = oldHeight;

		// Animate
		const animation = el.animate([
			{ height: oldHeight },
			{ height: newHeight }
		], {
			duration: 400,
			easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
		});

		animation.onfinish = () => {
			el.style.height = 'auto';
		};
	}

	// Temp settings for configuration
	let tempSettings = {
		nativeLanguage: LanguageSettingsData.nativeLanguage,
		foreignLanguage: LanguageSettingsData.foreignLanguage,
		languageLevel: LanguageSettingsData.languageLevel
	};

	function saveConfiguration() {
		LanguageSettingsData.nativeLanguage = tempSettings.nativeLanguage;
		LanguageSettingsData.foreignLanguage = tempSettings.foreignLanguage;
		LanguageSettingsData.languageLevel = tempSettings.languageLevel;
		transitionTo('menu');
	}

	function handleWorldCreated(event: CustomEvent) {
		customWorldPrompt = event.detail.worldPrompt
		transitionTo('character');
	}

	function skipWorldCreation() {
		transitionTo('character');
	}

	async function handleGameMode(answer: any) {
		gameStarterPrompt = answer
		transitionTo('world');
	}

	async function toggleConfiguration() {
		if (!configurationMode) {
			tempSettings = {
				nativeLanguage: LanguageSettingsData.nativeLanguage,
				foreignLanguage: LanguageSettingsData.foreignLanguage,
				languageLevel: LanguageSettingsData.languageLevel
			};
			transitionTo('config');
		} else {
			transitionTo('menu');
		}
	}
</script>

<div class="start-overlay" transition:fade={{ duration: 800, easing: cubicOut }}>
	<div class="start-window glass-container" id="game-start-window" in:fly={{ y: 40, duration: 800, delay: 200, easing: elasticOut }}>
			{#if worldCreationMode}
				<div class="world-creator-wrapper" in:fade={{ duration: 300, delay: 200 }} out:fade={{ duration: 200 }}>
					<WorldCreator on:worldCreated={handleWorldCreated} />
				</div>
			{:else if configurationMode}
				<div class="config-content" in:fade={{ duration: 300, delay: 200 }} out:fade={{ duration: 200 }}>
					<header class="minimal-header">
						<div class="logo-area">
							<span class="icon-glow">⚙</span>
							<h2 class="title">SYSTEM CONFIG</h2>
						</div>
						<p class="subtitle">Neural translation & Language parameters</p>
					</header>

					<div class="config-grid">
						<div class="config-item">
							<label for="native-lang">NATIVE LANGUAGE</label>
							<div class="select-wrapper">
								<select id="native-lang" bind:value={tempSettings.nativeLanguage} class="glass-select">
									{#each LanguageSettingsData.options.languages as lang}
										<option value={lang}>{lang}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="config-item">
							<label for="foreign-lang">TARGET LANGUAGE</label>
							<div class="select-wrapper">
								<select id="foreign-lang" bind:value={tempSettings.foreignLanguage} class="glass-select">
									{#each LanguageSettingsData.options.languages as lang}
										<option value={lang}>{lang}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="config-item">
							<label for="lang-level">PROFICIENCY LEVEL (CEFR)</label>
							<div class="select-wrapper">
								<select id="lang-level" bind:value={tempSettings.languageLevel} class="glass-select">
									{#each LanguageSettingsData.options.levels as level}
										<option value={level}>{level}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>

					<div class="config-actions">
						<button class="glass-btn secondary" on:click={() => transitionTo('menu')}>
							<div class="btn-inner">CANCEL</div>
						</button>
						<button class="glass-btn primary" on:click={saveConfiguration}>
							<div class="btn-inner">
								<span class="icon">💾</span>
								<span>APPLY CHANGES</span>
							</div>
						</button>
					</div>
				</div>
			{:else if gameModeSelected}
				<div class="character-select" in:fade={{ duration: 300, delay: 200 }} out:fade={{ duration: 200 }}>
					<CharacterClasses
						on:emittedAnswer={() => {
							emitAnswer(customWorldPrompt || gameStarterPrompt)
						}}
					/>
				</div>
			{:else}
			<div class="start-content" in:fade={{ duration: 300, delay: 200 }} out:fade={{ duration: 200 }}>
				<!-- Header Section -->
				<header class="minimal-header">
					<div class="logo-area">
						<h1 class="title">ALYSSIUM</h1>
						<div class="version-badge">v0.2.1-α</div>
					</div>
					<p class="subtitle">Infinite journey</p>
				</header>

				<!-- Main Menu Layout -->
				<div class="main-layout">
					<nav class="liquid-menu">
						<button class="menu-card primary" on:click={() => handleGameMode(getRandomValueFromArray([...medievalTavernStarter]))}>
							<div class="card-content">
								<span class="action-tag">INITIALIZE</span>
								<h2 class="card-title">Start new game</h2>
								<p class="card-desc">Create your world and start infinite adventure</p>
								
								<div class="card-stats">
									<div class="stat-item"><span class="icon">⚔️</span> 80%</div>
									<div class="stat-item"><span class="icon">🔮</span> 60%</div>
									<div class="stat-item"><span class="icon">💠</span> 90%</div>
								</div>
							</div>
							<div class="card-footer">
								<span class="status-pill">ACTIVE</span>
								<span class="arrow">→</span>
							</div>
						</button>

						<div class="secondary-actions">
							<button class="menu-card secondary" on:click={toggleConfiguration}>
								<div class="card-content">
									<h3 class="card-title">CONFIGURATION</h3>
									<p class="card-desc">Language sync: {LanguageSettingsData.foreignLanguage} ({LanguageSettingsData.languageLevel})</p>
								</div>
								<span class="status-dot"></span>
							</button>

							<button class="menu-card secondary disabled">
								<div class="card-content">
									<h3 class="card-title">TERMINATE</h3>
									<p class="card-desc">Safe shutdown of the interface.</p>
								</div>
							</button>
						</div>
					</nav>
				</div>

				<!-- Simple Footer -->
				<footer class="minimal-footer">
					<div class="footer-left">
						<span>Project: ALYSSIUM</span>
					</div>
					<div class="footer-right">
						<span>Created by Solemensis & Mateusz</span>
					</div>
				</footer>
			</div>
		{/if}
	</div>
</div>

<style>
	:root {
		--glass-bg: rgba(255, 255, 255, 0.03);
		--glass-border: rgba(255, 255, 255, 0.12);
		--accent-primary: #00f2ff;
		--accent-secondary: #7000ff;
		--text-main: #e0e0e0;
		--text-dim: rgba(224, 224, 224, 0.5);
	}

	.start-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		overflow: hidden;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	/* Glass Container */
	.glass-container {
		position: relative;
		z-index: 10;
		width: min(93%, 1100px);
		max-height: 85vh;
		background: rgba(10, 10, 15, 0.6);
		border: 1px solid var(--glass-border);
		border-radius: 32px;
		box-shadow: 
			0 25px 50px -12px rgba(0, 0, 0, 0.5),
			inset 0 1px 1px rgba(255, 255, 255, 0.05);
		overflow: hidden;
		transition: border-color 0.3s;
	}

	.start-content, .config-content {
		padding: 3rem;
		color: var(--text-main);
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		height: 100%;
		overflow-y: auto;
	}

	/* Minimalist Header */
	.minimal-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.logo-area {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.icon-glow {
		font-size: 1.5rem;
		color: var(--accent-primary);
		text-shadow: 0 0 15px var(--accent-primary);
	}

	.title {
		font-size: 2.5rem;
		font-weight: 800;
		letter-spacing: -0.05em;
		background: linear-gradient(to right, #fff, #888);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin: 0;
	}

	.version-badge {
		font-size: 0.7rem;
		padding: 0.2rem 0.6rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 20px;
		color: var(--text-dim);
		font-family: monospace;
	}

	.subtitle {
		font-size: 1rem;
		color: var(--text-dim);
		margin: 0;
	}

	/* Config Section Styles */
	.config-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.config-item {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.config-item label {
		font-size: 0.7rem;
		font-weight: 800;
		color: var(--accent-primary);
		letter-spacing: 0.1em;
		opacity: 0.8;
	}

	.select-wrapper {
		position: relative;
		width: 100%;
	}

	.glass-select {
		width: 100%;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 16px;
		padding: 1rem;
		color: white;
		font-family: inherit;
		font-size: 1rem;
		appearance: none;
		cursor: pointer;
		transition: all 0.3s;
	}

	.glass-select:focus {
		outline: none;
		border-color: var(--accent-primary);
		background: rgba(255, 255, 255, 0.08);
		box-shadow: 0 0 20px rgba(0, 242, 255, 0.1);
	}

	.glass-select option {
		background: #1a1a1a;
		color: white;
	}

	.config-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.glass-btn {
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		border-radius: 16px;
		padding: 1rem 2rem;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		color: white;
		font-weight: 800;
		letter-spacing: 0.05em;
	}

	.glass-btn:hover {
		transform: translateY(-2px);
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.glass-btn.primary {
		background: linear-gradient(135deg, rgba(0, 242, 255, 0.1), rgba(112, 0, 255, 0.1));
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	.btn-inner {
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}

	/* Main Layout */
	.main-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	/* Liquid Menu */
	.liquid-menu {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.menu-card {
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		border-radius: 20px;
		padding: 1.5rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
		overflow: hidden;
	}

	.menu-card:hover:not(.disabled) {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-4px);
		box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
	}

	.menu-card.primary {
		min-height: 200px;
		background: linear-gradient(135deg, rgba(0, 242, 255, 0.05), rgba(112, 0, 255, 0.05));
	}

	.menu-card.primary:hover {
		background: linear-gradient(135deg, rgba(0, 242, 255, 0.1), rgba(112, 0, 255, 0.1));
	}

	.secondary-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.action-tag {
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--accent-primary);
		letter-spacing: 0.1em;
		margin-bottom: 0.5rem;
		display: block;
	}

	.card-title {
		color: white;
		font-size: 1.5rem;
		margin: 0 0 0.5rem 0;
		font-weight: 700;
	}

	.card-desc {
		font-size: 0.9rem;
		color: var(--text-dim);
		margin: 0;
		line-height: 1.5;
	}

	.status-dot {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 8px;
		height: 8px;
		background: var(--accent-primary);
		border-radius: 50%;
		box-shadow: 0 0 10px var(--accent-primary);
	}

	.card-stats {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.stat-item {
		font-size: 0.8rem;
		background: rgba(255, 255, 255, 0.05);
		padding: 0.3rem 0.6rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: white;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1.5rem;
	}

	.status-pill {
		font-size: 0.7rem;
		color: #00ffaa;
		background: rgba(0, 255, 170, 0.1);
		padding: 0.2rem 0.6rem;
		border-radius: 20px;
		font-weight: 600;
	}

	.arrow {
		color: white;
		font-size: 1.2rem;
		transition: transform 0.3s;
	}

	.menu-card:hover .arrow {
		transform: translateX(5px);
	}

	.menu-card.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Scrollbar */
	.start-content::-webkit-scrollbar, .config-content::-webkit-scrollbar { width: 4px; }
	.start-content::-webkit-scrollbar-track, .config-content::-webkit-scrollbar-track { background: transparent; }
	.start-content::-webkit-scrollbar-thumb, .config-content::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 2px; }

	/* Minimal Footer */
	.minimal-footer {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--text-dim);
		padding-top: 1rem;
		border-top: 1px solid var(--glass-border);
	}

	/* World Creator Wrapper */
	.world-creator-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem;
	}

	#game-start-window {
		transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Responsive */
	@media (max-width: 900px) {
		.start-content, .config-content { padding: 1.5rem; }
		.title { font-size: 2rem; }
		.config-grid { grid-template-columns: 1fr; }
	}

	@media (max-width: 600px) {
		.secondary-actions { grid-template-columns: 1fr; }
	}
</style>
