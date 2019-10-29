import React from "react";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";
import "../prototype.scss";
import { User } from "../../../server/shared/interfaces";
import { theme, colors } from "../theme";
import { api } from "../api";
import { SearchBox } from "./searchbox";

import { Menu, MenuItems } from "../components/menu"

interface MyProps {
  //account: User;
  onlyLogo?: boolean
}

interface MyState {
  [index: string]: any;
}

export class NavBar extends React.Component<MyProps, MyState> {
  state = {
    mobileMenuActive: false
  };

  mobileMenuPress = () => {
    this.setState({ mobileMenuActive: !this.state.mobileMenuActive });
  };

  render() {
    var size = "large";
    if (window.innerWidth < 800) {
      size = "small";
    }

    // LOGGED IN USERS:
    if (api.data.account) {
      const menuitemsLogged = [
        { text: "Notifications", path: "/notifications", icon: "bell" },
        { text: "Settings", path: "/settings", icon: "cog" },
        {
          text: api.data.account.username,
          path: "/settings/account",
          icon: "user-circle"
        }
      ];

      return (
        <div style={{ background: colors.panels, padding: colors.padding, zIndex: 100 }}>
          <NavLink id="topnavhome" exact activeClassName="active" to="/">
            <div style={{ float: "left", padding: theme.paddings.default }}>
              <img
                src="/icon.png"
                alt=""
                width="23"
                height="23"
                style={{ float: "left" }}
              />

              <div style={{ paddingLeft: 5, paddingTop: 2, float: "left" }}>
                <span className="navHeading">PR0T0TYP3</span>
              </div>
            </div>
          </NavLink>


          <SearchBox />

          {menuitemsLogged.map((menuitem, i, arr) => {
            if (size == "small") {
              return (
                <NavLink
                  key={i}
                  activeClassName="active"
                  to={menuitem.path}
                  style={theme.global.navlinksmall}
                >
                  <i className={"fa fa-" + menuitem.icon}></i>
                </NavLink>
              );
            } else {
              return (
                <NavLink
                  key={i}
                  activeClassName="active"
                  to={menuitem.path}
                  style={theme.global.navlinklarge}
                >
                  <i className={"fa fa-" + menuitem.icon}></i> {menuitem.text}
                </NavLink>
              );
            }
          })}




          <div style={{ clear: "both" }}></div>
        </div>
      );
    }

    //////////////////////////////////////////////////////////////////

    //VISTORS:
    if (api.data.account == undefined) {
      // var menuitemsVisitor = [
      //   { text: "Company", path: "https://www.iotnxt.com", icon: "" },
      //   { text: "Code", path: "https://github.com/IoT-nxt/prototype", icon: "" },
      //   { text: "Pricing", path: "/pricing", icon: "" },
      //   { text: "Log in", path: "/login", icon: "" },
      //   {
      //     text: "Register",
      //     path: "/register",
      //     icon: "",
      //     style: { background: colors.spotA }
      //   }
      // ];

      var menuitems: MenuItems[] = [
        { text: "Log in", link: "/login", icon: "key" },
        {
          text: "Get Started",
          link: "/register",
          icon: "user-plus",
          style: { background: colors.good }
        }
      ]


      return (
        <div>
          <div style={{
            zIndex: 10,
            width: "100%",
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            flexDirection: "row",
            padding: colors.padding * 2

          }}>

            <div style={{ flex: "1" }}>
              <NavLink id="topnavhome" exact activeClassName="active" to="/">
                <div style={{ float: "left" }}>
                  <img
                    src="/icon.png"
                    alt=""
                    width="23"
                    height="23"
                    style={{ float: "left" }}
                  />

                  <div style={{ paddingLeft: 5, paddingTop: 2, float: "left" }}>
                    <span className="navHeading">PR0T0TYP3</span>
                  </div>
                </div>
              </NavLink>
            </div>


            {(this.props.onlyLogo) ? "" :

              <div style={{ flex: "0", paddingRight: 50 }} >
                <Menu config={{ menuitems }} />
              </div>
            }

            {/* {menuitemsVisitor.map((menuitem, i, arr) => {
              if (size == "small") {
                return (
                  <div style={{ flex: "1" }}>
                    <NavLink key={i} activeClassName="active" to={menuitem.path}>
                      <i className={"fa fa-" + menuitem.icon}></i>
                    </NavLink>
                  </div>
                );
              } else {
                return (
                  <div style={{ flex: "1" }}>
                    <NavLink key={i} activeClassName="active" to={menuitem.path}>
                      <i className={"fa fa-" + menuitem.icon}></i>
                      {menuitem.text}
                    </NavLink>
                  </div>
                );
              }
            })} */}

            {/* <a className="icon" onClick={this.mobileMenuPress}>
              <i className="fa fa-bars" />
            </a> */}
          </div>

        </div>
      );
    }
  }
}
