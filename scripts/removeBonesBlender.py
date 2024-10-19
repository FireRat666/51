import bpy

def remove_mixamo_prefix():
    # Check if the selected object is an armature
    obj = bpy.context.active_object
    if obj and obj.type == 'ARMATURE':
        renamed_count = 0  # Track how many bones were renamed

        # Rename bones by removing the "mixamo:" prefix
        for bone in obj.data.bones:
            if bone.name.startswith("mixamorig:"):
                bone.name = bone.name.replace("mixamorig:", "", 1)
                renamed_count += 1

        # Print feedback to the console
        print(f"Renamed {renamed_count} bones in '{obj.name}'!")
    else:
        print("Error: Please select an armature object.")

# Run the function
remove_mixamo_prefix()
