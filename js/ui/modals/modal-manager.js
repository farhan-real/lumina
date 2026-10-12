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

  open(modalId) {
    const modal = this.ensure(modalId);
    if (!modal) return;
    if (window.Lumina.DialogTemplates.onOpen) {
      window.Lumina.DialogTemplates.onOpen(modalId, modal);
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