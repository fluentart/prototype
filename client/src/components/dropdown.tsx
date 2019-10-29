import React from "react";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";
import { colors } from "../theme"
import { clone } from "../utils/lodash_alt";


interface MenuItems {
  /** show only icon on small screens */
  responsive?: boolean,
  text: string,
  icon?: string,
  onClick?: any,
  link?: string,
  menuitems?: MenuItems[]
  enabled?: boolean
}

interface Props {
  //account: User;
  enabled?: boolean
  icon?: string;
  text: string
  items: MenuItems[]
  style?: any;
  height?: number | string;
}

interface State {
  [index: string]: any;
}

/** Makes a dropdown menu component */

export class Dropdown extends React.Component<Props, State> {
  state = {
    mobileMenuActive: false,
    show: false,
    icon: "chevron-down",
    minWidth: 50 //this auto adjusts
  };

  wrapper;

  componentDidMount = () => {
    if (this.props.icon) {
      this.setState({ icon: this.props.icon })
    }
    this.wrapper = React.createRef();
  }


  componentDidUpdate() {
    /* detect width of button so dropdown menu items can use this width as a minimum*/
    if (this.wrapper) {
      if (this.wrapper.current) {
        var minWidth = this.wrapper.current.offsetWidth;
        this.setState((state) => {
          if (state.minWidth != minWidth) { return { minWidth }; }
        })
      }
    }
  }

  render() {

    var buttonstyle: any = { display: "inline-block", textAlign: "left" }
    var wrapperstyle: any = { display: "inline-block", textAlign: "left" }

    if (this.props.style) {
      buttonstyle = this.props.style
      wrapperstyle = clone(this.props.style);
    }

    var enabled = true; //default
    if (this.props.enabled != undefined) { enabled = this.props.enabled }

    var dropdownmenubuttonsstyle: any = { textAlign: "left" }

    if (buttonstyle.background) { dropdownmenubuttonsstyle.background = buttonstyle.background; }
    if (buttonstyle.color) { dropdownmenubuttonsstyle.color = buttonstyle.color }

    if (this.props.height) { dropdownmenubuttonsstyle.height = this.props.height }

    dropdownmenubuttonsstyle.minWidth = this.state.minWidth
    wrapperstyle.background = "none"
    wrapperstyle.width = "100%"

    return <div style={wrapperstyle} ref={this.wrapper}>

      {(enabled)
        ? <button style={buttonstyle} onClick={() => { this.setState({ show: !this.state.show }) }}>
          <i className={"fas fa-" + this.state.icon} /> {this.props.text}
        </button>
        : <button style={{ ...buttonstyle, ...{ opacity: 0.25 } }} onClick={() => { this.setState({ show: !this.state.show }) }} disabled>
          <i className={"fas fa-" + this.state.icon} /> {this.props.text}
        </button>
      }

      <div style={{
        display: (this.state.show) ? "flex" : "none",
        flexDirection: "column",
        position: "absolute",
        background: colors.panels,
        zIndex: 100
      }}>
        {this.props.items.map((item, i) => {
          var icon = (item.icon) ? item.icon : "caret-right";

          var buttonenabled = true; //default true
          if (item.enabled != undefined) { buttonenabled = item.enabled } //optional override

          if (buttonenabled) {
            return <button style={dropdownmenubuttonsstyle} key={i}
              onClick={() => {
                item.onClick();
                this.setState({ show: false }); //hides the dropdown when clicking a menu option
              }}>
              <div style={{ width: 20, textAlign: "center", float: "left", paddingRight: 5 }}>
                <i className={"fas fa-" + icon} /></div>
              {item.text}
            </button>
          } else {
            return <button style={{ ...dropdownmenubuttonsstyle, ...{ textAlign: "left", opacity: 0.5, cursor: "not-allowed" } }} key={i} disabled>
              <div style={{ width: 20, textAlign: "center", float: "left", paddingRight: 5 }}>
                <i className={"fas fa-" + icon} /></div>
              {item.text}
            </button>
          }


        })}
      </div>

    </div >
  }
}

