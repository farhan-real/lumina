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
            <div style="font-weight: 800; font-size: 11px; color: var(--color-moon-mist); letter-spacing: 0.1em;">CAMPAIGN LEVELS</div>
            <div id="level-select-grid" class="level-select-grid"></div>
            <div style="font-weight: 800; font-size: 11px; color: var(--color-cyan); letter-spacing: 0.1em; margin-top: 14px;">CUSTOM USER LEVELS</div>
            <div id="custom-levels-container" class="custom-levels-list"></div>
            <div style="display: flex; justify-content: flex-end; margin-top: 10px; padding-top: 14px; border-top: 1px solid var(--liquid-glass-border);">
              <button id="btn-modal-clear-memory" class="hud-btn btn-danger" type="button">Clear Memory</button>
            </div>
          </div>
        </div>`;
    } else if (modalId === 'editor-code') {
      wrap.innerHTML = `
        <div class="code-modal-panel">
          <div class="modal-header">
            <span class="modal-title">Level Code Specification</span>
            <button class="modal-close" onclick="window.Lumina.ModalManager.close()">✕</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 12px; color: var(--color-moon-mist);">Export code to share, or paste existing level code below and click Import.</p>
            <textarea id="editor-code-area" class="code-textarea" spellcheck="false"></textarea>
            <div class="code-actions-row">
              <button id="btn-code-copy" class="hud-btn">Copy Code</button>
              <button id="btn-code-import" class="hud-btn hud-btn-primary">Import Code</button>
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
              <p>Guide the light beams into every target sensor simultaneously. Press <b>[Run Test]</b> to validate your circuit and complete the level.</p>
            </div>
          </div>
        </div>`;
    }
    return wrap;
  },

  onOpen(modalId, el, contextData) {
    if (modalId === 'level-select') {
      const grid = el.querySelector('#level-select-grid');
      grid.innerHTML = '';
      window.Lumina.LevelRegistry.getAll().forEach((lvl, idx) => {
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

      const customContainer = el.querySelector('#custom-levels-container');
      customContainer.innerHTML = '';
      const customList = window.Lumina.EditorIO.getCustomLevels();
      if (customList.length === 0) {
        customContainer.innerHTML = '<div style="font-size: 12px; color: var(--color-moon-mist); padding: 4px;">No custom levels saved yet. Create one in the Level Editor!</div>';
      } else {
        customList.forEach(cLvl => {
          const item = document.createElement('div');
          item.className = 'custom-level-item';
          item.innerHTML = `<span class="custom-level-title">${cLvl.title}</span><button class="hud-btn hud-btn-primary" style="min-height: 32px; padding: 4px 12px;">Play</button>`;
          item.querySelector('button').onclick = () => {
            window.Lumina.LevelRegistry.loadCustomLevel(cLvl);
            window.Lumina.Game.loadLevel(cLvl);
            window.Lumina.Game.switchScreen('gameplay');
            window.Lumina.ModalManager.close();
          };
          customContainer.appendChild(item);
        });
      }

      el.querySelector('#btn-modal-clear-memory').onclick = () => {
        if (confirm('Reset all saved progress and lock completed levels?')) {
          window.Lumina.LevelRegistry.clearSaveData();
          this.onOpen('level-select', el);
        }
      };
    } else if (modalId === 'editor-code') {
      const area = el.querySelector('#editor-code-area');
      area.value = (contextData && contextData.code) || '';

      el.querySelector('#btn-code-copy').onclick = () => {
        area.select();
        navigator.clipboard.writeText(area.value);
        alert('Level code copied to clipboard.');
      };

      el.querySelector('#btn-code-import').onclick = () => {
        const parsed = window.Lumina.EditorIO.parseCode(area.value);
        if (parsed) {
          window.Lumina.Editor.loadLevelIntoEditor(parsed);
          window.Lumina.ModalManager.close();
        }
      };
    } else if (modalId === 'victory') {
      el.querySelector('#btn-next-level').onclick = () => {
        window.Lumina.ModalManager.close();
        window.Lumina.Game.loadNextLevel();
      };
    }
  }
};