
import bpy

def read_bone_name_map_from_file(filepath):
    """
    Reads a bone name mapping from a text file.
    The file should be in the format: old_name:new_name
    """
    bone_map = {}
    with open(filepath, "r") as f:
        for line in f:
            line = line.strip()
            if ":" in line:
                old_name, new_name = line.split(":", 1)
                bone_map[old_name.strip()] = new_name.strip()
    return bone_map

def rename_bones_by_map(armature, bone_map):
    """
    Renames bones of an armature based on a name mapping.
    """
    bones = armature.data.bones
    renamed_count = 0
    for bone in bones:
        if bone.name in bone_map:
            bone.name = bone_map[bone.name]
            renamed_count += 1
    
    print(f"Renamed {renamed_count} bones.")

class RenameBonesOperator(bpy.types.Operator):
    """Renames the bones of an armature based on a text file."""
    bl_idname = "import_armature.rename_bones"
    bl_label = "Rename Armature Bones"
    bl_options = {'REGISTER', 'UNDO'}

    filepath: bpy.props.StringProperty(subtype="FILE_PATH")

    def execute(self, context):
        obj = context.active_object
        if obj and obj.type == 'ARMATURE':
            try:
                bone_map = read_bone_name_map_from_file(self.filepath)
                rename_bones_by_map(obj, bone_map)
                self.report({'INFO'}, f"Bones renamed based on {self.filepath}")
            except Exception as e:
                self.report({'ERROR'}, str(e))
        else:
            self.report({'ERROR'}, "Please select an armature object.")
        return {'FINISHED'}

    def invoke(self, context, event):
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}


def register():
    bpy.utils.register_class(RenameBonesOperator)


def unregister():
    bpy.utils.unregister_class(RenameBonesOperator)


if __name__ == "__main__":
    register()
    bpy.ops.import_armature.rename_bones('INVOKE_DEFAULT')
