Run `npm start` to run the application. It will be hosted on `localhost:3000`.

I had a bit of difficulty troubleshooting some updating problems. For clicking on the nodes, the first time you
click it will update properly, but the other times it will only visually update after you leave the hover state
for the node. Perhaps it's a ChartJS issue, but I was not sure how to debug it.

Another issue is the Timescale events only update properly once, then after that the state is not changing
as I'd expect. It appears that the state is not changing correctly after the first event.

The plotpoints are grabbed from a Firebase database I created. The JSON used is in plotpoints.json.