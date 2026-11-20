import { useEffect, useRef, type MutableRefObject } from 'react';
import type { OwlPose } from './HyperOwl';
import type { OwlMood } from './useOwlMood';

type Point = { x: number; y: number; time: number };
type Vector = { x: number; y: number };
type Blink = { start: number; close: number; hold: number; open: number };

type Params = {
  enabled: boolean;
  followCursor: boolean;
  pose: OwlPose;
  reducedMotion: boolean;
  mood: OwlMood;
  happySequence: number;
  rootRef: MutableRefObject<HTMLDivElement | null>;
  eyeRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  irisRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  pupilRefs: MutableRefObject<Array<HTMLSpanElement | null>>;
  highlightRefs: MutableRefObject<Array<Array<HTMLSpanElement | null>>>;
  lidRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  lowerLidRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  tiltRef: MutableRefObject<HTMLDivElement | null>;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const randomBlinkDelay = () => 2500 + Math.random() * 3000;

export function useOwlEyeBehavior({
  enabled,
  followCursor,
  pose,
  reducedMotion,
  mood,
  happySequence,
  rootRef,
  eyeRefs,
  irisRefs,
  pupilRefs,
  highlightRefs,
  lidRefs,
  lowerLidRefs,
  tiltRef,
}: Params): void {
  const settingsRef = useRef({ pose, reducedMotion, mood, happySequence });
  const lastPoseRef = useRef(pose);
  const lastHappySequenceRef = useRef(happySequence);
  settingsRef.current = { pose, reducedMotion, mood, happySequence };

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    let active = false;
    let frame = 0;
    let lastFrame = 0;
    let pointer: Point | null = null;
    let samples: Point[] = [];
    let lastMoveAt = 0;
    let nextIdleLookAt = 0;
    let idleTarget: Vector = { x: 0, y: 0 };
    let nextMicroAt = 0;
    let microTarget: Vector = { x: 0, y: 0 };
    let attentionStartedAt = 0;
    let lookAwayUntil = 0;
    let lookAwayTarget: Vector = { x: 0, y: 0 };
    let nextBlinkAt = performance.now() + (reducedMotion ? 8000 : randomBlinkDelay());
    let doubleBlinkAt = 0;
    let blink: Blink | null = null;
    let happyUntil = 0;
    let previousReducedMotion = reducedMotion;
    let wasCurious = false;
    let touchReturnTimer = 0;
    const position: Vector[] = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
    const velocity: Vector[] = [{ x: 0, y: 0 }, { x: 0, y: 0 }];

    const startBlink = (now: number, slow = false, double = false) => {
      const reduce = settingsRef.current.reducedMotion;
      if (reduce) {
        slow = true;
        double = false;
      }
      const close = slow ? 160 : 80;
      const hold = slow ? 120 : 40;
      blink = { start: now, close, hold, open: 130 };
      doubleBlinkAt = double ? now + close + hold + 310 : 0;
      nextBlinkAt = reduce ? now + 8000 : now + close + hold + 130 + (double ? 220 : randomBlinkDelay());
    };

    const schedule = () => {
      if (active && !frame && !document.hidden) frame = requestAnimationFrame(render);
    };

    const render = (now: number) => {
      frame = 0;
      if (!active || document.hidden) return;
      const settings = settingsRef.current;

      if (settings.reducedMotion !== previousReducedMotion) {
        previousReducedMotion = settings.reducedMotion;
        nextBlinkAt = now + (settings.reducedMotion ? 8000 : randomBlinkDelay());
        doubleBlinkAt = 0;
        blink = null;
      }
      if (!settings.reducedMotion && settings.pose !== lastPoseRef.current) {
        lastPoseRef.current = settings.pose;
        startBlink(now);
      }
      if (!settings.reducedMotion && settings.happySequence !== lastHappySequenceRef.current) {
        lastHappySequenceRef.current = settings.happySequence;
        happyUntil = now + 800;
        startBlink(now, false, true);
      } else if (settings.reducedMotion) {
        lastHappySequenceRef.current = settings.happySequence;
      }
      if (!blink && doubleBlinkAt && now >= doubleBlinkAt) {
        doubleBlinkAt = 0;
        startBlink(now);
      } else if (!blink && now >= nextBlinkAt) {
        startBlink(now, settings.reducedMotion || Math.random() < 1 / 6, !settings.reducedMotion && Math.random() < 1 / 5);
      }

      const rootBounds = root.getBoundingClientRect();
      const attentionDistance = pointer
        ? Math.hypot(pointer.x - (rootBounds.left + rootBounds.width / 2), pointer.y - (rootBounds.top + rootBounds.height / 2))
        : Infinity;
      if (attentionDistance <= 220) {
        if (!attentionStartedAt) attentionStartedAt = now;
        if (now - attentionStartedAt >= 4000 && now >= lookAwayUntil) {
          const direction = Math.random() < 0.5 ? -1 : 1;
          lookAwayTarget = {
            x: direction * randomBetween(0.055, 0.09),
            y: randomBetween(-0.09, -0.035),
          };
          lookAwayUntil = now + randomBetween(600, 900);
          attentionStartedAt = now;
        }
      } else {
        attentionStartedAt = 0;
      }

      if (!settings.reducedMotion && now >= nextMicroAt) {
        microTarget = { x: randomBetween(-0.02, 0.02), y: randomBetween(-0.02, 0.02) };
        nextMicroAt = now + randomBetween(180, 400);
      }
      if (!settings.reducedMotion && now >= nextIdleLookAt && (!pointer || now - lastMoveAt >= 3000)) {
        const angle = Math.random() * Math.PI * 2;
        const magnitude = randomBetween(0.02, 0.12);
        idleTarget = { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude };
        nextIdleLookAt = now + randomBetween(1500, 3500);
      }

      const curious = attentionDistance <= 180;
      if (curious !== wasCurious) {
        root.classList.toggle('is-curious', curious);
        wasCurious = curious;
      }
      const thinking = settings.pose === 'thinking' || settings.mood === 'thinking';
      const happy = now < happyUntil || settings.mood === 'happy';
      const deltaSeconds = lastFrame ? Math.min((now - lastFrame) / 1000, 0.032) : 1 / 60;
      lastFrame = now;
      const dt = Math.max(deltaSeconds, 0.001);

      for (let index = 0; index < 2; index += 1) {
        const eye = eyeRefs.current[index];
        const iris = irisRefs.current[index];
        const pupil = pupilRefs.current[index];
        const lid = lidRefs.current[index];
        const lowerLid = lowerLidRefs.current[index];
        if (!eye || !iris || !pupil || !lid || !lowerLid) continue;

        const eyeBounds = eye.getBoundingClientRect();
        const radius = eyeBounds.width / 2.08;
        let target: Vector = { x: 0, y: 0 };
        if (!settings.reducedMotion && now < lookAwayUntil) {
          target = { x: lookAwayTarget.x * radius, y: lookAwayTarget.y * radius };
        } else if (!settings.reducedMotion && pointer && followCursor) {
          const cursorPoint = index === 1 ? getDelayedPointer(samples, now - 20) ?? pointer : pointer;
          const dx = cursorPoint.x - (eyeBounds.left + eyeBounds.width / 2);
          const dy = cursorPoint.y - (eyeBounds.top + eyeBounds.height / 2);
          const distance = Math.hypot(dx, dy);
          const ratio = Math.min(1, distance / 320);
          const strength = 1 - (1 - ratio) ** 2;
          const travel = Math.min(radius * 0.2, distance * strength * 0.2);
          if (distance) target = { x: dx / distance * travel, y: dy / distance * travel };
        } else if (!settings.reducedMotion && pointer && now - lastMoveAt < 3000) {
          target = { x: 0, y: 0 };
        } else if (!settings.reducedMotion) {
          target = { x: (idleTarget.x + microTarget.x) * radius, y: (idleTarget.y + microTarget.y) * radius };
        }
        if (thinking && !settings.reducedMotion) {
          const ponder = (1 - Math.cos((now % 4000) / 4000 * Math.PI * 2)) / 2;
          target.x -= radius * 0.06 * ponder;
          target.y -= radius * 0.08 * ponder;
        }

        const current = position[index];
        const motion = velocity[index];
        if (settings.reducedMotion) {
          current.x = 0;
          current.y = 0;
          motion.x = 0;
          motion.y = 0;
        }
        motion.x += (140 * (target.x - current.x) - 18 * motion.x) * dt;
        motion.y += (140 * (target.y - current.y) - 18 * motion.y) * dt;
        current.x += motion.x * dt;
        current.y += motion.y * dt;
        const magnitude = Math.hypot(current.x, current.y);
        const maxTravel = radius * 0.2;
        if (magnitude > maxTravel) {
          current.x = current.x / magnitude * maxTravel;
          current.y = current.y / magnitude * maxTravel;
        }
        iris.style.transform = `translate(-50%, -50%) translate(${current.x}px, ${current.y}px)`;
        highlightRefs.current[index].forEach((highlight) => {
          if (highlight) highlight.style.transform = `translate(${-current.x * 0.75}px, ${-current.y * 0.75}px)`;
        });

        const pupilFactor = happy || curious ? 1.15 : thinking ? 0.95 : 1;
        pupil.style.transform = `translate(-50%, -50%) scale(${pupilFactor})`;
        const blinkProgress = blink ? getBlinkProgress(now - (index === 1 ? 10 : 0), blink) : 0;
        const lidBase = thinking ? 0.47 : 0.58;
        const gazeLidOffset = clamp(current.y / radius, -1, 1) * 0.04;
        const happyLidOffset = happy ? 0.08 : 0;
        const rightLidOffset = index === 1 ? 0.01 : 0;
        const lidHeight = eyeBounds.height * 0.34;
        const lidTop = (-lidBase * lidHeight * (1 - blinkProgress))
          + (gazeLidOffset + happyLidOffset + rightLidOffset) * eyeBounds.height;
        lid.style.transform = `translateY(${lidTop}px) scaleY(${1 + blinkProgress * 2.4})`;
        lid.style.opacity = String(0.94 + Math.min(Math.abs(current.y / radius), 1) * 0.06);
        lowerLid.style.transform = `translateY(${eyeBounds.height * (0.06 - (happy ? 0.1 : 0))}px)`;
      }

      const centerX = rootBounds.left + rootBounds.width / 2;
      const centerY = rootBounds.top + rootBounds.height / 2;
      const tiltX = pointer && followCursor && !settings.reducedMotion ? clamp((pointer.x - centerX) / 260, -1, 1) : 0;
      const tiltY = pointer && followCursor && !settings.reducedMotion ? clamp((pointer.y - centerY) / 260, -1, 1) : 0;
      if (tiltRef.current) {
        tiltRef.current.style.transform = `translate(${tiltX * 6}px, ${tiltY * 6}px) rotateY(${tiltX * 8}deg) rotateX(${-tiltY * 5}deg)`;
      }
      schedule();
    };

    const eventPoint = (event: PointerEvent): Point => ({
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
    });
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || settingsRef.current.reducedMotion || !followCursor) return;
      const next = eventPoint(event);
      const previous = samples[samples.length - 1];
      if (previous && next.time - previous.time <= 100 && Math.hypot(next.x - previous.x, next.y - previous.y) > 400) {
        startBlink(next.time);
      }
      pointer = next;
      samples.push(next);
      samples = samples.filter((sample) => next.time - sample.time <= 120);
      lastMoveAt = next.time;
      schedule();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || settingsRef.current.reducedMotion || !followCursor) return;
      window.clearTimeout(touchReturnTimer);
      pointer = eventPoint(event);
      lastMoveAt = pointer.time;
      schedule();
      touchReturnTimer = window.setTimeout(() => {
        pointer = null;
        schedule();
      }, 1500);
    };
    const onPointerLeave = () => {
      pointer = null;
      samples = [];
      attentionStartedAt = 0;
      root.classList.remove('is-curious');
      wasCurious = false;
      schedule();
    };
    const onVisibilityChange = () => {
      if (document.hidden && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) schedule();
      else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { rootMargin: '80px' });
    observer.observe(root);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    if (followCursor) window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      active = false;
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearTimeout(touchReturnTimer);
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove('is-curious');
      if (tiltRef.current) tiltRef.current.style.transform = '';
      lidRefs.current.forEach((lid) => {
        if (lid) {
          lid.style.transform = '';
          lid.style.opacity = '';
        }
      });
      lowerLidRefs.current.forEach((lid) => {
        if (lid) lid.style.transform = '';
      });
    };
  }, [enabled, followCursor, rootRef, eyeRefs, irisRefs, pupilRefs, highlightRefs, lidRefs, lowerLidRefs, tiltRef]);
}

function getDelayedPointer(samples: Point[], targetTime: number): Point | null {
  for (let index = samples.length - 1; index >= 0; index -= 1) {
    if (samples[index].time <= targetTime) return samples[index];
  }
  return samples[0] ?? null;
}

function getBlinkProgress(now: number, blink: Blink): number {
  const elapsed = now - blink.start;
  if (elapsed < blink.close) return elapsed / blink.close;
  if (elapsed < blink.close + blink.hold) return 1;
  return 1 - (elapsed - blink.close - blink.hold) / blink.open;
}
