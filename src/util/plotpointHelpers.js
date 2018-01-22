import moment from 'moment';

export function findMinAndMaxPlotpointTimes(plotpoints) {
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
};

export function sortPlotpointIntoDatasets(plotpoints) {
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
        pass: passPlotpoints,
        error: errorPlotpoints,
        fail: failPlotpoints,
    };
}