import React, { Component } from 'react';
import { WidgetComponent } from "./widgetcomponent"
import { api } from "../../../api"
import { ResponsiveCalendar } from '@nivo/calendar'
import { widgetCalendar } from "../../../theme"

export default class WidgetCalendar extends WidgetComponent {
    state = {
        options: {},
        gettingdata: false,
        data: []
    }

    componentDidUpdate() {
        if (!this.state.gettingdata) {
            this.state.gettingdata = true;
            var key = this.props.state.key
            api.activity({ key }, (err, data: any) => {
                if (err) { console.log(err); }
                if (data) {
                    this.setState({ data })
                }
            })
        }
    }

    render() {
        return (
            <ResponsiveCalendar
                data={this.state.data}
                from="2019-01-01"
                to="2019-12-30"
                emptyColor={widgetCalendar.emptyColor}
                colors={widgetCalendar.colors}
                margin={widgetCalendar.margin}
                yearSpacing={35}
                yearLegendOffset={11}
                monthBorderWidth={1}
                monthBorderColor={widgetCalendar.monthBorderColor}
                monthLegendOffset={7}
                daySpacing={3}
                dayBorderWidth={2}
                dayBorderColor={widgetCalendar.dayBorderColor}
                theme={widgetCalendar.theme}
            />
        );
    }
};