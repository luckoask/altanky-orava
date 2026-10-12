// Only the parts of three.js the intro uses. Importing the whole namespace
// would stop Vite from tree-shaking the chunk it shares with the 3D badge
// (stage.js), and every visitor would download ~40 kB more.
export {
  AdditiveBlending, BoxGeometry, NormalBlending, BufferAttribute, BufferGeometry, CanvasTexture,
  Color, DirectionalLight, ExtrudeGeometry, Group, MathUtils, Mesh,
  MeshBasicMaterial, MeshPhysicalMaterial, NeutralToneMapping, PMREMGenerator,
  PerspectiveCamera, PlaneGeometry, PointLight, Points, PointsMaterial,
  SRGBColorSpace, Scene, Sprite, SpriteMaterial, Vector3, WebGLRenderer,
} from 'three';
export { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
export { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
export { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
