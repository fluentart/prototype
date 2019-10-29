import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, NavLink } from 'react-router-dom'
import { api } from "../../api"
import { User } from "../../../../server/shared/interfaces"
import { colors } from "../../theme";
import { AccountTypeBadge } from "../../components/account_type_badge";
import { request } from "../../utils/requestweb";
import { color } from "../../components/dashboard/options";

interface MyProps { }
interface MyState { }

export class AccountEmail extends React.Component<MyProps, MyState> {
    state = {
        email: undefined,
        emailverified: false,
        changeEmail: false,
        verifyClicked: false
    }

    static getDerivedStateFromProps(props, state) {
        if (api.data.account.email) {
            if (state.email == undefined) {
                return { email: api.data.account.email, emailverified: api.data.account.emailverified }
            }
        }
        return null;
    }

    changeEmail() {
        console.log("changing email")
        request.post("/api/v4/admin/emailchange", { json: { email: this.state.email } }, (e, r, response) => {
            this.setState({ changeEmail: false })
        })
    }

    requestVerificationMail = () => {
        request.get("/api/v3/admin/requestverificationemail", { json: true }, (e, r, response) => {

        });
    }


    render() {
        //const account: User = api.data.account;

        return (
            <div style={{
                display: "flex",
                flexDirection: "row",
                marginTop: colors.padding
            }}>
                <div style={{ textAlign: "right", width: "90px", padding: colors.padding, color: "rgba(255,255,255,0.5)" }}>
                    EMAIL:
                </div>

                {(!this.state.changeEmail) &&
                    <div style={{ background: "rgba(0,0,0,0.2)", flex: "1", padding: colors.padding }}>
                        <span>{this.state.email}</span> {(api.data.account.emailverified)
                            ? <span style={{ color: colors.good, paddingTop: colors.padding, whiteSpace: "nowrap" }}><i className="fas fa-check" /> Verified</span>
                            : <span style={{ color: colors.warning, paddingTop: colors.padding, whiteSpace: "nowrap" }}><i className="fas fa-exclamation-triangle" /> Unverified</span>}
                    </div>}

                {(this.state.changeEmail) && <div style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "row"
                }}>
                    <div style={{ flex: 1 }} ><input
                        value={this.state.email}
                        onChange={(e) => {
                            this.setState({ email: e.target.value })
                        }}
                        style={{
                            background: "rgba(0,0,0,0.2)",
                            boxSizing: "border-box",
                            padding: colors.padding,
                            width: "100%"
                        }}></input></div>
                    <div style={{ flex: 0 }}><button
                        onClick={() => {
                            this.changeEmail()
                        }}
                        style={{ boxSizing: "border-box", padding: colors.padding }}>SAVE</button></div>
                </div>}

                <div style={{
                    flex: 0,
                    textAlign: "right",
                    padding: colors.padding,
                }}><span className="button"
                    onClick={() => { this.setState({ changeEmail: !this.state.changeEmail }) }}>
                        {(this.state.changeEmail) ? "cancel" : "change"}
                    </span>

                    {(!api.data.account.emailverified)
                        && <div>

                            {(this.state.verifyClicked)
                                ? <span style={{ whiteSpace: "nowrap", color: colors.public }}><i className="fas fa-envelope" />Mail sent!</span>
                                : <button onClick={() => {
                                    this.setState({ verifyClicked: true });
                                    this.requestVerificationMail();
                                }} style={{ whiteSpace: "nowrap", marginLeft: colors.padding, color: colors.warning }} ><i className="fas fa-envelope" /> Send mail</button>}

                        </div>
                    }

                </div>

            </div>
        );
    }
}

