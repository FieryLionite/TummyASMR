///scene_create(name, sprBG, sprWall, sprFG, doRain,scale, speed)
var scene = ds_map_create();
scene[? "name"] = argument0;
scene[? "sprBG"] = argument1;
scene[? "sprWall"] = argument2;
scene[? "sprFG"] = argument3;
scene[? "doRain"] = argument4;
scene[? "scale"] = argument5;
scene[? "speed"] = argument6;

ds_map_add_map(scenes, argument0, scene);

