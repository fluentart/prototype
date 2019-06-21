import React, { Component } from 'react'
import { Widget } from "./widget.jsx"
import ReactApexChart from "react-apexcharts"

export class LineChart extends React.Component {
    dates = [];
    lasttimestamp = "";
    final = false;

    constructor(props) {
        super(props);

        this.state = {
            options: {
                zoomable_line: {
                    stacked: false,
                    zoom: {
                        type: 'x',
                        enabled: true
                    },
                    toolbar: {
                        autoSelected: 'zoom'
                    }
                },
                stroke: {
                    show: true,
                    curve: 'smooth',
                    lineCap: 'butt',
                    colors: undefined,
                    width: 1,
                    dashArray: 0,
                },
                dataLabels: {
                    enabled: false
                },
                grid: {
                    show: true,
                    borderColor: 'rgba(169,169,169, 0.2)',
                    strokeDashArray: 0,
                    position: 'back',
                    xaxis: {
                        opacity: 0.15,
                        lines: {
                            show: true
                        }
                    },
                    yaxis: {
                        opacity: 0.15,
                        lines: {
                            show: true
                        }
                    },
                    padding: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    },
                },
                markers: {
                    size: 0,
                    style: 'full',
                },
                colors: ['#24e079'],
                // title: {
                //     text: 'Stock Price Movement',
                //     align: 'left'
                // },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        inverseColors: false,
                        opacityFrom: 0.5,
                        opacityTo: 0,
                        stops: [0, 90, 100]
                    },
                },
                yaxis: {
                    // title: {
                    //     text: 'Price'
                    // },
                },
                xaxis: {
                    type: 'datetime',
                    // title: {
                    //     text: 'HEllo'
                    // }
                },

                tooltip: {
                    shared: true,
                }
            },
            series: undefined
        }
    }

    componentWillMount = () => {
        this.getdata();
    }

    componentDidUpdate() {
        if (_.has(this, "props.state.payload." + this.props.datapath)) {
            if (this.props.state.payload.timestamp != this.lasttimestamp) {
                if (this.state.series) {
                    this.getdata();
                }
                this.lasttimestamp = this.props.state.payload.timestamp;
            }
        }
    }

    async getdata() {
        await fetch("/api/v3/packets", {
            method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(
                {
                    key: this.props.state.key,
                    datapath: this.props.datapath
                }
            )
        }).then(response => response.json()).then(result => {
            this.dates = [];
            var verify = [];

            if (result.length == 0) {
                this.dates.push([{ String: true }]);
            } else {
                for (var date in result) {
                    if (!Number.isNaN(parseInt(result[date].y))) {
                        // if (date == 0) {
                        //     console.log(result[date])
                        //     console.log("" + parseInt(result[date].x.substr(0, 4)) + "." + result[date].x.substr(5, 2) + "." + parseInt(result[date].x.substr(8, 2)))
                        // }
                        var f = {
                            x: parseInt((new Date("" + parseInt(result[date].x.substr(0, 4)) + "." + result[date].x.substr(5, 2) + "." + parseInt(result[date].x.substr(8, 2))).getTime())),
                            y: parseInt(result[date].y).toFixed(0)
                        }

                        if (typeof result[date].y == "string") {
                            if (typeof parseInt(result[date].y) == "number") {
                                this.dates.push([f.x, parseInt(f.y)]);
                            }
                            verify.push(false);
                        } else {
                            verify.push(true);
                            if (result[date].y == true) {
                                result[date].y = 1;
                            } else if (result[date].y == false) {
                                result[date].y = 0;
                            }
                            var innerArr = [f.x, f.y];
                            this.dates.push(innerArr)
                        }
                    }
                }

                for (var n in verify) {
                    if (verify[n] == true) {
                        this.final = true;
                    }
                }
            }

            this.setState({
                series: [{
                    name: this.props.datapath,
                    data: this.dates
                }]
            });
        }).catch(err => console.error(err.toString()));
    }

    render() {
        if (this.state.series != null) {
            if ((this.state.series[0].data[0].String && this.final == false) || this.state.series[0].data[0].length == 0) {
                return <Widget label={this.props.data.dataname} dash={this.props.dash}><div>This widget doesn't use strings</div></Widget>
            } else {
                return (
                    <div>
                        <Widget label={this.props.data.dataname} dash={this.props.dash}>
                            <div id="chartz">
                                <ReactApexChart style={{ fill: "red" }} options={this.state.options} series={this.state.series} type="area" />
                            </div>
                        </Widget>
                    </div>
                )
            }

        } else {
            return null;
        }
    }
}