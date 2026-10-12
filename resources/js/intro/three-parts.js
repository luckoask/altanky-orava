// Only the parts of three.js the intro uses. Importing the whole namespace
// would stop Vite from tree-shaking this chunk, and every visitor who sees
// the intro would download ~40 kB more.
export {
  AdditiveBlending, Box3, BoxGeometry, NormalBlending, BufferAttribute, BufferGeometry, CanvasTexture,
  Color, DirectionalLight, ExtrudeGeometry, Group, MathUtils, Mesh,
  MeshBasicMaterial, MeshPhysicalMaterial, NeutralToneMapping, PMREMGenerator,
  PerspectiveCamera, Plane, PlaneGeometry, PointLight, Points, PointsMaterial,
  SRGBColorSpace, Scene, Sprite, SpriteMaterial, TextureLoader, Vector3, WebGLRenderer,
} from 'three';
export { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
export { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
