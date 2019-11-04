'use strict';

/*
 * Chaincode query
 */

var Fabric_Client = require('fabric-client');
var fs = require('fs');
var path = require('path');

var bloodnetwork_path = path.resolve('..', 'fabric', 'blood-network');
var org1tlscacert_path = path.resolve(bloodnetwork_path, 'crypto-config', 'peerOrganizations', 'org1.example.com', 'tlsca', 'tlsca.org1.example.com-cert.pem');
var org1tlscacert = fs.readFileSync(org1tlscacert_path, 'utf8');

//
var fabric_client = new Fabric_Client();

// setup the fabric network
var channel = fabric_client.newChannel('bloodchannel');
var peer = fabric_client.newPeer('grpcs://localhost:7051', {
	'ssl-target-name-override': 'peer0.org1.example.com',
	pem: org1tlscacert
});
channel.addPeer(peer);

//
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);

var queryResult;

// query 함수로 묶고 promise, then -> async, await로 변경
async function query(func, params) {
	var state_store = await Fabric_Client.newDefaultKeyValueStore({ path: store_path });
	// assign the store to the fabric client
	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	// use the same location for the state store (where the users' certificate are kept)
	// and the crypto store (where the users' keys are kept)
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	// get the enrolled user from persistence, this user will sign all requests
	var user_from_store = await fabric_client.getUserContext('user1', true);


	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded user1 from persistence');
	} else {
		throw new Error('Failed to get user1.... run registerUser.js');
	}

	var request;
	switch (func) {
		case 'all':
			request = {
				//targets : --- letting this default to the peers assigned to the channel
				chaincodeId: 'bloodchain',
				fcn: 'queryAllBloodCards',
				args: ['']
			};
			break;

		case 'onlyreg':
			// if (args.length != 4) {
			// 	console.log('인자 개수 error! 다시입력 ㄱㄱ');
			// 	break;
			// }
			request = {
				//targets : --- letting this default to the peers assigned to the channel
				chaincodeId: 'bloodchain',
				fcn: 'queryBloodCardsOnlyReg',
				args: [params[0]]
			};
			break;

		case 'dona':
			// if (args.length != 4) {
			// 	console.log('인자 개수 error! 다시입력 ㄱㄱ');
			// 	break;
			// }
			request = {
				//targets : --- letting this default to the peers assigned to the channel
				chaincodeId: 'bloodchain',
				fcn: 'queryBloodCardsDona',
				args: [params[0]]
			};
			break;

		case 'donated':
			// if (args.length != 4) {
			// 	console.log('인자 개수 error! 다시입력 ㄱㄱ');
			// 	break;
			// }
			request = {
				//targets : --- letting this default to the peers assigned to the channel
				chaincodeId: 'bloodchain',
				fcn: 'queryBloodCardsDonated',
				args: [params[0]]
			};
			break;

		case 'querySerialsForDonate':
			// if (args.length != 5) {
			// 	console.log('인자 개수 error! 다시입력 ㄱㄱ');
			// 	break;
			// }
			console.log(params)
			request = {
				//targets : --- letting this default to the peers assigned to the channel
				chaincodeId: 'bloodchain',
				fcn: 'querySerialsForDonate',
				args: [params[0].toString(), params[1]]
			};
			break;

		default:
			break;
	}

	// send the query proposal to the peer
	var query_responses = await channel.queryByChaincode(request);
	
	var queryResult;

	console.log("Query has completed, checking results");
	// query_responses could have more than one  results if there multiple peers were used as targets
	if (query_responses && query_responses.length == 1) {
		if (query_responses[0] instanceof Error) {
			console.error("error from query = ", query_responses[0]);
		} else {
			queryResult = JSON.parse(query_responses[0].toString());
			console.log("Response is ", queryResult);
			return new Promise(function(resolve, reject){
				resolve(queryResult);
			});
		}
	} else {
		console.log("No payloads were returned from query");
	}
}
	
module.exports.query = query;
