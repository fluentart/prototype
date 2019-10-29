import React from "react";
import { colors } from "../../theme";
interface MyProps { }

interface MyState { }

export class LandingServicePricing extends React.Component<MyProps, MyState> {
    state = {};

    render() {

        var cardstyles: any = {
            flex: "1",
            padding: colors.padding * 2,
            boxSizing: "border-box"
        }

        if (window.innerWidth < 1200) { cardstyles.minWidth = window.innerWidth / 2 }

        const cardstylewrap: any = { ...colors.cardShadow, ...{ height: 300 } };

        const buttonstyles: any = {
            bottom: 0, width: "100%",
            position: "absolute", padding: colors.padding * 2, fontSize: "120%",
            border: "none"
        }
        const cardtextstyle: any = {}


        var cardStyles: any = (window.innerWidth < 800) ? {
            wrap: {
                color: "#CCCCCC", maxWidth: 1400, display: "flex",
                flexDirection: "column", margin: "0 auto"
            }
        } : {
                wrap: {
                    color: "#CCCCCC", maxWidth: 1400, display: "flex",
                    flexWrap: "wrap", flexDirection: "row", margin: "0 auto"
                }
            }


        return (
            <div style={{
                paddingTop: 50, paddingBottom: 50,
                background: "rgba(255,255,255,0.05)"
            }}>

                <div style={{
                    color: "#CCCCCC",
                    maxWidth: 1400,
                    margin: "0 auto",
                    padding: colors.padding * 2
                }}>
                    <h1 >Hosted service</h1>
                    <p style={colors.p}>We offer both free accounts and paid
                    services for those who just want have a quick test drive,
                    or do not want the hassle of running their own cloud
                    infrastructure. </p>
                </div>

                <div style={cardStyles.wrap}>

                    <div style={cardstyles}>
                        <div style={{
                            ...cardstylewrap,
                            ...{ borderTop: "1px solid " + colors.good }
                        }}>
                            <div style={{ padding: colors.padding * 2 }}>
                                <h2 style={{ color: colors.good }}>Free</h2>
                                <p style={colors.p}>
                                    5 devices max<br />
                                    300MB per month<br />
                                    Community support</p>
                            </div>

                            <button style={{
                                ...buttonstyles,
                                ...colors.quickShadow,
                                ...{
                                    background: colors.good,
                                    color: "#fff",
                                    fontWeight: "bold"
                                }
                            }}>
                                <i className="fas fa-arrow-right" /> Click here
                            </button>
                        </div>
                    </div>

                    <div style={cardstyles}>
                        <div style={{
                            ...cardstylewrap,
                            ...{ borderTop: "1px solid " + colors.warning }
                        }}>
                            <div style={{ padding: colors.padding * 2 }}>
                                <h2 style={{ color: colors.warning }}>Pro</h2>
                                <p style={colors.p}>Unlimited* device count. <br />
                                    30,000MB per month<br />
                                    Domain pointing<br />
                                    Support included
        </p>
                            </div>
                            <div style={buttonstyles}>From $2.50/mo</div>
                        </div>
                    </div>

                    <div style={cardstyles}>
                        <div style={{
                            ...cardstylewrap,
                            ...{ borderTop: "1px solid " + colors.alarm }
                        }}>
                            <div style={{ padding: colors.padding * 2 }}>
                                <h2 style={{ color: colors.alarm }}>Business</h2>
                                <p style={colors.p}>
                                    Unlimited* device count. <br />
                                    60,000MB+ per month per user<br />
                                    Domain pointing<br />
                                    Business management<br />
                                    Priority support<br />
                                </p>
                            </div>
                            <div style={buttonstyles}>From $5/user/mo</div>
                        </div>
                    </div>

                    <div style={cardstyles}>
                        <div style={{
                            ...cardstylewrap,
                            ...{ borderTop: "1px solid " + colors.public }
                        }}>
                            <div style={{ padding: colors.padding * 2 }}>
                                <h2 style={{ color: colors.public }}>Enterprise</h2>
                                <p style={colors.p}>
                                    Business account plus:<br />
                                    Custom development.<br />
                                    Dedicated baremetal servers.<br />
                                    VIP support</p>
                            </div>
                            <a href="https://www.iotnxt.com/#section-contact">
                                <button style={buttonstyles}>Contact us</button>
                            </a>
                        </div>
                    </div>

                </div>

                <div style={{
                    padding: colors.padding * 2, color: "#CCCCCC", maxWidth: 1400,
                    display: "flex", flexDirection: "row", margin: "0 auto"
                }}>
                    <p style={colors.p} >* Unlimited devices, but you'll still
                    be capped by data usage limits to avoid system abuse.</p>
                </div>
            </div>


        )
    }
}
