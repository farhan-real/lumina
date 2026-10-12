window.Lumina = window.Lumina || {};

window.Lumina.DialogTemplates = {
  create(modalId) {
    const wrap = document.createElement('div');
    wrap.id = 'modal-' + modalId;
    wrap.className = 'modal-backdrop hidden';

    if (modalId === 'level-select') {
      wrap.innerHTML = `
        <div class="modal-panel">
          <div class="modal-header">
            <span class="modal-title">Levels</span>
            <button class="modal-close" onclick="window.Lumina.ModalManager.close()">✕</button>
          </div>
          <div class="modal-body">
            <div id="level-select-grid" class="level-select-grid"></div>
            <div style="display: flex; justify-content: flex-end; margin-top: 10px; padding-top: 14px; border-top: 1px solid var(--liquid-glass-border);">
              <button id="btn-modal-clear-memory" class="hud-btn btn-danger" type="button">Clear Memory</button>
            </div>
          </div>
        </div>`;
    } else if (modalId === 'victory') {
      wrap.innerHTML = `
        <div class="modal-panel" style="max-width: 480px;">
          <div class="modal-body" style="padding: 36px 24px; text-align: center;">
            <h2 class="win-title">Level Complete</h2>
            <p class="win-desc">All target sensors energized. Coherent light circuit achieved.</p>
            <div style="display: flex; gap: 14px; justify-content: center; margin-top: 24px;">
              <button id="btn-next-level" class="hud-btn hud-btn-primary" style="min-height: 46px; padding: 10px 28px;">Next Level</button>
            </div>
          </div>
        </div>`;
    } else if (modalId === 'help') {
      wrap.innerHTML = `
        <div class="modal-panel">
          <div class="modal-header">
            <span class="modal-title">Optical Manual</span>
            <button class="modal-close" onclick="window.Lumina.ModalManager.close()">✕</button>
          </div>
          <div class="modal-body">
            <div class="help-card">
              <h4>Objective & Validation</h4>
              <p>Guide the light beams into every target sensor simultaneously. Rotate and place pieces freely. Press <b>[Run Test]</b> to validate your circuit and complete the level.</p>
            </div>
            <div class="manual-grid">
              <div class="help-card">
                <h4>Flat Mirror</h4>
                <p>Specular reflector. Bounces rays such that the angle of incidence equals the angle of reflection.</p>
              </div>
              <div class="help-card">
                <h4>Dispersion Prism</h4>
                <p>Refracts and splits white composite beams into separate Red (680nm), Green (532nm), and Blue (445nm) paths.</p>
              </div>
              <div class="help-card">
                <h4>Convex Lens</h4>
                <p>Converging optics. Refracts incoming parallel light toward a real focal point on its principal axis.</p>
              </div>
              <div class="help-card">
                <h4>Concave Lens</h4>
                <p>Diverging optics. Spreads narrow light beams outward as if originating from a virtual focal point.</p>
              </div>
              <div class="help-card">
                <h4>Beam Splitter</h4>
                <p>Semi-silvered plate. Divides a single incoming ray into a transmitted branch and a 90° reflected branch.</p>
              </div>
              <div class="help-card">
                <h4>Portal</h4>
                <p>Coupled aperture. Light entering Portal A teleports instantly out of Portal B with preserved momentum.</p>
              </div>
              <div class="help-card">
                <h4>Black Hole</h4>
                <p>Cosmic hazard. Curves light paths via gravity. Beams crossing into the dark event horizon are swallowed.</p>
              </div>
              <div class="help-card">
                <h4>Target Receptors</h4>
                <p>Nodes display their required color ring and badge (λ RED, λ GRN, λ BLU, λ ANY). Only matching wavelengths lock.</p>
              </div>
            </div>
          </div>
        </div>`;
    }
    return wrap;
  },

  onOpen(modalId, el) {
    if (modalId === 'level-select') {
      const grid = el.querySelector('#level-select-grid');
      grid.innerHTML = '';
      const levels = window.Lumina.LevelRegistry.getAll();
      levels.forEach((lvl, idx) => {
        const card = document.createElement('div');
        const unlocked = window.Lumina.LevelRegistry.isUnlocked(idx);
        card.className = `level-card ${unlocked ? '' : 'locked'}`;
        card.innerHTML = `<span class="num">${lvl.id}</span><span class="state">${unlocked ? 'OPEN' : 'LOCKED'}</span>`;
        if (unlocked) {
          card.onclick = () => {
            window.Lumina.LevelRegistry.setCurrentIndex(idx);
            window.Lumina.Game.loadLevel(lvl);
            window.Lumina.Game.switchScreen('gameplay');
            window.Lumina.ModalManager.close();
          };
        }
        grid.appendChild(card);
      });

      const clearBtn = el.querySelector('#btn-modal-clear-memory');
      if (clearBtn) {
        clearBtn.onclick = () => {
          if (confirm('Reset all saved progress and lock completed levels?')) {
            window.Lumina.LevelRegistry.clearSaveData();
            window.Lumina.SFX.playClick();
            this.onOpen('level-select', el);
          }
        };
      }
    } else if (modalId === 'victory') {
      el.querySelector('#btn-next-level').onclick = () => {
        window.Lumina.ModalManager.close();
        window.Lumina.Game.loadNextLevel();
      };
    }
  }
};