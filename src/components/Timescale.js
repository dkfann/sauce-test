import React from 'react';

const Timescale = ({ handleClick }) => {
    return (
        <div>
            <button
                type="button" 
                onClick={ handleClick }
                className="minus-start"
            >
                -1 Day For Min
            </button>

            <button
                type="button" 
                onClick={ handleClick }
                className="plus-start"
            >
                +1 Day For Min
            </button>

            <button
                type="button" 
                onClick={ handleClick }
                className="minus-end"
            >
                -1 Day For Max
            </button>

            <button
                type="button" 
                onClick={ handleClick }
                className="plus-end"
            >
                +1 Day For Max
            </button>
        </div>
    );
};

export default Timescale;