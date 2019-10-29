import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, NavLink } from 'react-router-dom'
import "../prototype.scss"
import { api } from "../api"
import { emit } from "cluster";
import { theme, colors } from "../theme";

interface MyProps {
    /** The selected user from the drop down. */
    onSelect?: Function
}

interface MyState {
    searchtext: string;
    result: any[];
    //[index: string]: any
}

export class SearchBox extends React.Component<MyProps, MyState> {

    state = {
        searchtext: "",
        result: []
    }

    onChange = (e) => {
        var searchtext = e.target.value
        this.setState({ searchtext }, () => { })
    }

    onKeyPress = (event) => {
        if (event.key === "Enter") {

            if (this.state.searchtext.trim() == "") {
                this.clear();
                return;
            }

            api.search({ searchtext: this.state.searchtext }, (err, result) => {
                if (err) console.log(err);
                if (result) { console.log(result); this.setState({ result }) }
            })
        }
    }

    clear = () => {
        this.setState({ searchtext: "", result: [] })
    }

    render() {
        return (
            <div style={{ float: "left", padding: "5px 5px 5px 15px", position: "relative" }}>
                <i className="fas fa-search" style={{ opacity: 0.5, paddingRight: "10px" }} ></i>
                <input
                    style={{ zIndex: 100 }}
                    type="text"
                    placeholder="Search for user"
                    onKeyPress={this.onKeyPress}
                    onChange={this.onChange}
                    value={this.state.searchtext} />

                {(this.state.result.length > 0) ? <div> <div style={{
                    left: "40px",
                    width: "300px",
                    position: "absolute",
                    maxHeight: "400px",
                    overflowY: "scroll",
                    overflowX: "hidden",
                    zIndex: 200,
                    background: colors.panels,
                    border: colors.borders
                }}>
                    {this.state.result.map((user, i) => {
                        /** we can either browser to the user, or use the user selected in other UI components. 
                         * Currently used for top search box and share popup. */
                        return <div
                            key={i}
                            style={{ padding: "5px", borderBottom: "1px solid #333" }}>
                            {(this.props.onSelect)
                                ? <button style={{ width: "100%" }} onClick={() => { this.props.onSelect(user); this.setState({ result: [] }) }}>{user.username}</button>
                                : <Link to={"/u/" + user.username} >{user.username}</Link>
                            }

                        </div>
                    })}
                </div>

                    <div style={{
                        zIndex: 100,
                        width: "100%",
                        height: "100%",
                        background: "none",
                        position: "fixed",
                        top: 0, left: 0
                    }} onClick={() => { this.clear() }} />

                </div> : <div></div>}


            </div>
        );
    }
}

