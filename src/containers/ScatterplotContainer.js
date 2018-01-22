import React from 'react';
import Scatterplot from '../components/Scatterplot';
import Rebase from 're-base';
import Firebase from 'firebase/app';
import database from 'firebase/database';
import Timescale from '../components/Timescale';
import { findMinAndMaxPlotpointTimes, sortPlotpointIntoDatasets } from '../util/plotpointHelpers';
import {
    onPlotpointClick,
    generateAxesConfig,
    generateInitialData,
    generateInitialOptions,
} from '../util/chartHelpers';

const app = Firebase.initializeApp({
    apiKey: "AIzaSyBT3qtIm0uznHvjE9Oelad06pzLLVfpZk8",
    authDomain: "sauce-project-da1c0.firebaseapp.com",
    databaseURL: "https://sauce-project-da1c0.firebaseio.com",
    projectId: "sauce-project-da1c0",
    storageBucket: "sauce-project-da1c0.appspot.com",
    messagingSenderId: "1068809114531",
});

const base = Rebase.createClass(Firebase.database(app));

class ScatterplotContainer extends React.Component {
    constructor(props) {
        super(props);
        this.toggleDataNodeSelection = this.toggleDataNodeSelection.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.state = {
            data: null,
            options: null,
            isLoading: true,
        };
    }
    componentDidMount() {
        base.fetch('plotpoints', {
            context: this,
            asArray: true,
        })
        .then(data => {
            const plotpoints = data;
            const minAndMaxPlotpointTimes = findMinAndMaxPlotpointTimes(plotpoints);
            // Add a day buffer to the min and max to pad the chart
            const minPlotpointTime = minAndMaxPlotpointTimes.earliestTime.subtract(1, 'days');
            const maxPlotpointTime = minAndMaxPlotpointTimes.latestTime.add(1, 'days');
            const sortedPlotpoints = sortPlotpointIntoDatasets(plotpoints);

            this.setState({
                data: generateInitialData(sortedPlotpoints),
                options: generateInitialOptions({
                    onClick: onPlotpointClick.bind(this, this.toggleDataNodeSelection),
                    axesConfig: generateAxesConfig({
                        minPlotpointTime,
                        maxPlotpointTime,
                        yAxesTitle: 'Duration (in seconds)',
                        xAxesTitle: 'Date',
                    }),
                }),
                isLoading: false,
            });
        });
    }
    toggleDataNodeSelection({ datasetIndex, dataIndex }) {
        this.setState(prevState => {
            let newDataSets = prevState.data.datasets;
            const elemColor = newDataSets[datasetIndex].backgroundColor;
            const updatedNodeColor =
                newDataSets[datasetIndex].pointBorderColor[dataIndex] === 'black'
                ? elemColor
                : 'black';
            newDataSets[datasetIndex].pointBorderColor[dataIndex] = updatedNodeColor;
            return {
                data: {
                    ...prevState.data,
                    datasets: newDataSets,
                },
            };
        });
    }
    handleClick(event) {
        let newOptions = this.state.options;
        let oldMinTime = newOptions.scales.xAxes[0].time.min;
        let oldMaxTime = newOptions.scales.xAxes[0].time.max;

        switch (event.target.className) {
            case 'minus-start':
                newOptions.scales.xAxes[0].time.min = oldMinTime.add(1, "days");
                break;
            case 'plus-start':
                newOptions.scales.xAxes[0].time.min = oldMinTime.subtract(1, "days");
                break;
            case 'minus-end':
                newOptions.scales.xAxes[0].time.max = oldMaxTime.subtract(1, "days");
                break;
            case 'plus-end':
                newOptions.scales.xAxes[0].time.max = oldMaxTime.add(1, "days");
                break;
            default:
                break;
        }

        this.setState({
            options: newOptions
        });
    }
    render() {
        if (this.state.isLoading) {
            return (
                <div>
                    LOADING
                </div>
            );
        }
        return (
            <div className="scatterplot-container">
                <Scatterplot
                    data={this.state.data}
                    options={this.state.options}
                />
                <Timescale
                    handleClick={this.handleClick}
                />
            </div>
        );
    }
}

export default ScatterplotContainer;