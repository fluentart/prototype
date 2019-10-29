import React, { Component } from 'react';
import { WidgetComponent } from "./widgetcomponent"

import { api } from "../../../api"

import Form from "react-jsonschema-form";

export default class WidgetForm extends WidgetComponent {
    state = {
        options: {
            color: { type: "color", default: "#ffffff", value: undefined },
            schema: {
                type: "json", default: {
                    title: "Todo",
                    type: "object",
                    required: ["title"],
                    properties: {
                        title: { type: "string", title: "Title", default: "A new task" },
                        done: { type: "boolean", title: "Done?", default: false }
                    }
                }, value: undefined
            },
            uischema: {
                type: "json", default: {}, value: undefined
            }
        },
        formData: {},
        buttonText: "SEND",
        error: ""
    }

    onChange = (data) => {
        this.setState({ formData: data.formData })
    }

    onSubmit = () => {
        //var data = JSON.parse(this.state.formData);
        api.post({ key: this.props.state.key, data: { form: this.state.formData } })
        //api.post({ id: "formpost_test", data: { form: this.state.formData }, merge: false })
    }

    onError(error) {
        console.log(error)
        //api.post({})
    }

    validjson(datain) {
        try {
            var a = JSON.parse(datain);
            if (a) { return true; } else { return false; }
        } catch (err) {
            return false;
        }
    }

    render() {

        var schema = {};

        if (typeof this.state.options.schema.value == "string") {
            if (this.validjson(this.state.options.schema.value)) {
                schema = JSON.parse(this.state.options.schema.value);
            }
        } else {
            if (typeof this.state.options.schema.value == "object") {
                schema = this.state.options.schema.value
            }
        }

        var uischema = {};

        if (typeof this.state.options.uischema.value == "string") {
            if (this.validjson(this.state.options.uischema.value)) {
                uischema = JSON.parse(this.state.options.uischema.value);
            }
        } else {
            if (typeof this.state.options.uischema.value == "object") {
                uischema = this.state.options.uischema.value
            }
        }

        return (
            <div style={{ color: this.state.options.color.value, wordBreak: "break-all", paddingTop: 0 }}>
                <Form schema={schema}
                    uiSchema={uischema}
                    formData={this.state.formData}
                    onChange={this.onChange}
                    autocomplete="off"
                    onSubmit={this.onSubmit}
                    onError={this.onError} />
            </div>
        );
    }
};

