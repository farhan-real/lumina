window.Lumina = window.Lumina || {};

window.Lumina.ModalManager = {
  rootEl: null,
  activeModal: null,

  init() {
    this.rootEl = document.getElementById('modal-root');
  },

  ensure(modalId) {
    let modal = document.getElementById('modal-' + modalId);
    if (!modal) {
      modal = window.Lumina.DialogTemplates.create(modalId);
      if (modal) this.rootEl.appendChild(modal);
    }
    return modal;
  },

  open(modalId, contextData) {
    const modal = this.ensure(modalId);
    if (!modal) return;
    if (window.Lumina.DialogTemplates.onOpen) {
      // Forward contextData so modal templates receive their parameters
      window.Lumina.DialogTemplates.onOpen(modalId, modal, contextData);
    }
    modal.classList.remove('hidden');
    this.activeModal = modal;
    window.Lumina.SFX.playClick();
  },

  close() {
    if (this.activeModal) {
      this.activeModal.classList.add('hidden');
      this.activeModal = null;
    }
  }
};