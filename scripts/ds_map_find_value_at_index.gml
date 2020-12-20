///ds_map_find_index(id, idx)
var map = argument0,
    idx = argument1;
    
var key = ds_map_find_first(map);
for (var p=0; p < ds_map_size(map); p++){
    if (p == idx)
        return map[? key];    

    key = ds_map_find_next(map, key);
}
