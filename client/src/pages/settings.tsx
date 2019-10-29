import React, { Component, Suspense } from "react";

import { colors } from "../theme"

import { Menu } from "../components/menu"
import { Account } from "./settings/account";

import * as plugins from '../../../plugins/plugins_list_ui'

import { MenuVertical } from "../components/menu_vertical"
import { api } from "../api";

interface MyProps {
    page?: string
}

interface MyState {
    //[index: string]: any
}
export class Settings extends React.Component<MyProps, MyState> {
    state = {
        showMobileMenu: false
    };

    showpage(page) {

        if ((page == "account") || (page == undefined)) {
            return <Account />
        }

        var PluginToRender = plugins[page]

        return <PluginToRender />
    }

    render() {


        /** build the ADMIN menuitems list */
        var adminMenuItems = []
        if (api.data.account.admin) {
            for (var pluginName of Object.keys(plugins).sort()) {
                let test = new plugins[pluginName]
                if (test.admin) { adminMenuItems.push({ text: pluginName.toUpperCase(), link: "/settings/" + pluginName, icon: "shield-alt" }) }
            }
        }

        /** build the plugins menuitems list */
        var pluginsMenuItems = []
        for (var pluginName of Object.keys(plugins).sort()) {
            let test = new plugins[pluginName]
            if (!test.admin) pluginsMenuItems.push({ text: pluginName.toUpperCase(), link: "/settings/" + pluginName, icon: "cog" })
        }

        var settingsMenuItems = []
        settingsMenuItems.push({ text: "ACCOUNT", link: "/settings/account", icon: "user-circle" })


        var completemenuitems = []
        completemenuitems = completemenuitems.concat(adminMenuItems, settingsMenuItems, pluginsMenuItems)

        var size = (window.innerWidth < 800) ? "small" : "large"

        var showmenu = (window.innerWidth < 800) ? false : true

        if (this.state.showMobileMenu) { showmenu = true; }

        var settingsStyle: any = (window.innerWidth < 800)
            ? { padding: 0, display: "flex", flexDirection: "column" }
            : { padding: colors.padding * 2, display: "flex", flexDirection: "row" }

        var menuStyle: any = (window.innerWidth < 800)
            ? { width: "100%", margin: 0, padding: colors.padding * 2 }
            : { background: "rgba(0,0,0,0.1)", width: 300, margin: colors.padding, padding: colors.padding * 2, }


        /** this shows the menu on small screens by default on /settings url (no sub page) */
        if (size == "small") {
            if (this.props.page == undefined) {
                showmenu = true;
            }
        }

        var showContent = true;
        /** this hides content on small screens if menu is active */
        if (size == "small") {
            if (showmenu) {
                showContent = false;
            }
        }

        return (
            <div className="apiInfo" style={settingsStyle} >

                {(showmenu)
                    ? <div style={menuStyle}><MenuVertical
                        active={this.props.page}
                        menuitems={completemenuitems}
                        onClick={() => { this.setState({ showMobileMenu: false }) }} /></div>
                    : < button
                        style={{ whiteSpace: "nowrap" }}
                        onClick={() => { this.setState({ showMobileMenu: true }) }}>
                        <i className="fas fa-list-ul"></i> SHOW MENU</button>
                }


                {
                    (showContent)
                        ? <div style={{ background: "rgba(0,0,0,0.1)", flex: "1", margin: colors.padding, padding: colors.padding * 2, }}>
                            <h2 style={{ textTransform: "uppercase" }}>{this.props.page}</h2>
                            {this.showpage(this.props.page)}</div>
                        : ""
                }


            </div >
        );
    }
}

