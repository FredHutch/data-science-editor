import { Grid } from "@mui/material"
import React, { useContext } from "react"
import { SRV_BOOTLOADER } from "../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import DeviceCard from "./devices/DeviceCard"
import useGridBreakpoints from "./useGridBreakpoints"
import useChange from "../jacdac/useChange"
import useDevices from "./hooks/useDevices"
import { FlashDeviceButton } from "./firmware/FlashDeviceButton"
import useDeviceFirmwareBlob from "./firmware/useDeviceFirmwareBlob"
import { isDualDeviceId } from "../../jacdac-ts/src/jdom/spec"

function UpdateDeviceCard(props: { device: JDDevice; autoStart?: boolean }) {
    const { device, autoStart } = props
    const blob = useDeviceFirmwareBlob(device)

    return (
        <DeviceCard
            device={device}
            showFirmware={true}
            // tslint:disable-next-line: react-this-binding-issue
            action={
                <FlashDeviceButton
                    device={device}
                    blob={blob}
                    autoStart={autoStart}
                />
            }
        />
    )
}

export default function UpdateDeviceList(props: { autoStart?: boolean }) {
    const { autoStart } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const gridBreakpoints = useGridBreakpoints(3)
    const safeBoot = useChange(bus, b => b.safeBoot)
    const devices = useDevices(
        {
            announced: true,
            ignoreInfrastructure: true,
            ignoreSimulators: true,
        },
        [safeBoot]
    )
        .filter(
            (dev, _, devs) =>
                safeBoot || // show all devices
                !dev.hasService(SRV_BOOTLOADER) || // show non-bootloader devices
                !devs.some(d => isDualDeviceId(d.deviceId, dev.deviceId)) // show bootloaders which don't have the application device listed
        )
        .sort(
            (l, r) => -(l.productIdentifier || 0) + (r.productIdentifier || 0)
        )

    return (
        <Grid container spacing={2}>
            {devices.map(device => (
                <Grid key={device.id} item {...gridBreakpoints}>
                    <UpdateDeviceCard device={device} autoStart={autoStart} />
                </Grid>
            ))}
        </Grid>
    )
}
