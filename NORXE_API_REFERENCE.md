# Norxe Unify JSON-RPC API Reference

## Enhanced Status Features - Correct API Method Names

Based on the official Norxe Unify JSON-RPC API documentation:

### Power State
- **Query**: `state.state.get` - Returns current operating state (0=Standby, 1=Warming, 2=On, 3=Cooling, 4=Boot, 5=Eco, 6=Low power, 7=Upgrade, 8=Error)
- **Set**: `state.on()` / `state.off()` / `state.toggle()` - Methods to control power
- **Notification**: `state.state` - Property notifications

### Cooling Timer
- **Query**: `state.coolingtimer.get` - Seconds counting down to end of cooling period (0-120)
- **Notification**: `state.coolingtimer` - Property notifications
- **Smart Display**: Only shows timer when projector is in cooling state (3) and time > 0

### Shutter Control
- **Query**: `lightsource.shutter.get` - Get shutter state (0=off, 1=on)
- **Set**: `lightsource.shutter.set` - Set shutter state
- **Toggle**: `lightsource.toggleshutter()` - Method to toggle shutter
- **Notification**: `lightsource.shutter` - Property notifications

### WPT (White Point Tracking)
- **Query**: `lightsource.brightness.wpt.get` - Get WPT enabled state
- **Set**: `lightsource.brightness.wpt.set` - Set WPT enabled state
- **Notification**: `lightsource.brightness.wpt` - Property notifications

### CLO (Constant Light Output)
- **Query**: `lightsource.brightness.clo.get` - Get CLO enabled state
- **Set**: `lightsource.brightness.clo.set` - Set CLO enabled state
- **Notification**: `lightsource.brightness.clo` - Property notifications

### CLO Scale/Dim Level
- **Query**: `lightsource.brightness.closcale.get` - Get CLO scale value
- **Set**: `lightsource.brightness.closcale.set` - Set CLO scale value
- **Notification**: `lightsource.brightness.closcale` - Property notifications

### IR LED Control
- **Query**: `lightsource.infrared.enable.get` - Get IR enabled state (0=off, 1=on)
- **Set**: `lightsource.infrared.enable.set` - Set IR enabled state
- **Notification**: `lightsource.infrared.enable` - Property notifications

### NVG (Night Vision) Power Control
- **Query**: `lightsource.infrared.power.get` - Get NVG power level (0-100)
- **Set**: `lightsource.infrared.power.set` - Set NVG power level
- **Notification**: `lightsource.infrared.power` - Property notifications

### Projector Serial Number
- **Query**: `id.serial.get` - Get projector serial number (string)
- **Notification**: `id.serial` - Property notifications (rarely changes)

### Working API Methods (Already Correct)
- `lightsource.brightness.level.get/set` - RGB power level
- `image.p7.desiredwhitegain.get/set` - White gain
- `image.p7.desiredredgain.get/set` - Red gain
- `image.p7.desiredgreengain.get/set` - Green gain
- `image.p7.desiredbluegain.get/set` - Blue gain
- `image.p7.desiredcyangain.get/set` - Cyan gain
- `image.p7.desiredmagentagain.get/set` - Magenta gain
- `image.p7.desiredyellowgain.get/set` - Yellow gain

## Notes
- NVG (Night Vision) is not directly available in the API - it's controlled through infrared settings
- All properties support `.get`, `.set`, `.connect`, and `.disconnect` verbs
- Methods are called directly without verbs
- Power control uses methods (`state.on()`, `state.off()`, `state.toggle()`) rather than property sets 