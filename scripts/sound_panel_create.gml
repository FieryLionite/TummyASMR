///sound_panel_create(name, nameidx, groupid, enable_freq, vol, freq, num_sounds)
var panel = instance_create(0,75, SoundPanel);
panel.soundid = argument0;
audio_group_names[? argument0] = argument1;
panel.group = argument2;
panel.enable_freq = argument3;
panel.vol = argument4;
panel.freq = argument5;
sound_indexes[? argument0] = argument6;

var groupid = audio_group_get_index(argument0);
audio_group_load(groupid);
audio_group_set_gain(groupid, argument4, 0);

btGroup_create(argument0, argument2);
//show_message("loading " + argument0 + " " + string(audio_group_get_index(argument0)));
return panel;
