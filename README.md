# 블록체인(Hyperledger Fabric) 기반 헌혈증 공유 서비스 구축
* Hyperledger Fabric, express(Node.js), sdk(Node.js) 연동한 웹 서비스 구축
* chaincode : Go 언어가 아닌 javascript(Node.js) 사용
* fabric sdk : Node.js 사용
* 상태 db : couchdb 
* fabric 공식 sample의 byfn,  기반 네트워크 구축

## 개발환경 설정
* 가상머신
    * Oracle VM VirtualBox 6.0
* os
    * Ubuntu 18.04.2
* Docker
    * 17.06.2-ce 버전 이상
* Docker-Compose
    * 1.14.0 버전 이상
* Node.js
    * v8 : v8.9.4 이상
    * v10 : v10.15.3 이상
* npm
    * 5.5.1 이상
* python
    * 2.7
* Hyperledger Fabric v1.4.3

### 1. Docker CE 설치
---------------
다음의 명령어들을 한 줄씩 실행

``` sh
~$ sudo apt update
~$ sudo apt install apt-transport-https ca-certificates curl software-properties-common
~$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add
~$ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
~$ sudo apt update
~$ apt-cache policy docker-ce
```

모두 실행하면 다음과 같은 메시지가 표시
``` sh
docker-ce:
  설치: (없음)
  후보: 5:19.03.4~3-0~ubuntu-bionic
  버전 테이블:
     5:19.03.4~3-0~ubuntu-bionic 500
        500 https://download.docker.com/linux/ubuntu bionic/stable amd64 Packages
     5:19.03.3~3-0~ubuntu-bionic 500
        500 https://download.docker.com/linux/ubuntu bionic/stable amd64 Packages
     5:19.03.2~3-0~ubuntu-bionic 500
        500 https://download.docker.com/linux/ubuntu bionic/stable amd64 Packages

```

다음 명령어를 통해 도커를 설치

``` sh
~$ sudo apt install docker-ce
```

잘 설치되었는지 확인
``` sh
~$ sudo docker version

Client: Docker Engine - Community
 Version:           19.03.4
 API version:       1.40
 Go version:        go1.12.10
 Git commit:        9013bf583a
 Built:             Fri Oct 18 15:54:09 2019
 OS/Arch:           linux/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          19.03.4
  API version:      1.40 (minimum version 1.12)
  Go version:       go1.12.10
  Git commit:       9013bf583a
  Built:            Fri Oct 18 15:52:40 2019
  OS/Arch:          linux/amd64
  Experimental:     false
(생략)
```

사용자 docker 그룹에 추가 (sudo 없이 docker 명령어 실행하기 위함)
``` sh
~$ sudo usermod -aG docker <사용자id>
```
재로그인 후 확인
``` sh
~$ docker image

Usage:	docker image COMMAND

Manage images
(생략)
```
### 2. Docker-Compose 설치
---------------
설치
``` sh
~$ sudo apt -y install docker-compose
```
확인
``` sh
~$ docker compose version

docker-compose version 1.17.1, build unknown
docker-py version: 2.5.1
CPython version: 2.7.15+
OpenSSL version: OpenSSL 1.1.1  11 Sep 2018
```

### 3. 파이썬 2.7 설치
---------------
설치되어 있는지 확인
``` sh
~$ python -V

Python 2.7.15+
```
설치 안돼있다면 설치
``` sh
~$ sudo apt -y install python
```
### 4. Node.js, npm 설치
---------------
설치
``` sh
~$ curl -sL https://deb.nodesource.com/setup_8.x | sudo bash -
~$ sudo apt install nodejs
```
확인
``` sh
~$ node -v

v8.16.2
```
``` sh
~$ npm -v

6.4.1
```
### 5. GNU make, gcc/g++, libtool 설치
------------
npm 명령이나 node.js 의존 모듈이나 라이브러리를 설치할 때 모듈을 빌드하는데 필요한 도구들을 설치해준다.
``` sh
~$ sudo apt -y install make gcc g++ libtool
```
### 6. Hyperledger Fabric 도커 이미지 설치 (현재 디폴트 설치 버전 : 1.4.3)
---------------
설치
``` sh
~$ curl -sSL http://bit.ly/2ysbOFE | bash -s
```
패브릭 명령어 디렉터리(bin) path 설정
``` sh
~$ cd fabric-samples
~/fabric-samples$ ls bin
configtxgen    cryptogen  fabric-ca-client  orderer configtxlator  discover  idemixgen  peer
```
```sh
~/fabric-samples$ echo 'export PATH=$PATH:$HOME/fabric-samples/bin' >> ~/.profile
~/fabric-samples$ source ~/.profile
```
패브릭 도커 컨테이너 설치 확인
``` sh
~/fabric-samples$ docker images
REPOSITORY                     TAG                 IMAGE ID            CREATED             SIZE
hyperledger/fabric-tools       1.4.3               18ed4db0cd57        2 months ago        1.55GB
hyperledger/fabric-tools       latest              18ed4db0cd57        2 months ago        1.55GB
hyperledger/fabric-ca          1.4.3               c18a0d3cc958        2 months ago        253MB
hyperledger/fabric-ca          latest              c18a0d3cc958        2 months ago        253MB
hyperledger/fabric-ccenv       1.4.3               3d31661a812a        2 months ago        1.45GB
hyperledger/fabric-ccenv       latest              3d31661a812a        2 months ago        1.45GB
hyperledger/fabric-orderer     1.4.3               b666a6ebbe09        2 months ago        173MB
hyperledger/fabric-orderer     latest              b666a6ebbe09        2 months ago        173MB
hyperledger/fabric-peer        1.4.3               fa87ccaed0ef        2 months ago        179MB
hyperledger/fabric-peer        latest              fa87ccaed0ef        2 months ago        179MB
hyperledger/fabric-javaenv     1.4.3               5ba5ba09db8f        2 months ago        1.76GB
hyperledger/fabric-javaenv     latest              5ba5ba09db8f        2 months ago        1.76GB
hyperledger/fabric-zookeeper   0.4.15              20c6045930c8        7 months ago        1.43GB
hyperledger/fabric-zookeeper   latest              20c6045930c8        7 months ago        1.43GB
hyperledger/fabric-kafka       0.4.15              b4ab82bbaf2f        7 months ago        1.44GB
hyperledger/fabric-kafka       latest              b4ab82bbaf2f        7 months ago        1.44GB
hyperledger/fabric-couchdb     0.4.15              8de128a55539        7 months ago        1.5GB
hyperledger/fabric-couchdb     latest              8de128a55539        7 months ago        1.5GB

```
## 구축 메뉴얼

### 1. 작업 디렉터리 구성 및 패브릭 네트워크 실행
------------

* bloodchain
    * expressApp
    * fabric
        * blood-network
            * 네트워크 구성 파일들 (yaml)
        * chaincode
            * javascript
        * nodejs-sdk
        * startNetwork.sh

위와 같이 fabric 관련 리소스들이 담길 fabric 디렉터리 안에 
fabric 네트워크 구성을 위한 yaml 파일이 담길 blood-network 디렉터리,
javascript chaincode를 위한 chaincode 디렉터리,
skd for node.js를 위한 nodejs-sdk 디렉터리
로 구성되어 있다.

blood-network로 docker에 올라가는 노드들은 다음과 같이 구성된다.<br>
org1 : peer0.org1.example.com, peer1.org1.example.com (admin1, user1)<br>
org2 : peer0.org2.example.com, peer1.org2.example.com (admin2, user2)<br>
(nodejs-sdk에서 각 조직별로 admin과 user을 생성해 user를 통해 네트워크에 접근할 수 있게 한다.)<br>
orderer : orderer.example.com<br>
cli (명령어줄 인터페이스)

먼저 작업할 fabric 디렉터리 생성
```sh
~/fabric-samples$ cd ..
~$ mkdir bloodchain && cd bloodchain && mkdir fabric && cd fabric
```
네트워크 구성파일들 생성(각자 커스터마이징한 파일들 가능, 본 가이드에서는 first-network 파일 이용)
프로젝트 주제에 맞게 blood-network로 수정해서 가져온다.
```sh
~/bloodchain/fabric$ cp -r ../../fabric-samples/first-network/ ./blood-network
```

현재 channel 이름이 mychannel로 설정되어있는데, 각자 app에 맞게 바꿔준다. 여기에선 bloodchannel로 바꿔준다. 바꾸기 위해 grep, sed 명령어를 이용해 모든 파일에 있는 mychannel을 찾아 변경한다.
```sh
sudo grep "mychannel" * -rl | xargs sed -i 's/mychannel/bloodchannel/g'
```

couchdb 옵션으로 byfn 실행해 docker에 네트워크 up
```sh
~/bloodchain/fabric$ cd blood-network && ./byfn.sh up -a -n -s couchdb
```
다음과 같은 내용이 표시되면 성공
```
d orderer connections initialized
2019-10-29 07:07:39.906 UTC [channelCmd] update -> INFO 002 Successfully submitted channel update
===================== Anchor peers updated for org 'Org2MSP' on channel 'mychannel' ===================== 


========= All GOOD, BYFN execution completed =========== 


 _____   _   _   ____   
| ____| | \ | | |  _ \  
|  _|   |  \| | | | | | 
| |___  | |\  | | |_| | 
|_____| |_| \_| |____/  

```

chaincode 디렉터리가 생성된 것을 확인할 수 있다.
```sh
~/bloodchain/fabric/blood-network$ cd ..
~/bloodchain/fabric$ ls
blood-network  chaincode
```

### 2. 샘플 Node.js 체인코드 install 및 instantiate
------------

node.js 로 체인코드를 개발하기 위해에 fabcar의 샘플 javascript 체인코드를 가져온다.
```sh
~/bloodchain/fabric$ cd chaincode
~/bloodchain/fabric/chaincode$ sudo cp -r ../../../fabric-samples/chaincode/fabcar/javascript/ .
```
이후 javascript 안에 있는 fabcar.js의 파일 이름을 app에 맞게 바꾼다. (본 프로젝트에서는 bloodchain으로 변경)<br>
```sh
~/bloodchain/fabric/chaincode$ cd javascript/lib/ && sudo mv fabcar.js bloodchain.js && cd ..
```
index.js 파일과 바뀐 bloodchain.js 파일 안에있는 fabcar 클래스를 모두 bloodchain으로 바꾼다. (명령어 사용해도 됨) <br>

체인코드를 다음과 같이 환경변수 설정하여 byfn으로 up된 4개의 피어에 설치할 것이다.
```sh
export CONFIG_ROOT=/opt/gopath/src/github.com/hyperledger/fabric/peer
export ORG1_MSPCONFIGPATH=${CONFIG_ROOT}/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export ORG1_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export ORG2_MSPCONFIGPATH=${CONFIG_ROOT}/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export ORG2_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export ORDERER_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

peer0.org1에 설치
```sh
docker exec \
  -e CORE_PEER_LOCALMSPID=Org1MSP \
  -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 \
  -e CORE_PEER_MSPCONFIGPATH=${ORG1_MSPCONFIGPATH} \
  -e CORE_PEER_TLS_ROOTCERT_FILE=${ORG1_TLS_ROOTCERT_FILE} \
  cli \
  peer chaincode install \
    -n bloodchain \
    -v 1.0 \
    -p "/opt/gopath/src/github.com/chaincode/javascript" \
    -l "node"
2019-11-13 05:14:08.567 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2019-11-13 05:14:08.567 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2019-11-13 05:14:09.181 UTC [chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" > 

```

peer1.org1에 설치
```sh
docker exec \
  -e CORE_PEER_LOCALMSPID=Org1MSP \
  -e CORE_PEER_ADDRESS=peer1.org1.example.com:8051 \
  -e CORE_PEER_MSPCONFIGPATH=${ORG1_MSPCONFIGPATH} \
  -e CORE_PEER_TLS_ROOTCERT_FILE=${ORG1_TLS_ROOTCERT_FILE} \
  cli \
  peer chaincode install \
    -n bloodchain \
    -v 1.0 \
    -p "/opt/gopath/src/github.com/chaincode/javascript" \
    -l "node"
2019-11-13 05:16:06.780 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2019-11-13 05:16:06.780 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2019-11-13 05:16:06.846 UTC [chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" > 

``` 

peer0.org2에 설치
```sh
docker exec \
  -e CORE_PEER_LOCALMSPID=Org2MSP \
  -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 \
  -e CORE_PEER_MSPCONFIGPATH=${ORG2_MSPCONFIGPATH} \
  -e CORE_PEER_TLS_ROOTCERT_FILE=${ORG2_TLS_ROOTCERT_FILE} \
  cli \
  peer chaincode install \
    -n bloodchain \
    -v 1.0 \
    -p "/opt/gopath/src/github.com/chaincode/javascript" \
    -l "node"
2019-11-13 05:16:06.780 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2019-11-13 05:16:06.780 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2019-11-13 05:16:06.846 UTC [chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" > 
```

peer1.org2에 설치
```sh
docker exec \
  -e CORE_PEER_LOCALMSPID=Org2MSP \
  -e CORE_PEER_ADDRESS=peer1.org2.example.com:10051 \
  -e CORE_PEER_MSPCONFIGPATH=${ORG2_MSPCONFIGPATH} \
  -e CORE_PEER_TLS_ROOTCERT_FILE=${ORG2_TLS_ROOTCERT_FILE} \
  cli \
  peer chaincode install \
    -n bloodchain \
    -v 1.0 \
    -p "/opt/gopath/src/github.com/chaincode/javascript" \
    -l "node"
2019-11-13 05:16:06.780 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2019-11-13 05:16:06.780 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2019-11-13 05:16:06.846 UTC [chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" > 

```
install 후 앵커피어인 peer0.org1.example.com에 instantiate를 한다. -C 엔 채널이름, -n은 체인코드 이름이 들어간다.

```sh
docker exec \
  -e CORE_PEER_LOCALMSPID=Org1MSP \
  -e CORE_PEER_MSPCONFIGPATH=${ORG1_MSPCONFIGPATH} \
  cli \
  peer chaincode instantiate \
    -o orderer.example.com:7050 \
    -C bloodchannel \
    -n bloodchain \
    -l "node" \
    -v 1.0 \
    -c '{"Args":[]}' \
    -P "AND('Org1MSP.member','Org2MSP.member')" \
    --tls \
    --cafile ${ORDERER_TLS_ROOTCERT_FILE} \
    --peerAddresses peer0.org1.example.com:7051 \
    --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE}
2019-11-13 06:31:57.134 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2019-11-13 06:31:57.134 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc

```

모든 peer에 대해 다음 요청될 트랜잭션을 위해 initLedger로 초기화 트랜잭션을 요청한다. (시간 다소 소요)
```sh
docker exec \
  -e CORE_PEER_LOCALMSPID=Org1MSP \
  -e CORE_PEER_MSPCONFIGPATH=${ORG1_MSPCONFIGPATH} \
  cli \
  peer chaincode invoke \
    -o orderer.example.com:7050 \
    -C bloodchannel \
    -n bloodchain \
    -c '{"function":"initLedger","Args":[]}' \
    --waitForEvent \
    --tls \
    --cafile ${ORDERER_TLS_ROOTCERT_FILE} \
    --peerAddresses peer0.org1.example.com:7051 \
    --peerAddresses peer1.org1.example.com:8051 \
    --peerAddresses peer0.org2.example.com:9051 \
    --peerAddresses peer1.org2.example.com:10051 \
    --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE} \
    --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE} \
    --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE} \
    --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}
2019-11-13 06:41:05.280 UTC [chaincodeCmd] ClientWait -> INFO 001 txid [405dfd0e3c2c04061e50faef6bc1bf2963cfe62fb1d3b9c58ec1f17fa11bc4df] committed with status (VALID) at peer0.org2.example.com:9051
2019-11-13 06:41:05.387 UTC [chaincodeCmd] ClientWait -> INFO 002 txid [405dfd0e3c2c04061e50faef6bc1bf2963cfe62fb1d3b9c58ec1f17fa11bc4df] committed with status (VALID) at peer1.org2.example.com:10051
2019-11-13 06:41:05.412 UTC [chaincodeCmd] ClientWait -> INFO 003 txid [405dfd0e3c2c04061e50faef6bc1bf2963cfe62fb1d3b9c58ec1f17fa11bc4df] committed with status (VALID) at peer0.org1.example.com:7051
2019-11-13 06:41:05.426 UTC [chaincodeCmd] ClientWait -> INFO 004 txid [405dfd0e3c2c04061e50faef6bc1bf2963cfe62fb1d3b9c58ec1f17fa11bc4df] committed with status (VALID) at peer1.org1.example.com:8051
2019-11-13 06:41:05.427 UTC [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 005 Chaincode invoke successful. result: status:200 
```

### 3. 체인코드 node.js sdk로 호출 (디렉터리, 체인코드, 채널 이름은 변경하여 blood로 시작하지만(본 프로젝트 관련) 개발가이드는 fabcar 체인코드로 진행한다.)
------------------

모든 체인코드가 설치되면, sdk를 통해 실행해보기 위해 fabcar의 node.js sdk를 가져온다.
``` sh
~/bloodchain/fabric/chaincode$ cd ..
~/bloodchain/fabric$ sudo cp -r ../../fabric-samples/fabcar/javascript-low-level/ .
~/bloodchain/fabric$ ls
blood-network  chaincode  javascript-low-level
```
```sh
다음과 같이 이름 변경
~/bloodchain/fabric$ mv javascript-low-level nodejs-sdk
```

npm 전역 업데이트 후 --force를 붙여 npm install 수행 (error 가능성 대비)
```sh
~/bloodchain/fabric$ cd nodejs-sdk
~/bloodchain/fabric/nodejs-sdk$ npm update -g npm
~/bloodchain/fabric/nodejs-sdk$ npm install --force
```

sdk파일 (enrollAdmin.js, registerUser.js, query.js, invoke.js) 4개 파일의 17번째 줄<br>
var firstnetwork_path = path.resolve('..', '..', 'first-network'); 안에 있는 경로를 ('..', 'blood-network')로 직접 타이핑 해 바꿔준다.(명령어 써도 무관)

이후,

sdk파일 (enrollAdmin.js, registerUser.js, query.js, invoke.js)에 있는 모든 mychannel -> bloodchannel, fabcar -> bloodchain으로 변경하기 위해 다음의 명령어를 수행한다.
```sh
~/bloodchain/fabric/nodejs-sdk$ sudo sed -i 's/mychannel/bloodchannel/' query.js invoke.js
~/bloodchain/fabric/nodejs-sdk$ sudo sed -i 's/fabcar/bloodchain/' query.js invoke.js
```

admin, user를 등록한다. 등록이 완료되면 hfc-key-store 파일이 생성되어 key가 저장되는데, 등록과정에서 오류가 있을 경우 이 파일을 지우고 네트워크를 재시작해야한다.
```sh
~/bloodchain/fabric/nodejs-sdk$ sudo node endrollAdmin.js && sudo node registerUser.js
```
```sh
 Store path:/home/wocjf8888/bloodchain/fabric/nodejs-sdk/hfc-key-store
Successfully enrolled admin user "admin"
Assigned the admin user to the fabric client ::{"name":"admin","mspid":"Org1MSP","roles":null,"affiliation":"","enrollmentSecret":"","enrollment":{"signingIdentity":"e15eda5916303adf2936697b4cb13c35ff41f60328ec840ff35a95695ea2a46a","identity":{"certificate":"-----BEGIN CERTIFICATE-----\nMIICAjCCAaigAwIBAgIUHG+lqhs4pdKOiW7WEIveMlGJMwIwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMTA3MTg1MjAwWhcNMjEwMTA2MTg1\nNzAwWjAhMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBWFkbWluMFkwEwYHKoZI\nzj0CAQYIKoZIzj0DAQcDQgAEomvSR8z9sWYr6XPsbez2MqN2/nplx+uDPiPBZxXx\nymHJd6+k1Py9BpbmDVgrap6zaPhFJwPtAdGQln+1EzU3R6NsMGowDgYDVR0PAQH/\nBAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFDCcCBRwRCy+L0AXs8iXWUsh\nkdiUMCsGA1UdIwQkMCKAIKURN7r/o90PwHWdHU8S8sa2paRvAxuogJzhtU7fbnPp\nMAoGCCqGSM49BAMCA0gAMEUCIQCQz91gfl/Gd37jfA8WtTYhdtjyTHoccn6VIUTL\nxwwXmAIgfMi3fqWhUgJ/a0IpXBopfnuCSoNxMVqqyCwGUUCa2H4=\n-----END CERTIFICATE-----\n"}}}
 Store path:/home/wocjf8888/bloodchain/fabric/nodejs-sdk/hfc-key-store
Successfully loaded admin from persistence
Successfully registered user1 - secret:DZrPHrwbzWNy
Successfully enrolled member user "user1" 
User1 was successfully registered and enrolled and is ready to interact with the fabric network
```
query 수행
```sh
~/bloodchain/fabric/nodejs-sdk$ node query.js
```
```sh
Store path:/home/wocjf8888/bloodchain/fabric/nodejs-sdk/hfc-key-store
Successfully loaded user1 from persistence
Query has completed, checking results
Response is  [{"Key":"CAR0","Record":{"color":"blue","docType":"car","make":"Toyota","model":"Prius","owner":"Tomoko"}},{"Key":"CAR1","Record":{"color":"red","docType":"car","make":"Ford","model":"Mustang","owner":"Brad"}},{"Key":"CAR2","Record":{"color":"green","docType":"car","make":"Hyundai","model":"Tucson","owner":"Jin Soo"}},{"Key":"CAR3","Record":{"color":"yellow","docType":"car","make":"Volkswagen","model":"Passat","owner":"Max"}},{"Key":"CAR4","Record":{"color":"black","docType":"car","make":"Tesla","model":"S","owner":"Adriana"}},{"Key":"CAR5","Record":{"color":"purple","docType":"car","make":"Peugeot","model":"205","owner":"Michel"}},{"Key":"CAR6","Record":{"color":"white","docType":"car","make":"Chery","model":"S22L","owner":"Aarav"}},{"Key":"CAR7","Record":{"color":"violet","docType":"car","make":"Fiat","model":"Punto","owner":"Pari"}},{"Key":"CAR8","Record":{"color":"indigo","docType":"car","make":"Tata","model":"Nano","owner":"Valeria"}},{"Key":"CAR9","Record":{"color":"brown","docType":"car","make":"Holden","model":"Barina","owner":"Shotaro"}}]
```

invoke 수행
```sh
~/bloodchain/fabric/nodejs-sdk$ node invoke.js
```
```sh
.
.
.

Successfully sent Proposal and received response: Status - 200
Registered transaction listener with the peer event service for transaction ID:9b2fd5eac7e26ebe5f192b962f8b09c814d3b9849f91520270849f84adaa29a7
Sending endorsed transaction to the orderer
The transaction has been committed on peer localhost:7051
Successfully sent transaction to the orderer
Successfully committed the change to the ledger by the peer


 - try running "node query.js" to see the results


 --- invoke.js - end
```
다시 query 수행
```sh
~/bloodchain/fabric/nodejs-sdk$ node query.js
```
```sh
Store path:/home/wocjf8888/bloodchain/fabric/nodejs-sdk/hfc-key-store
Successfully loaded user1 from persistence
Query has completed, checking results
Response is  [{"Key":"CAR0","Record":{"color":"blue","docType":"car","make":"Toyota","model":"Prius","owner":"Tomoko"}},{"Key":"CAR1","Record":{"color":"red","docType":"car","make":"Ford","model":"Mustang","owner":"Brad"}},{"Key":"CAR12","Record":{"color":"Black","docType":"car","make":"Honda","model":"Accord","owner":"Tom"}},{"Key":"CAR2","Record":{"color":"green","docType":"car","make":"Hyundai","model":"Tucson","owner":"Jin Soo"}},{"Key":"CAR3","Record":{"color":"yellow","docType":"car","make":"Volkswagen","model":"Passat","owner":"Max"}},{"Key":"CAR4","Record":{"color":"black","docType":"car","make":"Tesla","model":"S","owner":"Adriana"}},{"Key":"CAR5","Record":{"color":"purple","docType":"car","make":"Peugeot","model":"205","owner":"Michel"}},{"Key":"CAR6","Record":{"color":"white","docType":"car","make":"Chery","model":"S22L","owner":"Aarav"}},{"Key":"CAR7","Record":{"color":"violet","docType":"car","make":"Fiat","model":"Punto","owner":"Pari"}},{"Key":"CAR8","Record":{"color":"indigo","docType":"car","make":"Tata","model":"Nano","owner":"Valeria"}},{"Key":"CAR9","Record":{"color":"brown","docType":"car","make":"Holden","model":"Barina","owner":"Shotaro"}}]
```
-> key값으로 CAR12가 추가된 것을 볼 수 있다.

현재, query, invoke 모두 실행할 경우 미리 지정되어있는 체인코드의 함수가 실행된다. (query : queryAllCars, invoke : createCar)<br>
따라서 sdk로 체인코드를 호출하면서 개발하기 위해, query.js, invoke.js 두 sdk 파일을 실행할 때 매개인자를 넣어 호출하고싶은 체인코드 함수를 호출해야한다.<br>
먼저 query.js 55 ~ 62 line의 다음 코드를
```js
// queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'   ],
// queryAllCars chaincode function - requires no arguments , ex: args:     [''],
const request = {
//targets : --- letting this default to the peers assigned to the c    hannel
    chaincodeId: 'bloodchain',
    fcn: 'queryAllCars',
    args: ['']
};
```
다음과 같이 바꿔준다. 
```js
// ex) node query.js [호출할 함수 이름] [함수의 매개변수...]  
const process = require('process');
var args = process.argv;
var func = args[2]; // 무슨 함수 호출할건지 가져옴. 
var request;

switch (func) {
	case 'queryCar':
	    if (args.length != 4) {
			console.log('인자 개수 error!');
			break;
		}
	    var carNumber = args[3]
		request = {
			//targets : --- letting this default to the peers assigned to the channel
			chaincodeId: 'bloodchain',
			fcn: 'queryCar',
			args: [carNumber]
		};
		break;

	case 'queryAllCars':
		if (args.length != 3) {
			console.log('인자 개수 error!');
			break;
		}
		request = {
			//targets : --- letting this default to the peers assigned to the channel
			chaincodeId: 'bloodchain',
			fcn: 'queryAllCars',
			args: ['']
		};
		break;
	default:
		break;
}
```
그 다음 invoke.js 20line의 다음 코드를
```js
invoke();
```
다음과 같이 바꾸고
```js
// node invoke.js [호출할 함수 이름] [함수의 매개변수...]  
const process = require('process');
var args = process.argv;
var func = args[2]; // 무슨 함수 호출할건지 가져옴.  등록(register) 인지 기부(donate) 인지 등등

switch (func) {
	case 'createCar':
	    if(args.length != 8){
			console.log('인자 개수 error!');
			break;
		}
	    var carNumber = args[3];
	    var make = args[4];
	    var model = args[5];
	    var color = args[6];
	    var owner = args[7];
		invoke('createCar', [carNumber, make, model, color, owner]);
		break;
	case 'changeCarOwner':
	    if(args.length != 5){
			console.log('인자 개수 error!');
			break;
		}
	    var carNumber = args[3];
	    var newOwner = args[4];
		invoke('changeCarOwner', [carNumber, newOwner]);
		break;
	default:
		break;
}
```
밑에 있는 invoke() 함수를
```js
async function invoke() { 
```
다음과 같이 매개변수를 추가해준다.
```js
async function invoke(func, params) { 
```

다음, 79 ~ 89 line의 다음 코드를
```js
//  The bloodchain chaincode is able to perform a few functions
//   'createCar' - requires 5 args, ex: args: ['CAR12', 'Honda', 'A    ccord', 'Black', 'Tom']
//   'changeCarOwner' - requires 2 args , ex: args: ['CAR10', 'Dave    ']
const proposal_request = {
    targets: [peer],
    chaincodeId: 'bloodchain',
    fcn: 'createCar',
    args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom'],
    chainId: 'bloodchannel',
    txId: tx_id
};
```
다음과 같이 바꿔준다.
```js
// 위에서 가져온 함수, param 정보대로 proposal_request 객체 생성 
let proposal_request;
switch (func) {
	case 'createCar':
		proposal_request = {
			targets: [peer],
			chaincodeId: 'bloodchain',
			fcn: 'createCar',
			args: params,
			chainId: 'bloodchannel',
			txId: tx_id
		};
		break;
	case 'changeCarOwner':
		proposal_request = {
			targets: [peer],
			chaincodeId: 'bloodchain',
			fcn: 'changeCarOwner',
			args: params,
			chainId: 'bloodchannel',
			txId: tx_id
		};
		break;
	default:
		break;
}
```

호출을 할 때는 node query.js [호출 구분 이름] [함수의 매개변수...] 와 같이 호출한다.<br>
먼저 체인코드의 query 메소드를 sdk의 query.js 파일로 호출해본다. queryCar 같은 경우 특정 key값으로 매개변수를 넣어준다.
```sh
~/bloodchain/fabric/nodejs-sdk$ node query.js queryAllCars
```
```sh
Store path:/home/wocjf8888/bloodchain/fabric/nodejs-sdk/hfc-key-store
Successfully loaded user1 from persistence
Query has completed, checking results
Response is  [{"Key":"CAR0","Record":{"color":"blue","docType":"car","make":"Toyota","model":"Prius","owner":"Tomoko"}},{"Key":"CAR1","Record":{"color":"red","docType":"car","make":"Ford","model":"Mustang","owner":"Brad"}},{"Key":"CAR12","Record":{"color":"Black","docType":"car","make":"Honda","model":"Accord","owner":"Tom"}},{"Key":"CAR2","Record":{"color":"green","docType":"car","make":"Hyundai","model":"Tucson","owner":"Jin Soo"}},{"Key":"CAR3","Record":{"color":"yellow","docType":"car","make":"Volkswagen","model":"Passat","owner":"Max"}},{"Key":"CAR4","Record":{"color":"black","docType":"car","make":"Tesla","model":"S","owner":"Adriana"}},{"Key":"CAR5","Record":{"color":"purple","docType":"car","make":"Peugeot","model":"205","owner":"Michel"}},{"Key":"CAR6","Record":{"color":"white","docType":"car","make":"Chery","model":"S22L","owner":"Aarav"}},{"Key":"CAR7","Record":{"color":"violet","docType":"car","make":"Fiat","model":"Punto","owner":"Pari"}},{"Key":"CAR8","Record":{"color":"indigo","docType":"car","make":"Tata","model":"Nano","owner":"Valeria"}},{"Key":"CAR9","Record":{"color":"brown","docType":"car","make":"Holden","model":"Barina","owner":"Shotaro"}}]
```
```sh
~/bloodchain/fabric/nodejs-sdk$ node query.js queryCar CAR12
```
```sh
Store path:/home/wocjf8888/bloodchain/fabric/nodejs-sdk/hfc-key-store
Successfully loaded user1 from persistence
Query has completed, checking results
Response is  {"color":"Black","docType":"car","make":"Honda","model":"Accord","owner":"Tom"}
```
-> CAR12의 쿼리값이 나오는 것을 볼 수 있다.

마찬가지로 체인코드의 invoke 메소드를 sdk의 invoke.js 파일로 호출한다.
```sh
~/bloodchain/fabric/nodejs-sdk$ node invoke.js createCar CAR77 A A A A
```
```sh
.
.
.

Created a transaction ID: 03b550399da7489ba937e40db520cb17d3cc8a860b23c3e34f1371e4798893f5
Successfully sent Proposal and received response: Status - 200
Registered transaction listener with the peer event service for transaction ID:03b550399da7489ba937e40db520cb17d3cc8a860b23c3e34f1371e4798893f5
Sending endorsed transaction to the orderer
The transaction has been committed on peer localhost:7051
Successfully sent transaction to the orderer
Successfully committed the change to the ledger by the peer


 - try running "node query.js" to see the results


 --- invoke.js - end
```
queryCar로 확인해보면, 정상적으로 key값 CAR77인 자동차 데이터가 생성되는 것을 볼 수 있다.
```sh
~/bloodchain/fabric/nodejs-sdk$ node query.js queryCar CAR77
Store path:/home/wocjf8888/bloodchain/fabric/nodejs-sdk/hfc-key-store
Successfully loaded user1 from persistence
Query has completed, checking results
Response is  {"color":"A","docType":"car","make":"A","model":"A","owner":"A"}
```

changeCarOwner 마찬가지로 매개변수를 넣어 호출해준 후 확인해보면 된다.


### 4. 체인코드 개발(== upgrade)
------------
위의 fabcar 예제에서 차의 색깔을 바꾸는 changeCarColor 함수를 추가한다. 처음 설치한 체인코드의 버전이 1.0이기 때문에,
다음버전 1.1로 peer0.org1에만 새로 install한다.<br>
bloodchain.js 파일 맨 밑 changeCarOwner 함수 밑에 다음 함수를 작성한다.
```js
async changeCarColor(ctx, carNumber, newColor){
	console.info('============= START : changeCarColor ===========');

    const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
    if (!carAsBytes || carAsBytes.length === 0) {
        throw new Error(`${carNumber} does not exist`);
    }
    const car = JSON.parse(carAsBytes.toString());
    car.color = newColor;

    await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
    console.info('============= END : changeCarOwner ===========');
}
```

```sh
docker exec \
  -e CORE_PEER_LOCALMSPID=Org1MSP \
  -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp\
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  cli \
  peer chaincode install \
    -n bloodchain \
    -v 1.1 \
    -p "/opt/gopath/src/github.com/chaincode/javascript" \
    -l "node"
2020-01-07 22:10:03.297 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2020-01-07 22:10:03.298 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2020-01-07 22:10:03.460 UTC [chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" > 

```
install한 후 upgrade 한다.
```sh
docker exec \
  -e CORE_PEER_LOCALMSPID=Org1MSP \
  -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp\
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  cli \
  peer chaincode upgrade \
    -o orderer.example.com:7050\
    -C bloodchannel\
    -n bloodchain \
    -v 1.1 \
    -p "/opt/gopath/src/github.com/chaincode/javascript" \
    -l "node"\
    -c '{"Args":[]}' \
    --tls \
    --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    --peerAddresses peer0.org1.example.com:7051 \
    --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
2020-01-07 22:10:53.861 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2020-01-07 22:10:53.861 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
```

nodejs-sdk의 invoke.js 파일에서 위에 있는 스위치문, invoke(func, params) 함수 안의 스위치문 각각에 다음 case를 작성한다.
```sh
case 'changeCarColor':
    if(args.length != 5){
		console.log('인자 개수 error!');
		break;
	}
    var carNumber = args[3];
    var newColor = args[4];
	invoke('changeCarColor', [carNumber, newColor]);
	break;
```
```sh
case 'changeCarColor':
	proposal_request = {
		targets: [peer],
		chaincodeId: 'bloodchain',
		fcn: 'changeCarColor',
		args: params,
		chainId: 'bloodchannel',
		txId: tx_id
	};
	break;
```
이후 test로 아까 createCar로 새로 생성했던 CAR77의 색깔을 B로 바꾼 후 query해서 확인한다.
```sh
~/bloodchain/fabric/nodejs-sdk$ node invoke.js changeCarColor CAR77 B
~/bloodchain/fabric/nodejs-sdk$ node query.js queryCar CAR77
```
```sh
Response is  {"color":"B","docType":"car","make":"A","model":"A","owner":"A"}
```
-> color가 B로 변경되었다. 작성한 체인코드가 정상적으로 업그레이드 된 것을 알 수 있다.


위와 같은 방식으로 작성된, 본 프로젝트의 체인코드 [개발용 sdk, 체인코드](https://github.com/qnzo8888/bloodchain/tree/master/codeForGuide)에 있는 코드를 chaincode 디렉터리의 bloodchain.js, nodejs-sdk 디렉터리의 query.js, invoke.js 파일에 복사한다.<br> 
이 때, initLedger으로 원래 있던 원장의 내용을 update 해야하므로 
```sh
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker rmi $(docker  images dev-*)
```
위 명령어로 docker 컨테이너와 이미지들을 모두 지운 후, nodejs-sdk의 hfc-key-store 디렉터리를 삭제한다.<br> 
이후 blood-network에서 ./byfn down 후 새로 네트워크를 시작해 체인코드 설치까지 진행한다. (2. 체인코드 install 및 instantiate 까지만 실행)<br>
nodejs-sdk 디렉터리로 가서 admin, user를 재등록 후 본 프로젝트에서 구현한 query, invoke를 실행해본다.<br> 
 ex) donate : key가 인자1인 데이터의 owner를 인자2로, used_place를 인자3값으로 변경, register : key값이 인자1, owner가 인자2인 데이터 저장
```sh
~/bloodchain/fabric/nodejs-sdk$ node query.js all
Store path:/home/wocjf8888/bloodchain/fabric/nodejs-sdk/hfc-key-store
Successfully loaded user1 from persistence
Query has completed, checking results
Response is  [ { Key: 'test',
    Record: 
     { docType: 'bloodCard',
       dona_date: null,
       donater: null,
       is_donated: false,
       is_used: false,
       owner: '1',
       reg_date: '2020-1-8',
       used_date: null,
       used_place: null } } ]
```
```sh
~/bloodchain/fabric/nodejs-sdk$ node invoke.js donate test newTester testPlace
~/bloodchain/fabric/nodejs-sdk$ node invoke.js register test2 owner2
~/bloodchain/fabric/nodejs-sdk$ node query.js all
Response is  [ { Key: 'test',
    Record: 
     { docType: 'bloodCard',
       dona_date: '2020-1-8',
       donater: '1',
       is_donated: true,
       is_used: false,
       owner: 'newTester',
       reg_date: '2020-1-8',
       used_date: null,
       used_place: 'testPlace' } },
  { Key: 'test2',
    Record: 
     { docType: 'bloodCard',
       dona_date: null,
       donater: null,
       is_donated: false,
       is_used: false,
       owner: 'owner2',
       reg_date: '2020-1-8',
       used_date: null,
       used_place: null } } ]
```
다음과 같은 결과가 나오면 성공이고, 이 완성된 sdk, 체인코드를 웹과 연동하면 된다.<br>
본 프로젝트의 sdk 파일은 개발용 sdk 파일과 좀 다른데, 웹과 연동 시 node query.js [호출 구분 이름] [함수의 매개변수...] 와 같이 명령어로 호출하는 것이 아닌
sdk를 모듈화해서 express의 라우터에서 함수로 호출하기 때문에 경로 등이 달라진다.
