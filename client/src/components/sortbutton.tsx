import React from "react";
import { theme } from "../theme"

interface SortProps {
    type?: "vertical" | "verticalalpha";
    onChangeSort: Function;
    value: string;
}


interface SortState {

}

//export class Registration extends React.Component<MyProps, MyState> {
export class SortButton extends React.Component<SortProps, SortState> {

    state = {
        type: "vertical",
        value: "none"
    }

    componentDidMount = () => {
        if (this.props.value) { this.setState({ value: this.props.value }) }

        if (this.props.type) {
            this.setState({ type: this.props.type })
        }
    }

    onClick = () => {
        if (this.state.type == "vertical") {
            if (this.props.value == "none") this.setState({ value: "up" }, () => { this.props.onChangeSort(this.state.value); });
            if (this.props.value == "up") this.setState({ value: "down" }, () => { this.props.onChangeSort(this.state.value); });
            if (this.props.value == "down") this.setState({ value: "up" }, () => { this.props.onChangeSort(this.state.value); });
        }

        if (this.state.type == "verticalalpha") {
            if (this.props.value == "none") this.setState({ value: "up" }, () => { this.props.onChangeSort(this.state.value); });
            if (this.props.value == "up") this.setState({ value: "down" }, () => { this.props.onChangeSort(this.state.value); });
            if (this.props.value == "down") this.setState({ value: "up" }, () => { this.props.onChangeSort(this.state.value); });
        }
    }

    render() {
        // var style: any = { width: theme.global.sortbuttons.width, textAlign: "center" }
        // var style2: any = { position: "relative", left: -5, top: 8 }



        if (this.state.type == "vertical") {
            return (<div>
                <span className="fa-stack fa-1x" onClick={this.onClick}>
                    {this.props.value == "up" && <i className="fas fa-sort-up fa-stack-1x" />}
                    {this.props.value == "down" && <i className="fas fa-sort-down fa-stack-1x" />}
                    <i className="fas fa-sort fa-stack-1x " style={{ opacity: 0.5 }} />
                </span>
            </div>
            )
        }

        if (this.state.type == "verticalalpha") {
            return (
                <div><span onClick={this.onClick}>
                    {this.props.value == "none" && <i className="fas fa-sort-alpha-up" style={{ opacity: 0.5 }} />}
                    {this.props.value == "up" && <i className="fas fa-sort-alpha-up" />}
                    {this.props.value == "down" && <i className="fas fa-sort-alpha-down-alt" />}
                </span></div>
            )
        }

        return (<div></div>)

    }
}

