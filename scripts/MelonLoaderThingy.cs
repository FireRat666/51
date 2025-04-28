using MelonLoader;
using UnityEngine;
using Il2CppSystem;
using Il2CppSystem.Reflection;
using Il2CppAppDomain = Il2CppSystem.AppDomain;

[assembly: MelonInfo(typeof(MelonLoaderMod1.Core), "MelonLoaderMod1", "1.0.0", "Owner", null)]
[assembly: MelonGame("SideQuest", "Banter")]

namespace MelonLoaderMod1
{
    public class Core : MelonMod
    {
        private float lastCheckedTime = 0f;
        private float checkInterval = 5f;
        private bool hasDumpedFields = false;

        public override void OnInitializeMelon()
        {
            LoggerInstance.Msg("Initialized.");
        }

        public override void OnUpdate()
        {
            if (Time.time - lastCheckedTime < checkInterval)
                return;

            lastCheckedTime = Time.time;

            try
            {
                var assemblies = Il2CppAppDomain.CurrentDomain.GetAssemblies();

                // Look for the Banter.SDK assembly
                Assembly banterSDKAssembly = null;
                foreach (var assembly in assemblies)
                {
                    if (assembly.FullName.Contains("Banter.SDK"))
                    {
                        banterSDKAssembly = assembly;
                        LoggerInstance.Msg($"Found assembly: {assembly.FullName}");
                        break;
                    }
                }

                if (banterSDKAssembly == null)
                {
                    LoggerInstance.Msg("Could not find Banter.SDK.dll.");
                    return;
                }

                // Find the UserData type
                Il2CppSystem.Type userType = null;
                foreach (var type in banterSDKAssembly.GetTypes())
                {
                    if (type.Name == "UserData")
                    {
                        userType = type;
                        LoggerInstance.Msg("Found UserData type.");
                        break;
                    }
                }

                if (userType == null)
                {
                    LoggerInstance.Msg("Could not find UserData type in Banter.SDK.");
                    return;
                }

                // Dump all fields (only once)
                if (!hasDumpedFields)
                {
                    foreach (var field in userType.GetFields(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic))
                    {
                        LoggerInstance.Msg($"Field found: {field.Name} ({field.FieldType.FullName})");
                    }
                    hasDumpedFields = true;
                }

                // Find UserData objects
                var users = UnityEngine.Object.FindObjectsOfType(userType);
                if (users == null || users.Length == 0)
                {
                    LoggerInstance.Msg("No UserData objects found.");
                    return;
                }

                LoggerInstance.Msg($"Found {users.Length} UserData objects.");

                // Try to find the isSpaceAdmin field
                var isAdminField = userType.GetField("isSpaceAdmin", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
                if (isAdminField == null)
                {
                    LoggerInstance.Msg("Could not find isSpaceAdmin field.");
                    return;
                }

                // Set isSpaceAdmin = true on each UserData object
                foreach (var user in users)
                {
                    LoggerInstance.Msg($"UserData object: {user}");

                    foreach (var field in userType.GetFields(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic))
                    {
                        var value = field.GetValue(user);
                        string valueString = value == null ? "null" : value.ToString();
                        LoggerInstance.Msg($" - {field.Name}: {valueString}");
                    }

                    isAdminField.SetValue(user, true);
                    LoggerInstance.Msg("Set isSpaceAdmin = true on a user.");
                }


            }
            catch (System.Exception ex)
            {
                LoggerInstance.Error($"Error while setting isSpaceAdmin: {ex}");
            }
        }
    }
}