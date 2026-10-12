window.Lumina = window.Lumina || {};

window.Lumina.Elements = {
  MIRROR: {
    type: 'mirror',
    name: 'Mirror',
    length: 80,
    movable: true,
    rotatable: true,
    icon: '<svg width="24" height="24" viewBox="0 0 24 24"><line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" stroke-width="2.5"/></svg>'
  },
  MIRROR_CONCAVE: {
    type: 'mirror_concave',
    name: 'Concave Mirror',
    length: 90,
    curvature: 260,
    movable: true,
    rotatable: true,
    icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M6 3 Q16 12 6 21" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>'
  },
  MIRROR_CONVEX: {
    type: 'mirror_convex',
    name: 'Convex Mirror',
    length: 90,
    curvature: 260,
    movable: true,
    rotatable: true,
    icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M18 3 Q8 12 18 21" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>'
  },
  PRISM: {
    type: 'prism',
    name: 'Prism',
    side: 70,
    movable: true,
    rotatable: true,
    icon: '<svg width="24" height="24" viewBox="0 0 24 24"><polygon points="12,4 21,20 3,20" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  },
  LENS_CONVEX: {
    type: 'lens_convex',
    name: 'Convex Lens',
    height: 160,
    focalLength: 250,
    movable: true,
    rotatable: true,
    icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 3 C17 8 17 16 12 21 C7 16 7 8 12 3 Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  },
  LENS_CONCAVE: {
    type: 'lens_concave',
    name: 'Concave Lens',
    height: 160,
    focalLength: -180,
    movable: true,
    rotatable: true,
    icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 3 C12 8 12 16 8 21 L16 21 C12 16 12 8 16 3 Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  },
  BEAM_SPLITTER: {
    type: 'beam_splitter',
    name: 'Splitter',
    size: 50,
    movable: true,
    rotatable: true,
    icon: '<svg width="24" height="24" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" stroke-width="2"/></svg>'
  },
  PORTAL: {
    type: 'portal',
    name: 'Portal',
    length: 70,
    movable: true,
    rotatable: true,
    icon: '<svg width="24" height="24" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="6" ry="9" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  },
  BLACK_HOLE: {
    type: 'black_hole',
    name: 'Black Hole',
    radius: 22,
    movable: false,
    rotatable: false,
    icon: '<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  },
  WALL: {
    type: 'wall',
    name: 'Wall',
    width: 30,
    height: 120,
    movable: true,
    rotatable: true,
    icon: '<svg width="24" height="24" viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="20" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  }
};