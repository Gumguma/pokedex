export const playPokemonCry = (id, types) => {
    if (!id) {
        playSynthesizedRetroCry(types);
        return;
    }

    try {
        const audioUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
        const audio = new Audio(audioUrl);
        audio.volume = 0.35;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                playSynthesizedRetroCry(types);
            });
        }
    } catch (err) {
        console.warn("Gagal memutar audio PokéAPI, memutar sintesis retro:", err);
        playSynthesizedRetroCry(types);
    }
};

export const playSynthesizedRetroCry = (types) => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const primaryType = types[0] || 'normal';

        let duration = 0.35;
        let baseFreq = 180;
        let endFreq = 400;
        let typeEffect = 'sine';

        if (primaryType === 'fire') {
            baseFreq = 120; endFreq = 300; typeEffect = 'triangle';
        } else if (primaryType === 'water') {
            baseFreq = 220; endFreq = 150; typeEffect = 'sine'; duration = 0.5;
        } else if (primaryType === 'electric') {
            baseFreq = 600; endFreq = 1200; typeEffect = 'sawtooth'; duration = 0.25;
        } else if (primaryType === 'grass') {
            baseFreq = 280; endFreq = 450; typeEffect = 'triangle';
        }

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = typeEffect;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (err) {
        console.warn("Gagal mensintesis audio retro:", err);
    }
};