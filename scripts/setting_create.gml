///setting_create(name, doToggle, toggled)
var setting = ds_map_create();
setting[? "name"] = argument0;
setting[? "doToggle"] = argument1;
setting[? "toggled"] = argument2;

ds_map_add_map(Control.settings, argument0, setting);
return setting;
