if (Control.clear_screen > 0 ||
    !setting_get_toggled("Powersave Mode") || 
    (setting_get_toggled("Powersave Mode") && Control.draw_counter % 30 == 0))
    return true;
    
return false;
