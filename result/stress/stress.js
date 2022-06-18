import http from 'k6/http';
import {check, group, sleep, fail} from 'k6';

export const options = {
    stages: [
        {duration: '1m', target: 100},
        {duration: '1m', target: 200},
        {duration: '1m', target: 250},
        {duration: '1m', target: 300},
        {duration: '1m', target: 350},
        {duration: '2m', target: 350},
        {duration: '1m', target: 300},
        {duration: '1m', target: 200},
        {duration: '1m', target: 100},
        {duration: '1m', target: 50},
        {duration: '1m', target: 0}
    ],
    thresholds: {
        http_req_duration: ['p(99)<1000']
    },
};

const BASE_URL = 'https://subway.kangseonghyo.kro.kr'
const USERNAME = 'test@test.com';
const PASSWORD = '1q2w3e4r';

export default function () {
    // 1. 메인페이지에 접속한다.
    let main = http.get(BASE_URL);
    check(main, {'main page access': (resp) => resp.status == 200});

    // 2. 로그인 한다. (엑세스토큰 발급)
    const payload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD
    });

    const params = {headers: {'Content-Type': 'application/json'}};

    let loginRes = http.post(BASE_URL + '/login/token', payload, params);
    check(loginRes, {'logged in successfully': (resp) => resp.json('accessToken') !== ''});

    //3. 즐겨찾기를 조회한다.
    let authHeaders = {headers: {Authorization: `Bearer ${loginRes.json('accessToken')}`}};

    let favorites = http.get(BASE_URL + '/favorites', authHeaders);
    check(favorites, {'favorites response status OK': (resp) => resp.status == 200});

    // 4. 경로검색으로 이동한다.
    let path = http.get(BASE_URL + '/path');
    check(path, {'path page moved': (resp) => resp.status == 200});


    // 5. 경로를 검색한다.
    let pathSearch = http.get(BASE_URL + '/path?source=111&target=116');
    check(pathSearch, {'path search response status OK': (resp) => resp.status == 200});

    sleep(1);

};