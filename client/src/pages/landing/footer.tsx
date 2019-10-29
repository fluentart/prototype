import React from "react";
import { colors } from "../../theme";

interface MyProps { }

interface MyState { }

export class LandingFooter extends React.Component<MyProps, MyState> {
    state = {};

    render() {



        return <div style={{ background: "rgba(255,255,255,0.1)" }}>
            <div style={{
                margin: "0 auto", maxWidth: "1400px", display: "flex",
                flexDirection: "row", paddingTop: 100, paddingBottom: 100
            }}>
                {(window.innerWidth > 800) &&
                    <div style={{ flex: "1", padding: colors.padding * 2 }}>
                        <h2>PR0T0TYP3</h2>
                    </div>
                }


                <div style={{ flex: "1", padding: colors.padding * 2, lineHeight: "200%" }}>
                    <a href="https://www.iotnxt.com">About</a> <br />
                    <a href="https://www.iotnxt.com/#section-2">Partners</a><br />
                    <a href="https://www.iotnxt.com/#section-5">Framework</a><br />
                    <a href="https://www.iotnxt.com/#section-9">Awards</a>
                </div>

                <div style={{ flex: "1", padding: colors.padding * 2, lineHeight: "200%" }}>
                    <a href="https://github.com/IoT-nxt/prototype">Opensource</a><br />
                    <a href="https://github.com/IoT-nxt/prototype#documentation">
                        Documentation</a><br />
                    <a href="https://discord.gg/rTQmvbT">Community</a><br />
                    <a href="https://discord.gg/rTQmvbT">Help</a>
                </div>

                <div style={{
                    flex: "1", padding: colors.padding * 2, fontSize: "150%",
                    textAlign: "right", lineHeight: "200%"
                }}>
                    <a style={{ border: "none" }}
                        className="footerButton"
                        href="https://discord.gg/rTQmvbT"><i className="fab fa-discord"></i></a>

                    <br />

                    <a style={{ border: "none" }}
                        className="footerButton"
                        href="https://github.com/IoT-nxt/prototype">
                        <i className="fab fa-github"></i></a>
                </div>
            </div>
        </div>

    }
}