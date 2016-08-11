/**
 * Created by srg on 7/29/16.
 */
var async = require('async');

module.exports.deletetable = function(dynamo, tablename, cb){
    async.waterfall([
        function(callback){
            console.log('deleting table '+tablename);
            var params = {
                TableName: tablename
            }
            dynamo.deleteTable(params, function(err){
                return callback(err, params);
            });
        },
        function(params, callback){
            console.log('delete command issued, now waiting on table delete');
            dynamo.waitFor('tableNotExists',params, function(err, data){ //http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#tableNotExists-waiter
                if (err){
                    console.log('something went wrong waiting for table deletion!');
                    console.log(err);
                    return callback(err);
                }
                console.log('table delete completed');
                return callback();
            })
        },
    ], function(err){
        return cb(err);
    })
}