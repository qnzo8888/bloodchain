'use strict';

const { Contract } = require('fabric-contract-api');

class BloodChain extends Contract {

    // 구현 완료
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        // 초기화 데이터
        // const bloodCards = [
        //     {
        //         owner: 'wocjf8888',
        //         reg_date: new Date().toLocaleDateString(),
        //         is_donated: false,
        //         donater: null,
        //         dona_date: null,
        //         is_used: false,
        //         used_place: null,
        //         used_date: null
        //     },
        //     {
        //         owner: 'jaecheol1234',
        //         reg_date: new Date().toLocaleDateString(),
        //         is_donated: false,
        //         donater: null,
        //         dona_date: null,
        //         is_used: false,
        //         used_place: null,
        //         used_date: null
        //     },
        //     {
        //         owner: 'ys97',
        //         reg_date: new Date().toLocaleDateString(),
        //         is_donated: true,
        //         donater: null,
        //         dona_date: null,
        //         is_used: false,
        //         used_place: null,
        //         used_date: null
        //     },
        // ];

        // for (let i = 0; i < bloodCards.length; i++) {
        //     bloodCards[i].docType = 'bloodCard';
        //     await ctx.stub.putState('BLOODCARD' + i, Buffer.from(JSON.stringify(bloodCards[i])));
        //     console.info('Added <--> ', bloodCards[i]);
        // }

        const bloodCards = [
            {
                owner: '1',
                reg_date: new Date().toLocaleDateString(),
                is_donated: false,
                donater: null,
                dona_date: null,
                is_used: false,
                used_place: null,
                used_date: null,
                docType: 'bloodCard'
            }
        ];

        for (let i = 0; i < 20; i++) {
            await ctx.stub.putState((i + 1).toString(), Buffer.from(JSON.stringify(bloodCards[0])));
            console.info('Added <--> ', bloodCards[0]);
        }

        console.info('============= END : Initialize Ledger ===========');
    }

    async getResults(iterator){
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    // 모든 헌혈증의 모든 value 검색(확인용, 구현 완료) return : 헌혈증 key, value(record) 문자열화 한 배열
    async queryAllBloodCards(ctx) {
        const iterator = await ctx.stub.getQueryResult(`{
            "selector": {
                "docType": "bloodCard"
            }
        }`);
        return this.getResults(iterator);
    }

    //등록 o 기부 x    return : reg_date
    async queryBloodCardsOnlyReg(ctx, owner) {
        const iterator = await ctx.stub.getQueryResult(`{
            "selector": {
                "docType": "bloodCard",
                "is_donated": false,
                "owner": "${owner}"
            },
            "fields": ["reg_date"]
        }`);
        return this.getResults(iterator);
    }

    // 기부 o 사용 o | x  return 
    async queryBloodCardsDona(ctx, donater) {
        const iterator = await ctx.stub.getQueryResult(`{
            "selector": {
                "docType": "bloodCard",
                "donater": "${donater}"
            }
        }`);
        return this.getResults(iterator);
    }

    // 기부받은 헌혈증 확인
    async queryBloodCardsDonated(ctx, owner) {
        const iterator = await ctx.stub.getQueryResult(`{
            "selector": {
                "docType": "bloodCard",
                "is_donated": true,
                "owner": "${owner}"
            }
        }`);
        return this.getResults(iterator);
    }

    // 헌혈증 등록(구현 완료) return : x
    async register(ctx, serialNumber, owner) {
        console.info('============= START : Create bloodCard ===========');
        const bloodCard = {
            owner,
            reg_date: new Date().toLocaleDateString(),
            is_donated: false,
            donater: null,
            dona_date: null,
            is_used: false,
            used_place: null,
            used_date: null,
            docType: 'bloodCard',
        };

        await ctx.stub.putState(serialNumber, Buffer.from(JSON.stringify(bloodCard)));
        console.info('============= END : Create bloodCard ===========');
    }

    // 기부할 헌혈증들의 serial 번호를 쿼리 return : serials[]
    async querySerialsForDonate(ctx, donate_count, donater) {
        console.info('============= START : donate ===========');

        const { iterator, metadata }= await ctx.stub.getQueryResultWithPagination(`{
            "selector": {
                "reg_date": {"$ne": null},
                "docType": "bloodCard", 
                "owner": "${donater}", 
                "is_donated": false
            },
            "sort": [
                {"reg_date": "asc"}
            ]
        }`, Number(donate_count));
        console.log(metadata);

        var serials = [];

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const serial = res.value.key;
                
                serials.push(serial);
            }
            if (res.done) {
                await iterator.close();
                console.log(serials);
                console.info('============= END : donate ===========');
                return JSON.stringify(serials);
            }
        }
    }

    // getDonatedSerial 로 가져온 serial들 중 serial 하나에 해당하는 헌혈증을 기부처리 한다.
    async donate(ctx, serial, newOwner, used_place){
        var value = await ctx.stub.getState(serial);
        var bloodCard = JSON.parse(value.toString('utf8'));
        bloodCard.donater = bloodCard.owner;
        bloodCard.owner = newOwner;
        bloodCard.is_donated = true;
        bloodCard.dona_date = new Date().toLocaleDateString();
        bloodCard.used_place = used_place;
        await ctx.stub.putState(serial, Buffer.from(JSON.stringify(bloodCard)));
    }

    // 헌혈증 사용(구현 완료) return : x
    async useCard(ctx, serial){
        var value = await ctx.stub.getState(serial);
        if (!value || value.length === 0) {
            throw new Error(`${serial} does not exist`);
        }
        var bloodCard = JSON.parse(value.toString('utf8'));
        bloodCard.is_used = true;
        bloodCard.used_date = new Date().toLocaleDateString();
        await ctx.stub.putState(serial, Buffer.from(JSON.stringify(bloodCard)));
        // const iterator = await ctx.stub.getQueryResult(`{ \"selector\": {\"docType\": \"bloodCard\", \"owner\": \"${donateRequester}\"} }`);
        // while (true) {
        //     const res = await iterator.next();

        //     var bloodCard = JSON.parse(res.value.value.toString('utf8'));
        //     bloodCard.is_used = true;
        //     bloodCard.used_date = new Date().toLocaleDateString();
        //     await ctx.stub.putState(res.value.key, Buffer.from(JSON.stringify(bloodCard)));
        //     if(res.done)
        //         return;
        // }
    }

}

module.exports = BloodChain;
