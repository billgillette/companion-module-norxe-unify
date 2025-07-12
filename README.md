# Norxe Unify Companion Module

A comprehensive Bitfocus Companion module for controlling Norxe Unify projectors via JSON-RPC.

## **Features**

### **Power Control**
- ✅ Projector power ON/OFF with status tracking
- ✅ RGB power level control (0-100%)
- ✅ NVG (Night Vision) power level control (0-100%)
- ✅ Real-time status feedback

### **Status Tracking**
- ✅ IR remote control ON/OFF
- ✅ CLO (Constant Light Output) mode ON/OFF
- ✅ Projector serial number display
- ✅ Visual feedback for all status states

### **Color Gain Control**
- ✅ Desired gain control for all colors (White, Red, Green, Blue, Cyan, Magenta, Yellow)
- ✅ Measured gain tracking and control
- ✅ RGB sum calculation
- ✅ Precise gain adjustment (0.000-1.000)

### **Advanced Features**
- ✅ Debounced controls for smooth operation
- ✅ Automatic reconnection on network issues
- ✅ Config persistence across restarts
- ✅ Comprehensive error handling
- ✅ Real-time variable updates

## **Installation**

1. **Download the module** to your Companion modules directory
2. **Restart Companion** to load the new module
3. **Add a new instance** of "Norxe Unify" in Companion
4. **Configure** the projector IP address and port (default: 49374)
5. **Enable network control** in the module configuration

## **Configuration**

### **Required Settings**
- **Device IP Address**: IP address of your Norxe projector
- **JSON-RPC Port**: TCP port (default: 49374)
- **Enable Network Control**: Must be enabled for actual device control

### **Optional Settings**
- **Debounce Delay**: Delay for smooth control (default: 100ms)
- **Enable Debug Logging**: For troubleshooting

## **Quick Start**

### **1. Basic Power Control**
Create a button with:
- **Action**: `Projector Power - Toggle`
- **Button Text**: `Power: $(projector_power_status)`
- **Feedback**: `Projector Power - Status`

### **2. RGB Power Control**
Create buttons with:
- **Action**: `RGB Power - Set Level`
- **Options**: Power Level = 50
- **Button Text**: `RGB: $(rgb_power)%`

### **3. Status Display**
Create an information button with:
- **Button Text**: `Serial: $(projector_serial_number)`

## **Available Actions**

### **Power Control**
- `Projector Power - Toggle` - Toggle projector ON/OFF
- `Projector Power - Set` - Set specific power state
- `RGB Power - Set Level` - Set RGB power (0-100%)
- `RGB Power - Increment (+)` - Increase RGB power
- `RGB Power - Decrement (-)` - Decrease RGB power
- `NVG Power - Set Level` - Set NVG power (0-100%)
- `NVG Power - Increment (+)` - Increase NVG power
- `NVG Power - Decrement (-)` - Decrease NVG power

### **Status Control**
- `IR - Toggle` - Toggle IR remote control
- `IR - Set` - Set IR state
- `CLO Mode - Toggle` - Toggle CLO mode
- `CLO Mode - Set` - Set CLO mode state

### **Color Gain Control**
- `Desired [Color] Gain - Set Level` - Set specific gain
- `Desired [Color] Gain - Increment (+)` - Increase gain
- `Desired [Color] Gain - Decrement (-)` - Decrease gain
- `Set Measured [Color] Gain` - Set measured gain
- `Measured [Color] Gain - Increment (+)` - Increase measured gain
- `Measured [Color] Gain - Decrement (-)` - Decrease measured gain

## **Available Variables**

### **Status Variables**
- `$(projector_power_status)` - "Active" or "Standby"
- `$(ir_status)` - "ON" or "OFF"
- `$(clo_mode_status)` - "ON" or "OFF"

### **Power Variables**
- `$(rgb_power)` - RGB power level (0-100)
- `$(nvg_power)` - NVG power level (0-100)

### **Gain Variables**
- `$(desired_white_gain)` - White gain (0.000-1.000)
- `$(desired_red_gain)` - Red gain (0.000-1.000)
- `$(desired_green_gain)` - Green gain (0.000-1.000)
- `$(desired_blue_gain)` - Blue gain (0.000-1.000)
- `$(desired_cyan_gain)` - Cyan gain (0.000-1.000)
- `$(desired_magenta_gain)` - Magenta gain (0.000-1.000)
- `$(desired_yellow_gain)` - Yellow gain (0.000-1.000)

### **Measured Gain Variables**
- `$(measured_white_gain)` - Measured white gain (0.0000-1.0000)
- `$(measured_red_gain)` - Measured red gain (0.0000-1.0000)
- `$(measured_green_gain)` - Measured green gain (0.0000-1.0000)
- `$(measured_blue_gain)` - Measured blue gain (0.0000-1.0000)
- `$(measured_rgb_sum)` - Sum of measured RGB gains

### **Information Variables**
- `$(projector_serial_number)` - Projector serial number
- `$(projector_firmware_version)` - Projector firmware version
- `$(total_lamp_on_time_hours)` - Total lamp on time in hours (rounded)
- `$(module_version)` - Module version number

## **Available Feedback**

### **Power Feedback**
- `RGB Power - Level Check` - Check RGB power level
- `RGB Power - Range Check` - Check if RGB power is in range
- `NVG Power - Level Check` - Check NVG power level
- `Projector Power - Status` - Check projector power state

### **Status Feedback**
- `IR - Status` - Check IR state
- `CLO Mode - Status` - Check CLO mode state

### **Gain Feedback**
- `Desired [Color] Gain - Level Check` - Check gain levels
- `Measured [Color] Gain - Level Check` - Check measured gain levels

## **Example Button Configurations**

See `EXAMPLE_BUTTONS.md` for detailed button configuration examples.

## **Troubleshooting**

### **Connection Issues**
1. **Check IP Address**: Verify the projector IP is correct
2. **Check Network**: Ensure Companion can reach the projector
3. **Check Port**: Default port is 49374
4. **Enable Network Control**: Must be enabled in configuration

### **No Response**
1. **Power Status**: Ensure projector is powered on
2. **Network Access**: Check firewall settings
3. **JSON-RPC**: Verify JSON-RPC is enabled on projector
4. **Debug Logging**: Enable debug logging to see communication

### **Wrong Values**
1. **API Compatibility**: Check projector firmware version
2. **Feature Support**: Verify projector supports requested features
3. **Response Parsing**: Check debug logs for response format

### **Button Issues**
1. **Action Configuration**: Verify action is properly configured
2. **Feedback Setup**: Ensure feedback is correctly configured
3. **Variable Syntax**: Check variable syntax in button text

## **Technical Details**

### **JSON-RPC Methods Used**
- `id.serial.get` - Get projector serial number
- `version.version.get` - Get projector firmware version
- `statistics.totalontime.count.get` - Get total lamp on time in seconds
- `state.on` / `state.off` - Power control
- `state.state.get` - Get power status
- `lightsource.brightness.level.set/get` - RGB power control
- `lightsource.infrared.power.set/get` - NVG power control
- `remotecontrol.irfront.set/get` - IR front control
- `remotecontrol.irrear.set/get` - IR rear control
- `lightsource.brightness.clo.set/get` - CLO mode control
- `image.p7.desired[color]gain.set/get` - Desired gain control
- `image.p7.measured[color]gain.set/get` - Measured gain control

### **Network Protocol**
- **Protocol**: TCP/IP
- **Port**: 49374 (default)
- **Format**: JSON-RPC 2.0
- **Separator**: Newline between messages

### **Error Handling**
- **Automatic Reconnection**: 5-second retry on connection loss
- **Debounced Controls**: Prevents rapid-fire commands
- **Error Logging**: Comprehensive error reporting
- **Graceful Degradation**: Continues operation on partial failures

## **Version History**

### **v1.9.1** (Current)
- ✅ Added projector power, IR, and CLO status tracking
- ✅ Added serial number variable
- ✅ Fixed API method calls using official documentation
- ✅ Enhanced error handling and logging
- ✅ Improved response parsing
- ✅ Added comprehensive documentation

### **v1.9.0**
- ✅ Added measured gain controls
- ✅ Enhanced RGB and NVG power controls
- ✅ Improved debouncing and error handling
- ✅ Added comprehensive feedback system

### **v1.8.0**
- ✅ Initial release with basic RGB power control
- ✅ Color gain controls
- ✅ Network communication framework

## **Support**

For issues or questions:
1. **Check Debug Logs**: Enable debug logging in configuration
2. **Review Documentation**: See example configurations
3. **Test Connectivity**: Verify network communication
4. **Check API Compatibility**: Ensure projector supports features

## **License**

This module is provided as-is for use with Bitfocus Companion and Norxe Unify projectors.
