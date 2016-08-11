/**
 * Created by srg on 7/29/16.
 */
var async = require('async');

module.exports.createtable = function(dynamo, schema, cb){
    var params = {
        AttributeDefinitions: schema.AttributeDefinitions,
        KeySchema: schema.KeySchema,
        ProvisionedThroughput: {
            ReadCapacityUnits: schema.ProvisionedThroughput.ReadCapacityUnits,
            WriteCapacityUnits: schema.ProvisionedThroughput.WriteCapacityUnits
        },
        TableName: schema.TableName,
    }
    if (schema.GlobalSecondaryIndexes){
        params.GlobalSecondaryIndexes = [];
        async.each(schema.GlobalSecondaryIndexes, function(index){
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
    if (schema.LocalSecondaryIndexes){
        params.LocalSecondaryIndexes = [];
        async.each(schema.LocalSecondaryIndexes, function(index){
            params.LocalSecondaryIndexes.push({
                IndexName: index.IndexName,
                KeySchema: index.KeySchema,
                Projection: index.Projection
            })
        })
    }
    if (schema.StreamSpecification){
        params.StreamSpecification = {
            StreamEnabled : schema.StreamSpecification.StreamEnabled,
            StreamViewType: schema.StreamSpecification.StreamViewType
        }
    }
    console.log('creating table '+JSON.stringify(params));
    dynamo.createTable(params, function(err, results){
        return cb(err, params);
    });
}