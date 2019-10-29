import React, { lazy, Suspense } from "react";

//import MonacoEditor from 'react-monaco-editor';
const MonacoEditor = React.lazy(() => import('react-monaco-editor'))
//import * as monaco from "monaco-editor"

import { colors, theme } from "../theme";
import { api } from "../api";
import { CorePacket } from "../../../server/shared/interfaces";
import { logger } from "../../../server/shared/log";

interface EditorProps {
    /**
     * Description test
     */
    state?: CorePacket
}

interface EditorState {
    code: string
    state: CorePacket
    unsaved: boolean
    message: string
}

export class ProtoEditor extends React.Component<EditorProps, EditorState> {

    state = {
        code: `// uncomment below to test "workflow" processing \n// packet.data.test = "hello world"\ncallback(packet); `,
        state: undefined,
        unsaved: false,
        message: "test"
    }

    constructor(props) {
        super(props);
    }

    // -----------------------------------------------

    componentDidUpdate = () => {
        //if (this.props.state.workflowerror) { this.setState({ message: this.props.state.workflowerror }) }
    }

    componentDidMount = () => {
        document.addEventListener("keydown", e => {
            if (e.key.toLowerCase() == "s") {
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.saveWorkflow();
                }
            }
        });

        if (this.props.state) {
            if (this.props.state.workflowCode) {
                this.setState({ code: this.props.state.workflowCode })
            }
        }
    };

    saveWorkflow = () => {
        logger.log({ message: "editor.saveWorkflow", level: "debug" })
        if (this.props.state) {
            api.post({ id: this.props.state.id, workflowCode: this.state.code }, (e, response) => {
                if (response) {
                    if (response.result == "success") { this.setState({ unsaved: false }) }
                }
            })
        }
    };

    //editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
    editorDidMount = (editor: any, monaco: any) => {
        console.log('editorDidMount', editor);
        editor.focus();

        var definitions = [
            // "declare var packet = " + JSON.stringify(this.props.state.payload),
            // "const state = " + JSON.stringify(this.state.lastState),
            // "const states = " + JSON.stringify(resp.lastStates),
            // "const statesObj = " + JSON.stringify(resp.lastStatesObj),
            "declare var iotnxt = { register : ()=>{}, somenewapicall: ()=>{} }",
            "declare function callback(packet:any)",
            "declare class Facts {",
            "    /**",
            "     * Returns the next fact",
            "     */",
            "    static next():string",
            "}"
        ]

        if (this.props.state) {
            definitions.push("declare var packet = " + JSON.stringify(this.props.state))
            definitions.push("declare var state = " + JSON.stringify(this.props.state))
        }

        //definitions = definitions.concat(resp.pluginDefinitions.definitions);
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            definitions.join("\n"),
            "filename/facts.d.ts"
        );

    }

    // -----------------------------------------------

    onChange = (code, e) => {
        //console.log('onChange', newCode, e);
        console.log(",...")
        this.setState({ code, unsaved: true })
    }

    message = () => {

        if (this.props.state) {
            if (this.props.state.workflowerror) {
                if (this.props.state.workflowerror != "") return <div style={{ color: colors.spotA }}>{this.props.state.workflowerror}</div>
            }
        }

        return <div>Editor</div>

        // {(this.state.message)
        //     ? <div style={{ padding: theme.paddings.default, background: colors.spotC }}>{this.state.message}</div>
        //     : <div></div>}

    }

    render() {

        if (!this.props.state) { return (<div>loading</div>) }
        if (!this.state.code) { return (<div>loading..</div>) }

        const options = {
            selectOnLineNumbers: false,
            minimap: { enabled: false }
        };

        return (<div>

            <div style={{ width: "100%", background: colors.spotC, display: "flex" }}>

                <div style={{ flex: "1 auto", padding: theme.paddings.default }}>
                    {this.message()}
                </div>

                <div style={{ flex: "1 auto", textAlign: "right" }}>
                    {(this.state.unsaved)
                        ? <button onClick={this.saveWorkflow} style={{ background: colors.spotA }}><i className="fas fa-hdd"></i> Save</button>
                        : <button onClick={this.saveWorkflow}><i className="fas fa-hdd"></i> Save</button>
                    }
                </div>


            </div>



            <div>
                <Suspense fallback={<div>loading...</div>}>
                    <MonacoEditor
                        width="100%"
                        height="300"
                        language="typescript"
                        theme="vs-dark"
                        //value={JSON.stringify(this.props.state, null, 2)}
                        value={this.state.code}
                        options={options}
                        onChange={this.onChange}
                        editorDidMount={this.editorDidMount}
                    />
                </Suspense>
            </div>



        </div>
        );
    }
}



