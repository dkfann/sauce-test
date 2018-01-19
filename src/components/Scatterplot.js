import React from 'react';
import { Scatter } from 'react-chartjs-2';

const Scatterplot = ({ data, options }) => {
    return (
        <div>
            <Scatter
                data={data}
                options={options}
            />
        </div>
    );
};

export default Scatterplot;