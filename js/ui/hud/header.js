window.Lumina = window.Lumina || {};

window.Lumina.HUDHeader = {
  titleEl: null,
  sensorContainer: null,
  coordEl: null,

  init() {
    this.titleEl = document.getElementById('hdr-level-title');
    this.sensorContainer = document.getElementById('sensor-indicators');
    this.coordEl = document.getElementById('pointer-coord-display');

    document.getElementById('btn-hdr-menu').addEventListener('click', () => {
      window.Lumina.Game.switchScreen('menu');
    });

    document.getElementById('btn-hdr-reset').addEventListener('click', () => {
      window.Lumina.Game.resetCurrentLevel();
    });

    document.getElementById('btn-hdr-levels').addEventListener('click', () => {
      window.Lumina.ModalManager.open('level-select');
    });

    document.getElementById('btn-run-check').addEventListener('click', () => {
      window.Lumina.Game.checkSolution();
    });

    const audioBtn = document.getElementById('btn-hdr-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = window.Lumina.Synth.toggleMute();
        audioBtn.textContent = isMuted ? 'Sound: Off' : 'Sound: On';
      });
    }
  },

  updateLevelInfo(level) {
    if (this.titleEl) this.titleEl.textContent = level.title;
    this.buildSensorDots(level.sensors);
  },

  buildSensorDots(sensors) {
    if (!this.sensorContainer) return;
    this.sensorContainer.innerHTML = '';
    sensors.forEach((s, idx) => {
      const dot = document.createElement('div');
      dot.className = 'sensor-dot';
      dot.setAttribute('data-color', s.requiredColor || 'any');
      dot.id = 's-dot-' + idx;
      this.sensorContainer.appendChild(dot);
    });
  },

  updateSensorStates(sensors) {
    sensors.forEach((s, idx) => {
      const dot = document.getElementById('s-dot-' + idx);
      if (dot) {
        if (s.active) {
          dot.className = 'sensor-dot active';
        } else if ((s.currentHits || 0) > 0) {
          dot.className = 'sensor-dot charging';
        } else {
          dot.className = 'sensor-dot';
        }
      }
    });
  },

  updatePointerCoords(x, y) {
    if (this.coordEl) {
      const text = `X: ${x} Y: ${y}`;
      if (this.coordEl.textContent !== text) {
        this.coordEl.textContent = text;
      }
    }
  }
};