window.Lumina = window.Lumina || {};

window.Lumina.Raycaster = {
  rayPool: [],
  activeRays: 0,

  init() {
    this.rayPool = [];
    for (let i = 0; i < 256; i++) {
      this.rayPool.push({
        x1: 0, y1: 0, x2: 0, y2: 0,
        r: 1, g: 1, b: 1, intensity: 1.0
      });
    }
  },

  reset() {
    this.activeRays = 0;
  },

  traceScene(emitters, elements, sensors) {
    this.reset();
    for (let s = 0; s < sensors.length; s++) {
      sensors[s].active = false;
      sensors[s].currentHits = 0;
      sensors[s].hitSources = [];
      sensors[s].receivedColors = [];
    }

    const hit = { t: 0, x: 0, y: 0, nx: 0, ny: 0 };
    const ref = { dx: 0, dy: 0 };
    const lenOut = { dx: 0, dy: 0, x: 0, y: 0 };

    for (let e = 0; e < emitters.length; e++) {
      const em = emitters[e];
      const rad = (em.angle || 0) * (Math.PI / 180);
      const edx = Math.cos(rad);
      const edy = Math.sin(rad);

      if (em.color === 'white') {
        this.cast(em.x, em.y, edx, edy, 1.0, 0.2, 0.25, 1.0, 0, e, elements, sensors, hit, ref, lenOut);
        this.cast(em.x, em.y, edx, edy, 0.1, 1.0, 0.35, 1.0, 0, e, elements, sensors, hit, ref, lenOut);
        this.cast(em.x, em.y, edx, edy, 0.1, 0.3, 1.0, 1.0, 0, e, elements, sensors, hit, ref, lenOut);
      } else {
        const rgb = window.Lumina.Constants.COLOR_MAP[em.color] || [1, 1, 1];
        this.cast(em.x, em.y, edx, edy, rgb[0], rgb[1], rgb[2], 1.0, 0, e, elements, sensors, hit, ref, lenOut);
      }
    }

    for (let s = 0; s < sensors.length; s++) {
      const sens = sensors[s];
      let satisfied = true;

      if (sens.requirements && sens.requirements.length > 0) {
        const rec = [...sens.receivedColors];
        for (let r = 0; r < sens.requirements.length; r++) {
          const req = sens.requirements[r];
          const neededCount = req.count || 1;
          let matchedCount = 0;

          if (req.color === 'any') {
            matchedCount = rec.length;
            rec.length = Math.max(0, rec.length - neededCount);
          } else {
            for (let c = rec.length - 1; c >= 0; c--) {
              if (rec[c] === req.color) {
                rec.splice(c, 1);
                matchedCount++;
                if (matchedCount >= neededCount) break;
              }
            }
          }

          if (matchedCount < neededCount) {
            satisfied = false;
            break;
          }
        }
      } else {
        const req = sens.requiredColor || 'any';
        if (req !== 'any' && !sens.receivedColors.includes(req)) satisfied = false;
        const reqBeams = sens.requiredBeams || 1;
        if (sens.currentHits < reqBeams) satisfied = false;
      }

      sens.active = satisfied;
    }
  },

  cast(ox, oy, dx, dy, r, g, b, inten, depth, sourceId, elements, sensors, hitH, refH, lenOut) {
    if (depth > 20 || inten < 0.1) return;

    let nearestT = 3200;
    let hitX = ox + dx * nearestT;
    let hitY = oy + dy * nearestT;
    let hitElem = null;
    let hitNx = 0, hitNy = 0;

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (this.intersect(ox, oy, dx, dy, el, hitH)) {
        if (hitH.t < nearestT) {
          nearestT = hitH.t;
          hitX = hitH.x; hitY = hitH.y;
          hitNx = hitH.nx; hitNy = hitH.ny;
          hitElem = el;
        }
      }
    }

    if (this.activeRays < this.rayPool.length) {
      const seg = this.rayPool[this.activeRays++];
      seg.x1 = ox; seg.y1 = oy;
      seg.x2 = hitX; seg.y2 = hitY;
      seg.r = r; seg.g = g; seg.b = b;
      seg.intensity = inten;
    }

    this.checkSensors(ox, oy, hitX, hitY, r, g, b, sourceId, sensors);

    if (hitElem) {
      this.handleHit(hitElem, hitX, hitY, dx, dy, hitNx, hitNy, r, g, b, inten, depth, sourceId, elements, sensors, hitH, refH, lenOut);
    }
  },

  intersect(ox, oy, dx, dy, el, out) {
    const math = window.Lumina.OpticsMath;
    if (el.type === 'wall') {
      return math.intersectRayBox(ox, oy, dx, dy, el.x, el.y, el.width || 30, el.height || 120, el.angle || 0, out);
    }
    if (el.type === 'mirror' || el.type === 'mirror_concave' || el.type === 'mirror_convex' || el.type === 'beam_splitter' || el.type === 'portal') {
      const rad = ((el.angle || 0) * Math.PI) / 180;
      const halfL = (el.length || el.size || 80) / 2;
      const x1 = el.x - Math.cos(rad) * halfL;
      const y1 = el.y - Math.sin(rad) * halfL;
      const x2 = el.x + Math.cos(rad) * halfL;
      const y2 = el.y + Math.sin(rad) * halfL;
      return math.intersectRaySegment(ox, oy, dx, dy, x1, y1, x2, y2, out);
    }
    if (el.type === 'lens_convex' || el.type === 'lens_concave') {
      const ap = window.Lumina.Lenses.getApertureSegment(el);
      return math.intersectRaySegment(ox, oy, dx, dy, ap.x1, ap.y1, ap.x2, ap.y2, out);
    }
    if (el.type === 'prism') {
      const edges = math.getPrismEdges(el.x, el.y, el.angle || 0, el.side || 70);
      let hitAny = false;
      let minT = 9999;
      const temp = { t: 0, x: 0, y: 0, nx: 0, ny: 0 };
      for (let e = 0; e < edges.length; e++) {
        if (math.intersectRaySegment(ox, oy, dx, dy, edges[e].x1, edges[e].y1, edges[e].x2, edges[e].y2, temp)) {
          if (temp.t < minT) {
            minT = temp.t;
            out.t = temp.t; out.x = temp.x; out.y = temp.y;
            out.nx = temp.nx; out.ny = temp.ny;
            hitAny = true;
          }
        }
      }
      return hitAny;
    }
    return false;
  },

  handleHit(el, hx, hy, dx, dy, nx, ny, r, g, b, inten, depth, sourceId, elements, sensors, hitH, refH, lenOut) {
    if (el.type === 'wall') return;
    if (el.type === 'mirror') {
      window.Lumina.OpticsMath.reflect(dx, dy, nx, ny, refH);
      this.cast(hx, hy, refH.dx, refH.dy, r, g, b, inten * 0.95, depth + 1, sourceId, elements, sensors, hitH, refH, lenOut);
    } else if (el.type === 'mirror_concave' || el.type === 'mirror_convex') {
      window.Lumina.OpticsMath.reflectCurved(el, hx, hy, dx, dy, nx, ny, refH);
      this.cast(hx, hy, refH.dx, refH.dy, r, g, b, inten * 0.95, depth + 1, sourceId, elements, sensors, hitH, refH, lenOut);
    } else if (el.type === 'beam_splitter') {
      window.Lumina.OpticsMath.reflect(dx, dy, nx, ny, refH);
      this.cast(hx, hy, refH.dx, refH.dy, r, g, b, inten * 0.5, depth + 1, sourceId, elements, sensors, hitH, refH, lenOut);
      this.cast(hx + dx * 2, hy + dy * 2, dx, dy, r, g, b, inten * 0.5, depth + 1, sourceId + 50, elements, sensors, hitH, refH, lenOut);
    } else if (el.type === 'lens_convex' || el.type === 'lens_concave') {
      window.Lumina.Lenses.calculateDeflection(el, hx, hy, dx, dy, lenOut);
      this.cast(hx + lenOut.dx * 2, hy + lenOut.dy * 2, lenOut.dx, lenOut.dy, r, g, b, inten * 0.95, depth + 1, sourceId, elements, sensors, hitH, refH, lenOut);
    } else if (el.type === 'prism') {
      const prismRad = ((el.angle || 0) * Math.PI) / 180;
      const incAngle = Math.atan2(dy, dx);
      const relIncidence = Math.sin(incAngle - prismRad);
      const angleBias = relIncidence * 0.30;

      let chromaticSpread = 0;
      if (r > 0.6 && b < 0.5) chromaticSpread = -0.26;
      else if (b > 0.6 && r < 0.5) chromaticSpread = 0.26;

      const outAngle = incAngle + angleBias + chromaticSpread;
      const outDx = Math.cos(outAngle);
      const outDy = Math.sin(outAngle);
      this.cast(hx + outDx * 3, hy + outDy * 3, outDx, outDy, r, g, b, inten, depth + 1, sourceId, elements, sensors, hitH, refH, lenOut);
    } else if (el.type === 'portal') {
      const allPortals = elements.filter((item) => item.type === 'portal');
      const partner = allPortals.find((item) => (item.linkId && item.linkId === el.id) || (el.linkId && item.id === el.linkId) || (item !== el));
      if (partner) {
        window.Lumina.Geodesic.mapPortal(hx, hy, dx, dy, el, partner, lenOut);
        this.cast(lenOut.x, lenOut.y, lenOut.dx, lenOut.dy, r, g, b, inten * 0.95, depth + 1, sourceId, elements, sensors, hitH, refH, lenOut);
      }
    }
  },

  checkSensors(x1, y1, x2, y2, r, g, b, sourceId, sensors) {
    for (let s = 0; s < sensors.length; s++) {
      const sens = sensors[s];
      const dist = this.distToSegment(sens.x, sens.y, x1, y1, x2, y2);
      if (dist <= window.Lumina.Constants.SENSOR_RADIUS) {
        let beamColor = 'any';
        if (r > 0.6 && b < 0.45 && g < 0.45) beamColor = 'red';
        else if (g > 0.6 && r < 0.45 && b < 0.45) beamColor = 'green';
        else if (b > 0.6 && r < 0.4 && g < 0.55) beamColor = 'blue';
        else if (g > 0.6 && b > 0.6 && r < 0.4) beamColor = 'cyan';
        else if (r > 0.7 && g > 0.4 && b < 0.4) beamColor = 'amber';
        else if (r > 0.5 && b > 0.6 && g < 0.4) beamColor = 'violet';

        const angleStep = Math.round(Math.atan2(y2 - y1, x2 - x1) * 10);
        const hitKey = sourceId * 1000 + angleStep;
        if (!sens.hitSources.includes(hitKey)) {
          sens.hitSources.push(hitKey);
          sens.currentHits++;
          sens.receivedColors.push(beamColor);
        }
      }
    }
  },

  distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }
};