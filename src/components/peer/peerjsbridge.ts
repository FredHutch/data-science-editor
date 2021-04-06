// tslint:disable-next-line: no-submodule-imports match-default-export-name
import { CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import JDBridge from "../../../jacdac-ts/src/jdom/bridge"
import Peer, { DataConnection } from "peerjs"

export interface PeerConnection {
    label: string;
    close: () => void;
}

export default class PeerJSBridge extends JDBridge {
    private readonly _peer: Peer
    private _connections: DataConnection[] = []

    constructor() {
        super()

        this._peer = new Peer()
        this._peer.on("open", () => {
            this.log(`open`)
            this.emit(CHANGE)
        })
        this._peer.on("connection", this.addConnection.bind(this))
        this._peer.on("disconnected", () => {
            this.log(`disconnected`)
            this.bus = undefined;
        })
        this._peer.on("error", console.error)

        this.mount(() => {
            if (!this._peer.destroyed) {
                this._connections = []
                this._peer.destroy()
            }
        })
    }

    private addConnection(conn: DataConnection) {
        this.log(`connection`)
        this._connections.push(conn)
        conn.on("open", () => {
            this.log("open")
            this.emit(CHANGE)
        })
        conn.on("data", buf => {
            const data = new Uint8Array(buf)
            this.receivePacket(data)
        })
        conn.on("close", () => {
            const i = this._connections.indexOf(conn)
            if (i > -1) {
                this._connections.splice(i, 1)
                this.emit(CHANGE)
            }
        })
        conn.on("error", console.error)
        this.emit(CHANGE)
    }

    get connections(): PeerConnection[] {
        return this._connections;
    }

    protected sendPacket(data: Uint8Array) {
        this._connections
            .filter(conn => conn.open)
            .forEach(conn => conn.send(data))
    }

    get id() {
        return this._peer?.id
    }

    connect(id: string) {
        const conn = this._peer.connect(id)
        this.addConnection(conn)
    }
}
