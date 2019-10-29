import React, { Component } from "react";

import { moment } from "../../../client/src/utils/momentalt"
import { PopupConfirm } from "../../../client/src/components/popups/popup_confirm";

import { GatewayType } from "../lib/iotnxtqueue"
import { colors } from "../../../client/src/theme";

//import { cellstyle, gridHeadingStyle, blockstyle } from "../../styles.jsx"

interface GatewayListProps {
  update: Function
  gateways: any
  action: (action: object, cb?: Function) => void
}

interface GatewayListState {
  /** Show the delete popup? */
  showDelete: boolean
  /** The gateway of concern for the delete popup */
  showDeleteGateway: GatewayType
  redraw: any
}

export class GatewayList extends React.Component<GatewayListProps, GatewayListState>{
  state = {
    showDelete: false,
    showDeleteGateway: undefined,
    redraw: 1
  };

  redraw;
  update;

  componentWillMount = () => {

  }

  componentDidUpdate = () => {

  }

  valueToggle(valuein, options) {
    for (var option of options) {
      if (valuein == option.value) {
        return option.result
      }
    }
  }

  removeGateway = gateway => {
    this.props.action({ delete: { gateway } })
  };

  componentWillUnmount() {
    clearInterval(this.redraw);
  }

  componentDidMount = () => {
    // trick to force redrawing for timestamp updates
    this.redraw = setInterval(() => {
      this.setState({ redraw: Math.random() })
    }, 1000)


  }

  renderDelete = (gateway) => {

    return <div>todo</div>

    // if (this.state.user) {
    //   return (
    //     <div
    //       className="deleteButton"
    //       onClick={this.removeGateway(gateway)}
    //       title={"Delete"}
    //       style={{
    //         float: "right",
    //         paddingRight: 10,
    //         paddingTop: 1,
    //         opacity: 0.25,
    //         cursor: "pointer"
    //       }}
    //     >
    //       <i className="fas fa-trash-alt"></i>
    //     </div>
    //   )
    // } else {
    //   return (<div />)
    // }

  }



  render() {

    const gridstyle = { borderBottom: "1px solid rgba(255,255,255,0.1)", paddingTop: 4, paddingBottom: 4 }
    var blockstyle: any = {
      border: "1px solid rgba(0,0,0,0.1)",
      background: "rgba(0,0,0,0.2)",
      margin: 0,
      padding: 20
    }

    var gridHeadingStyle: any = {
      borderBottom: "2px solid rgba(255,255,255,0.2)",
      display: "flex",
      flexDirection: "row"
    };

    if (this.props.gateways) {
      if (this.props.gateways.length > 0) {

        var gateways = [];

        gateways = this.props.gateways.sort((a: GatewayType, b: GatewayType) => {
          var at = new Date(a._created_on).getTime()
          var bt = new Date(b._created_on).getTime()
          return at > bt ? -1 : at < bt ? 1 : 0;
        })

        return (
          <div style={blockstyle} >

            {(this.state.showDelete) && <PopupConfirm
              message={"Are you sure you want to delete " + this.state.showDeleteGateway.GatewayId + "?"}
              onConfirm={() => {
                this.props.action({ deleteGateway: this.state.showDeleteGateway }, () => { });
                this.setState({ showDelete: false });
              }}
              onClose={() => { this.setState({ showDelete: false }) }}
            />}

            <div className="row" style={gridHeadingStyle}>

              <div style={{ flex: "1" }}>GatewayId</div>
              <div style={{ flex: "1" }}>ENV</div>
              <div style={{ flex: "1" }}>ACTIVITY</div>
              <div style={{ flex: "1" }}>CLUSTER</div>
              <div style={{ flex: "1" }}>OPTIONS</div>
            </div>

            {gateways.map((gateway: GatewayType, i) => {

              var background = (i % 2 == 1) ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0)"
              // var accountdefault = false;
              // if (this.state.accountgatewaydefault) {
              //   if (this.state.accountgatewaydefault.GatewayId && this.state.accountgatewaydefault.GatewayId) {
              //     if (this.state.accountgatewaydefault.GatewayId == gateway.GatewayId &&
              //       this.state.accountgatewaydefault.HostAddress == gateway.HostAddress) {
              //       accountdefault = true;
              //     }
              //   }
              // }


              if (gateway.lastactive == undefined) { gateway.lastactive = new Date("1970") }
              return (
                <div key={i} style={{ display: "flex", flexDirection: "row", background }} >
                  <div style={{ flex: 1, padding: colors.padding, whiteSpace: "nowrap" }}>

                    <div title={this.valueToggle(gateway.connected,
                      [{ value: true, result: "connected" },
                      { value: false, result: "not connected" },
                      { value: "error", result: gateway.error },
                      { value: "connecting", result: "connecting..." }])
                    }
                      style={{
                        float: "left",
                        paddingRight: 10,
                        paddingTop: 1,
                        opacity: 1,
                        cursor: "pointer",
                        //color: gateway.connected ? "rgb(0, 222, 125)" : "rgb(255, 57, 67)"
                        color: this.valueToggle(gateway.connected,
                          [{ value: true, result: "rgb(0, 222, 125)" },
                          { value: false, result: "#f4d701" },
                          { value: "error", result: "#ff284a" },
                          { value: "connecting", result: "rgb(255, 255, 255)" }])
                      }}
                    >
                      {this.valueToggle(gateway.connected, [
                        { value: true, result: <i className="fas fa-check-circle"></i> },
                        { value: false, result: <i className="fas fa-times-circle"></i> },
                        { value: "connecting", result: <i className="fas fa-circle-notch fa-spin"></i> },
                        { value: "error", result: <i className="fas fa-exclamation-circle"></i> },
                        { value: undefined, result: <i className="fas fa-question-circle"></i> }])}
                    </div>

                    {gateway.GatewayId}
                  </div>

                  {/* ENV */}
                  {(window.innerWidth > 800) && <div style={{ flex: 1, padding: colors.padding }}>
                    {gateway.HostAddress.split(".")[1].toUpperCase()}
                  </div>
                  }


                  {/* CONNECTED */}
                  <div style={{ flex: 1, padding: colors.padding }}>
                    <span title={gateway["lastactive"].toString()}>{moment(gateway["lastactive"]).fromNow()}</span>
                  </div>

                  {/* CLUSTER */}
                  {(window.innerWidth > 800) && <div style={{ flex: 1, padding: colors.padding }}>
                    {gateway.hostname} - {gateway.instance_id}
                  </div>}

                  <div style={{ flex: 1 }}>
                    <button onClick={() => { this.props.action({ reconnectGateway: gateway }) }}><i className="fas fa-sync-alt"></i></button>
                    <button onClick={() => { this.setState({ showDelete: true, showDeleteGateway: gateway }) }}><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              );
            }, this)}
          </div>
        );
      } else {
        return (
          <div style={{ textAlign: "center", opacity: 0.25 }}>
            No Gateways set
          </div>
        );
      }
    } else {
      return (
        <div style={{ textAlign: "center", opacity: 0.25 }}>Loading..</div>
      );
    }
  }
}
