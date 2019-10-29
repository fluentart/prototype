import React, { Component } from 'react';
import { WidgetComponent } from "./widgetcomponent"
import { api } from "../../../api"
import { colors } from "../../../theme"

export default class WidgetCanvas extends WidgetComponent {
    state = {
        options: {
            color: { type: "color", default: "#00C66D", value: "" }
        },
        width: 100,
        height: 100,
        gettingdata: false,
        data: []
    }

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    wrapper;

    componentDidMount() {
        this.wrapper = React.createRef();
        this.canvas = this.refs.canvas as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")
        // const img = this.refs.image
        // img.onload = () => {
        //   ctx.drawImage(img, 0, 0)
        //   ctx.font = "40px Courier"
        //   ctx.fillText(this.props.text, 210, 75)
        // }
        this.drawCanvas();

        if (!this.state.gettingdata) {
            this.state.gettingdata = true;
            var key = this.props.state.key
            // api.activity({ key }, (err, data: any) => {
            //     if (err) { console.log(err); }
            //     if (data) {
            //         console.log(data);
            //         this.setState({ data })
            //     }
            // })
            // temp generate data:
            var data = []
            for (var a = 0; a < 100; a++) {
                var dp = { x: a, value: (Math.random() * 10) + (a / 5) }
                data.push(dp);
            }
            console.log(data);
            // presort
            this.setState({ data })
        }
    }

    componentDidUpdate() {
        console.log("Graph componentDidUpdate")
        //console.log(this.ctx)
        var dimensions = {
            width: this.wrapper.current.offsetWidth,
            height: this.wrapper.current.offsetHeight
        }

        if ((this.state.height != dimensions.height) || (this.state.width != dimensions.width)) {
            this.setState(dimensions, () => { this.drawCanvas() });
        }



        console.log(dimensions);
        console.log(this.ctx.canvas.width)
    }

    drawCanvas() {
        if (!this.ctx) { return; }
        // clear bg
        this.ctx.clearRect(0, 0, this.state.width, this.state.height);

        this.ctx.strokeStyle = "#565859"
        this.ctx.lineWidth = 2;

        // drawaxis
        this.ctx.beginPath();
        this.ctx.moveTo(60, this.state.height - 60); // bottom left
        this.ctx.lineTo(this.state.width - 60, this.state.height - 60); // bottom right
        this.ctx.lineTo(this.state.width - 60, 60); //top right
        this.ctx.stroke();

        this.drawGraph();
    }



    drawBox() {

    }

    drawGraph() {
        var offset = { x: 30, y: this.state.height - 30 }
        var scale = { x: 5, y: 5 }

        //no data?
        if (this.state.data.length == 0) return;
        this.ctx.strokeStyle = this.state.options.color.value
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        //start
        this.ctx.moveTo(0 + offset.x, offset.y - (this.state.data[0].value * scale.y));
        for (var d of this.state.data) {
            this.ctx.lineTo(offset.x + (d.x * scale.x), offset.y - (d.value * scale.y));
        }
        this.ctx.stroke();
    }


    render() {
        this.drawCanvas();
        return (
            <div ref={this.wrapper} style={{ height: "100%" }}>
                <canvas ref="canvas" width={this.state.width} height={this.state.height} />
            </div>
        );
    }
};

