import React from "react";

import { colors } from "../theme";
import { Hero } from "./herolanding"
import { LandingServicePricing } from "./landing/servicePricing";
import { LandingFooter } from "./landing/footer";
import { LandingFeatures } from "./landing/features";

interface MyProps { }

interface MyState {
  //[index: string]: any
}

export class Landing extends React.Component<MyProps, MyState> {
  state = {};

  render() {

    /** provides the responsive styles for the landing hero segment */
    var landingheroSegmentStyle: any = (window.innerWidth > 800)
      ? {
        wrapper: {
          width: "100%", overflow: "hidden",
        },
        subwrap: { maxWidth: "1400px", margin: "0 auto", position: "relative" },
        svgblock: { width: "75%", float: "right", zIndex: 1, right: 0, top: 0 },
        textblock: { width: "75%", padding: colors.padding * 2, zIndex: 2, position: "absolute", top: 0, left: 0, paddingTop: 100, paddingBottom: 100 }
      }
      : {
        wrapper: { width: "100%", overflow: "hidden" },
        subwrap: { width: "100%" },
        svgblock: { width: "100%" },
        textblock: { width: "100%", padding: colors.padding * 2, zIndex: 2, paddingTop: 100, paddingBottom: 100 }
      }



    /** landscape phone or tablet */
    if ((window.innerWidth > 800) && (window.innerWidth < 1000)) {
      landingheroSegmentStyle = {
        wrapper: { width: "100%", overflow: "hidden" },
        subwrap: { maxWidth: "1400px", margin: "0 auto", position: "relative" },
        svgblock: { width: "60%", float: "right", zIndex: 1, right: 0, top: 0 },
        textblock: {
          width: "60%", padding: colors.padding * 2, zIndex: 2, position: "absolute", top: 0, left: 0,
          paddingTop: 20, paddingBottom: 20
        }
      }
    }


    /** provides the responsive styles for the devicelist segment */
    var devicelistSegmentWrapperStyle: any = (window.innerWidth > 800)
      ? {
        maxWidth: "1400px",
        margin: "-100px auto",
        marginBottom: "50px",
        position: "relative"
      } : {
        maxWidth: "100%"
      }

    var devicelistSegmentWrapperSubStyle: any = (window.innerWidth > 800)
      ? { display: "flex", flexDirection: "row" }
      : { display: "flex", flexDirection: "column" }



    return (
      <div style={{ paddingTop: "0", background: "#232323", height: "100%", zIndex: 1 }}>

        <div>


          <div className="landingBannerBg" style={landingheroSegmentStyle.wrapper}>

            <div style={landingheroSegmentStyle.subwrap}>

              <div style={landingheroSegmentStyle.svgblock}>
                <Hero />
              </div>

              <div style={landingheroSegmentStyle.textblock}>
                <h1 style={{ paddingRight: 20 }}>Internet of things for everyone.</h1>
                <p style={{ ...colors.p, ...{ color: "#cccccc" } }}>
                  Open-Source.<br />
                  Connect any device, any process. <br />
                  Script custom data processes in JS/TS<br />
                  Build custom interfaces easily.
                </p>
                <a href="https://github.com/IoT-nxt/prototype">
                  <button style={{ ...colors.quickShadow, ...{ fontSize: "120%" } }}>
                    <i className="fab fa-github" /> Source</button></a>
                <a href="/register">
                  <button style={{
                    ...colors.quickShadow,
                    ...{
                      fontSize: "120%", background: colors.good,
                      color: "#fff", fontWeight: "bold"
                    }
                  }}>
                    <i className="fa fa-user-plus" /> Register FREE* account</button></a>
              </div>
            </div>
          </div>

          <div style={devicelistSegmentWrapperStyle}>
            <div style={devicelistSegmentWrapperSubStyle}>
              <div style={{ flex: 1, padding: colors.padding * 2 }}>
                <img style={{ width: "100%" }} src="/img/landingPage_devicelist.gif" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ padding: colors.padding * 2, paddingTop: 80 }}>
                  <h1>Devicelist</h1>
                  <p style={colors.p}>Quickly see alarm, warning, share or public status of devices while the map view shows you where you need to focus.</p>
                </div>
              </div>
            </div>
          </div>

        </div>



        <LandingFeatures />

        <LandingServicePricing />

        <LandingFooter />


      </div >
    );
  }
}
