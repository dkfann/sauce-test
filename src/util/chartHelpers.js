const plotpointColors = {
    pass: 'green',
    error: 'orange',
    fail: 'red',
    selected: 'black',
};

export function onPlotpointClick(onClick, event, elem) {
    if (!elem.length) return;
    onClick({
        datasetIndex: elem[0]._datasetIndex,
        dataIndex: elem[0]._index,
    });
};

const plotpointProperties = {
    pointRadius: 10,
    pointHoverRadius: 15,
    pointBorderWidth: 3,
};

export function generateInitialData(sortedPlotpoints) {
    const datasets = [];
    Object.keys(sortedPlotpoints).forEach(plotpointKey => {
        datasets.push(generateDataset({
            labelName: plotpointKey,
            labelColor: plotpointColors[plotpointKey],
            plotpoints: sortedPlotpoints[plotpointKey],
        }));
    });

    return {
        datasets,
        labels: ['Scatter'],
    }
};

function generateDataset({ labelName, labelColor, plotpoints }) {
    return {
        ...plotpointProperties,
        label: labelName,
        backgroundColor: labelColor,
        pointBackgroundColor: new Array(plotpoints.length).fill(labelColor),
        pointBorderColor: new Array(plotpoints.length).fill(labelColor),
        data: plotpoints,
    };
}

export function generateAxesConfig({ yAxesTitle, xAxesTitle, minPlotpointTime, maxPlotpointTime }) {
    return {
        yAxes: [
            {
                scaleLabel: {
                    display: true,
                    labelString: yAxesTitle,
                },
            },
        ],
        xAxes: [
            {
                type: 'time',
                scaleLabel: {
                    display: true,
                    labelString: xAxesTitle,
                },
                time: {
                    unit: 'day',
                    min: minPlotpointTime,
                    max: maxPlotpointTime,
                },
            }
        ],
    };
}

export function generateInitialOptions({ onClick, axesConfig }) {
    return {
        onClick,
        scales: axesConfig,
    };
};