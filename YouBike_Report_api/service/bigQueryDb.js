const { BigQuery } = require('@google-cloud/bigquery');


const bigquery = new BigQuery({
    projectId: process.env.GCP_PROJECT_ID
});

module.exports = bigquery;