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

    const syncName = (src, tgt) => {
      const raw = src.value;
      if (window.Lumina.Editor.currentLevel) {
        window.Lumina.Editor.currentLevel.title = raw.trim() || 'Custom Level';
      }
      if (tgt && tgt.value !== raw) tgt.value = raw;
    };

    const finalizeName = (elA, elB) => {
      const val = elA.value.trim() || 'Custom Level';
      elA.value = val;
      if (elB) elB.value = val;
      if (window.Lumina.Editor.currentLevel) {
        window.Lumina.Editor.currentLevel.title = val;
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

    const currentInv = window.Lumina.Editor.currentLevel.inventory || [];
    container.innerHTML = '';

    const getSizeMeta = (type) => {
      const def = window.Lumina.Elements[type.toUpperCase()] || {};
      if (type.startsWith('lens')) return { key: 'height', def: def.height || 160, label: 'H' };
      if (type.startsWith('mirror') || type === 'portal') {
        const defL = def.length || (type === 'portal' ? 70 : (type === 'mirror' ? 80 : 90));
        return { key: 'length', def: defL, label: 'L' };
      }
      if (type === 'beam_splitter') return { key: 'size', def: def.size || 50, label: 'S' };
      if (type === 'prism') return { key: 'side', def: def.side || 70, label: 'S' };
      return null;
    };

    currentInv.forEach((item, idx) => {
      const meta = getSizeMeta(item.type);
      const row = document.createElement('div');
      row.className = 'inv-config-row';

      const elemDef = window.Lumina.Elements[item.type.toUpperCase()] || {};
      const name = elemDef.name || item.type;
      const dimVal = meta ? (item[meta.key] || meta.def) : '';

      row.innerHTML = `
        <span class="inv-config-label">${name}</span>
        <div class="inv-stepper">
          ${meta ? `<div class="inv-size-box"><span style="font-size:10px; color:var(--color-moon-mist);">${meta.label}:</span>
          <input type="number" class="inv-size-field" value="${dimVal}" min="30" max="400"></div>` : ''}
          <button type="button" class="inv-step-btn" data-act="sub">-</button>
          <input type="number" class="prop-input inv-input" min="1" max="99" value="${item.count}">
          <button type="button" class="inv-step-btn" data-act="add">+</button>
          <button type="button" class="inv-step-btn" style="color:var(--color-red);" data-act="del">✕</button>
        </div>
      `;

      const input = row.querySelector('.inv-input');
      const sizeInput = row.querySelector('.inv-size-field');

      row.querySelector('[data-act="sub"]').onclick = () => {
        if (item.count > 1) { item.count--; input.value = item.count; }
        else { currentInv.splice(idx, 1); }
        window.Lumina.Editor.syncToGame();
        this.renderInventoryConfig();
      };

      row.querySelector('[data-act="add"]').onclick = () => {
        item.count++; input.value = item.count;
        window.Lumina.Editor.syncToGame();
      };

      input.onchange = (e) => {
        item.count = Math.max(1, parseInt(e.target.value, 10) || 1);
        window.Lumina.Editor.syncToGame();
      };

      if (sizeInput && meta) {
        sizeInput.onchange = (e) => {
          item[meta.key] = Math.max(30, parseInt(e.target.value, 10) || meta.def);
          window.Lumina.Editor.syncToGame();
        };
      }

      row.querySelector('[data-act="del"]').onclick = () => {
        currentInv.splice(idx, 1);
        window.Lumina.Editor.syncToGame();
        this.renderInventoryConfig();
      };

      container.appendChild(row);
    });

    const addBar = document.createElement('div');
    addBar.className = 'inv-add-bar';
    addBar.innerHTML = `
      <select id="inv-new-type" class="inv-add-select">
        <option value="mirror">Flat Mirror (80px)</option>
        <option value="mirror_concave">Concave Mirror (90px)</option>
        <option value="mirror_convex">Convex Mirror (90px)</option>
        <option value="lens_convex">Convex Lens (160px)</option>
        <option value="lens_concave">Concave Lens (160px)</option>
        <option value="prism">Dispersion Prism (70px)</option>
        <option value="beam_splitter">Beam Splitter (50px)</option>
        <option value="portal">Portal (70px)</option>
        <option value="wall">Wall</option>
      </select>
      <button type="button" id="btn-inv-add-item" class="hud-btn btn-inv-add">+ Add</button>
    `;

    addBar.querySelector('#btn-inv-add-item').onclick = () => {
      const type = addBar.querySelector('#inv-new-type').value;
      const meta = getSizeMeta(type);
      const newItem = { type, count: 1 };
      if (meta) newItem[meta.key] = meta.def;
      currentInv.push(newItem);
      window.Lumina.Editor.syncToGame();
      this.renderInventoryConfig();
    };

    container.appendChild(addBar);
  },

  syncValues(entity) {
    if (!entity || entity !== this.activeEntity) return;
    const inpX = document.getElementById('inp-ent-x');
    const inpY = document.getElementById('inp-ent-y');
    const inpAng = document.getElementById('inp-ent-ang');
    const inpW = document.getElementById('inp-w-w');
    const inpH = document.getElementById('inp-w-h') || document.getElementById('inp-el-h');
    const inpLen = document.getElementById('inp-el-len');
    const inpR = document.getElementById('inp-sens-r') || document.getElementById('inp-el-r');

    if (inpX && document.activeElement !== inpX) inpX.value = Math.round(entity.x);
    if (inpY && document.activeElement !== inpY) inpY.value = Math.round(entity.y);
    if (inpAng && document.activeElement !== inpAng) inpAng.value = entity.angle || 0;
    if (inpW && document.activeElement !== inpW && entity.width) inpW.value = entity.width;
    if (inpH && document.activeElement !== inpH && entity.height) inpH.value = entity.height;
    if (inpLen && document.activeElement !== inpLen && entity.length) inpLen.value = entity.length;
    if (inpR && document.activeElement !== inpR && entity.radius) inpR.value = entity.radius;
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
        <div class="inspector-title">SENSOR RECEPTOR</div>
        <div class="prop-field"><label>X Position</label><input type="number" id="inp-ent-x" class="prop-input" value="${Math.round(sensor.x)}"></div>
        <div class="prop-field"><label>Y Position</label><input type="number" id="inp-ent-y" class="prop-input" value="${Math.round(sensor.y)}"></div>
        <div class="prop-field"><label>Radius (Px)</label><input type="number" id="inp-sens-r" class="prop-input" value="${Math.round(sensor.radius || 24)}" min="14" max="80"></div>
        <div style="font-size: 11px; font-weight: 700; color: var(--color-moon-mist); margin-top: 4px;">REQUIRED COMBINATIONS</div>
        <div id="sensor-reqs-list" class="sensor-reqs-list"></div>
        <button id="btn-add-req-row" class="hud-btn" style="min-height: 28px; font-size: 11px; margin-top: 4px;">+ Add Light Requirement</button>
        <button id="btn-del-entity" class="hud-btn btn-danger" style="margin-top: 8px;">Delete Sensor</button>
      </div>`;

    const inpR = container.querySelector('#inp-sens-r');
    if (inpR) inpR.onchange = (e) => { sensor.radius = Math.max(14, Math.min(80, parseInt(e.target.value, 10) || 24)); };

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
      row.querySelector('.req-color-select').onchange = (e) => { req.color = e.target.value; };
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
    const isLens = element.type === 'lens_convex' || element.type === 'lens_concave';
    const isMirror = element.type === 'mirror' || element.type === 'mirror_concave' || element.type === 'mirror_convex' || element.type === 'portal';
    const isBlackHole = element.type === 'black_hole';

    container.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-title">${element.type.toUpperCase()}</div>
        <div class="prop-field"><label>X Position</label><input type="number" id="inp-ent-x" class="prop-input" value="${Math.round(element.x)}"></div>
        <div class="prop-field"><label>Y Position</label><input type="number" id="inp-ent-y" class="prop-input" value="${Math.round(element.y)}"></div>
        <div class="prop-field"><label>Angle (Deg)</label><input type="number" id="inp-ent-ang" class="prop-input" value="${element.angle || 0}"></div>
        ${isWall ? `<div class="prop-field"><label>Width</label><input type="number" id="inp-w-w" class="prop-input" value="${element.width || 30}" min="12" max="500"></div>
                   <div class="prop-field"><label>Height</label><input type="number" id="inp-w-h" class="prop-input" value="${element.height || 120}" min="16" max="800"></div>` : ''}
        ${isMirror ? `<div class="prop-field"><label>Length (Px)</label><input type="number" id="inp-el-len" class="prop-input" value="${element.length || 80}" min="30" max="400"></div>` : ''}
        ${isLens ? `<div class="prop-field"><label>Height (Aperture)</label><input type="number" id="inp-el-h" class="prop-input" value="${element.height || 160}" min="30" max="500"></div>` : ''}
        ${isBlackHole ? `<div class="prop-field"><label>Radius (Px)</label><input type="number" id="inp-el-r" class="prop-input" value="${element.radius || 24}" min="12" max="100"></div>` : ''}
        <button id="btn-del-entity" class="hud-btn btn-danger" style="margin-top: 6px;">Delete Element</button>
      </div>`;

    if (isWall) {
      container.querySelector('#inp-w-w').onchange = (e) => { element.width = parseInt(e.target.value, 10) || 30; };
      container.querySelector('#inp-w-h').onchange = (e) => { element.height = parseInt(e.target.value, 10) || 120; };
    }
    if (isMirror) {
      container.querySelector('#inp-el-len').onchange = (e) => { element.length = Math.max(30, parseInt(e.target.value, 10) || 80); };
    }
    if (isLens) {
      container.querySelector('#inp-el-h').onchange = (e) => { element.height = Math.max(30, parseInt(e.target.value, 10) || 160); };
    }
    if (isBlackHole) {
      container.querySelector('#inp-el-r').onchange = (e) => { element.radius = Math.max(12, parseInt(e.target.value, 10) || 24); };
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