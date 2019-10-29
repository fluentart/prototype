import React, { Component } from "react";
import { WidgetComponent } from "./widgetcomponent";
import { api } from "../../../api";
import { colors, opacity } from "../../../theme";

//import { Line } from 'react-chartjs-2';
import {
  AreaChart,
  AreaSeries,
  Area,
  Stripes,
  Gradient,
  GradientStop,
  Line,
  LinearAxis,
  LinearAxisLine,
  LinearAxisTickSeries,
  LinearYAxis
} from "reaviz";

import { objectByString } from "../../../../../server/shared/shared";
import { moment } from "../../../utils/momentalt";

export default class WidgetCanvas extends WidgetComponent {
  state = {
    options: {
      color: { type: "color", default: colors.widgetDefault, value: "" }
    },
    gettingdata: false,
    data: [],
    loading: true
  };

  componentDidMount() {
    if (!this.state.gettingdata) {
      this.state.gettingdata = true;

      /** This is similar to mongodb query language */
      var query: any = {
        find: {
          key: this.props.state.key,
          [this.props.widget.datapath]: { $exists: true }
        },
        mask: {
          [this.props.widget.datapath]: 1
        },
        sort: { timestamp: -1 },
        limit: 50
      };

      api.packets(query, (err, data: any) => {
        if (err) {
          console.log(err);
        }
        if (data) {
          data = data.reverse(); // flip order
          this.setState({ data, loading: false });
        }
      });

      api.on("packet", this.packetHandler);
    }
  }

  componentWillUnmount() {
    api.removeListener("packet", this.packetHandler);
  }

  packetHandler = packet => {
    if (Array.isArray(packet) == false) {
      if (packet.key == this.props.state.key) {
        var data: any = this.state.data;
        data.push(packet);
        this.setState({ data });
      }
    }
  };

  displayLoading() {
    return (
      <div
        style={{
          color: "rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          margin: 0,
          height: "100%",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: "center",
            position: "relative",
            width: "100%"
          }}
        >
          <div
            style={{
              textAlign: "center",
              position: "absolute",
              bottom: -20,
              width: "100%"
            }}
          >
            <div className="fa-3x">
              <i className="fas fa-circle-notch fa-spin"></i>
            </div>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            width: "100%",
            paddingTop: 20
          }}
        >
          loading chart
        </div>
      </div>
    );
  }

  displayNoData() {
    return (
      <div
        style={{
          padding: colors.padding * 2,
          paddingTop: colors.padding * 4,
          background: opacity(colors.share, 0.15),
          border: "1px solid " + colors.share,
          color: colors.share,
          height: "100%",
          boxSizing: "border-box"
        }}
      >
        <i className="fas fa-exclamation-triangle" /> Chart has no data.
      </div>
    );
  }

  render() {
    if (this.state.loading == true) {
      return this.displayLoading();
    }
    //if (this.props.widget.datapath) { return <div>{this.props.widget.datapath}</div> }
    if (this.state.data.length == 0) {
      return this.displayNoData();
    }

    var labels = [];
    var data = [];

    var min = Infinity;
    var max = -Infinity;

    for (var d of this.state.data) {
      //var value = objectByString(this.props.state, this.props.widget.datapath)
      var entry = {
        key: new Date(d["timestamp"]),
        data: parseFloat(objectByString(d, this.props.widget.datapath))
      };

      if (!Number.isNaN(entry.data)) {
        if (entry.data < min) {
          min = entry.data;
        }
        if (entry.data > max) {
          max = entry.data;
        }
        data.push(entry);
      }
    }

    var style: any = {
      wordBreak: "break-all",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    };

    // For documentation see:
    // see https://reaviz.io/?path=/docs/docs-chart-types-area-chart--page
    // and https://github.com/jask-oss/reaviz

    if (data.length == 0) {
      return this.displayNoData();
    }

    var datapath = "";

    if (this.props.widget.datapath) {
      if (this.props.widget.datapath.indexOf("data.") == 0) {
        datapath = this.props.widget.datapath.slice(5);
      }
    }

    //timestamp
    var valueTimestamp = (this.props.valueTimestamp)
      ? this.props.valueTimestamp
      : undefined

    return (
      <div style={style}>
        <div style={{
          flex: "0",
          width: "100%",
          boxSizing: "border-box",
          padding: 0,
          margin: 0,
          paddingBottom: colors.padding,
          display: "flex",
          flexDirection: "row"
        }}>

          <div style={{
            flex: "1",
            opacity: 0.25,
            paddingRight: 7, paddingTop: 7,
            textAlign: "right"
          }}>{moment(valueTimestamp).fromNow()}</div>
        </div>

        <div style={{
          flex: "1",
          padding: 0,
          margin: 0,
          overflow: "hidden",
        }}>
          <div style={{ width: "100%", height: "100%" }}>
            <AreaChart
              style={{ width: "100%", height: "100%", background: "#f00" }}
              data={data}
              yAxis={<LinearYAxis type="value" scaled={true} domain={[min, max]} />}
              series={
                <AreaSeries
                  area={
                    <Area
                      mask={<Stripes />}
                      style={{ fill: this.state.options.color.value }}
                      gradient={
                        <Gradient
                          stops={[
                            <GradientStop offset="10%" stopOpacity={0} />,
                            <GradientStop offset="80%" stopOpacity={1} />
                          ]}
                        />
                      }
                    />
                  }
                  line={
                    <Line
                      strokeWidth={3}
                      style={{ stroke: this.state.options.color.value }}
                    />
                  }
                />
              }
            />
          </div>
        </div>

        <div style={{
          flex: "0",
          textAlign: "center",
          opacity: 1,
          width: "100%",
          boxSizing: "border-box",
          padding: 0,
          margin: 0,
          paddingBottom: colors.padding
        }}>{datapath}</div>

      </div>
    );
  }
}
