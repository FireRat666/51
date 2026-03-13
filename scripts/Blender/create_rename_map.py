import bpy

def get_bone_hierarchy(armature):
    """
    Returns a dictionary representing the bone hierarchy of an armature.
    """
    hierarchy = {}
    bones = armature.data.bones
    
    # Create a dictionary of bones with their children
    for bone in bones:
        if bone.parent:
            if bone.parent.name not in hierarchy:
                hierarchy[bone.parent.name] = []
            hierarchy[bone.parent.name].append(bone.name)
        else:
            if "ROOT" not in hierarchy:
                hierarchy["ROOT"] = []
            hierarchy["ROOT"].append(bone.name)
            
    return hierarchy

def create_rename_map_by_hierarchy(source_armature, target_armature):
    """
    Creates a bone rename map by comparing the hierarchy of two armatures.
    """
    source_hierarchy = get_bone_hierarchy(source_armature)
    target_hierarchy = get_bone_hierarchy(target_armature)
    
    bone_map = {bone.name: bone.name for bone in source_armature.data.bones}

    def traverse_hierarchies(source_parent, target_parent):
        source_children = source_hierarchy.get(source_parent, [])
        target_children = target_hierarchy.get(target_parent, [])
        
        # To prevent issues with lists of different sizes, we will only iterate 
        # up to the length of the smaller list.
        min_len = min(len(source_children), len(target_children))

        for i in range(min_len):
            source_child = source_children[i]
            target_child = target_children[i]
            bone_map[source_child] = target_child
            traverse_hierarchies(source_child, target_child)

    traverse_hierarchies("ROOT", "ROOT")
    return bone_map


class CreateRenameMapOperator(bpy.types.Operator):
    """Creates a bone rename map file from two armatures."""
    bl_idname = "armature.create_rename_map"
    bl_label = "Create Rename Map"
    bl_options = {'REGISTER', 'UNDO'}

    filepath: bpy.props.StringProperty(subtype="FILE_PATH", default="rename_map.txt")

    source_armature: bpy.props.StringProperty(
        name="Source Armature",
        description="The armature to rename",
    )
    target_armature: bpy.props.StringProperty(
        name="Target Armature",
        description="The armature with the desired names",
    )

    def execute(self, context):
        source_obj = bpy.data.objects.get(self.source_armature)
        target_obj = bpy.data.objects.get(self.target_armature)

        if not source_obj or source_obj.type != 'ARMATURE':
            self.report({'ERROR'}, "Source armature not found or is not an armature.")
            return {'CANCELLED'}
        
        if not target_obj or target_obj.type != 'ARMATURE':
            self.report({'ERROR'}, "Target armature not found or is not an armature.")
            return {'CANCELLED'}

        bone_map = create_rename_map_by_hierarchy(source_obj, target_obj)

        with open(self.filepath, "w") as f:
            for source_name, target_name in bone_map.items():
                f.write(f"{source_name}:{target_name}\n")

        self.report({'INFO'}, f"Rename map saved to {self.filepath}")
        return {'FINISHED'}

    def invoke(self, context, event):
        # Get armatures from the scene
        armatures = [obj.name for obj in bpy.data.objects if obj.type == 'ARMATURE']
        if len(armatures) < 2:
            self.report({'ERROR'}, "Please have at least two armatures in the scene.")
            return {'CANCELLED'}
        
        # Set default values for the dialog
        self.source_armature = armatures[0]
        self.target_armature = armatures[1]
        
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}

def register():
    bpy.utils.register_class(CreateRenameMapOperator)

def unregister():
    bpy.utils.unregister_class(CreateRenameMapOperator)

if __name__ == "__main__":
    register()
    bpy.ops.armature.create_rename_map('INVOKE_DEFAULT')
