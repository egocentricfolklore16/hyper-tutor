import { useEffect, useState, type CSSProperties, type Dispatch, type PointerEvent as ReactPointerEvent, type RefObject, type SetStateAction } from 'react';
import type { OwlMood } from './useOwlMood';
import type { EyeConfig, OwlPose, PoseConfig } from './HyperOwl';

type Props = {
  enabled: boolean;
  eyeLookEnabled: boolean;
  onCompareChange: (compare: boolean) => void;
  pose: OwlPose;
  onPoseChange: (pose: OwlPose) => void;
  config: Record<OwlPose, PoseConfig>;
  onConfigChange: Dispatch<SetStateAction<Record<OwlPose, PoseConfig>>>;
  stageRef: RefObject<HTMLDivElement | null>;
  mood: OwlMood;
  aspectWarning: boolean;
  onEyeRef: (index: number, element: HTMLDivElement | null) => void;
  onIrisRef: (index: number, element: HTMLDivElement | null) => void;
  onPupilRef: (index: number, element: HTMLSpanElement | null) => void;
  onHighlightRef: (eyeIndex: number, highlightIndex: number, element: HTMLSpanElement | null) => void;
  onLidRef: (index: number, element: HTMLDivElement | null) => void;
  onLowerLidRef: (index: number, element: HTMLDivElement | null) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function OwlEyeCalibrator({
  enabled,
  eyeLookEnabled,
  onCompareChange,
  pose,
  onPoseChange,
  config,
  onConfigChange,
  stageRef,
  mood,
  aspectWarning,
  onEyeRef,
  onIrisRef,
  onPupilRef,
  onHighlightRef,
  onLidRef,
  onLowerLidRef,
}: Props) {
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [compareHeld, setCompareHeld] = useState(false);
  const [selectedEye, setSelectedEye] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');
  const eyes = [config[pose].leftEye, config[pose].rightEye];

  useEffect(() => {
    if (!enabled) {
      setCompareHeld(false);
      onCompareChange(false);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.matches('input,textarea,select'))) return;
      if (event.key.toLowerCase() === 'c') {
        setCompareHeld(true);
        onCompareChange(true);
        return;
      }

      const eye = eyes[selectedEye];
      const step = event.altKey ? 2 : event.shiftKey ? 0.25 : 0.5;
      let changes: Partial<EyeConfig> | undefined;
      if (event.key === 'ArrowLeft') changes = { x: clamp(eye.x - step, 0, config[pose].naturalWidth) };
      if (event.key === 'ArrowRight') changes = { x: clamp(eye.x + step, 0, config[pose].naturalWidth) };
      if (event.key === 'ArrowUp') changes = { y: clamp(eye.y - step, 0, config[pose].naturalHeight) };
      if (event.key === 'ArrowDown') changes = { y: clamp(eye.y + step, 0, config[pose].naturalHeight) };
      if (event.key === '+' || event.key === '=' || event.key === 'Add') {
        changes = { r: eye.r + (event.altKey ? 2 : event.shiftKey ? 0.25 : 1) };
      }
      if (event.key === '-' || event.key === '_' || event.key === 'Subtract') {
        changes = { r: eye.r - (event.altKey ? 2 : event.shiftKey ? 0.25 : 1) };
      }
      if (changes) {
        event.preventDefault();
        updateEye(selectedEye, changes);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'c') {
        setCompareHeld(false);
        onCompareChange(false);
      }
    };
    const onWindowBlur = () => {
      setCompareHeld(false);
      onCompareChange(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [enabled, config, pose, selectedEye, onCompareChange]);

  function updateEye(index: number, changes: Partial<EyeConfig>) {
    onConfigChange((current) => {
      const key = index === 0 ? 'leftEye' : 'rightEye';
      const eye = current[pose][key];
      return {
        ...current,
        [pose]: {
          ...current[pose],
          [key]: {
            ...eye,
            ...changes,
            x: clamp(changes.x ?? eye.x, 0, current[pose].naturalWidth),
            y: clamp(changes.y ?? eye.y, 0, current[pose].naturalHeight),
            r: clamp(changes.r ?? eye.r, 1, Math.min(current[pose].naturalWidth, current[pose].naturalHeight) / 2),
          },
        },
      };
    });
  }

  function moveEyeFromPointer(index: number, event: ReactPointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    const currentPose = config[pose];
    updateEye(index, {
      x: Number(clamp((event.clientX - bounds.left) / bounds.width * currentPose.naturalWidth, 0, currentPose.naturalWidth).toFixed(2)),
      y: Number(clamp((event.clientY - bounds.top) / bounds.height * currentPose.naturalHeight, 0, currentPose.naturalHeight).toFixed(2)),
    });
  }

  async function copyConfig() {
    const text = `export const POSE_CONFIG: Record<OwlPose, PoseConfig> = ${JSON.stringify(config, null, 2)};`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Config copied.');
    } catch (error) {
      console.error('Could not copy the owl pose config.', error);
      setCopyStatus('Clipboard unavailable; select and copy the config below.');
    }
  }

  if (!overlaysVisible || compareHeld) {
    return enabled ? (
      <div className="owl-debug-panel">
        <DebugControls
          pose={pose}
          onPoseChange={onPoseChange}
          onToggleOverlays={() => {
            setOverlaysVisible(true);
            onCompareChange(false);
          }}
          onCopy={copyConfig}
          copyStatus={copyStatus}
          config={config}
          aspectWarning={aspectWarning}
        />
      </div>
    ) : null;
  }

  return (
    <>
      {eyes.map((eye, index) => {
        const key = index === 0 ? 'leftEye' : 'rightEye';
        const circleSize = 2 * 1.04 * eye.r / config[pose].naturalWidth * 100;
        const eyeStyle = {
          left: `${eye.x / config[pose].naturalWidth * 100}%`,
          top: `${eye.y / config[pose].naturalHeight * 100}%`,
          width: `${circleSize}%`,
        } satisfies CSSProperties;
        return (
          <div
            key={`${pose}-${index}`}
            ref={(element) => onEyeRef(index, element)}
            className={`owl-eye ${index === 1 ? 'owl-eye--right' : 'owl-eye--left'} ${enabled ? 'is-debugging' : ''} ${eyeLookEnabled ? 'has-eye-look' : ''} ${mood === 'thinking' ? 'is-pondering' : ''}`}
            style={eyeStyle}
            role={enabled ? 'group' : undefined}
            tabIndex={enabled ? 0 : undefined}
            aria-label={enabled ? `Move ${key === 'leftEye' ? 'left' : 'right'} ${pose} eye; arrow keys nudge by 0.5 pixels` : undefined}
            onFocus={() => enabled && setSelectedEye(index)}
            onPointerDown={(event) => {
              if (!enabled) return;
              setSelectedEye(index);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (enabled && event.buttons) moveEyeFromPointer(index, event);
            }}
            onWheel={(event) => {
              if (!enabled) return;
              event.preventDefault();
              setSelectedEye(index);
              const step = event.altKey ? 2 : event.shiftKey ? 0.25 : 1;
              updateEye(index, { r: eye.r - Math.sign(event.deltaY) * step });
            }}
          >
            <div className="owl-eye-plate" />
            {eyeLookEnabled && <span className="owl-original-outline" />}
            <div className="owl-eye-clip">
              <div className="owl-socket-shadow" />
              <div
                ref={(element) => onIrisRef(index, element)}
                className="owl-iris-travel"
              >
                <div className="owl-iris-geometry">
                  <span className="owl-iris-ring" />
                  <span className="owl-iris">
                    <span className="owl-pupil" ref={(element) => onPupilRef(index, element)} />
                    <span
                      className="owl-eye-highlight owl-eye-highlight--large"
                      ref={(element) => onHighlightRef(index, 0, element)}
                    />
                    <span
                      className="owl-eye-highlight owl-eye-highlight--small"
                      ref={(element) => onHighlightRef(index, 1, element)}
                    />
                  </span>
                </div>
              </div>
              <div className="owl-eyelid" ref={(element) => onLidRef(index, element)} />
              <div className="owl-lower-lid" ref={(element) => onLowerLidRef(index, element)} />
            </div>
            {enabled && (
              <>
                {eyeLookEnabled && <span className="owl-plate-outline" />}
                <span className="owl-debug-crosshair" />
                <span className="owl-debug-handle" />
                <span className="owl-debug-label">
                  {key}: x {eye.x.toFixed(2)}, y {eye.y.toFixed(2)}, r {eye.r.toFixed(2)}
                </span>
              </>
            )}
          </div>
        );
      })}
      {enabled && (
        <div className="owl-debug-panel">
          <DebugControls
            pose={pose}
            onPoseChange={onPoseChange}
            onToggleOverlays={() => {
              setOverlaysVisible(false);
              onCompareChange(true);
            }}
            onCopy={copyConfig}
            copyStatus={copyStatus}
            config={config}
            aspectWarning={aspectWarning}
          />
        </div>
      )}
    </>
  );
}

function DebugControls({
  pose,
  onPoseChange,
  onToggleOverlays,
  onCopy,
  copyStatus,
  config,
  aspectWarning,
}: {
  pose: OwlPose;
  onPoseChange: (pose: OwlPose) => void;
  onToggleOverlays: () => void;
  onCopy: () => void;
  copyStatus: string;
  config: Record<OwlPose, PoseConfig>;
  aspectWarning: boolean;
}) {
  return (
    <>
      {aspectWarning && <p className="owl-aspect-warning" role="alert">Stage aspect ratio differs from the natural image ratio by more than 0.5%.</p>}
      <div className="owl-debug-actions">
        <button type="button" aria-pressed={pose === 'wings-up'} onClick={() => onPoseChange('wings-up')}>Wings up</button>
        <button type="button" aria-pressed={pose === 'thinking'} onClick={() => onPoseChange('thinking')}>Thinking</button>
        <button type="button" onClick={onToggleOverlays}>Compare (hold C)</button>
        <button type="button" onClick={onCopy}>Copy TypeScript config</button>
      </div>
      <p className="owl-debug-help">Drag an eye to move it. Wheel resizes; Shift = 0.25 px, Alt = 2 px. Focus an eye and use arrow keys to nudge it.</p>
      {copyStatus && <p role="status">{copyStatus}</p>}
      <label>
        POSE_CONFIG
        <textarea readOnly value={`export const POSE_CONFIG: Record<OwlPose, PoseConfig> = ${JSON.stringify(config, null, 2)};`} />
      </label>
    </>
  );
}
