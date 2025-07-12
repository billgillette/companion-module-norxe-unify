# Norxe Unify Module for Companion

## Overview
This module provides comprehensive control over Norxe Unify projectors, including RGB power, NVG power, and color gain controls. It supports both desired and measured gain values, with real-time feedback and smooth control.

## Features
- RGB Power Control (0-100%)
- NVG Power Control (0-100%)
- Color Gain Control (0.000-1.000)
  - White, Red, Green, Blue
  - Cyan, Magenta, Yellow
- Measured Gain Monitoring
- Real-time Feedback
- Smooth Control with Configurable Debouncing

## Installation
1. Download the module
2. Place it in your Companion modules directory
3. Restart Companion
4. Add a new instance of the Norxe Unify module

## Configuration
### Network Settings
- **Device IP Address**: IP address of your Norxe Unify device
- **JSON-RPC Port**: TCP port for JSON-RPC communication (default: 49374)
- **Enable Network Control**: Toggle network control on/off

### Performance Settings
- **Debounce Delay**: Delay for smooth control (0-1000ms, default: 100ms)
  - 0 = no debounce (immediate response)
  - Higher values = smoother but slower response
  - NVG power uses faster response (max 50ms)
- **Enable Debug Logging**: Toggle detailed logging for troubleshooting

## Actions
### RGB Power
- **RGB Power - Set Level**: Set RGB power to specific level (0-100%)
- **RGB Power - Increment (+)**: Increase RGB power by specified amount
- **RGB Power - Decrement (-)**: Decrease RGB power by specified amount

### NVG Power
- **NVG Power - Set Level**: Set NVG power to specific level (0-100%)
- **NVG Power - Increment (+)**: Increase NVG power by specified amount
- **NVG Power - Decrement (-)**: Decrease NVG power by specified amount

### Color Gains
- **Desired [Color] Gain - Set Level**: Set specific color gain (0.000-1.000)
- **Desired [Color] Gain - Increment (+)**: Increase gain by specified amount
- **Desired [Color] Gain - Decrement (-)**: Decrease gain by specified amount

## Feedbacks
### Power Levels
- **RGB Power**: Feedback based on current RGB power level
- **NVG Power**: Feedback based on current NVG power level
- **NVG Power Range**: Feedback based on NVG power range

### Color Gains
- **Desired [Color] Gain**: Feedback based on current desired gain
- **Measured [Color] Gain**: Feedback based on current measured gain

## Variables
### Power Levels
- `$(norxe_unify:rgb_power)`: Current RGB power level
- `$(norxe_unify:nvg_power)`: Current NVG power level

### Desired Gains
- `$(norxe_unify:desired_white_gain)`: Current desired white gain
- `$(norxe_unify:desired_red_gain)`: Current desired red gain
- `$(norxe_unify:desired_green_gain)`: Current desired green gain
- `$(norxe_unify:desired_blue_gain)`: Current desired blue gain
- `$(norxe_unify:desired_cyan_gain)`: Current desired cyan gain
- `$(norxe_unify:desired_magenta_gain)`: Current desired magenta gain
- `$(norxe_unify:desired_yellow_gain)`: Current desired yellow gain

### Measured Gains
- `$(norxe_unify:measured_white_gain)`: Current measured white gain
- `$(norxe_unify:measured_red_gain)`: Current measured red gain
- `$(norxe_unify:measured_green_gain)`: Current measured green gain
- `$(norxe_unify:measured_blue_gain)`: Current measured blue gain
- `$(norxe_unify:measured_rgb_sum)`: Sum of measured RGB gains

## Presets
### RGB Power
- Power Display
- Power UP (+1)
- Power DOWN (-1)
- Common power levels (0%, 25%, 50%, 75%, 100%)

### NVG Power
- Power Display
- Power UP (+1)
- Power DOWN (-1)
- Common power levels (0%, 25%, 50%, 75%, 100%)

### Color Gains
- Gain Display
- Gain UP (+0.010)
- Gain DOWN (-0.010)
- Common gain levels (0.000, 0.250, 0.500, 0.750, 1.000)

## Troubleshooting
1. **No Connection**
   - Verify IP address and port
   - Check network connectivity
   - Enable debug logging for details

2. **Commands Not Working**
   - Check if network control is enabled
   - Verify device is responding
   - Check debug logs for errors

3. **Slow Response**
   - Adjust debounce delay
   - Consider using non-debounced actions
   - Check network latency

## Version History
- v1.9.1: Fixed power control and debouncing
  - Improved RGB and NVG power control
  - Added proper error handling
  - Fixed feedback mechanisms
  - Added comprehensive presets

## Support
For issues and feature requests, please contact the module developer.

## License
This module is licensed under the MIT License. 