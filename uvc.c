#include <stdio.h>
#include <libusb-1.0/libusb.h>

#define VENDOR_ID 0x0BD2 // Change to your camera's vendor ID
#define PRODUCT_ID 0x3035 // Change to your camera's product ID
#define INTERFACE 1 // The interface number might vary
#define BRIGHTNESS_CONTROL 0x02 // Control selector for brightness
#define REQUEST_TYPE_SET 0x21 // bmRequestType for setting feature unit control
#define REQUEST_TYPE_GET 0xA1 // bmRequestType for getting feature unit control
#define REQUEST 0x01 // bRequest for SET_CUR
#define W_VALUE_SET (BRIGHTNESS_CONTROL << 8) | 0x02 // wValue for setting brightness control
#define W_VALUE_GET (BRIGHTNESS_CONTROL << 8) | 0x82 // wValue for getting brightness control, change accordingly
#define W_INDEX 0x0200 // wIndex for the specific interface and entity ID, change as needed

int main() {
    libusb_context *ctx = NULL;
    libusb_device_handle *dev_handle;
    int r; // for return values
    int actual; // for actual bytes transmitted

    // Initialize libusb
    r = libusb_init(&ctx);
    if (r < 0) {
        fprintf(stderr, "Init Error\n");
        return 1;
    }
    libusb_set_option(ctx, LIBUSB_OPTION_LOG_LEVEL, LIBUSB_LOG_LEVEL_INFO);

    // Open a device with a given VID and PID
    dev_handle = libusb_open_device_with_vid_pid(ctx, VENDOR_ID, PRODUCT_ID);
    if (dev_handle == NULL) {
        fprintf(stderr, "Cannot open device\n");
        goto exit;
    }

    // Detach the kernel driver, required on Linux
    if (libusb_kernel_driver_active(dev_handle, INTERFACE) == 1) {
        libusb_detach_kernel_driver(dev_handle, INTERFACE);
    }

    // Claim the interface
    r = libusb_claim_interface(dev_handle, INTERFACE);
    if (r < 0) {
        fprintf(stderr, "Cannot Claim Interface\n");
        goto close_device;
    }

    // Attempt to set brightness value
    uint16_t brightness = 200; // Adjust as needed, for example setting to 200 out of 255
    r = libusb_control_transfer(dev_handle, REQUEST_TYPE_SET, REQUEST, W_VALUE_SET, W_INDEX,
                                (unsigned char*)&brightness, sizeof(brightness), 0);
    if (r < 0) {
        fprintf(stderr, "Error setting brightness\n");
    } else {
        printf("Brightness set successfully\n");
    }

    // Attempt to read back brightness value to confirm it was set
    uint16_t readBrightness;
    r = libusb_control_transfer(dev_handle, REQUEST_TYPE_GET, REQUEST, W_VALUE_GET, W_INDEX,
                                (unsigned char*)&readBrightness, sizeof(readBrightness), 0);
    if (r < 0) {
        fprintf(stderr, "Error reading brightness\n");
    } else {
        printf("Current brightness: %d\n", readBrightness);
    }

    // Release the interface and close device
    libusb_release_interface(dev_handle, INTERFACE);

close_device:
    libusb_close(dev_handle);

exit:
    libusb_exit(ctx);
    return 0;
}
