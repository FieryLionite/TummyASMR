///sound_create(name, enable_freq, vol, freq)
var sound = ds_map_create();
sound[? "name"] = argument0;
sound[? "vol"] = argument2;
sound[? "freq"] = argument3;
sound[? "enable_freq"] = argument1;
ds_map_add_map(Control.sounds, argument0, sound)
return sound;
