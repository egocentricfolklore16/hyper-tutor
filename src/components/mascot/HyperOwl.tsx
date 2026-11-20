import { useCallback, useEffect, useRef, useState, type CSSProperties, type SyntheticEvent } from 'react';
import owlThinkingPng from '../../assets/mascot/owl-thinking.png';
import owlThinkingWebp from '../../assets/mascot/owl-thinking.webp';
import owlWingsUpPng from '../../assets/mascot/owl-wings-up.png';
import owlWingsUpWebp from '../../assets/mascot/owl-wings-up.webp';
import './mascot.css';
import { OwlEyeCalibrator } from './OwlEyeCalibrator';
import { useOwlMood } from './useOwlMood';
import { useOwlEyeBehavior } from './useOwlEyeBehavior';

export type OwlPose = 'wings-up' | 'thinking';
export type EyeConfig = { x: number; y: number; r: number };
export type PoseConfig = {
  naturalWidth: number;
  naturalHeight: number;
  leftEye: EyeConfig;
  rightEye: EyeConfig;
};
type NaturalSize = { width: number; height: number };
type ImageFormat = 'webp' | 'png';

export const POSE_CONFIG: Record<OwlPose, PoseConfig> = {
  'wings-up': {
    naturalWidth: 546,
    naturalHeight: 457,
    leftEye: { x: 242, y: 150, r: 31 },
    rightEye: { x: 332, y: 147, r: 28 },
  },
  thinking: {
    naturalWidth: 544,
    naturalHeight: 458,
    leftEye: { x: 212, y: 147, r: 32 },
    rightEye: { x: 303, y: 122, r: 27 },
  },
};

const IMAGE_ASSETS: Record<OwlPose, Record<ImageFormat, string>> = {
  'wings-up': { png: owlWingsUpPng, webp: owlWingsUpWebp },
  thinking: { png: owlThinkingPng, webp: owlThinkingWebp },
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

export type HyperOwlProps = {
  pose?: OwlPose;
  size?: number;
  followCursor?: boolean;
  className?: string;
  debug?: boolean;
};

export function HyperOwl({
  pose = 'wings-up',
  size = 280,
  followCursor = true,
  className = '',
  debug = false,
}: HyperOwlProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const eyeRefs = useRef<Array<HTMLDivElement | null>>([null, null]);
  const irisRefs = useRef<Array<HTMLDivElement | null>>([null, null]);
  const pupilRefs = useRef<Array<HTMLSpanElement | null>>([null, null]);
  const highlightRefs = useRef<Array<Array<HTMLSpanElement | null>>>([[null, null], [null, null]]);
  const inViewRef = useRef(false);
  const hopTimerRef = useRef(0);
  const lidRefs = useRef<Array<HTMLDivElement | null>>([null, null]);
  const lowerLidRefs = useRef<Array<HTMLDivElement | null>>([null, null]);
  const canHopRef = useRef(true);
  const reducedMotion = useReducedMotion();
  const { mood, happySequence } = useOwlMood();
  const [debugEnabled, setDebugEnabled] = useState(debug);
  const [eyeLookEnabled, setEyeLookEnabled] = useState(false);
  const [debugPose, setDebugPose] = useState(pose);
  const [compareActive, setCompareActive] = useState(false);
  const [debugConfig, setDebugConfig] = useState<Record<OwlPose, PoseConfig>>(() => structuredClone(POSE_CONFIG));
  const [loadedPoses, setLoadedPoses] = useState<Set<OwlPose>>(() => new Set([pose]));
  const [shownPose, setShownPose] = useState(pose);
  const [imageFormats, setImageFormats] = useState<Record<OwlPose, ImageFormat>>({
    'wings-up': 'webp',
    thinking: 'webp',
  });
  const [naturalSizes, setNaturalSizes] = useState<Partial<Record<OwlPose, NaturalSize>>>({});
  const [aspectWarning, setAspectWarning] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDebugEnabled(debug || params.get('owlDebug') === '1');
    setEyeLookEnabled(params.get('eyeLook') === '1');
  }, [debug]);

  useEffect(() => {
    if (!debugEnabled) setCompareActive(false);
  }, [debugEnabled]);

  useEffect(() => setDebugPose(pose), [pose]);

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)');
    const update = () => setFinePointer(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const displayPose: OwlPose = debugEnabled
    ? debugPose
    : mood === 'thinking' ? 'thinking' : pose;
  const renderedPose = loadedPoses.has(displayPose) ? displayPose : shownPose;
  const config = debugEnabled ? debugConfig : POSE_CONFIG;
  const poseConfig = config[renderedPose];
  canHopRef.current = renderedPose === 'wings-up';

  useOwlEyeBehavior({
    enabled: true,
    followCursor,
    pose: renderedPose,
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
  });

  useEffect(() => setShownPose(renderedPose), [renderedPose]);

  const triggerHop = useCallback(() => {
    if (reducedMotion || !canHopRef.current || !bodyRef.current) return;
    window.clearTimeout(hopTimerRef.current);
    bodyRef.current.classList.remove('is-hopping');
    void bodyRef.current.offsetWidth;
    bodyRef.current.classList.add('is-hopping');
    hopTimerRef.current = window.setTimeout(() => bodyRef.current?.classList.remove('is-hopping'), 650);
  }, [reducedMotion]);

  useEffect(() => {
    if (mood === 'happy') triggerHop();
  }, [happySequence, mood, triggerHop]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!('IntersectionObserver' in window)) {
      inViewRef.current = true;
      triggerHop();
      return;
    }
    let hasEntered = false;
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
      if (entry.isIntersecting && !hasEntered) {
        hasEntered = true;
        triggerHop();
      }
      if (!entry.isIntersecting) {
      }
    }, { rootMargin: '80px' });
    observer.observe(root);
    return () => observer.disconnect();
  }, [triggerHop]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (reducedMotion || !inViewRef.current) return;
      const target = event.target;
      if (target instanceof Element && target.closest('a,button,input,textarea,select,[role="button"]')) return;
      const bounds = rootRef.current?.getBoundingClientRect();
      if (bounds && event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom) {
        triggerHop();
      }
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [reducedMotion, triggerHop]);

  useEffect(() => () => {
    window.clearTimeout(hopTimerRef.current);
  }, []);

  useEffect(() => {
    if (!debugEnabled) return;
    const stage = stageRef.current;
    if (!stage) return;
    const checkAspect = () => {
      const width = stage.offsetWidth;
      const height = stage.offsetHeight;
      const natural = naturalSizes[renderedPose] ?? {
        width: POSE_CONFIG[renderedPose].naturalWidth,
        height: POSE_CONFIG[renderedPose].naturalHeight,
      };
      const relativeDifference = Math.abs((width / height) / (natural.width / natural.height) - 1);
      setAspectWarning(relativeDifference > 0.005);
    };
    checkAspect();
    const observer = new ResizeObserver(checkAspect);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [debugEnabled, naturalSizes, renderedPose]);

  const handleImageLoad = (imagePose: OwlPose, event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const stored = POSE_CONFIG[imagePose];
    if (import.meta.env.DEV && (naturalWidth !== stored.naturalWidth || naturalHeight !== stored.naturalHeight)) {
      console.warn(
        `[HyperOwl] ${imagePose} image natural size ${naturalWidth}x${naturalHeight} differs from POSE_CONFIG ${stored.naturalWidth}x${stored.naturalHeight}.`,
      );
    }
    setNaturalSizes((sizes) => ({ ...sizes, [imagePose]: { width: naturalWidth, height: naturalHeight } }));
    setLoadedPoses((loaded) => new Set(loaded).add(imagePose));
  };

  const handleImageError = (imagePose: OwlPose) => {
    if (imageFormats[imagePose] === 'webp') {
      setImageFormats((formats) => ({ ...formats, [imagePose]: 'png' }));
    } else {
      console.error(`[HyperOwl] Both image formats failed to load for the ${imagePose} pose.`);
    }
  };

  const actualDimensions = naturalSizes[renderedPose] ?? {
    width: poseConfig.naturalWidth,
    height: poseConfig.naturalHeight,
  };
  const rootStyle = {
    aspectRatio: `${actualDimensions.width} / ${actualDimensions.height}`,
  } satisfies CSSProperties;
  const stageStyle = {
    aspectRatio: `${actualDimensions.width} / ${actualDimensions.height}`,
  } satisfies CSSProperties;

  return (
    <div className={`hyper-owl-wrap ${className}`} style={{ '--owl-size': `${size}px` } as CSSProperties}>
      <div
        ref={rootRef}
        className={`hyper-owl ${reducedMotion ? 'is-reduced' : ''} ${debugEnabled ? 'is-debug-mode' : ''}`}
        style={rootStyle}
        aria-hidden={!debugEnabled}
      >
        <div className="owl-ground-shadow" />
        <div className="owl-float">
          <div ref={tiltRef} className="owl-tilt">
            <div ref={bodyRef} className="owl-body">
              <div
                ref={stageRef}
                className={`owl-stage ${renderedPose === 'wings-up' ? 'has-wing-wiggle' : ''}`}
                style={stageStyle}
              >
                {(Object.keys(IMAGE_ASSETS) as OwlPose[])
                  .filter((imagePose) => imagePose === renderedPose || imagePose === displayPose || loadedPoses.has(imagePose))
                  .map((imagePose) => {
                    const imageSize = config[imagePose];
                    const format = compareActive ? 'png' : imageFormats[imagePose];
                    return (
                      <img
                        key={imagePose}
                        data-pose={imagePose}
                        className={`owl-stage-image ${imagePose === renderedPose ? 'is-active' : ''}`}
                        src={IMAGE_ASSETS[imagePose][format]}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        width={imageSize.naturalWidth}
                        height={imageSize.naturalHeight}
                        loading={imagePose === 'wings-up' ? 'eager' : 'lazy'}
                        decoding="async"
                        onLoad={(event) => handleImageLoad(imagePose, event)}
                        onError={() => handleImageError(imagePose)}
                      />
                    );
                  })}
                <OwlEyeCalibrator
                  enabled={debugEnabled}
                  eyeLookEnabled={eyeLookEnabled}
                  onCompareChange={setCompareActive}
                  pose={renderedPose}
                  onPoseChange={setDebugPose}
                  config={config}
                  onConfigChange={setDebugConfig}
                  stageRef={stageRef}
                  mood={mood}
                  aspectWarning={aspectWarning}
                  onEyeRef={(index, element) => { eyeRefs.current[index] = element; }}
                  onIrisRef={(index, element) => { irisRefs.current[index] = element; }}
                  onPupilRef={(index, element) => { pupilRefs.current[index] = element; }}
                  onHighlightRef={(eyeIndex, highlightIndex, element) => {
                    highlightRefs.current[eyeIndex][highlightIndex] = element;
                  }}
                  onLidRef={(index, element) => { lidRefs.current[index] = element; }}
                  onLowerLidRef={(index, element) => { lowerLidRefs.current[index] = element; }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {finePointer && (
        <button type="button" className="owl-hop-trigger" aria-label="Make the owl hop" onClick={triggerHop} />
      )}
    </div>
  );
}
