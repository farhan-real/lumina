window.Lumina = window.Lumina || {};

window.Lumina.SFX = {
  playTargetHit() {
    const s = window.Lumina.Synth;
    s.playTone(523.25, 0.25, 'sine', 0.2); // C5
    setTimeout(() => s.playTone(659.25, 0.25, 'sine', 0.2), 60); // E5
  },

  playVictory() {
    const s = window.Lumina.Synth;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => s.playTone(freq, 0.5, 'sine', 0.25), idx * 80);
    });
  },

  playClick() {
    window.Lumina.Synth.playTone(800, 0.04, 'triangle', 0.1);
  },

  playRotate() {
    window.Lumina.Synth.playTone(400, 0.03, 'sine', 0.05);
  }
};