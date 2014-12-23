# Analytics Module

This module is for computing analyses of the gathered data. It runs in the background as its own process.

The only currenlt analytic being run is a trend analysis, which takes user-specified search queries (e.g. keyword search) and runs those queries periodically, counting the number of matches. The number of matches per unit time (currently 5 minutes, called 'timeboxes') is returned as a collection and graphed as a histogram.