# Pavilion model for the 3D intro: portal.blend -> resources/js/intro/domorava-portal.glb
#
#   blender -b portal.blend --factory-startup --python docs/logo/export_portal_glb.py -- <out.glb> [leaf_keep]
#
# The intro animates the pieces separately, so the parts become five nodes:
# Roof, Frame (green arch and posts), Pedestals (stone bases), PlantsL and PlantsR.
# The file stays small for the web: textures are downscaled and written as WebP,
# only a share of the 3D evergreen leaves is kept (leaf_keep, default 0.3) and
# the leaves and the painted foliage relief are smooth-shaded, so their vertices
# are not split per face. The script also prints the fit between the model and
# the reference image (docs/logo/pavilion-source.png) that the intro uses to
# place the model exactly on the flat mark (PORTAL in domorava-intro.js).
import random
import sys

import bmesh
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
OUT = argv[0]
LEAF_KEEP = float(argv[1]) if len(argv) > 1 else 0.3
REF = 1254  # reference image size in px


def base(name):
    return name.rsplit('.', 1)[0]


GROUPS = {
    'Roof': lambda n: n.startswith('Roof_') or n in ('Dark_Metal_Pitched_Roof', 'Left_Roof_Fascia', 'Right_Roof_Fascia'),
    'Frame': lambda n: n in ('Carved_Arch_and_Inner_Posts', 'Green_Frame_Core', 'Left_Arch_Collar', 'Right_Arch_Collar', 'Left_Timber_Post', 'Right_Timber_Post'),
    'Pedestals': lambda n: n.startswith(('Left_Stone', 'Right_Stone')),
    'PlantsL': lambda n: n.startswith('Left_') and ('Leaves' in n or 'Foliage' in n or 'River_Rock' in n),
    'PlantsR': lambda n: n.startswith('Right_') and ('Leaves' in n or 'Foliage' in n or 'River_Rock' in n),
}
meshes = [o for o in bpy.data.objects if o.type == 'MESH']

# Front faces carry the reference painting, so their UVs are reference pixels:
# least-squares fit px = a*x + b and py = c*z + d (Blender is z-up).
pairs = []
for o in meshes:
    uv = o.data.uv_layers.active
    slots = [s.material.name if s.material else '' for s in o.material_slots]
    if not uv or not slots:
        continue
    for poly in o.data.polygons:
        if not slots[poly.material_index].startswith('Reference_Front_Unlit'):
            continue
        for li in poly.loop_indices:
            v = o.matrix_world @ o.data.vertices[o.data.loops[li].vertex_index].co
            u, w = uv.data[li].uv
            pairs.append((v.x, v.z, u * REF, (1 - w) * REF))


def fit(xs, ps):
    n, sx, sp = len(xs), sum(xs), sum(ps)
    a = (n * sum(x * p for x, p in zip(xs, ps)) - sx * sp) / (n * sum(x * x for x in xs) - sx * sx)
    return a, (sp - a * sx) / n


a, b = fit([p[0] for p in pairs], [p[2] for p in pairs])
c, d = fit([p[1] for p in pairs], [p[3] for p in pairs])
print(f'FIT px = {a:.4f}*x + {b:.3f};  py = {c:.4f}*z + {d:.3f}  ({len(pairs)} points)')

# Thin the 3D evergreen leaves: keep a share of the leaf islands; they need no UVs.
random.seed(7)
for o in meshes:
    if 'Leaves' not in o.name:
        continue
    bm = bmesh.new()
    bm.from_mesh(o.data)
    seen, drop = set(), []
    for f in bm.faces:
        if f.index in seen:
            continue
        stack, island = [f], []
        seen.add(f.index)
        while stack:
            g = stack.pop()
            island.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h.index not in seen:
                        seen.add(h.index)
                        stack.append(h)
        if random.random() > LEAF_KEEP:
            drop.extend(island)
    bmesh.ops.delete(bm, geom=drop, context='FACES')
    bm.to_mesh(o.data)
    bm.free()
    while o.data.uv_layers:
        o.data.uv_layers.remove(o.data.uv_layers[0])

# Smaller textures; the exporter writes them as WebP.
SIZES = {'front-atlas': (1024, 1024), 'green-wood': (256, 1024), 'warm-wood': (512, 128), 'stone': (256, 256)}
for im in bpy.data.images:
    for key, size in SIZES.items():
        if im.name.startswith(key) and tuple(im.size) != size:
            im.scale(*size)

bpy.ops.object.select_all(action='DESELECT')
made = []
for gname, test in GROUPS.items():
    objs = [o for o in bpy.data.objects if o.type == 'MESH' and o.name not in GROUPS and test(base(o.name))]
    for o in objs:
        o.hide_set(False)
        o.hide_viewport = False
    if gname.startswith('Plants'):
        # Plants stay a group of parts under an empty at their centre.
        for o in objs:
            if 'Foliage' in o.name or 'Leaves' in o.name:
                for poly in o.data.polygons:
                    poly.use_smooth = True
                for e in o.data.edges:
                    e.use_edge_sharp = False
                if o.data.has_custom_normals:
                    bpy.context.view_layer.objects.active = o
                    o.select_set(True)
                    bpy.ops.mesh.customdata_custom_splitnormals_clear()
                    o.select_set(False)
        corners = [o.matrix_world @ Vector(k) for o in objs for k in o.bound_box]
        empty = bpy.data.objects.new(gname, None)
        bpy.context.scene.collection.objects.link(empty)
        empty.location = [(min(v[i] for v in corners) + max(v[i] for v in corners)) / 2 for i in range(3)]
        bpy.context.view_layer.update()
        for o in objs:
            world = o.matrix_world.copy()
            o.parent = empty
            o.matrix_world = world
        made.append(empty)
        continue
    # Rigid pieces are joined into one mesh with the origin at its centre (the pivot in the intro).
    bpy.context.view_layer.objects.active = objs[0]
    for o in objs:
        o.select_set(True)
    bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = gname
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    bpy.ops.object.select_all(action='DESELECT')
    made.append(joined)

for o in made:
    o.select_set(True)
    for child in o.children:
        child.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=OUT, export_format='GLB', use_selection=True,
    export_apply=True, export_yup=True,
    export_texcoords=True, export_normals=True, export_tangents=False,
    export_materials='EXPORT', export_image_format='WEBP', export_image_quality=80,
    export_cameras=False, export_lights=False, export_animations=False, export_extras=False,
)
print('WROTE', OUT)
