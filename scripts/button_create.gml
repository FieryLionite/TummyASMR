///button_create(name, doToggle, toggle, isLabel)
var panel = instance_create(0,75, Button);
panel.name = argument0;
panel.doToggle = argument1;
panel.toggled = argument2;
panel.isLabel = argument3;
if (panel.doToggle)
    setting_create(panel.name, panel.doToggle, panel.toggled);
return panel;
