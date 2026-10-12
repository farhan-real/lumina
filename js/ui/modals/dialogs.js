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
            <span class="modal-title">Level Code</span>
            <button class="modal-close" onclick="window.Lumina.ModalManager.close()">✕</button>
          </div>
          <div class="code-tab-bar">
            <button id="tab-btn-export" class="code-tab-btn active" type="button">Export Code</button>
            <button id="tab-btn-import" class="code-tab-btn" type="button">Paste & Import</button>
          </div>
          <div class="modal-body">
            <div id="pane-code-export" class="code-tab-pane">
              <p style="font-size: 12px; color: var(--color-moon-mist);">Generated JavaScript file content for your level. Copy and save into your project:</p>
              <textarea id="editor-code-export-area" class="code-textarea" readonly spellcheck="false"></textarea>
              <div class="code-actions-row">
                <button id="btn-code-copy" class="hud-btn hud-btn-primary">Copy Code</button>
              </div>
            </div>
            <div id="pane-code-import" class="code-tab-pane hidden">
              <p style="font-size: 12px; color: var(--color-moon-mist);">Paste level code (JavaScript or JSON) below and click Import to edit:</p>
              <textarea id="editor-code-import-area" class="code-textarea" placeholder="Paste level code here..." spellcheck="false"></textarea>
              <div class="code-actions-row">
                <button id="btn-code-import" class="hud-btn hud-btn-primary">Load & Edit Level</button>
              </div>
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
    }
    return wrap;
  },

  onOpen(modalId, el, contextData) {
    if (modalId === 'level-select') {
      const grid = el.querySelector('#level-select-grid');
      grid.innerHTML = '';
      const allLevels = window.Lumina.LevelRegistry.getAll();

      allLevels.forEach((lvl, idx) => {
        const card = document.createElement('div');
        const unlocked = window.Lumina.LevelRegistry.isUnlocked(idx);
        card.className = `level-card ${unlocked ? '' : 'locked'}`;
        card.innerHTML = `<span class="num">${lvl.id}</span><span class="state">${unlocked ? 'OPEN' : 'LOCKED'}</span>`;
        if (unlocked) {
          card.onclick = () => {
            if (window.Lumina.Game.currentScreen === 'editor') {
              window.Lumina.Editor.loadLevelIntoEditor(lvl);
            } else {
              window.Lumina.LevelRegistry.setCurrentIndex(idx);
              window.Lumina.Game.loadLevel(lvl);
              window.Lumina.Game.switchScreen('gameplay');
            }
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
        customList.forEach((cLvl) => {
          const item = document.createElement('div');
          item.className = 'custom-level-item';
          item.innerHTML = `
            <span class="custom-level-title">${cLvl.title}</span>
            <div style="display: flex; gap: 6px;">
              <button class="hud-btn hud-btn-primary btn-play-custom" style="min-height: 30px; padding: 3px 10px; font-size: 11px;">Play</button>
              <button class="hud-btn btn-edit-custom" style="min-height: 30px; padding: 3px 10px; font-size: 11px;">Edit</button>
              <button class="hud-btn btn-danger btn-del-custom" style="min-height: 30px; padding: 3px 8px; font-size: 11px;">Delete</button>
            </div>
          `;

          item.querySelector('.btn-play-custom').onclick = () => {
            window.Lumina.LevelRegistry.loadCustomLevel(cLvl);
            window.Lumina.Game.loadLevel(cLvl);
            window.Lumina.Game.switchScreen('gameplay');
            window.Lumina.ModalManager.close();
          };

          item.querySelector('.btn-edit-custom').onclick = () => {
            window.Lumina.Editor.loadLevelIntoEditor(cLvl);
            if (window.Lumina.Game.currentScreen !== 'editor') {
              window.Lumina.Game.switchScreen('editor');
            }
            window.Lumina.ModalManager.close();
          };

          item.querySelector('.btn-del-custom').onclick = () => {
            if (confirm(`Delete custom level "${cLvl.title}"?`)) {
              window.Lumina.EditorIO.deleteFromStorage(cLvl.id);
              if (window.Lumina.SFX?.playClick) window.Lumina.SFX.playClick();
              this.onOpen('level-select', el);
            }
          };

          customContainer.appendChild(item);
        });
      }

      el.querySelector('#btn-modal-clear-memory').onclick = () => {
        if (confirm('Reset all game data, progress, and custom levels?')) {
          window.Lumina.LevelRegistry.clearSaveData();
          if (window.Lumina.SFX?.playClick) window.Lumina.SFX.playClick();
          this.onOpen('level-select', el);
        }
      };
    } else if (modalId === 'editor-code') {
      const tabExport = el.querySelector('#tab-btn-export');
      const tabImport = el.querySelector('#tab-btn-import');
      const paneExport = el.querySelector('#pane-code-export');
      const paneImport = el.querySelector('#pane-code-import');
      const exportArea = el.querySelector('#editor-code-export-area');
      const importArea = el.querySelector('#editor-code-import-area');

      const generated = (contextData && contextData.code) ||
        window.Lumina.EditorIO.generateCode(window.Lumina.Editor.currentLevel);
      exportArea.value = generated;
      importArea.value = '';

      const switchTab = (toExport) => {
        tabExport.classList.toggle('active', toExport);
        tabImport.classList.toggle('active', !toExport);
        paneExport.classList.toggle('hidden', !toExport);
        paneImport.classList.toggle('hidden', toExport);
      };

      tabExport.onclick = () => switchTab(true);
      tabImport.onclick = () => switchTab(false);

      el.querySelector('#btn-code-copy').onclick = () => {
        exportArea.select();
        navigator.clipboard.writeText(exportArea.value);
        alert('Level code copied to clipboard.');
      };

      el.querySelector('#btn-code-import').onclick = () => {
        const parsed = window.Lumina.EditorIO.parseCode(importArea.value);
        if (parsed) {
          window.Lumina.Editor.loadLevelIntoEditor(parsed);
          window.Lumina.ModalManager.close();
        }
      };
    } else if (modalId === 'victory') {
      const btn = el.querySelector('#btn-next-level');
      if (window.Lumina.Game.isPreviewMode) {
        btn.textContent = 'Exit Preview';
        btn.onclick = () => {
          window.Lumina.ModalManager.close();
          window.Lumina.Game.exitPreviewMode();
        };
      } else {
        btn.textContent = 'Next Level';
        btn.onclick = () => {
          window.Lumina.ModalManager.close();
          window.Lumina.Game.loadNextLevel();
        };
      }
    }
  }
};