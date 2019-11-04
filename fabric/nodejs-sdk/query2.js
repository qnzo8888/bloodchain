'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode query
 */

var Fabric_Client = require('fabric-client');
var fs = require('fs');
var path = require('path');

var bloodnetwork_path = path.resolve('..', 'fabric', 'blood-network');
var org2tlscacert_path = path.resolve(bloodnetwork_path, 'crypto-config', 'peerOrganizations', 'org2.example.com', 'tlsca', 'tlsca.org2.example.com-cert.pem');
var org2tlscacert = fs.readFileSync(org2tlscacert_path, 'utf8');

//
var fabric_client = new Fabric_Client();

// setup the fabric network
var channel = fabric_client.newChannel('bloodchannel');
var peer = fabric_client.newPeer('grpcs://localhost:9051', {
	'ssl-target-name-override': 'peer0.org2.example.com',
	pem: org2tlscacert
});
channel.addPeer(peer);

//
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
	// assign the store to the fabric client
	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	// use the same location for the state store (where the users' certificate are kept)
	// and the crypto store (where the users' keys are kept)
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	// get the enrolled user from persistence, this user will sign all requests
	return fabric_client.getUserContext('user2', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded user2 from persistence');
	} else {
		throw new Error('Failed to get user2.... run registerUser.js');
	}

	// node query.js [호출 구분 이름] [함수의 매개변수...]  
	// ex)
	// node query.js all
	// node query.js owner 1(사용자 아이디)
	const process = require('process');
	var args = process.argv;
	var func = args[2]; // 무슨 함수 호출할건지 가져옴. 
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
			if (args.length != 4) {
				console.log('인자 개수 error! 다시입력 ㄱㄱ');
				break;
			}
			request = {
				//targets : --- letting this default to the peers assigned to the channel
				chaincodeId: 'bloodchain',
				fcn: 'queryBloodCardsOnlyReg',
				args: args[3]
			};
			break;

		case 'onlydona':
			if (args.length != 4) {
				console.log('인자 개수 error! 다시입력 ㄱㄱ');
				break;
			}
			request = {
				//targets : --- letting this default to the peers assigned to the channel
				chaincodeId: 'bloodchain',
				fcn: 'queryBloodCardsOnlyDona',
				args: args[3]
			};
			break;

		case 'used':
			if (args.length != 4) {
				console.log('인자 개수 error! 다시입력 ㄱㄱ');
				break;
			}
			request = {
				//targets : --- letting this default to the peers assigned to the channel
				chaincodeId: 'bloodchain',
				fcn: 'queryBloodCardsDonaUsed',
				args: args[3]
			};
			break;

		case 'donated':
			if (args.length != 4) {
				console.log('인자 개수 error! 다시입력 ㄱㄱ');
				break;
			}
			request = {
				//targets : --- letting this default to the peers assigned to the channel
				chaincodeId: 'bloodchain',
				fcn: 'queryBloodCardsDonated',
				args: args[3]
			};
			break;

		default:
			break;
	}

	// send the query proposal to the peer
	return channel.queryByChaincode(request);
}).then((query_responses) => {
	console.log("Query has completed, checking results");
	// query_responses could have more than one  results if there multiple peers were used as targets
	if (query_responses && query_responses.length == 1) {
		if (query_responses[0] instanceof Error) {
			console.error("error from query = ", query_responses[0]);
		} else {
			console.log("Response is ", JSON.parse(query_responses[0].toString()));
		}
	} else {
		console.log("No payloads were returned from query");
	}
}).catch((err) => {
	console.error('Failed to query successfully :: ' + err);
});

