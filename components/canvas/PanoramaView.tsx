'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { useViewModeStore } from '@/stores/viewModeStore';
import { useSweepStore } from '@/stores/sweepStore';
import { ViewMode, Sweep } from '@/lib/types';
import { SWEEP_PUCK_COLOR } from '@/lib/constants';

// ============================================================
// Walk-forward transition: dolly toward target + crossfade
// ============================================================

const NAV_PHASE_DOLLY = 'dolly';     // Camera moves toward marker
const NAV_PHASE_FADEIN = 'fadein';   // New panorama fades in
const NAV_PHASE_IDLE = 'idle';

const DOLLY_DURATION = 0.6;  // seconds
const FADEIN_DURATION = 0.4; // seconds
const DOLLY_DISTANCE = 80;   // how far camera moves toward marker
const FOV_ZOOM = 40;         // FOV narrows to create zoom effect

type NavPhase = typeof NAV_PHASE_DOLLY | typeof NAV_PHASE_FADEIN | typeof NAV_PHASE_IDLE;

// ============================================================
// Sweep Puck (clickable navigation marker)
// ============================================================

function PanoramaSweepPuck({
  sweep,
  currentSweep,
  onNavigate,
}: {
  sweep: Sweep;
  currentSweep: Sweep;
  onNavigate: (sweepId: string, direction: THREE.Vector3) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const dx = sweep.position[0] - currentSweep.position[0];
  const dz = sweep.position[2] - currentSweep.position[2];
  const dist = Math.sqrt(dx * dx + dz * dz);

  const puckDistance = 3;
  let px: number, pz: number;
  if (dist > 0.01) {
    px = (dx / dist) * puckDistance;
    pz = (dz / dist) * puckDistance;
  } else {
    px = puckDistance;
    pz = 0;
  }

  const scale = hovered ? 1.4 : 1.0;
  const color = hovered ? '#80d8ff' : SWEEP_PUCK_COLOR;

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  return (
    <mesh
      position={[px, -1.5, pz]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[scale, scale, 1]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
        // Pass the direction vector toward this puck
        const dir = new THREE.Vector3(px, 0, pz).normalize();
        onNavigate(sweep.id, dir);
      }}
    >
      <circleGeometry args={[0.3, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
    </mesh>
  );
}

function PanoramaSweepPucks({
  onNavigate,
}: {
  onNavigate: (sweepId: string, direction: THREE.Vector3) => void;
}) {
  const getNeighbors = useSweepStore((s) => s.getNeighbors);
  const currentSweepId = useSweepStore((s) => s.currentSweepId);
  const sweeps = useSweepStore((s) => s.sweeps);
  const isNavigating = useSweepStore((s) => s.isNavigating);

  const currentSweep = sweeps[currentSweepId];
  if (!currentSweep || isNavigating) return null;

  const neighbors = getNeighbors();

  return (
    <>
      {neighbors.map((neighbor) => (
        <PanoramaSweepPuck
          key={neighbor.id}
          sweep={neighbor}
          currentSweep={currentSweep}
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
}

// ============================================================
// Camera Yaw Tracker (for minimap)
// ============================================================

function CameraYawTracker() {
  const { camera } = useThree();
  const setCameraYaw = useViewModeStore((s) => s.setCameraYaw);
  const lastYawRef = useRef(0);

  useFrame(() => {
    const yaw = camera.rotation.y;
    if (Math.abs(yaw - lastYawRef.current) > 0.05) {
      lastYawRef.current = yaw;
      setCameraYaw(yaw);
    }
  });

  return null;
}

// ============================================================
// Main PanoramaView
// ============================================================

export function PanoramaView() {
  const currentMode = useViewModeStore((s) => s.currentMode);
  const isTransitioning = useViewModeStore((s) => s.isTransitioning);
  const currentSweepId = useSweepStore((s) => s.currentSweepId);
  const sweeps = useSweepStore((s) => s.sweeps);
  const startNavigation = useSweepStore((s) => s.startNavigation);
  const completeNavigation = useSweepStore((s) => s.completeNavigation);
  const { camera } = useThree();

  // Navigation state
  const navPhaseRef = useRef<NavPhase>(NAV_PHASE_IDLE);
  const navProgressRef = useRef(0);
  const navDirectionRef = useRef(new THREE.Vector3(0, 0, -1));
  const navTargetIdRef = useRef<string | null>(null);
  const startFovRef = useRef(75);
  const [navActive, setNavActive] = useState(false); // state to trigger re-render for OrbitControls

  // Sphere materials for crossfade
  const currentMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const nextMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Texture loading
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  const [currentTexture, setCurrentTexture] = useState<THREE.Texture | null>(null);
  const [nextTexture, setNextTexture] = useState<THREE.Texture | null>(null);

  const currentSweep = sweeps[currentSweepId];
  const panoramaUrl = currentSweep?.panoramaUrl || '/panoramas/sundowner_deck.jpg';

  // Load initial texture
  useEffect(() => {
    if (!panoramaUrl) return;
    textureLoader.load(panoramaUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setCurrentTexture(tex);
    });
  }, [panoramaUrl, textureLoader]);

  // Reset camera on entering panorama mode or after navigation completes
  const isNavigating = useSweepStore((s) => s.isNavigating);
  const prevNavigatingRef = useRef(false);

  useEffect(() => {
    if (currentMode === ViewMode.Panorama && !isTransitioning) {
      camera.position.set(0, 0, 0);
    }
  }, [currentMode, isTransitioning, camera]);

  // After navigation completes, ensure camera is back at origin
  useEffect(() => {
    if (prevNavigatingRef.current && !isNavigating) {
      camera.position.set(0, 0, 0);
    }
    prevNavigatingRef.current = isNavigating;
  }, [isNavigating, camera]);

  // Handle navigation start - called by puck click
  const handleNavigate = (sweepId: string, direction: THREE.Vector3) => {
    if (navPhaseRef.current !== NAV_PHASE_IDLE) return;

    navTargetIdRef.current = sweepId;
    navDirectionRef.current.copy(direction);
    navPhaseRef.current = NAV_PHASE_DOLLY;
    navProgressRef.current = 0;
    startFovRef.current = (camera as THREE.PerspectiveCamera).fov;
    setNavActive(true); // trigger re-render to disable OrbitControls

    // Mark as navigating in store (hides pucks)
    startNavigation(sweepId);

    // Preload next panorama texture
    const targetSweep = sweeps[sweepId];
    if (targetSweep) {
      textureLoader.load(targetSweep.panoramaUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setNextTexture(tex);
      });
    }
  };

  // Animation loop for walk-forward transition
  useFrame((_, delta) => {
    if (navPhaseRef.current === NAV_PHASE_IDLE) return;

    const perspCam = camera as THREE.PerspectiveCamera;

    if (navPhaseRef.current === NAV_PHASE_DOLLY) {
      navProgressRef.current += delta / DOLLY_DURATION;
      const t = Math.min(navProgressRef.current, 1);
      // Ease in (accelerate)
      const eased = t * t;

      // Move camera toward the direction of the marker
      const moveAmount = eased * DOLLY_DISTANCE * delta * 2;
      camera.position.addScaledVector(navDirectionRef.current, moveAmount);

      // Narrow FOV for zoom effect
      perspCam.fov = THREE.MathUtils.lerp(startFovRef.current, FOV_ZOOM, eased);
      perspCam.updateProjectionMatrix();

      // Fade out current panorama
      if (currentMatRef.current) {
        currentMatRef.current.opacity = 1 - eased * 0.7;
      }

      if (t >= 1) {
        // Dolly phase complete - switch to fade-in
        navPhaseRef.current = NAV_PHASE_FADEIN;
        navProgressRef.current = 0;

        // Reset camera position for new panorama
        camera.position.set(0, 0, 0);

        // Swap textures
        if (nextTexture) {
          setCurrentTexture(nextTexture);
          setNextTexture(null);
        }

        // Complete navigation in store (changes currentSweepId)
        completeNavigation();
      }
    } else if (navPhaseRef.current === NAV_PHASE_FADEIN) {
      navProgressRef.current += delta / FADEIN_DURATION;
      const t = Math.min(navProgressRef.current, 1);
      // Ease out (decelerate)
      const eased = 1 - (1 - t) * (1 - t);

      // Restore FOV
      perspCam.fov = THREE.MathUtils.lerp(FOV_ZOOM, startFovRef.current, eased);
      perspCam.updateProjectionMatrix();

      // Fade in new panorama
      if (currentMatRef.current) {
        currentMatRef.current.opacity = 0.3 + eased * 0.7;
      }

      if (t >= 1) {
        // Transition complete
        navPhaseRef.current = NAV_PHASE_IDLE;
        navProgressRef.current = 0;
        setNavActive(false); // trigger re-render to re-enable OrbitControls

        // Ensure full opacity and default FOV
        if (currentMatRef.current) {
          currentMatRef.current.opacity = 1;
        }
        perspCam.fov = startFovRef.current;
        perspCam.updateProjectionMatrix();
      }
    }
  });

  if (currentMode !== ViewMode.Panorama) return null;

  return (
    <>
      <CameraYawTracker />

      {/* Current panorama sphere */}
      <mesh position={[0, 0, 0]} scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 64, 32]} />
        <meshBasicMaterial
          ref={currentMatRef}
          map={currentTexture}
          side={THREE.BackSide}
          transparent
          opacity={1}
        />
      </mesh>

      <PanoramaSweepPucks onNavigate={handleNavigate} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={-0.5}
        target={[0, 0, -0.01]}
        enabled={!isTransitioning && !navActive}
        makeDefault
      />
    </>
  );
}
