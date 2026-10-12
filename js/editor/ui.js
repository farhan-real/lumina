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

    if (mapW) {
      mapW.addEventListener('change', () => {
        window.Lumina.Editor.currentLevel.width = parseInt(mapW.value, 10) || 1000;
        window.Lumina.Renderer.resize();
      });
    }
    if (mapH) {
      mapH.addEventListener('change', () => {
        window.Lumina.Editor.currentLevel.height = parseInt(mapH.value, 10) || 700;
        window.Lumina.Renderer.resize();
      });
    }
    if (lvlTitle) {
      lvlTitle.addEventListener('change', () => {
        window.Lumina.Editor.currentLevel.title = lvlTitle.value || 'Custom Level';
      });
    }
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
    const colors = ['any', 'red', 'green', 'blue', 'cyan', 'amber', 'violet'];
    sensor.requiredMix = sensor.requiredMix || [];

    container.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-title">SENSOR RECEPTOR</div>
        <div class="prop-field"><label>X Position</label><input type="number" id="inp-ent-x" class="prop-input" value="${Math.round(sensor.x)}"></div>
        <div class="prop-field"><label>Y Position</label><input type="number" id="inp-ent-y" class="prop-input" value="${Math.round(sensor.y)}"></div>
        <div class="prop-field"><label>Beams Required</label><input type="number" id="inp-req-beams" class="prop-input" min="1" max="6" value="${sensor.requiredBeams || 1}"></div>
        <div class="prop-field" style="flex-direction: column; align-items: flex-start; gap: 4px;">
          <label>Spectral Color Mix</label>
          <div class="color-mix-picker" id="mix-color-buttons"></div>
        </div>
        <button id="btn-del-entity" class="hud-btn btn-danger" style="margin-top: 6px;">Delete Sensor</button>
      </div>`;

    const mixContainer = container.querySelector('#mix-color-buttons');
    colors.forEach(col => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = sensor.requiredMix.includes(col);
      btn.className = `mix-tag-btn ${isSelected ? 'selected' : ''}`;
      btn.textContent = col.toUpperCase();
      btn.onclick = () => {
        if (col === 'any') {
          sensor.requiredMix = ['any'];
        } else {
          sensor.requiredMix = sensor.requiredMix.filter(c => c !== 'any');
          const idx = sensor.requiredMix.indexOf(col);
          if (idx !== -1) sensor.requiredMix.splice(idx, 1);
          else sensor.requiredMix.push(col);
        }
        sensor.requiredColor = sensor.requiredMix[0] || 'any';
        this.renderSensorInspector(container, sensor);
      };
      mixContainer.appendChild(btn);
    });

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
            ${['white', 'red', 'green', 'blue', 'cyan', 'amber', 'violet'].map(c => `<option value="${c}" ${emitter.color === c ? 'selected' : ''}>${c.toUpperCase()}</option>`).join('')}
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