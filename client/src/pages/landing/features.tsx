import React from "react";
import { colors } from "../../theme";

interface MyProps { }

interface MyState { }

export class LandingFeatures extends React.Component<MyProps, MyState> {
    state = {};

    render() {
        /** provides the responsive styles for the dashboard/editor segments. */
        var landingSegmentWrapperStyle: any = (window.innerWidth > 800) ? {
            maxWidth: "1400px",
            margin: "0 auto",
            paddingTop: 100,
            display: "flex",
            flexDirection: "row"
        }
            : {
                width: "100%",
                paddingTop: 100,
                display: "flex",
                flexDirection: "column-reverse"
            }


        return <div style={{}}>
            <div style={landingSegmentWrapperStyle}>
                <div style={{ flex: 1, padding: colors.padding * 2 }}>
                    <h1>Dashboard</h1>
                    <p style={colors.p}>Drag and drop new buttons, graphs and gauges. Powerful API to build your own widgets.</p>
                </div>

                <div style={{ flex: 1, padding: colors.padding * 2 }}>
                    <img style={{ width: "100%" }} src="/img/landing_dashboard.gif" />
                </div>
            </div>



            <div style={landingSegmentWrapperStyle}>
                <div style={{ flex: 1, padding: colors.padding * 2 }}>
                    <h1>Editor</h1>
                    <p style={colors.p}>Script the behaviour of your devices directly in the browser. Easily count events, automate actions and gain value from data.</p>
                </div>

                <div style={{ flex: 1, padding: colors.padding * 2 }}>
                    <img style={{ width: "100%" }} src="/img/landing_editor.gif" />
                </div>
            </div>
        </div>


    }
}