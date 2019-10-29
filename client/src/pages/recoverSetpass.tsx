import React from "react";
import { colors } from "../theme";
import { UserRegistration } from "../components/user_registration";
import { UserRecoveryForm } from "../components/user_recover";
import { InputCheck } from "./settings/inputCheck";
import { request } from "../utils/requestweb";
import { validPassword } from "../../../server/shared/shared";
import { response } from "express";

interface MyProps { code: string }

interface MyState { }

/** For users to recover access to their account. 
 * At the moment we only support users to use their email account to get a recovery link. 
 * In future we can also support mobile phone authentication or even drivers licence authentication.
*/
export class RecoverSetpassPage extends React.Component<MyProps, MyState> {
    state = {
        password: "",
        passwordvalid: false,
        message: "",
        showTryAgainLink: false,
        codeSuccess: false
    };

    constructor(props) {
        super(props);
        console.log("constructor...", props.code)

        request.post("/recover/code", { json: { code: props.code } }, (e, r, response: any) => {
            if (response) {
                if (response.result == "success") {
                    this.setState({ message: response.message, codeSuccess: true })
                } else {
                    this.setState({ message: response.message, showTryAgainLink: true })
                }
            } else {
                this.setState({ message: "server error", showTryAgainLink: true })
            }
        })
    }

    setpassword() {
        request.post("/recover/set", { json: { code: this.props.code, password: this.state.password } }, (e, r, response: any) => {
            if (response) {
                if (response.result == "success") {
                    this.setState({ message: response.message });
                } else {
                    this.setState({ message: response.message });
                }
            } else this.setState({ message: "server error", showTryAgainLink: true });
        })
    }

    render() {
        var styleregister: any = { ...colors.cardShadow, ...{ maxWidth: "800px", margin: "0 auto" } }
        return (<div>
            <div style={{ padding: colors.padding * 2, zIndex: 3 }}>

                <div style={styleregister}>

                    <div style={{ padding: colors.padding * 2, background: "rgba(0,0,0,0.2)" }}>
                        <h2 style={{ margin: 0, padding: 0 }}>ACCOUNT RECOVERY</h2>
                    </div>

                    <div style={{ padding: colors.padding * 2 }}>{this.state.message}</div>

                    {(this.state.showTryAgainLink) && <div style={{
                        ...colors.p, ...{
                            padding: colors.padding * 2,
                            paddingTop: 0,
                            paddingBottom: colors.padding * 3,
                            textAlign: "left",
                            fontSize: "12pt"
                        }
                    }}> You can request a <a className="dotted" href="/recover">new recovery code</a>. </div>}


                    {(this.state.codeSuccess) &&
                        <div style={{ padding: colors.padding * 2 }}>
                            {/* <UserRecoveryForm /> */}
                            <InputCheck placeholder="new password" type="password" validation="password"
                                onChange={(e) => {
                                    this.setState({ password: e.target.value, passwordvalid: validPassword(e.target.value).valid })
                                }}
                            />

                            <div style={{ paddingTop: colors.padding * 2, paddingBottom: colors.padding * 2, textAlign: "right" }}>
                                {(this.state.passwordvalid) ? <button
                                    style={{
                                        ...colors.quickShadow,
                                        ...{
                                            fontSize: "120%", background: colors.good,
                                            color: "#fff", fontWeight: "bold"
                                        }
                                    }} onClick={() => { this.setpassword() }}>
                                    <i className="fas fa-envelope" /> Set password</button>
                                    : <button
                                        disabled
                                        style={{
                                            ...colors.quickShadow, ...{
                                                cursor: "default",
                                                fontSize: "120%", background: colors.panels,
                                                color: "rgba(255,255,255,0.1)", fontWeight: "bold"
                                            }
                                        }} > <i className="fas fa-envelope" /> Set password</button>}
                            </div>
                        </div>
                    }





                    <div style={{ ...colors.p, ...{ background: "rgba(0,0,0,0.2)", padding: colors.padding * 1, textAlign: "right", fontSize: "12pt", } }}>
                        Need help? Contact <a style={{ whiteSpace: "nowrap" }} href="/">Support</a>.
              </div>

                </div>
            </div>
        </div>)
    }
}
