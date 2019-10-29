import React, { Component } from "react";
import { colors } from "../../../client/src/theme";
import { request } from "../../../client/src/utils/requestweb";

interface Props {
  list: any
  update: Function
}

interface State {

}

export class PortList extends React.Component<Props, State>  {
  state = { ports: [] };


  removeroute = route => {
    return event => {
      request.post("/api/v3/http/removeroute", { json: route }, (e, r, response) => {
        this.props.update();
      });
    };
  }




  render() {


    if (this.props.list) {
      if (this.props.list.length > 0) {

        return (
          <div style={{ background: "rgba(0,0,0,0.2)", padding: colors.padding, marginTop: colors.padding }}>

            <div style={{ display: "flex", flexDirection: "row", width: "100%", borderBottom: colors.borders }}>
              <div style={{ flex: "1", paddingLeft: 37 }}>ID</div>
              <div style={{ flex: "1", textAlign: "left" }}>METHOD</div>
              <div style={{ flex: "1", textAlign: "left" }}>ROUTE</div>
              <div style={{ flex: "1", textAlign: "right" }}>OPTIONS</div>
            </div>

            {this.props.list.map((route, i) => {
              //console.log(route);
              var background = (i % 2 == 1) ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0)"
              return (
                <div key={route.route} style={{ display: "flex", flexDirection: "row", width: "100%", background }}>

                  <div style={{ flex: "1", padding: "10px 0px 10px 10px", whiteSpace: "nowrap" }}>
                    <i style={{
                      color: "rgb(0, 222, 125)", paddingRight: 10,
                      paddingTop: 1,
                    }} className="fas fa-check-circle" />

                    {route.id}
                  </div>

                  <div style={{ flex: "1", padding: "10px 0px 10px 15px", textAlign: "left" }} >
                    {route.method}
                  </div>

                  <div style={{ flex: "1", padding: "10px 0px 10px 15px", textAlign: "left" }} >
                    <span>/plugin/http/</span>{route.route}
                  </div>

                  <div style={{ flex: "1", padding: 10, textAlign: "right" }} >


                    <div onClick={this.removeroute(route)} title={"Delete"}
                      style={{
                        paddingRight: 10,
                        paddingTop: 1,
                        opacity: 0.25,
                        cursor: "pointer",
                        float: "right"
                      }}
                    >
                      <i className="fas fa-trash-alt" />
                    </div>

                    {/* <div onClick={this.setApikey(port)} style={{
                        paddingRight: 10,
                        paddingTop: 1,
                        opacity: port.apikey ? 1.0 : 0.25,
                        cursor: "pointer",
                        float : "right"
                      }}><FontAwesomeIcon icon="user" />
                    </div> */}


                    {/* <div style={{float:"right",                        
                        paddingRight: 10,
                        paddingTop: 1}}>{port.connections}</div>*/}
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
