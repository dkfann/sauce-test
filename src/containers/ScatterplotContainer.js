import React from 'react';
import Scatterplot from '../components/Scatterplot';
import Rebase from 're-base';
import Firebase from 'firebase/app';
import database from 'firebase/database';
import moment from 'moment';
import Timescale from '../components/Timescale';

const app = Firebase.initializeApp({
    apiKey: "AIzaSyBT3qtIm0uznHvjE9Oelad06pzLLVfpZk8",
    authDomain: "sauce-project-da1c0.firebaseapp.com",
    databaseURL: "https://sauce-project-da1c0.firebaseio.com",
    projectId: "sauce-project-da1c0",
    storageBucket: "sauce-project-da1c0.appspot.com",
    messagingSenderId: "1068809114531"
});

const base = Rebase.createClass(Firebase.database(app));

class ScatterplotContainer extends React.Component {
    constructor(props) {
        super(props);
        this.generateInitialData = this.generateInitialData.bind(this);
        this.generateInitialOptions = this.generateInitialOptions.bind(this);
        this.toggleDataNodeSelection = this.toggleDataNodeSelection.bind(this);
        this.sortPlotpointIntoDatasets = this.sortPlotpointIntoDatasets.bind(this);
        this.findMinAndMaxPlotpointTimes = this.findMinAndMaxPlotpointTimes.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.colorMapping = {
            pass: 'green',
            error: 'orange',
            fail: 'red',
            selected: 'black',
        };

        this.state = {
            data: null,
            options: null,
            isLoading: true,
        };
    }
    componentWillMount() {
        base.fetch('plotpoints', {
            context: this,
            asArray: true,
        })
        .then(data => {
            const plotpoints = data;
            const minAndMaxPlotpointTimes = this.findMinAndMaxPlotpointTimes(plotpoints);
            // Add a day buffer to the min and max to pad the chart
            const minPlotpointTime = minAndMaxPlotpointTimes.earliestTime.subtract(1, 'days');
            const maxPlotpointTime = minAndMaxPlotpointTimes.latestTime.add(1, 'days');
            const sortedPlotpoints = this.sortPlotpointIntoDatasets(plotpoints);

            this.setState({
                data: this.generateInitialData(sortedPlotpoints),
                options: this.generateInitialOptions({
                    minPlotpointTime,
                    maxPlotpointTime,
                }),
                isLoading: false,
            });
        });
    }
    findMinAndMaxPlotpointTimes(plotpoints) {
        let earliestTime = null;
        let latestTime = null;
        plotpoints.forEach(plotpoint => {
            if (!earliestTime) {
                earliestTime = moment(plotpoint.start_time);
            }
            if (!latestTime) {
                latestTime = moment(plotpoint.start_time);
            }
            else {
                earliestTime = moment(plotpoint.start_time).isBefore(earliestTime)
                    ? moment(plotpoint.start_time)
                    : earliestTime;

                latestTime = moment(plotpoint.start_time).isAfter(latestTime)
                    ? moment(plotpoint.start_time)
                    : latestTime;
            }
        });

        return {
            earliestTime,
            latestTime,
        };
    }
    sortPlotpointIntoDatasets(plotpoints) {
        const passPlotpoints = [];
        const errorPlotpoints = [];
        const failPlotpoints = [];
        plotpoints.forEach(plotpoint => {
            // Convert plotpoint into a ChartJS data node
            plotpoint = {
                t: plotpoint.start_time,
                y: Math.min(300, Math.max(0, plotpoint.duration)),
                status: plotpoint.status,
            };

            switch (plotpoint.status) {
                case 'pass':
                    passPlotpoints.push(plotpoint);
                    break;
                case 'error':
                    errorPlotpoints.push(plotpoint);
                    break;
                case 'fail':
                    failPlotpoints.push(plotpoint);
                    break;
                default:
                    break;
            }
        });

        return {
            passPlotpoints,
            errorPlotpoints,
            failPlotpoints,
        };
    }
    generateInitialData(sortedPlotpoints) {
        return {
            labels: ['Scatter'],
            datasets: [
                {
                    label: 'Pass',
                    pointRadius: 10,
                    pointHoverRadius: 15,
                    pointBorderWidth: 3,
                    backgroundColor: this.colorMapping.pass,
                    // Creates an prepopulated array of the same color based on the status
                    // This is required to change an individual data point's color by modifying this value through the data point's index
                    pointBackgroundColor: new Array(sortedPlotpoints.passPlotpoints.length).fill(this.colorMapping.pass),
                    pointBorderColor: new Array(sortedPlotpoints.passPlotpoints.length).fill(this.colorMapping.pass),
                    data: sortedPlotpoints.passPlotpoints,
                },
                {
                    label: 'Error',
                    pointRadius: 10,
                    pointHoverRadius: 15,
                    pointBorderWidth: 3,
                    backgroundColor: this.colorMapping.error,
                    pointBackgroundColor: new Array(sortedPlotpoints.errorPlotpoints.length).fill(this.colorMapping.error),
                    pointBorderColor: new Array(sortedPlotpoints.errorPlotpoints.length).fill(this.colorMapping.error),
                    data: sortedPlotpoints.errorPlotpoints,
                },
                {
                    label: 'Fail',
                    pointRadius: 10,
                    pointHoverRadius: 15,
                    pointBorderWidth: 3,
                    backgroundColor: this.colorMapping.fail,
                    pointBackgroundColor: new Array(sortedPlotpoints.failPlotpoints.length).fill(this.colorMapping.fail),
                    pointBorderColor: new Array(sortedPlotpoints.failPlotpoints.length).fill(this.colorMapping.fail),
                    data: sortedPlotpoints.failPlotpoints,
                },
            ],
        }
    }
    generateInitialOptions({ minPlotpointTime, maxPlotpointTime }) {
        return {
            onClick: (event, elem) => {
                if (!elem.length) return;
                this.toggleDataNodeSelection({
                    datasetIndex: elem[0]._datasetIndex,
                    dataIndex: elem[0]._index,
                });
            },
            scales: {
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Duration (In Seconds)',
                        },
                    }
                ],
                xAxes: [
                    {
                        type: 'time',
                        scaleLabel: {
                            display: true,
                            labelString: 'Date',
                        },
                        time: {
                            unit: 'day',
                            min: minPlotpointTime,
                            max: maxPlotpointTime,
                        },
                    }
                ],
            },
        };
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
            }
        });
    }
    handleClick(event) {
        let newOptions = this.state.options;
        let oldMinTime = newOptions.scales.xAxes[0].time.min;
        let oldMaxTime = newOptions.scales.xAxes[0].time.max;

        switch (event.target.className) {
            case 'minus-start':
                newOptions.scales.xAxes[0].time.min = oldMinTime.add(1, "days");
                this.setState({
                    options: newOptions
                });
                break;
            case 'plus-start':
                newOptions.scales.xAxes[0].time.min = oldMinTime.subtract(1, "days");
                this.setState({
                    options: newOptions
                });
                break;
            case 'minus-end':
                newOptions.scales.xAxes[0].time.max = oldMaxTime.subtract(1, "days");
                this.setState({
                    options: newOptions
                });
                break;
            case 'plus-end':
                newOptions.scales.xAxes[0].time.max = oldMaxTime.add(1, "days");
                this.setState({
                    options: newOptions
                });
                break;
            default:
                break;
        }
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