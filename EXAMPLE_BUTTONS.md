# Norxe Unify Companion Module - Example Button Configurations

## **Quick Start Guide**

This document provides example button configurations for common Norxe projector control scenarios.

## **Basic Power Control**

### **Projector Power Toggle**
- **Action**: `Projector Power - Toggle`
- **Button Text**: `Power: $(projector_power_status)`
- **Feedback**: `Projector Power - Status` (Power State: ON)
- **Style**: Red background when Active, Gray when Standby

### **Projector Power Set**
- **Action**: `Projector Power - Set`
- **Options**: Power State = ON
- **Button Text**: `Power ON`
- **Feedback**: `Projector Power - Status` (Power State: ON)

## **IR Remote Control**

### **IR Toggle**
- **Action**: `IR - Toggle`
- **Button Text**: `IR: $(ir_status)`
- **Feedback**: `IR - Status` (IR State: ON)
- **Style**: Gray background when ON, Dark gray when OFF

### **IR Set**
- **Action**: `IR - Set`
- **Options**: IR State = ON
- **Button Text**: `IR ON`

## **CLO Mode Control**

### **CLO Mode Toggle**
- **Action**: `CLO Mode - Toggle`
- **Button Text**: `CLO: $(clo_mode_status)`
- **Feedback**: `CLO Mode - Status` (CLO Mode State: ON)
- **Style**: Purple background when ON, Dark purple when OFF

### **CLO Mode Set**
- **Action**: `CLO Mode - Set`
- **Options**: CLO Mode State = ON
- **Button Text**: `CLO ON`

## **RGB Power Control**

### **RGB Power Set**
- **Action**: `RGB Power - Set Level`
- **Options**: Power Level = 50
- **Button Text**: `RGB: 50%`
- **Feedback**: `RGB Power - Level Check` (Condition: Equal, Power Level: 50)

### **RGB Power Increment**
- **Action**: `RGB Power - Increment (+)`
- **Options**: Increment Amount = 10
- **Button Text**: `RGB +10%`

### **RGB Power Decrement**
- **Action**: `RGB Power - Decrement (-)`
- **Options**: Decrement Amount = 10
- **Button Text**: `RGB -10%`

## **NVG Power Control**

### **NVG Power Set**
- **Action**: `NVG Power - Set Level`
- **Options**: Power Level = 75
- **Button Text**: `NVG: 75%`
- **Feedback**: `NVG Power - Level Check` (Condition: Equal, Power Level: 75)

### **NVG Power Increment**
- **Action**: `NVG Power - Increment (+)`
- **Options**: Increment Amount = 5
- **Button Text**: `NVG +5%`

## **Color Gain Controls**

### **White Gain Set**
- **Action**: `Desired White Gain - Set Level`
- **Options**: Gain Level = 0.500
- **Button Text**: `White: $(desired_white_gain)`
- **Feedback**: `Desired White Gain - Level Check` (Condition: Equal, Gain Level: 0.500)

### **Red Gain Increment**
- **Action**: `Desired Red Gain - Increment (+)`
- **Options**: Increment Amount = 0.010
- **Button Text**: `Red +0.01`

### **Green Gain Decrement**
- **Action**: `Desired Green Gain - Decrement (-)`
- **Options**: Decrement Amount = 0.010
- **Button Text**: `Green -0.01`

## **Measured Gain Controls**

### **Measured White Gain Set**
- **Action**: `Set Measured White Gain`
- **Options**: Gain = 0.5000
- **Button Text**: `Meas White: $(measured_white_gain)`

### **Measured Red Gain Increment**
- **Action**: `Measured Red Gain - Increment (+)`
- **Options**: Increment Amount = 0.0010
- **Button Text**: `Meas Red +0.001`

## **Information Display**

### **Serial Number Display**
- **Button Text**: `Serial: $(projector_serial_number)`
- **Style**: Information display (no action needed)

### **Status Summary**
- **Button Text**: `Power: $(projector_power_status) | IR: $(ir_status) | CLO: $(clo_mode_status)`
- **Style**: Status display (no action needed)

### **RGB Sum Display**
- **Button Text**: `RGB Sum: $(measured_rgb_sum)`
- **Style**: Information display (no action needed)

## **Advanced Button Examples**

### **Master Power Control**
- **Action**: `Projector Power - Toggle`
- **Button Text**: `MASTER POWER\n$(projector_power_status)`
- **Feedback**: `Projector Power - Status` (Power State: ON)
- **Style**: Large button, Red when Active, Gray when Standby

### **Quick Preset - Full Brightness**
- **Action**: `RGB Power - Set Level`
- **Options**: Power Level = 100
- **Button Text**: `FULL BRIGHT`
- **Feedback**: `RGB Power - Level Check` (Condition: Equal, Power Level: 100)
- **Style**: Green background when active

### **Quick Preset - Night Mode**
- **Action**: `RGB Power - Set Level`
- **Options**: Power Level = 25
- **Button Text**: `NIGHT MODE`
- **Feedback**: `RGB Power - Level Check` (Condition: Equal, Power Level: 25)
- **Style**: Blue background when active

### **Color Balance Reset**
- **Multiple Actions**:
  1. `Desired White Gain - Set Level` (Gain Level: 0.500)
  2. `Desired Red Gain - Set Level` (Gain Level: 0.500)
  3. `Desired Green Gain - Set Level` (Gain Level: 0.500)
  4. `Desired Blue Gain - Set Level` (Gain Level: 0.500)
- **Button Text**: `RESET COLORS`
- **Style**: Yellow background

## **Button Layout Suggestions**

### **Main Control Page**
```
[POWER] [IR] [CLO] [INFO]
[RGB +] [RGB -] [NVG +] [NVG -]
[WHITE] [RED] [GREEN] [BLUE]
[CYAN] [MAGENTA] [YELLOW] [RESET]
```

### **Advanced Control Page**
```
[MASTER] [NIGHT] [FULL] [BALANCE]
[MEAS WHITE] [MEAS RED] [MEAS GREEN] [MEAS BLUE]
[RGB SUM] [SERIAL] [STATUS] [CLO MODE]
[PRESET 1] [PRESET 2] [PRESET 3] [PRESET 4]
```

## **Variable Reference**

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

## **Tips for Success**

1. **Start Simple**: Begin with basic power controls
2. **Use Feedback**: Add visual feedback to confirm button states
3. **Test Incrementally**: Add one feature at a time
4. **Use Variables**: Display current values in button text
5. **Group Related Controls**: Organize buttons logically
6. **Backup Configurations**: Save your button layouts

## **Troubleshooting**

### **Common Issues**
- **Connection Failed**: Check IP address and network settings
- **No Response**: Verify projector is powered on and accessible
- **Wrong Values**: Check that the projector supports the requested features
- **Button Not Working**: Verify action is properly configured

### **Debug Information**
- Enable debug logging in module configuration
- Check Companion logs for error messages
- Verify JSON-RPC communication is working 