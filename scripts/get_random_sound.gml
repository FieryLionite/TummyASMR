///get_random_sound(group_name)
var max_index = Control.sound_indexes[? argument0]
var index, name;
do{
    index = round(random_range(1, max_index));
    name = argument0+string(index);
}until(!ds_map_exists(Control.excludes, name))
var sound = asset_get_index(name);
return sound;

