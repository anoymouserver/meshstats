// +---------------------------------------------------------------------------
// |  File: meshstats.js    UTF-8
// |  Author: anoymouserver
// |  Status:
// |  Revision: 2015/12/16
// +---------------------------------------------------------------------------
'use strict';

var stats = {};

stats.jsonPath = "http://map.ffggrz.de/data.php/nodes.json";

stats.gateways = 0;
stats.nodes = {
    total: 0,
    online: 0,
    offline: 0,
    geo: 0
};
stats.users = 0;

$(document).ready(function () {
    stats.getCurrentStats();
    setInterval(function(){stats.getCurrentStats()}, 20 * 1000);
})
.on("usersupdated", function () {
    console.log("Online Users: " + stats.users);

    $('#users-online').text(stats.users);
})
.on("nodesupdated", function () {
    console.log("Online Nodes: " + stats.nodes.online);
    console.log("Nodes with GEO: " + stats.nodes.geo);
    console.log("Total Nodes: " + stats.nodes.total);
    console.log("Gateways: " + stats.gateways);

    $('#nodes-total').text(stats.nodes.total);

    $('#nodes-online').text(stats.nodes.online + " (" + stats.getPercent(
            stats.nodes.total, stats.nodes.online).toFixed(2).replace(".", ",") + "%)");
    $('#nodes-offline').text(stats.nodes.offline + " (" + stats.getPercent(
            stats.nodes.total, stats.nodes.offline).toFixed(2).replace(".", ",") + "%)");
    $('#nodes-geo').text(stats.nodes.geo + " (" + stats.getPercent(
            stats.nodes.total, stats.nodes.geo).toFixed(2).replace(".", ",") + "%)");
    $('#nodes-gateways').text(stats.gateways);
});

stats.getCurrentStats = function() {
    $.getJSON(stats.jsonPath, function (data) {

        var nodes = $.map(data.nodes, function(e) {return e;});
        var date = new Date(data.timestamp);
        var stats_tmp = {nodes: {}};

        stats_tmp.nodes.online = nodes.filter(function (d) {
                return d.flags.online;
            }).length;
        stats_tmp.nodes.total = nodes.filter(function (d) {
                return !d.flags.gateway;
            }).length;
        stats_tmp.gateways = nodes.filter(function (d) {
                return d.flags.gateway && d.flags.online;
            }).length;
        stats_tmp.users = nodes.reduce(function (previousValue, currentValue) {
                if (typeof(previousValue) !== "number") {
                    previousValue = 0;
                }
                return previousValue + currentValue.statistics.clients;
            });
        stats_tmp.nodes.geo = nodes.filter(function (d) {
                return d.nodeinfo.location;
            }).length;

        if (stats.users !== (stats_tmp.users)) {
            stats.users = stats_tmp.users;
            $(document).trigger("usersupdated");
        }
        if ( stats.nodes.total !== stats_tmp.nodes.total || 
             stats.nodes.online !== stats_tmp.nodes.online || 
             stats.nodes.geo !== stats_tmp.nodes.geo )
        {
            stats.gateways = stats_tmp.gateways;
            stats.nodes.total = stats_tmp.nodes.total;
            stats.nodes.online = stats_tmp.nodes.online;
            stats.nodes.offline = stats_tmp.nodes.total - stats_tmp.nodes.online;
            stats.nodes.geo = stats_tmp.nodes.geo;
            $(document).trigger("nodesupdated");
        }
    });
};

stats.getPercent = function(base, portion) {
    return (base && portion) ? (portion / base * 100) : 0;
};
