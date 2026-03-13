import bpy


def get_bone_hierarchy(armature):
    """
    Traverses the bone hierarchy of an armature and returns a list of strings
    representing the bone structure.
    """
    def get_child_bones(bone, level):
        hierarchy = []
        for child in bone.children:
            hierarchy.append("  " * level + "|- " + child.name)
            hierarchy.extend(get_child_bones(child, level + 1))
        return hierarchy

    hierarchy = []
    for bone in armature.data.bones:
        if not bone.parent:
            hierarchy.append(bone.name)
            hierarchy.extend(get_child_bones(bone, 1))
    return hierarchy


class ExportArmatureHierarchyOperator(bpy.types.Operator):
    """Exports the bone hierarchy of the selected armature to a text file."""
    bl_idname = "export_armature.save_hierarchy"
    bl_label = "Export Armature Hierarchy"
    bl_options = {'REGISTER', 'UNDO'}

    filepath: bpy.props.StringProperty(subtype="FILE_PATH")

    def execute(self, context):
        obj = context.active_object
        if obj and obj.type == 'ARMATURE':
            hierarchy = get_bone_hierarchy(obj)
            with open(self.filepath, "w") as f:
                for line in hierarchy:
                    f.write(line + "\n")
            self.report({'INFO'}, f"Armature hierarchy exported to {self.filepath}")
        else:
            self.report({'ERROR'}, "Please select an armature object.")
        return {'FINISHED'}

    def invoke(self, context, event):
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}


def register():
    bpy.utils.register_class(ExportArmatureHierarchyOperator)


def unregister():
    bpy.utils.unregister_class(ExportArmatureHierarchyOperator)


if __name__ == "__main__":
    register()
    bpy.ops.export_armature.save_hierarchy('INVOKE_DEFAULT')
