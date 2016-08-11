/**
 * Created by srg on 7/29/16.
 */
var schema = require('./get-schema');
var utils = require('./lib/utils');
var async = require('async');
var deltable = require('./delete-table');
var createtable = require('./create-table');
var argv = utils.config({
    demand: ['table'],
    optional: ['key', 'secret'],
    usage: 'Drops Dynamo DB table and restores schema only\n' +
    'Usage: get-schema --table my-table [--key AK...AA] [--secret 7a...IG]'
});
var jsonfile = require('jsonfile');
var dynamo = utils.dynamo(argv);


async.waterfall([
    function(callback){
        console.log('saving schema for '+argv.table);
        schema.getschema(dynamo, argv.table, callback);
    },
    function(schemafile, callback){
        console.log('getting schema in file '+schemafile);
        jsonfile.readFile(process.cwd()+'/'+schemafile,function(err, schema){
            return callback(err, schema);
        })
    },
    function(schema, callback){
        console.log('got schema, now deleting the table');
        deltable.deletetable(dynamo, argv.table, function(err){
            return callback(err, schema);
        })
    },
    function(schema, callback){
        console.log('creating table');
        createtable.createtable(dynamo,schema, callback);
    }
], function(err, results){
    console.log(err);
    console.log(results);
})
