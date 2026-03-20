<script>
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	export let nazwaPropozycji = 'wartość domyślna';
	export let opis = '';
	export let cena = 0;
	export let waluta = 'PLN';
	
	let licznik = 0;
	let komponentWidoczny = true;
	
	const incrementujLicznik = () => {
		licznik += 1;
	};
	
	const resetujLicznik = () => {
		licznik = 0;
	};
	
	const toggleKomponent = () => {
		komponentWidoczny = !komponentWidoczny;
		console.log('Stan komponentu:', komponentWidoczny);
	};

	// ===== GENERATOR MAPY =====
	const MAP_SIZE = 20;

	const staticNames = [
		{n: "Vaeloria", d: "Zapomniane miasto w chmurach"},
		{n: "Kranz", d: "Posterunek na skraju świata"},
		{n: "Onyx Ridge", d: "Czarne skały pełne echa"},
		{n: "Greenfell", d: "Wiecznie zielone doliny"},
		{n: "Ironhold", d: "Twierdza wykuta w granicie"},
		{n: "Silvershadow", d: "Lustrzane tafle jezior"},
		{n: "Dustmourn", d: "Piaszczyste pustkowia"},
		{n: "Everbloom", d: "Oaza niegasnących kwiatów"},
		{n: "Stormreach", d: "Wzgórza targane wiatrem"},
		{n: "Nightshade", d: "Mroczny, gęsty las"},
		{n: "Highfall", d: "Kaskady spadającej wody"},
		{n: "Cinder Peak", d: "Wygasły wulkaniczny stożek"},
		{n: "Mistwatch", d: "Wieża we mgle"},
		{n: "Solitude", d: "Ciche miejsce odosobnienia"},
		{n: "Wraithwood", d: "Szept starej puszczy"},
		{n: "Goldleaf", d: "Jesienne gaje klonowe"},
		{n: "Obsidian", d: "Gładka, ciemna otchłań"},
		{n: "Frostpeak", d: "Zmarznięta iglica świata"},
		{n: "Dawnstar", d: "Pierwszy blask poranka"},
		{n: "Ravenloft", d: "Gniazdo czarnych kruków"}
	];

	const regionSchema = {
		"001": { type: "city", color: "#ef4444" },
		"002": { type: "Neutral", role: "main", color: "#84cc3a" },
		"003": { type: "Neutral", role: "water", color: "#3b82f6" }, 
		"004": { type: "Neutral", role: "desert", color: "#e8c37d" },
		"005": { type: "Neutral", role: "forest", color: "#238823" },
		"006": { type: "Monolith", role: "mountain", color: "#78716c" }
	};

	const Perlin = {
		p: new Uint8Array(512),
		init(seed) {
			let s = seed;
			const random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
			for(let i=0; i<256; i++) this.p[i] = i;
			for(let i=255; i>0; i--) {
				let j = Math.floor(random() * (i + 1));
				[this.p[i], this.p[j]] = [this.p[j], this.p[i]];
			}
			for(let i=0; i<256; i++) this.p[256+i] = this.p[i];
		},
		fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); },
		lerp(t, a, b) { return a + t * (b - a); },
		grad(hash, x, y) {
			const h = hash & 15;
			const u = h < 8 ? x : y;
			const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
			return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
		},
		noise(x, y) {
			const X = Math.floor(x) & 255;
			const Y = Math.floor(y) & 255;
			const xf = x - Math.floor(x);
			const yf = y - Math.floor(y);
			const u = this.fade(xf);
			const v = this.fade(yf);
			const A = this.p[X]+Y, AA = this.p[A], AB = this.p[A+1];
			const B = this.p[X+1]+Y, BA = this.p[B], BB = this.p[B+1];
			return this.lerp(v, this.lerp(u, this.grad(this.p[AA], xf, yf), this.grad(this.p[BA], xf-1, yf)),
							   this.lerp(u, this.grad(this.p[AB], xf, yf-1), this.grad(this.p[BB], xf-1, yf-1)));
		}
	};

	function prng(seed, index) {
		let val = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
		return val - Math.floor(val);
	}

	let mapGrid = [];
	let selectedTile = null;
	let seedInput = 1337;

	function generateMap() {
		const seed = seedInput;
		Perlin.init(seed);
		
		let raw = Array.from({length: MAP_SIZE}, () => Array(MAP_SIZE).fill("002"));
		
		for(let y=0; y<MAP_SIZE; y++) {
			for(let x=0; x<MAP_SIZE; x++) {
				let nx = x / 7.0;
				let ny = y / 7.0;
				let elevation = (Perlin.noise(nx, ny) + 1) / 2;
				let dx = Math.abs(x - MAP_SIZE/2) / (MAP_SIZE/2);
				let dy = Math.abs(y - MAP_SIZE/2) / (MAP_SIZE/2);
				let dist = Math.sqrt(dx*dx + dy*dy);
				elevation -= (dist * 0.22); 
				
				if (elevation < 0.28) { 
					raw[y][x] = "003"; 
				} else {
					let moisture = (Perlin.noise(nx + 20, ny + 20) + 1) / 2;
					if (moisture < 0.35) {
						raw[y][x] = "004"; 
					} else if (moisture > 0.65) {
						raw[y][x] = "005"; 
					} else {
						raw[y][x] = "002"; 
					}
				}
			}
		}

		for(let pass=0; pass<3; pass++) {
			let temp = JSON.parse(JSON.stringify(raw));
			for(let y=0; y<MAP_SIZE; y++) {
				for(let x=0; x<MAP_SIZE; x++) {
					let neighbors = [];
					if(y>0) neighbors.push(raw[y-1][x]);
					if(y<MAP_SIZE-1) neighbors.push(raw[y+1][x]);
					if(x>0) neighbors.push(raw[y][x-1]);
					if(x<MAP_SIZE-1) neighbors.push(raw[y][x+1]);
					let counts = {};
					neighbors.forEach(n => counts[n] = (counts[n] || 0) + 1);
					let maxCount = 0;
					let dominant = raw[y][x];
					for(let type in counts) {
						if(counts[type] > maxCount) {
							maxCount = counts[type];
							dominant = type;
						}
					}
					if (maxCount >= 3) temp[y][x] = dominant;
				}
			}
			raw = temp;
		}

		let landTiles = [];
		for(let y=0; y<MAP_SIZE; y++) {
			for(let x=0; x<MAP_SIZE; x++) {
				if (raw[y][x] !== "003") landTiles.push({x, y});
			}
		}
		landTiles.sort((a,b) => prng(seed, a.x*MAP_SIZE+a.y) - prng(seed, b.x*MAP_SIZE+b.y));

		const cities = [];
		let cityCandidates = landTiles.filter(t => raw[t.y][t.x] === "002" || raw[t.y][t.x] === "004");
		for (let pos of cityCandidates) {
			if (cities.length >= 4) break;
			if (cities.every(p => Math.hypot(p.x - pos.x, p.y - pos.y) > 6)) {
				cities.push(pos);
				raw[pos.y][pos.x] = "001";
			}
		}

		const monos = [];
		for (let pos of landTiles) {
			if (monos.length >= 2) break;
			if (raw[pos.y][pos.x] === "001") continue; 
			
			const farFromCities = cities.every(p => Math.hypot(p.x - pos.x, p.y - pos.y) > 6);
			const farFromMonos = monos.every(p => Math.hypot(p.x - pos.x, p.y - pos.y) > 8);
			
			if (farFromCities && farFromMonos) {
				monos.push(pos);
				raw[pos.y][pos.x] = "006";
			}
		}

		mapGrid = raw.map((row, y) => row.map((id, x) => {
			const base = regionSchema[id];
			const nameIdx = (x * 7 + y * 13 + seed) % staticNames.length;
			const data = staticNames[nameIdx];
			return {
				x, y, regionId: id, type: base.type,
				name: id === "001" ? "Osada " + data.n : (id === "006" ? "Monolit " + data.n : data.n),
				description: data.d,
			};
		}));
		
		selectedTile = null;
		renderCanvas();
	}

	let canvas;
	let ctx;

	onMount(() => {
		canvas = document.getElementById('mapCanvas');
		ctx = canvas.getContext('2d');
		generateMap();
	});

	function renderCanvas() {
		if (!ctx || !mapGrid.length) return;
		ctx.clearRect(0,0,200,200);
		mapGrid.forEach((row, y) => {
			row.forEach((tile, x) => {
				ctx.fillStyle = regionSchema[tile.regionId].color;
				ctx.fillRect(x*10, y*10, 10, 10);
				if (y > 0 && mapGrid[y-1][x].regionId !== tile.regionId) {
					ctx.fillStyle = "rgba(0,0,0,0.12)";
					ctx.fillRect(x*10, y*10, 10, 1);
				}
			});
		});
		if (selectedTile) {
			ctx.strokeStyle = "white";
			ctx.lineWidth = 2;
			ctx.strokeRect(selectedTile.x*10+1, selectedTile.y*10+1, 8, 8);
		}
	}

	function handleCanvasClick(e) {
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const mouseX = (e.clientX - rect.left) * scaleX;
		const mouseY = (e.clientY - rect.top) * scaleY;
		const x = Math.floor(mouseX / 10);
		const y = Math.floor(mouseY / 10);
		if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return;
		selectedTile = {x, y};
		renderCanvas();
	}
</script>

<!-- Przycisk do pokazywania/ukrywania (zawsze widoczny) -->
<button class="toggle-btn" on:click={toggleKomponent} class:ukryty={!komponentWidoczny}>
  {#if komponentWidoczny}
    <span class="toggle-icon">◀</span>
    <span>Ukryj panel</span>
  {:else}
    <span class="toggle-icon">▶</span>
    <span>Pokaż panel</span>
  {/if}
</button>

<!-- Główny komponent - widoczny tylko gdy komponentWidoczny = true -->
{#if komponentWidoczny}
  <div class="komponent" transition:fade={{ duration: 300 }}>
    <h2>{nazwaPropozycji}</h2>
    
    {#if opis}
      <p class="opis">{opis}</p>
    {/if}
    
    {#if cena > 0}
      <p class="cena">Cena: {cena} {waluta}</p>
    {/if}
    
    <div class="licznik">
      <p>Liczba kliknięć: {licznik}</p>
      <button on:click={incrementujLicznik}>Kliknij mnie</button>
      <button on:click={resetujLicznik}>Resetuj</button>
    </div>

    <!-- NOWA SEKCJA: GENERATOR MAPY -->
    <div style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
      <h3 style="margin:0 0 10px 0;">Generator mapy świata</h3>
      <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
        <label>Seed:</label>
        <input type="number" bind:value={seedInput} style="width: 80px; padding: 4px;" />
        <button on:click={generateMap}>Generuj mapę</button>
      </div>
      <div style="display: flex; gap: 20px;">
        <canvas id="mapCanvas" width="200" height="200" style="width: 200px; height: 200px; image-rendering: pixelated; border: 1px solid #000;" on:click={handleCanvasClick}></canvas>
        {#if selectedTile}
          {@const tile = mapGrid[selectedTile.y]?.[selectedTile.x]}
          {#if tile}
            <div style="flex:1; background: #f0f0f0; padding: 8px; border-radius: 4px;">
              <p><strong>{tile.name}</strong> (typ: {tile.type})</p>
              <p style="font-size:0.9rem;">{tile.description}</p>
              <p style="font-size:0.8rem; color:#666;">ID regionu: {tile.regionId}</p>
              <p style="font-size:0.8rem; color:#666;">[Generate AI]</p>
            </div>
          {/if}
        {:else}
          <div style="flex:1; background: #f0f0f0; padding: 8px; border-radius: 4px; color:#999;">
            Kliknij na mapie, aby zobaczyć szczegóły.
          </div>
        {/if}
      </div>
    </div>

    <p class="hola">hola hola</p>
  </div>
{/if}

<style>
  .toggle-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 50px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  }
  
  .toggle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  }
  
  .toggle-btn.ukryty {
    background: linear-gradient(135deg, #48c6ef, #6f86d6);
  }
  
  .toggle-icon {
    font-size: 20px;
    line-height: 1;
  }
  
  .komponent {
    position: fixed;
    top: 80px;
    right: 20px;
    width: 600px;  /* zwiększone, aby pomieścić mapę */
    max-width: calc(100vw - 40px);
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px;
    background: white;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    z-index: 999;
    animation: slideIn 0.3s ease;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  h2 {
    color: #333;
    margin: 0 0 12px 0;
    font-size: 1.3rem;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 8px;
  }
  
  .opis {
    color: #666;
    font-style: italic;
    margin: 8px 0;
    font-size: 0.95rem;
  }
  
  .cena {
    font-weight: bold;
    color: #2c3e50;
    font-size: 1.1em;
    background: #f8f9fa;
    padding: 8px 12px;
    border-radius: 8px;
    margin: 10px 0;
  }
  
  .licznik {
    margin: 16px 0;
    padding: 16px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 10px;
    border: 1px solid #dee2e6;
  }
  
  .licznik p {
    margin: 0 0 12px 0;
    font-weight: 600;
    color: #495057;
  }
  
  button {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
  
  button:last-child {
    background: linear-gradient(135deg, #fc466b, #3f5efb);
  }
  
  .hola {
    text-align: center;
    color: #e74c3c;
    font-weight: bold;
    margin: 12px 0 0 0;
    font-size: 1.1rem;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  
  @media (max-width: 768px) {
    .toggle-btn {
      top: 10px;
      right: 10px;
      padding: 8px 16px;
      font-size: 14px;
    }
    
    .komponent {
      top: 70px;
      right: 10px;
      width: 300px;
      padding: 16px;
    }
    
    button {
      padding: 6px 12px;
      font-size: 13px;
    }
  }
  
  @media (max-width: 480px) {
    .komponent {
      width: calc(100vw - 20px);
      right: 10px;
      left: 10px;
      top: 70px;
    }
    
    .toggle-btn span:last-child {
      display: none;
    }
  }
</style>