import React from "react";
import ReactDOM from "react-dom";
import { api } from "../../api"
import { colors } from "../../theme";
import { request } from "../../utils/requestweb";
import { validUsername, usernameSettings } from "../../../../server/shared/shared";

interface MyProps { }
interface MyState { }

export class AccountUsername extends React.Component<MyProps, MyState> {
    state = {
        username: undefined,
        changeUsername: false,
        validUsername: {
            valid: false,
            capitals: true,
            lowercase: false,
            numbers: true,
            symbols: true,
            noSpace: false,
            length: false
        },
        available: "notchecking"
    }

    static getDerivedStateFromProps(props, state) {
        if (api.data.account.username) {
            if (state.username == undefined) {
                return { username: api.data.account.username, validUsername: validUsername(api.data.account.username) }
            }
        }
        return null;
    }

    sendToServer() {
        if ((this.state.validUsername.valid) && (this.state.available)) {
            request.post("/api/v4/admin/usernamechange", { json: { username: this.state.username } }, (e, r, response) => {
                this.setState({ changeUsername: false })
            })
        }
    }

    onTypeUsername = (e) => {
        this.setState({
            username: e.target.value,
            validUsername: validUsername(e.target.value)
        })

        this.checkIfUsernameAvailable();
    }

    checkIfUsernameAvailable = (cb?) => {

        if (!this.state.validUsername.valid) { return; }

        this.setState({ available: "checking" }, () => {
            api.users({ find: { username: this.state.username } }, (e, user) => {
                if (user) {
                    if (user.length == 0) {
                        this.setState({ available: "available" }, () => {
                            if (cb) cb(true)
                        })
                    } else {
                        this.setState({ available: "taken" }, () => {
                            if (cb) cb(false)
                        })
                    }
                }
            })
        });
    }

    render() {
        //const account: User = api.data.account;

        var wrapStyle: any = { display: "flex", flexDirection: "row" }

        var labelStyle: any = {
            textAlign: "right",
            width: "90px",
            padding: colors.padding,
            color: "rgba(255,255,255,0.5)"
        }

        var valueStyle: any = { flex: "1", background: "rgba(0,0,0,0.2)", padding: colors.padding }
        var valueChangeStyle: any = { flex: "1", display: "flex", flexDirection: "row" }
        var valueChangeInputStyle: any = {
            flex: 1,
            boxSizing: "border-box",
            padding: colors.padding,
            width: "100%"
        }
        var valueChangeButtonStyle: any = { boxSizing: "border-box", padding: colors.padding }

        var optionStyle: any = { flex: 0, textAlign: "right", padding: colors.padding }

        return (
            <div style={wrapStyle}>
                <div style={labelStyle}>USERNAME:</div>

                {(this.state.changeUsername)
                    ? <div style={{ flex: "1", background: "rgba(0,0,0,0.2)" }} >
                        <div style={valueChangeStyle}>
                            <input value={this.state.username} onChange={this.onTypeUsername} style={valueChangeInputStyle} />
                            <button onClick={() => { this.sendToServer(); }} style={valueChangeButtonStyle}>SAVE</button>
                        </div>

                        <div style={{ padding: colors.padding }}>
                            {(this.state.validUsername.capitals) && <div style={{ color: colors.alarm }}>
                                <i className="fas fa-times" /> May not contain CAPITAL letters.</div>}
                            {(!this.state.validUsername.length) && <div style={{ color: colors.alarm }}>
                                <i className="fas fa-times" /> Must be between {usernameSettings.minlength} and {usernameSettings.maxlength} length.</div>}
                            {(!this.state.validUsername.noSpace) && <div style={{ color: colors.alarm }}>
                                <i className="fas fa-times" /> May not contain a space.</div>}
                            {(this.state.validUsername.symbols) && <div style={{ color: colors.alarm }}>
                                <i className="fas fa-times" /> May not contain symbols only a-z 0-9.</div>}


                            {(this.state.validUsername.valid) &&
                                <div>
                                    {(this.state.available == "checking") && <div style={{}}>
                                        <i className="fas fa-circle-notch fa-spin" />Checking</div>}

                                    {(this.state.available == "available") && <div style={{ color: colors.good }}>
                                        <i className="fas fa-check" /> Available</div>}

                                    {(this.state.available == "taken") && <div style={{ color: colors.alarm }}>
                                        <i className="fas fa-times" /> Taken</div>}
                                </div>}



                        </div>

                    </div>
                    : <div style={valueStyle}><span>{this.state.username}</span></div>}

                <div style={optionStyle}>
                    <span className="button"
                        onClick={() => {
                            this.setState({
                                username: api.data.account.username,
                                validUsername: validUsername(api.data.account.username),
                                changeUsername: !this.state.changeUsername
                            }, () => {
                                this.checkIfUsernameAvailable();
                            })
                        }}>
                        {(this.state.changeUsername) ? "cancel" : "change"}</span>
                </div>

            </div>
        );
    }
}

