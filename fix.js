const cookies = document.cookie
    .split(';')
    .reduce((res, c) => {
        const [key, val] = c.trim().split('=').map(decodeURIComponent)
        try {
            return Object.assign(res, { [key]: JSON.parse(val) })
        } catch (e) {
            return Object.assign(res, { [key]: val })
        }
    }, {});


const token = cookies.auth.token.replace(/\"/g, '');
async function getFreeBookings(id) {
    const response = await fetch(`https://gavleborg-coronavaccination-allmanhet.platform24.se/api/bookings/free/v1/${id}?priority=99&isOnline=1&resourceType=NURSE`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "sv",
            "X-ClientId": "",
            "X-Origin": "gavleborg-coronavaccination-public",
            "Authorization": `Bearer ${token}`,
            "Sec-GPC": "1"
        },
        "referrer": "",
        "method": "GET",
        "mode": "cors"
    });
    return await response.json()
}

async function getCareUnits() {
    const response = await fetch("https://gavleborg-coronavaccination-allmanhet.platform24.se/api/bookings/free/v1?priority=99&isOnline=1&resourceType=NURSE", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "sv",
            "X-ClientId": "",
            "X-Origin": "gavleborg-coronavaccination-public",
            "Authorization": `Bearer ${token}`,
            "Sec-GPC": "1"
        },
        "referrer": "",
        "method": "GET",
        "mode": "cors"
    });
    return await response.json()
}

function getEmptiness () {
    return getCareUnits().then(cus => {
        const promises = cus.map(cu => {
            // console.log(cu.careUnit)
            return getFreeBookings(cu.careUnit.id).then(careUnitWithDates => {
                const listItemText = [...document.querySelectorAll("strong")]
                    .filter(a => a.textContent.includes(careUnitWithDates.careUnit.name))[0]
                // console.log(careUnitWithDates)
                // console.log(careUnitWithDates.dates)
                if (Object.keys(careUnitWithDates.dates).length == 0) {
                    const span = document.createElement('span')
                    span.style = 'color: red'
                    span.textContent = 'TOM - '
                    listItemText.prepend(span)
                    // listItem.closest('[class^=AddressListPage_itemContainer]')
                }
            })
        });
        return Promise.all(promises)
    })
}


function sortList () {
    let lists = document.querySelectorAll('[class^=AddressListPage_rows]')
    let longestList = undefined
    let longest = 0
    lists.forEach(list => {
        if (list.childNodes.length > longest) {
            longestList = list
        }
    });

    let items = longestList.childNodes;
    let itemsArr = [];
    for (let i in items) {
        if (items[i].nodeType == 1) { // get rid of the whitespace text nodes
            itemsArr.push(items[i]);
        }
    }

    itemsArr.sort(function (a, b) {
        if (a.innerText.includes('Välj')) {
            return -1
        }
        if (b.innerText.includes('Välj')) {
            return 1
        }
        return a.innerText == b.innerText
            ? 0
            : (a.innerText > b.innerText ? 1 : -1);
    });

    for (i = 0; i < itemsArr.length; ++i) {
        longestList.appendChild(itemsArr[i]);
    }
}

getEmptiness().then(sortList)
