# Hyperledger Fabric을 이용한 헌혈증 공유 서비스 구축 가이드
* Hyperledger Fabric, express(Node.js), sdk(Node.js) 연동한 웹 서비스 구축
* chaincode : Go 언어가 아닌 javascript(Node.js) 사용
* fabric sdk : Node.js 사용
* fabric 공식 sample의 byfn 기반 네트워크 구축
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
* 
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
### 5. Hyperledger Fabric 도커 이미지 설치 (현재 디폴트 설치 버전 : 1.4.3)
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

### 1. 패브릭 네트워크 구동
------------
먼저 작업할 디렉터리 생성
```sh
~/fabric-samples$ cd ..
~$ mkdir bloodchain && cd bloodchain
```
