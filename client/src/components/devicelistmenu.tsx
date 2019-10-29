import React from "react";
import { theme } from "../theme"
import { SortButton } from "./sortbutton"
import { clone } from "../utils/lodash_alt"
import { Dropdown } from "./dropdown"

interface MenuProps {
    action: Function;
    selection: any[]
}

interface MenuState { }

export type SortVal = 'none' | 'up' | 'down';

export interface MenuSort {
    selected: SortVal
    id: SortVal
    lastseen: SortVal
    alarm: SortVal
    warning: SortVal
    shared: SortVal
    public: SortVal
}

export class DeviceListMenu extends React.Component<MenuProps, MenuState> {

    state = {
        sort: {
            selected: 'none',
            id: 'none',
            lastseen: 'up',
            alarm: 'none',
            warning: 'none',
            shared: 'none',
            public: 'none'
        },
        search: "",
        selectall: true
    }

    constructor(props) {
        super(props);
    }

    changeSort = (prop) => {
        return (direction) => {
            var sort = clone(this.state.sort);
            //default others
            sort.selected = 'none'
            sort.id = 'none'
            sort.lastseen = 'none'
            sort.alarm = 'none'
            sort.warning = 'none'
            sort.shared = 'none'
            sort.public = 'none'

            //set this one
            sort[prop] = direction;
            this.setState({ sort }, () => { this.props.action({ sort }) })
        }
    }

    onSearchBoxChange = (event) => {
        var search = event.target.value.toLowerCase();
        this.setState({ search }, () => { this.props.action({ search }) })
    }

    render() {

        var hasSelection = (this.props.selection.length > 0) ? true : false

        return (
            <div>
                <div style={theme.global.menubars}>
                    <div style={{ display: "flex", flexDirection: "row" }}>

                        <div style={{ flex: "0 auto" }}>
                            <button onClick={() => { this.props.action({ add: true }) }}>
                                <i className="fas fa-plus" /> Add
                            </button>
                        </div>

                        <div style={{ flex: "" }}>
                            <button style={{ width: "135px" }} onClick={() => {
                                this.props.action({ selectall: this.state.selectall })
                                this.setState({ selectall: !this.state.selectall }); //toggle
                            }}>
                                {(this.state.selectall)
                                    ? <span><i className="fas fa-check-double" /> Select All</span>
                                    : <span><i className="fas fa-square" /> Select None</span>
                                }
                            </button>
                        </div>

                        <div style={{ flex: "0 auto" }}>
                            <Dropdown
                                enabled={hasSelection}
                                text='Modify'
                                items={[
                                    { enabled: hasSelection, icon: "th", text: 'Dashboard Preset', onClick: () => { this.props.action({ dashboardset: true }); } },
                                    { enabled: hasSelection, icon: "code", text: 'Code', onClick: () => { this.props.action({ scriptset: true }) } },
                                    { enabled: hasSelection, icon: "share-alt", text: 'Share', onClick: () => { this.props.action({ shareset: true }) } },
                                    { enabled: hasSelection, icon: "trash", text: 'Delete', onClick: () => { this.props.action({ removeselected: true }) } }
                                ]}
                            />
                        </div>

                        <div style={{ flex: "0 auto" }}>
                            {(hasSelection)
                                ? <button onClick={() => { this.props.action({ removeselected: true }) }}><i className="fas fa-trash" /> Delete</button>
                                : <button style={{ opacity: 0.25 }}><i className="fas fa-trash" /> Delete</button>
                            }

                        </div>

                    </div>
                </div>

                <div style={{
                    boxSizing: "border-box", background: theme.global.menubars.background, width: "100%", borderRight: "11px solid " + theme.global.menubars.background,
                    paddingBottom: "5px"
                }} >
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", marginRight: 35 }}>
                        <div style={theme.global.devicelist.columnleftsortselect}>
                            <SortButton onChangeSort={this.changeSort("selected")} value={this.state.sort.selected} />
                        </div>

                        <div style={theme.global.devicelist.menusortcollapse}>
                            <i style={{ paddingLeft: 0, paddingTop: 7 }} className="button fas fa-caret-up"></i>
                        </div>

                        <div style={theme.global.devicelist.columnleftsortselect}>
                            <div style={{ float: "left", paddingLeft: 0, width: theme.global.devicelist.columns.width }}>
                                <SortButton onChangeSort={this.changeSort("id")} value={this.state.sort.id} type="verticalalpha" />
                            </div>
                        </div>

                        <div style={{ flex: 0, width: 26 }}>
                            <i className="fas fa-filter" style={{ fontSize: "0.85em", opacity: 0.5, paddingLeft: 0, paddingTop: 14, paddingRight: 5 }} ></i>
                        </div>

                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                placeholder="filter"
                                style={{ width: "100%" }}
                                onChange={this.onSearchBoxChange}
                                value={this.state.search}
                            />
                        </div>

                        <div style={{ flex: 0, width: 27 }}>
                            <div style={{}}><SortButton onChangeSort={this.changeSort("lastseen")} value={this.state.sort.lastseen} /></div>
                        </div>
                        <div style={{ flex: 0, width: 27 }}>
                            <SortButton onChangeSort={this.changeSort("alarm")} value={this.state.sort.alarm} />
                        </div>
                        <div style={{ flex: 0, width: 27 }}>
                            <SortButton onChangeSort={this.changeSort("warning")} value={this.state.sort.warning} />
                        </div>
                        <div style={{ flex: 0, width: 27 }}>
                            <SortButton onChangeSort={this.changeSort("shared")} value={this.state.sort.shared} />
                        </div>
                        <div style={{ flex: 0, width: 27, marginRight: 5 }}>
                            <SortButton onChangeSort={this.changeSort("public")} value={this.state.sort.public} />
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}
