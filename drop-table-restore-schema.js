var utils = require('./lib/utils');
var async = require('async');

var argv = utils.config({
    demand: ['table'],
    optional: ['key', 'secret'],
    usage: 'Drops Dynamo DB table and restores from same schema\n' +
    'Usage: drop-table-restore-schema --table my-table [--key AK...AA] [--secret 7a...IG]'
});

var dynamo = utils.dynamo(argv);

async.waterfall([
    //get the table description
    function(callback){
        var params = {
            TableName: argv.table
        }
        console.log('getting table description');
        dynamo.describeTable(params, function(err, results){
            if(err || !results.Table){
                if (err){
                    console.log(err);
                }
                return callback('table not found');
            }
            return callback(err, results.Table);
        });
    },
    //delete the table
    function(table, callback){
        console.log('deleting table '+JSON.stringify(table));
        var params = {
            TableName: table.TableName
        }
        dynamo.deleteTable(params, function(err){
            return callback(err, table);
        });
    },
    //wait for table not exists
    function(table, callback){
        console.log('delete command issued, now waiting on table delete');
        dynamo.waitFor('tableNotExists',params, function(err, data){ //http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#tableNotExists-waiter
            if (err){
                console.log('something went wrong waiting for table deletion!');
                console.log(err);
                return callback(err);
            }
            console.log('table delete completed');
            return callback(null, table);
        })
    },
    //create the table with same schema
    function(table, callback){
        var params = {
            AttributeDefinitions: table.AttributeDefinitions,
            KeySchema: table.KeySchema,
            ProvisionedThroughput: {
                ReadCapacityUnits: table.ProvisionedThroughput.ReadCapacityUnits,
                WriteCapacityUnits: table.ProvisionedThroughput.WriteCapacityUnits
            },
            TableName: table.TableName,
        }
        if (table.GlobalSecondaryIndexes){
            params.GlobalSecondaryIndexes = [];
            async.each(table.GlobalSecondaryIndexes, function(index){
                params.GlobalSecondaryIndexes.push({
                    IndexName: index.IndexName,
                    KeySchema: index.KeySchema,
                    Projection: index.Projection,
                    ProvisionedThroughput: {
                        ReadCapacityUnits: index.ProvisionedThroughput.ReadCapacityUnits,
                        WriteCapacityUnits: index.ProvisionedThroughput.WriteCapacityUnits
                    }
                })
            })
        }
        if (table.LocalSecondaryIndexes){
            params.LocalSecondaryIndexes = [];
            async.each(table.LocalSecondaryIndexes, function(index){
                params.LocalSecondaryIndexes.push({
                    IndexName: index.IndexName,
                    KeySchema: index.KeySchema,
                    Projection: index.Projection
                })
            })
        }
        if (table.StreamSpecification){
            params.StreamSpecification = {
                StreamEnabled : table.StreamSpecification.StreamEnabled,
                StreamViewType: table.StreamSpecification.StreamViewType
            }
        }
        console.log('creating table '+JSON.stringify(params));
        dynamo.createTable(params, function(err, results){
            return callback(err, params);
        })
    }
], function(err, results){
    if(err){
        console.log(err);
    }
    else{
        console.log('table created:');
        console.log(JSON.stringify(results));
    }
});
