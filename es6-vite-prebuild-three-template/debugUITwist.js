// Debug UI for Twist (p5) + TwistManager
// Loads as a plain script and attaches a global DebugUITwist

(function initDebugUITwist() {
  class DebugUITwist {
    constructor(twistManager) {
      this.manager = twistManager || (window && window.twistManager);
      this.isVisible = true;
      this._elements = {};
      this.createUI();
      // Periodic updates
      this._interval = setInterval(() => this.updateUI(), 250);
    }

    createUI() {
      const existing = document.getElementById('debug-ui-twist');
      if (existing) existing.remove();

      const container = document.createElement('div');
      container.id = 'debug-ui-twist';
      container.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 16px;
        border-radius: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                     Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        font-size: 12px;
        z-index: 1001;
        max-width: 320px;
        max-height: 80vh;
        overflow-y: auto;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.12);
      `;

      // Header
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 12px; padding-bottom: 8px;
        border-bottom: 1px solid rgba(255,255,255,0.18);
      `;
      const title = document.createElement('h3');
      title.textContent = 'Twist Debug';
      title.style.cssText = 'margin:0;font-size:14px;';
      const toggleBtn = document.createElement('button');
      toggleBtn.textContent = '−';
      toggleBtn.style.cssText = `
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;
      `;
      toggleBtn.onclick = () => this.toggleVisibility();
      header.appendChild(title);
      header.appendChild(toggleBtn);
      container.appendChild(header);

      // Sections
      this._sections = {};
      this._sections.connection = this._createSection('Connection', container);
      this._buildConnectionSection(this._sections.connection);

      this._sections.twist = this._createSection('Twist Controls', container);
      this._buildTwistSection(this._sections.twist);

      this._sections.mouse = this._createSection('Mouse / Drag', container);
      this._buildMouseSection(this._sections.mouse);

      this._sections.sensors = this._createSection('Sensor Controls', container);
      this._buildSensorsSection(this._sections.sensors);

      document.body.appendChild(container);
    }

    _createSection(titleText, parent) {
      const section = document.createElement('div');
      section.style.cssText = 'margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1)';
      const title = document.createElement('h4');
      title.textContent = titleText;
      title.style.cssText = 'margin:0 0 8px 0; font-size: 13px; color:#4CAF50;';
      section.appendChild(title);
      parent.appendChild(section);
      return section;
    }

    _buildConnectionSection(section) {
      // Status
      const status = document.createElement('div');
      status.style.marginBottom = '8px';
      const label = document.createElement('span');
      label.textContent = 'Magic Status: ';
      label.style.fontWeight = 'bold';
      const value = document.createElement('span');
      value.id = 'twist-magic-status';
      value.textContent = (this.manager && this.manager.isMagic) ? 'Connected' : 'Disconnected';
      value.style.color = (this.manager && this.manager.isMagic) ? '#4CAF50' : '#f44336';
      status.appendChild(label);
      status.appendChild(value);
      section.appendChild(status);

      // Connect/Disconnect
      const btn = document.createElement('button');
      btn.textContent = (this.manager && this.manager.isMagic) ? 'Disconnect Magic' : 'Connect Magic';
      btn.style.cssText = `
        background: ${(this.manager && this.manager.isMagic) ? '#f44336' : '#4CAF50'};
        border: none; color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer; width: 100%;
      `;
      btn.onclick = async () => {
        if (this.manager && this.manager.toggleMagicConnection) {
          await this.manager.toggleMagicConnection();
          this.updateUI();
        } else if (this.manager && this.manager.connectMagic) {
          await this.manager.connectMagic();
          this.updateUI();
        }
      };
      section.appendChild(btn);
      this._elements.statusValue = value;
      this._elements.connectBtn = btn;
    }

    _buildTwistSection(section) {
      // Override toggle
      const overrideRow = document.createElement('div');
      overrideRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
      const overrideLabel = document.createElement('label');
      overrideLabel.textContent = 'Override Interaction';
      const overrideInput = document.createElement('input');
      overrideInput.type = 'checkbox';
      overrideInput.onchange = (e) => {
        if (window.twistSketch && window.twistSketch.overrideInteraction) {
          window.twistSketch.overrideInteraction(e.target.checked);
        }
      };
      overrideRow.appendChild(overrideInput);
      overrideRow.appendChild(overrideLabel);
      section.appendChild(overrideRow);
      this._elements.overrideInput = overrideInput;

      // Twist Amount slider
      this._elements.twist = this._createSlider(section, 'Twist Amount', -6.283, 6.283, 0.001, 0.0, (v) => {
        if (window.twistSketch && window.twistSketch.setTwist) window.twistSketch.setTwist({ twistAmount: v });
      });
      // Pinch Amount slider
      this._elements.pinch = this._createSlider(section, 'Pinch Amount', -1.0, 1.0, 0.001, 0.0, (v) => {
        if (window.twistSketch && window.twistSketch.setTwist) window.twistSketch.setTwist({ pinchAmount: v });
      });

      // Buttons
      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex; gap:8px; margin-top:6px;';
      const resetBtn = document.createElement('button');
      resetBtn.textContent = 'Reset Twist/Pinch';
      resetBtn.style.cssText = this._btnStyle();
      resetBtn.onclick = () => {
        if (window.twistSketch && window.twistSketch.setTwist) window.twistSketch.setTwist({ twistAmount: 0, pinchAmount: 0 });
        this._elements.twist.update(0);
        this._elements.pinch.update(0);
      };
      const centerBtn = document.createElement('button');
      centerBtn.textContent = 'Center Drag';
      centerBtn.style.cssText = this._btnStyle();
      centerBtn.onclick = () => {
        if (window.twistSketch && window.twistSketch.setDrag) {
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          window.twistSketch.setDrag({ start: { x: cx, y: cy }, current: { x: cx, y: cy } });
        }
      };
      btnRow.appendChild(resetBtn);
      btnRow.appendChild(centerBtn);
      section.appendChild(btnRow);
    }

    _buildMouseSection(section) {
      const info = document.createElement('div');
      info.id = 'twist-mouse-info';
      info.style.cssText = 'font-family: monospace; font-size: 11px; line-height: 1.4;';
      section.appendChild(info);
      this._elements.mouseInfo = info;
    }

    _buildSensorsSection(section) {
      if (!this.manager) return;
      const keys = Object.keys(this.manager.manualControls || {});
      keys.forEach((key) => {
        const initial = this.manager.manualControls[key];
        const slider = this._createSlider(section, key, 0, 1, 0.001, initial, (v) => {
          if (this.manager && this.manager.updateManualControl) {
            this.manager.updateManualControl(key, v);
          }
        });
        this._elements[`sensor_${key}`] = slider;
      });
    }

    _createSlider(section, labelText, min, max, step, initial, onChange) {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'margin-bottom: 8px;';
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;';
      const label = document.createElement('span');
      label.textContent = labelText;
      label.style.fontSize = '11px';
      const valueSpan = document.createElement('span');
      valueSpan.textContent = (typeof initial === 'number') ? initial.toFixed(3) : initial;
      valueSpan.style.cssText = 'font-family: monospace; font-size: 10px; color: #4CAF50;';
      row.appendChild(label);
      row.appendChild(valueSpan);
      const input = document.createElement('input');
      input.type = 'range';
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = initial;
      input.style.cssText = 'width: 100%; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.12);';
      input.oninput = (e) => {
        const v = parseFloat(e.target.value);
        valueSpan.textContent = v.toFixed(3);
        onChange(v);
      };
      wrap.appendChild(row);
      wrap.appendChild(input);
      section.appendChild(wrap);
      return {
        set value(v) { input.value = v; valueSpan.textContent = v.toFixed(3); },
        update: (v) => { input.value = v; valueSpan.textContent = v.toFixed(3); onChange(v); }
      };
    }

    _btnStyle() {
      return 'background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;';
    }

    updateUI() {
      const isMagic = !!(this.manager && this.manager.isMagic);
      if (this._elements.statusValue) {
        this._elements.statusValue.textContent = isMagic ? 'Connected' : 'Disconnected';
        this._elements.statusValue.style.color = isMagic ? '#4CAF50' : '#f44336';
      }
      if (this._elements.connectBtn) {
        this._elements.connectBtn.textContent = isMagic ? 'Disconnect Magic' : 'Connect Magic';
        this._elements.connectBtn.style.background = isMagic ? '#f44336' : '#4CAF50';
      }

      // Mouse / drag info from sketch
      if (this._elements.mouseInfo && window.twistSketch && window.twistSketch.getState) {
        const state = window.twistSketch.getState();
        this._elements.mouseInfo.innerHTML = `
          twistAmount: ${Number(state.twistAmount).toFixed(3)}<br/>
          pinchAmount: ${Number(state.pinchAmount).toFixed(3)}<br/>
          dragStart: (${Number(state.dragStart.x).toFixed(1)}, ${Number(state.dragStart.y).toFixed(1)})<br/>
          dragCurrent: (${Number(state.dragCurrent.x).toFixed(1)}, ${Number(state.dragCurrent.y).toFixed(1)})
        `;
      }
    }

    toggleVisibility() {
      const container = document.getElementById('debug-ui-twist');
      if (!container) return;
      this.isVisible = !this.isVisible;
      container.style.display = this.isVisible ? 'block' : 'none';
    }
  }

  // Expose global and auto-init if manager present
  if (typeof window !== 'undefined') {
    window.DebugUITwist = DebugUITwist;
    // Auto instantiate when DOM is ready
    const tryInit = () => {
      if (!document.body) { requestAnimationFrame(tryInit); return; }
      const mgr = window.twistManager || null;
      window.debugUITwist = new DebugUITwist(mgr);
    };
    tryInit();
  }
})();

