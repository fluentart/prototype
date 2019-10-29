import React, { Component, Suspense } from "react";

const PropTypes = require('prop-types')

import hljs from 'highlight.js';

import 'highlight.js/styles/vs2015.css';
import { colors } from "../theme";

interface CustomProps {
    language: string;
    value: string;
    type?: any;
}

interface States {

}

export class CodeBlock extends React.PureComponent<CustomProps, States> {

    constructor(props) {
        super(props)
        this.setRef = this.setRef.bind(this)
    }

    codeEl;

    setRef(el) {
        this.codeEl = el
    }

    componentDidMount() {
        this.highlightCode()
    }

    componentDidUpdate() {
        this.highlightCode()
    }

    highlightCode() {
        hljs.highlightBlock(this.codeEl)
    }

    view = () => {
        if (this.props.type == undefined) {
            return (
                <pre ref={this.setRef} className={`fontmono language-${this.props.language}`}>
                    {this.props.value}
                </pre>
            )
        }

        else if (this.props.type == "modify") {
            return (
                <pre ref={this.setRef} className={`fontmono language-${this.props.language}`}>
                    {this.props.value}
                </pre>
            )
        }
    }

    render() {
        return (<div style={{ fontSize: "0.85em" }}>
            {this.view()}</div>
        )
    }
}


