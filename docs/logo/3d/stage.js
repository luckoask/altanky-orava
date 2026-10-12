// Lighting, camera and renderer for showing the 3D logo on a transparent
// background (soft daylight from the front left, studio reflections, a faint
// contact shadow). Shared by build.html (renders/export) and viewer.html.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createStage(canvas, { width, height, pixelRatio = 1, shadow = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = shadow;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const key = new THREE.DirectionalLight(0xfff1df, 2.6);
  key.position.set(-5, 8, 7);
  key.castShadow = shadow;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4;
  key.shadow.camera.top = 5; key.shadow.camera.bottom = -1.5;
  key.shadow.camera.near = 1; key.shadow.camera.far = 30;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.012;
  key.shadow.radius = 3;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe9ff, 0.9);
  rim.position.set(6, 5, -6);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xe4ecf7, 0x5d5141, 0.45));

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.visible = shadow;
  scene.add(ground);

  const camera = new THREE.PerspectiveCamera(18, width / height, 0.1, 100);

  /** frame the object: yaw/pitch in degrees, margin = empty space around it */
  function frame(object, { yaw = 0, pitch = 4, margin = 1.06 } = {}) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const r = Math.max(size.x / camera.aspect, size.y) * 0.5 * margin;
    const dist = r / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) + size.z * 0.5;
    const yr = THREE.MathUtils.degToRad(yaw), pr = THREE.MathUtils.degToRad(pitch);
    camera.position.set(
      center.x + Math.sin(yr) * Math.cos(pr) * dist,
      center.y + Math.sin(pr) * dist,
      center.z + Math.cos(yr) * Math.cos(pr) * dist,
    );
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    return { center, size, dist };
  }

  function resize(w, h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  return { renderer, scene, camera, key, ground, frame, resize, render: () => renderer.render(scene, camera) };
}
