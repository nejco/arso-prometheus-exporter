const https = require("https")
const parseString = require('xml2js').parseString;
const client = require('prom-client');
const http = require('http');

const url = 'https://meteo.arso.gov.si/uploads/probase/www/observ/surface/text/sl/observationAms_PTUJ_latest.xml'

const register = new client.Registry();

//create a server object:
http.createServer(async function (req, res) {
    res.write(register.metrics()); //write a response to the client
    res.end(); //end the response
}).listen(8080); //the server object listens on port 8080

const tempGauge = new client.Gauge({
    name: 'current_temp',
    help: 'current_temp',
});

const rainGauge = new client.Gauge({
    name: 'current_rain',
    help: 'current_rain',
});

const windMaxGauge = new client.Gauge({
    name: 'current_wind_max',
    help: 'current_wind_max',
});

const windGauge = new client.Gauge({
    name: 'current_wind',
    help: 'current_wind',
});

const humidityGauge = new client.Gauge({
    name: 'current_humidity',
    help: 'current_humidity',
});

register.registerMetric(tempGauge)
register.registerMetric(windGauge)
register.registerMetric(windMaxGauge)
register.registerMetric(rainGauge)
register.registerMetric(humidityGauge)

function updateData() {
    let data = ""
    https.get(url, res => {
        res.setEncoding('utf8');
        console.log("got response code", res.statusCode)

        res.on('data', chunk => {
            data += chunk
        })

        res.on("close", () => {
            console.log("Retrieved all data");
            // console.log("data: ", data)
            parseString(data, function (err, result) {
                // console.log("result.data: ", result.data)

                const latestData = result.data.metData[0];

                const temp = Number(latestData.t[0]);
                const humidity = Number(latestData.rh[0]);
                const wind = Number(latestData.ff_val_kmh[0]);
                const windMax = Number(latestData.ffmax_val_kmh[0]);
                const rain = Number(latestData.rr_val[0]);
                const wwsyn = latestData.wwsyn_icon;

                tempGauge.set(temp);
                humidityGauge.set(humidity);
                windGauge.set(wind);
                windMaxGauge.set(windMax);
                rainGauge.set(rain);

                // JSON.stringify(result.data.metData[0], null, 2)

                // console.log(register.metrics())
                console.log("returned metrics with success")

            });
        });

    })
}

updateData();
setInterval(updateData, 60000)
