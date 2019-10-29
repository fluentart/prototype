import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, NavLink } from 'react-router-dom'
import { api } from "../../api"
import { User } from "../../../../server/shared/interfaces"
import { colors } from "../../theme";
import { AccountTypeBadge } from "../../components/account_type_badge";
import { request } from "../../utils/requestweb";
import { InputCheck } from "./inputCheck";
import { validPassword } from "../../../../server/shared/shared";


interface MyProps { }
interface MyState { }


/** allows user to change password in account/settings */
export class AccountPassword extends React.Component<MyProps, MyState> {
    state = {
        currentpassword: "",
        newpassword: "",
        changePassword: false,
        match: false,
        passwordvalid: false
    }

    static getDerivedStateFromProps(props, state) {
        // if (api.data.account.password) {
        //     if (state.password == undefined) {
        //         return { password: api.data.account.password, passwordverified: api.data.account.passwordverified }
        //     }
        // }
        return null;
    }

    changePassword() {

        if ((this.state.passwordvalid) && (this.state.match)) {
            console.log("changing password")
            request.post("/api/v4/admin/passwordchange", {
                json: {
                    currentpassword: this.state.currentpassword,
                    newpassword: this.state.newpassword
                }
            }, (e, r, response) => {
                this.setState({ changePassword: false })
            })
        } else {
            console.log("passwords invalid")
        }

    }

    requestVerificationMail = () => {
        request.get("/api/v3/admin/requestverificationpassword", { json: true }, (e, r, response) => {

        });
    }


    render() {
        //const account: User = api.data.account;

        var A: any = {
            display: "flex",
            flexDirection: "row",
            marginTop: colors.padding
        }

        var B: any = { textAlign: "right", width: "90px", padding: colors.padding, color: "rgba(255,255,255,0.5)" }

        var passwordStyle: any = { background: "rgba(0,0,0,0.2)", flex: "1", padding: colors.padding, color: "rgba(255,255,255,0.5)" }

        var D: any = { flex: "1" }

        var inputStyle: any = {
            flex: "1",
            background: "rgba(0,0,0,0.2)",
            boxSizing: "border-box",
            padding: colors.padding,
            width: "100%"
        }

        var buttonStyle: any = { flex: 0, boxSizing: "border-box", padding: colors.padding }

        var optionsStyle: any = {
            flex: 0,
            textAlign: "right",
            padding: colors.padding,
        }
        return (
            <div style={A}>
                <div style={B}>PASSWORD:</div>

                {(!this.state.changePassword)
                    ? <div style={passwordStyle}><span>******</span></div>
                    : <div style={{ flex: "1", background: "rgba(0,0,0,0.2)", padding: colors.padding }}>

                        <div style={D}>
                            <div>Current password:</div>
                            <div><input
                                type="password"
                                style={inputStyle}
                                value={this.state.currentpassword}
                                onChange={(e) => { this.setState({ currentpassword: e.target.value }) }}
                            /></div>
                        </div>

                        <div style={D}>
                            <div>New password twice:</div>
                            <div>
                                <InputCheck
                                    onChange={(e) => {
                                        this.setState({
                                            passwordvalid: validPassword(e.target.value).valid,
                                            newpassword: e.target.value
                                        })
                                    }} type="password" validation="password" />

                            </div>
                            <div>
                                <InputCheck onChange={(e) => {
                                    this.setState({ match: (e.target.value == this.state.newpassword) })
                                }} type="password" match={this.state.newpassword} />
                            </div>

                            <button
                                style={buttonStyle}
                                onClick={() => {
                                    this.changePassword()
                                }}>SAVE</button>
                        </div>
                    </div>}

                <div style={optionsStyle}><span className="button"
                    onClick={() => { this.setState({ changePassword: !this.state.changePassword }) }}>
                    {(this.state.changePassword) ? "cancel" : "change"}
                </span></div>
            </div>
        );
    }
}

