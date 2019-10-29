import React from "react";

import { api } from "../api"
import { CorePacket } from "../../../server/shared/interfaces";
import { theme, colors } from "../theme"
import { DeviceListItem } from "./devicelistitem"
import { DeviceListMenu } from "./devicelistmenu"

import { sortBy, clone, filter } from "../utils/lodash_alt"
import { logger } from "../../../server/shared/log"
import { PopupShare } from "./popups/popup_share";
import { PopupConfirm } from "./popups/popup_confirm";
import { PopupAddWizard } from "./popups/popup_addwizard";
import { Loading } from "./loading";

interface MyProps {
    username?: string;
}

interface MyState {
    sort: {
        selected: "none" | "up" | "down",
        id: "none" | "up" | "down",
        lastseen: "none" | "up" | "down",
        alarm: "none" | "up" | "down",
        warning: "none" | "up" | "down",
        shared: "none" | "up" | "down",
        public: "none" | "up" | "down"
    },
    search: string,
    filter: string,
    states: any,
    statesraw: any,
    sharedevicepopupvisible: boolean,
    deletedevicepopupvisible: boolean,
    addDeviceWizardPopupVisible: boolean,
    username: string,
    /** by default be start on loading screen */
    loading: boolean
    needToGetData: boolean
}

/** This component is the entire box containing add device, the modify menu, and the list of devices. */
export class DeviceList extends React.Component<MyProps, MyState> {
    state: MyState = {
        sort: {
            selected: "none",
            id: "none",
            lastseen: "up",
            alarm: "none",
            warning: "none",
            shared: "none",
            public: "none"
        },
        search: undefined,
        filter: "",
        states: [],
        statesraw: [],
        sharedevicepopupvisible: false,
        deletedevicepopupvisible: false,
        addDeviceWizardPopupVisible: false,
        username: undefined,
        loading: true,
        needToGetData: true
    }

    constructor(props) {
        super(props);
    }

    static getDerivedStateFromProps = (props, current_state) => {



        if (current_state.username !== props.username) {
            console.log("username changed from " + current_state.username + " to " + props.username)
            return {
                username: props.username,
                loading: true,
                needToGetData: true
            }
        }
        return null
    }

    componentDidUpdate = () => {
        console.log("deviceList", "this.componentDidUpdate")
        console.log("loading", this.state.loading);
        console.log("needToGetData", this.state.needToGetData);
        console.log("username", this.state.username);
        if (this.state.needToGetData) {
            this.getData();
        }
    }


    componentDidMount = () => {
        //console.log("deviceList", "this.componentDidMount")

        this.getData();
        //dynamic updates:
        api.on("states", this.stateUpdater)

        api.on("doupdate", () => {
            this.getData();
        })
    }

    getData = () => {
        logger.log({ message: "loading devicelist", data: this.props, level: "verbose" })
        if (this.props.username) {
            api.subscribe({ username: this.props.username });

            api.states({ username: this.props.username }, (err, states: CorePacket[]) => {
                if (err) console.error(err);
                if (states) {
                    logger.log({ message: "states return", data: { states }, level: "verbose" })
                    this.applySortFilter(states, () => {
                        this.setState({ loading: false, needToGetData: false })
                    });
                }
            })

        } else {
            // own account
            console.log("devicelist", "loading own data")
            api.states((err, states: CorePacket[]) => {
                if (states) {
                    this.applySortFilter(states, () => {
                        this.setState({ loading: false, needToGetData: false })
                    });
                }
            })
        }
    }

    componentWillUnmount = () => {
        api.removeListener("states", this.stateUpdater);
    }

    // listener callback
    stateUpdater = (states: CorePacket[]) => {
        this.applySortFilter(states);
    }

    applySortFilter = (states: CorePacket[], cb?: Function) => {
        // transfer select state
        for (var dev of this.state.states) {
            for (var dev2 of states) {
                if (dev2.key == dev.key) {
                    if (dev.selected) { dev2.selected = dev.selected }
                }
            }
        }

        // show current username devices
        var tempstates = clone(states);
        if (this.props.username) {
            tempstates = filter(tempstates, (dev) => {
                if (dev.username == undefined) return false;
                return (dev.username == this.props.username)
            })
        }

        // apply sorts
        if (this.state.sort) {
            if (this.state.sort.selected == "up") {
                tempstates = sortBy(tempstates, (d) => {
                    return d.selected
                }).reverse()
            }

            if (this.state.sort.selected == "down") {
                tempstates = sortBy(tempstates, (d) => {
                    return d.selected
                })
            }

            if (this.state.sort.id == "up") {
                tempstates = sortBy(tempstates, (a, b) => { return a > b })
            }

            if (this.state.sort.id == "down") {
                tempstates = sortBy(tempstates, (a, b) => { return a > b }).reverse()
            }

            if (this.state.sort.lastseen == "up") {
                tempstates = sortBy(tempstates, (a, b) => {
                    return new Date(b["_last_seen"]).getTime() - new Date(a["_last_seen"]).getTime();
                })
            }

            if (this.state.sort.lastseen == "down") {
                tempstates = sortBy(tempstates, (a, b) => {
                    return new Date(b["_last_seen"]).getTime() - new Date(a["_last_seen"]).getTime();
                }).reverse()
            }

            if (this.state.sort.alarm == "up") {
                tempstates = sortBy(tempstates, (d) => { return (d.alarm) ? 1 : -1 }).reverse()
            }

            if (this.state.sort.alarm == "down") {
                tempstates = sortBy(tempstates, (d) => { return (d.alarm) ? 1 : -1 })
            }

            if (this.state.sort.warning == "up") {
                tempstates = sortBy(tempstates, (d) => { return (d.warning) ? 1 : -1 }).reverse()
            }

            if (this.state.sort.warning == "down") {
                tempstates = sortBy(tempstates, (d) => { return (d.warning) ? 1 : -1 })
            }

            if (this.state.sort.shared == "up") {
                tempstates = sortBy(tempstates, (d) => { return (d.shared) ? 1 : -1 }).reverse()
            }

            if (this.state.sort.shared == "down") {
                tempstates = sortBy(tempstates, (d) => { return (d.shared) ? 1 : -1 })
            }

            if (this.state.sort.public == "up") {
                tempstates = sortBy(tempstates, (d) => { return (d.public) ? 1 : -1 }).reverse()
            }

            if (this.state.sort.public == "down") {
                tempstates = sortBy(tempstates, (d) => { return (d.public) ? 1 : -1 })
            }
        }

        // apply search
        if (this.state.search) {
            if (this.state.search != "") {
                tempstates = filter(tempstates, (dev) => {
                    if (dev.id.toLowerCase().indexOf(this.state.search) >= 0) { return true } else return false;
                })
            }
        }
        // var states: CorePacket[] = filter(clone(api.data.states), (dev: CorePacket) => {
        //     if (dev.id.indexOf("") >= 0) { return true } else return false
        // })
        this.setState({ states: tempstates }, () => { if (cb) cb(); });
    }



    // handles clicks on devices in the list.. like for selecting/deselecting
    handleAction_deviceListItems = (device) => {
        return (action) => {
            if (action.select != undefined) {
                var states = clone(this.state.states)
                for (var dev in states) {
                    if (states[dev].key == device.key) {
                        states[dev].selected = action.select;
                    }
                }
                this.setState({ states })
            }
        }
    }

    /**
     * Handles actions coming from the menu.
     */
    handleAction_deviceListMenu = (action) => {
        console.log("ACTION", action);
        if (action.selectall != undefined) {
            console.log("selectall")
            var states = clone(this.state.states)
            for (var device of states) {
                device.selected = action.selectall;
            }
            this.setState({ states })
        }

        if (action.removeselected) {
            this.setState({ deletedevicepopupvisible: true })
        }

        if (action.sort) {
            this.setState({ sort: action.sort }, () => {
                this.applySortFilter(clone(api.data.states));
            })
        }

        if (action.search != undefined) {
            this.setState({ search: action.search.trim() }, () => {
                this.applySortFilter(clone(api.data.states));
            })
        }


        if (action.shareset) {
            this.setState({ sharedevicepopupvisible: true });
        }

        // pressed the add button
        if (action.add) {
            this.setState({ addDeviceWizardPopupVisible: true });   // then we show the popup
        }

    }

    deletePopupConfirm = () => {
        var states = clone(this.state.states)
        for (var device of states) {
            if (device.selected) {
                this.deleteItem(device)
            }
        }
    }

    deleteItem = (device) => {
        console.log("removing id:" + device.id);
        api.delete(device, (err, result) => {
            if (err) { console.log(err); }
            if (result) {
                console.log(result);
                if (result.n == 1) {
                    console.log("success")
                    var states = clone(this.state.states);
                    states = states.filter((dev) => (dev.id != device.id))
                    this.setState({ states })
                }
            }
        })
    }

    render() {

        if (this.state.loading) {
            return <Loading />
        }

        return (
            <div style={{
                background: colors.panels,
                width: "100%",
                height: "100%", overflow: "hidden", display: "flex", flexDirection: "column"
            }} >

                <div style={theme.global.menubars}>
                    <DeviceListMenu
                        action={this.handleAction_deviceListMenu}
                        selection={this.state.states.filter((s) => { if (s.selected) return s })} />

                    {(this.state.sharedevicepopupvisible)
                        ? <PopupShare
                            devices={this.state.states.filter((s) => { if (s.selected) return s })}
                            onClose={() => { this.setState({ sharedevicepopupvisible: false }) }} />
                        : ""}

                    {(this.state.deletedevicepopupvisible)
                        ? <PopupConfirm
                            message={"Are you sure to delete " + this.state.states.filter((s) => { if (s.selected) return s }).length + " devices?"}
                            onConfirm={() => {
                                this.deletePopupConfirm();
                                this.setState({ deletedevicepopupvisible: false })
                            }}
                            onClose={() => { this.setState({ deletedevicepopupvisible: false }) }} />
                        : ""}

                    {(this.state.addDeviceWizardPopupVisible) ? <PopupAddWizard onClose={() => { this.setState({ addDeviceWizardPopupVisible: false }) }} /> : ""}

                </div>

                <div style={{ overflowX: "hidden", width: "100%", flex: 1, overflowY: "scroll" }}>
                    {(this.state.states) ? (<div>

                        {this.state.states.map(
                            (value: CorePacket, index, array) => {
                                return (
                                    <DeviceListItem device={value} key={index} action={this.handleAction_deviceListItems(value)} />
                                )
                            }
                        )}

                    </div>) : (<div>loading</div>)}
                </div>
            </div>
        )
    }
}