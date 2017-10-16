bluetooth.onBluetoothConnected(() => {
    basic.showString("C")
})
bluetooth.onBluetoothDisconnected(() => {
    basic.showString("D")
})
input.onButtonPressed(Button.A, () => {
    uartbluetooth.sendKeyValue("A")
})
input.onButtonPressed(Button.B, () => {
    uartbluetooth.sendKeyValue("B")
})
basic.forever(() => {
    uartbluetooth.handleIncomingUARTData()
})
namespace uartbluetooth {
    let terminator = "#";
    let handlers: LinkedKeyHandlerList = null;

    class LinkedKeyHandlerList {
        callback: (value: string) => void;
        next: LinkedKeyHandlerList
    }

    export function onMessageReceived(callback: (value: string) => void) {
        //two cases to handle here: 
        //1) we don't have any handlers yet, 
        //2) we are creating the first, or nth, handler for this key. we will allow multiple callbacks for the same key.
        //we can handle both of these scenarios by just pushing new elements to the start of the handlers list
        let newHandler = new LinkedKeyHandlerList()
        newHandler.callback = callback;
        newHandler.next = handlers;
        handlers = newHandler;
    }

    export function sendKeyValue(value: string) {
        bluetooth.uartWriteString(value + terminator)
    }

    export function handleIncomingUARTData() {
        let latestMessage = bluetooth.uartReadUntil(terminator)

        let value = latestMessage

        let handlerToExamine = handlers;

        if (handlerToExamine == null) { //empty handler list
            basic.showString("nohandler")
        }

        while (handlerToExamine != null) {
            handlerToExamine.callback(value)
            handlerToExamine = handlerToExamine.next
        }

    }
    bluetooth.startUartService();
}
uartbluetooth.onMessageReceived((value: string) => {
    basic.showString(value);
});
