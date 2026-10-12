window.Lumina = window.Lumina || {};

window.Lumina.EditorUI = {
  activeEntity: null,

  init() {
    this.bindGlobalInputs();
  },

  bindGlobalInputs() {
    const mapW = document.getElementById('prop-map-width');
    const mapH = document.getElementById('prop-map-height');
    const lvlTitle = document.getElementById('prop-level-title');
    const headerTitle = document.getElementById('editor-level-name-input');

    // Preserve whitespace during typing; sync without overwriting the active input
    const syncName = (sourceInput, targetInput) => {
      const rawVal = sourceInput.value;
      if (window.Lumina.Editor.currentLevel) {
        window.Lumina.Editor.currentLevel.title = rawVal.trim() || 'Custom Level';
      }
      if (targetInput && targetInput.value !== rawVal) {
        targetInput.value = rawVal;
      }
    };

    const finalizeName = (inputEl, otherEl) => {
      const cleanVal = inputEl.value.trim() || 'Custom Level';
      inputEl.value = cleanVal;
      if (otherEl) otherEl.value = cleanVal;
      if (window.Lumina.Editor.currentLevel) {
        window.Lumina.Editor.currentLevel.title = cleanVal;
      }
    };

    if (headerTitle && lvlTitle) {
      headerTitle.addEventListener('input', () => syncName(headerTitle, lvlTitle));
      lvlTitle.addEventListener('input', () => syncName(lvlTitle, headerTitle));

      headerTitle.addEventListener('blur', () => finalizeName(headerTitle, lvlTitle));
      lvlTitle.addEventListener('blur', () => finalizeName(lvlTitle, headerTitle));
    }

    if (mapW) {
      mapW.addEventListener('change', () => {
        if (!window.Lumina.Editor.currentLevel) return;
        window.Lumina.Editor.currentLevel.width = parseInt(mapW.value, 10) || 1000;
        window.Lumina.Renderer.resize();
      });
    }
    if (mapH) {
      mapH.addEventListener('change', () => {
        if (!window.Lumina.Editor.currentLevel) return;
        window.Lumina.Editor.currentLevel.height = parseInt(mapH.value, 10) || 700;
        window.Lumina.Renderer.resize();
      });
    }

    this.renderInventoryConfig();
  },

  renderInventoryConfig() {
    const container = document.getElementById('editor-inv-config');
    if (!container || !window.Lumina.Editor || !window.Lumina.Editor.currentLevel) return;

    const invTypes = [
      { key: 'mirror', label: 'Mirrors' },
      { key: 'prism', label: 'Prisms' },
      { key: 'lens_convex', label: 'Convex Lenses' },
      { key: 'lens_concave', label: 'Concave Lenses' },
      { key: 'beam_splitter', label: 'Splitters' },
      { key: 'portal', label: 'Portals' },
      { key: 'wall', label: 'Walls' }
    ];

    const currentInv = window.Lumina.Editor.currentLevel.inventory || [];
    container.innerHTML = '';

    invTypes.forEach((t) => {
      const row = document.createElement('div');
      row.className = 'inv-config-row';
      const existing = currentInv.find((i) => i.type === t.key);
      const count = existing ? existing.count : 0;

      row.innerHTML = `
        <label>${t.label}</label>
        <div class="inv-stepper">
          <button type="button" class="inv-step-btn" data-act="sub">-</button>
          <input type="number" class="prop-input inv-input" min="0" max="99" value="${count}">
          <button type="button" class="inv-step-btn" data-act="add">+</button>
        </div>
      `;

      const input = row.querySelector('.inv-input');
      const updateCount = (newVal) => {
        const val = Math.max(0, parseInt(newVal, 10) || 0);
        input.value = val;
        let item = currentInv.find((i) => i.type === t.key);
        if (item) {
          item.count = val;
        } else if (val > 0) {
          currentInv.push({ type: t.key, count: val });
        }
        window.Lumina.Editor.currentLevel.inventory = currentInv.filter((i) => i.count > 0);
        window.Lumina.Editor.syncToGame();
      };

      row.querySelector('[data-act="sub"]').onclick = () => updateCount(parseInt(input.value, 10) - 1);
      row.querySelector('[data-act="add"]').onclick = () => updateCount(parseInt(input.value, 10) + 1);
      input.onchange = (e) => updateCount(e.target.value);

      container.appendChild(row);
    });
  },

  syncValues(entity) {
    if (!entity || entity !== this.activeEntity) return;
    const inpX = document.getElementById('inp-ent-x');
    const inpY = document.getElementById('inp-ent-y');
    const inpAng = document.getElementById('inp-ent-ang');
    const inpW = document.getElementById('inp-w-w');
    const inpH = document.getElementById('inp-w-h');

    if (inpX && document.activeElement !== inpX) inpX.value = Math.round(entity.x);
    if (inpY && document.activeElement !== inpY) inpY.value = Math.round(entity.y);
    if (inpAng && document.activeElement !== inpAng) inpAng.value = entity.angle || 0;
    if (inpW && document.activeElement !== inpW && entity.width) inpW.value = entity.width;
    if (inpH && document.activeElement !== inpH && entity.height) inpH.value = entity.height;
  },

  updateInspector(entity) {
    this.activeEntity = entity;
    const body = document.getElementById('inspector-dynamic-props');
    if (!body) return;

    if (!entity) {
      body.innerHTML = '<div style="color: var(--color-moon-mist); font-size: 12px;">Select an element or sensor on the canvas to configure properties.</div>';
      return;
    }

    if (entity._isSensor) {
      this.renderSensorInspector(body, entity);
    } else if (entity._isEmitter) {
      this.renderEmitterInspector(body, entity);
    } else {
      this.renderElementInspector(body, entity);
    }
  },

  renderSensorInspector(container, sensor) {
    if (!sensor.requirements || sensor.requirements.length === 0) {
      sensor.requirements = [{ color: sensor.requiredColor || 'any', count: sensor.requiredBeams || 1 }];
    }

    container.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-title">LIGHT COMBINATIONS</div>
        <div class="prop-field"><label>X Position</label><input type="number" id="inp-ent-x" class="prop-input" value="${Math.round(sensor.x)}"></div>
        <div class="prop-field"><label>Y Position</label><input type="number" id="inp-ent-y" class="prop-input" value="${Math.round(sensor.y)}"></div>
        <div style="font-size: 11px; font-weight: 700; color: var(--color-moon-mist); margin-top: 4px;">REQUIRED COMBINATIONS</div>
        <div id="sensor-reqs-list" class="sensor-reqs-list"></div>
        <button id="btn-add-req-row" class="hud-btn" style="min-height: 28px; font-size: 11px; margin-top: 4px;">+ Add Light Requirement</button>
        <button id="btn-del-entity" class="hud-btn btn-danger" style="margin-top: 8px;">Delete Sensor</button>
      </div>`;

    const list = container.querySelector('#sensor-reqs-list');
    const colors = ['any', 'red', 'green', 'blue', 'cyan', 'amber', 'violet'];

    sensor.requirements.forEach((req, idx) => {
      const row = document.createElement('div');
      row.className = 'req-item-row';
      row.innerHTML = `
        <button class="req-step-btn" data-act="sub">-</button>
        <span class="req-count-label">${req.count}x</span>
        <button class="req-step-btn" data-act="add">+</button>
        <select class="req-color-select">
          ${colors.map((c) => `<option value="${c}" ${req.color === c ? 'selected' : ''}>${c.toUpperCase()}</option>`).join('')}
        </select>
        <button class="req-step-btn" style="color: var(--color-red);" data-act="del">✕</button>
      `;

      row.querySelector('[data-act="sub"]').onclick = () => {
        if (req.count > 1) { req.count--; this.renderSensorInspector(container, sensor); }
      };
      row.querySelector('[data-act="add"]').onclick = () => {
        req.count++; this.renderSensorInspector(container, sensor);
      };
      row.querySelector('.req-color-select').onchange = (e) => {
        req.color = e.target.value;
      };
      row.querySelector('[data-act="del"]').onclick = () => {
        if (sensor.requirements.length > 1) {
          sensor.requirements.splice(idx, 1);
          this.renderSensorInspector(container, sensor);
        }
      };
      list.appendChild(row);
    });

    container.querySelector('#btn-add-req-row').onclick = () => {
      sensor.requirements.push({ color: 'any', count: 1 });
      this.renderSensorInspector(container, sensor);
    };

    this.bindEntityCommon(container, sensor);
  },

  renderEmitterInspector(container, emitter) {
    container.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-title">LIGHT EMITTER</div>
        <div class="prop-field"><label>X Position</label><input type="number" id="inp-ent-x" class="prop-input" value="${Math.round(emitter.x)}"></div>
        <div class="prop-field"><label>Y Position</label><input type="number" id="inp-ent-y" class="prop-input" value="${Math.round(emitter.y)}"></div>
        <div class="prop-field"><label>Angle (Deg)</label><input type="number" id="inp-ent-ang" class="prop-input" value="${emitter.angle || 0}"></div>
        <div class="prop-field"><label>Beam Spectrum</label>
          <select id="inp-em-col" class="prop-input">
            ${['white', 'red', 'green', 'blue', 'cyan', 'amber', 'violet'].map((c) => `<option value="${c}" ${emitter.color === c ? 'selected' : ''}>${c.toUpperCase()}</option>`).join('')}
          </select>
        </div>
        <button id="btn-del-entity" class="hud-btn btn-danger" style="margin-top: 6px;">Delete Emitter</button>
      </div>`;

    container.querySelector('#inp-em-col').onchange = (e) => { emitter.color = e.target.value; };
    this.bindEntityCommon(container, emitter);
  },

  renderElementInspector(container, element) {
    const isWall = element.type === 'wall';
    container.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-title">${element.type.toUpperCase()}</div>
        <div class="prop-field"><label>X Position</label><input type="number" id="inp-ent-x" class="prop-input" value="${Math.round(element.x)}"></div>
        <div class="prop-field"><label>Y Position</label><input type="number" id="inp-ent-y" class="prop-input" value="${Math.round(element.y)}"></div>
        <div class="prop-field"><label>Angle (Deg)</label><input type="number" id="inp-ent-ang" class="prop-input" value="${element.angle || 0}"></div>
        ${isWall ? `<div class="prop-field"><label>Width</label><input type="number" id="inp-w-w" class="prop-input" value="${element.width || 30}"></div>
                   <div class="prop-field"><label>Height</label><input type="number" id="inp-w-h" class="prop-input" value="${element.height || 120}"></div>` : ''}
        <button id="btn-del-entity" class="hud-btn btn-danger" style="margin-top: 6px;">Delete Element</button>
      </div>`;

    if (isWall) {
      container.querySelector('#inp-w-w').onchange = (e) => { element.width = parseInt(e.target.value, 10) || 30; };
      container.querySelector('#inp-w-h').onchange = (e) => { element.height = parseInt(e.target.value, 10) || 120; };
    }
    this.bindEntityCommon(container, element);
  },

  bindEntityCommon(container, entity) {
    const inpX = container.querySelector('#inp-ent-x');
    const inpY = container.querySelector('#inp-ent-y');
    const inpAng = container.querySelector('#inp-ent-ang');
    const btnDel = container.querySelector('#btn-del-entity');

    if (inpX) inpX.onchange = (e) => { entity.x = parseInt(e.target.value, 10) || 0; };
    if (inpY) inpY.onchange = (e) => { entity.y = parseInt(e.target.value, 10) || 0; };
    if (inpAng) inpAng.onchange = (e) => { entity.angle = parseInt(e.target.value, 10) || 0; };
    if (btnDel) {
      btnDel.onclick = () => {
        window.Lumina.Editor.deleteEntity(entity);
        this.updateInspector(null);
      };
    }
  }
};

window.Lumina.UI = window.Lumina.EditorUI;