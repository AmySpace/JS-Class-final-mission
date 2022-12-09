const config = {
    headers :{
        Authorization : 'FdqNHmWvfoetfeK5vvYi4hfxZlh2'
    }
};

const orderList = document.querySelector('.orderPage-table tbody');
let orderData = [];

// 預設
function init(){
    getOrder();
};
init();

// 訂單列表
function getOrder(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiKey}/orders`,config).then(function(response){
        orderData = response.data.orders;
        render();        
        return;
        }).catch(function(error){
            alert('資料讀取錯誤!!');
        })    
};

// 訂單渲染
function render(){
    let str = '';
    orderData.forEach(i=>{
        // 訂單品項多品
        let ptStr = '';
        i.products.forEach(p=>{
            ptStr += `<p>${p.title} / ${p.quantity}</p>`
        });

        // 訂單日期
        let allDate = new Date(i.createdAt*1000);
        let orderDate = `${allDate.getFullYear()}/${allDate.getMonth()+1}/${allDate.getDate()}`;
        
        // 訂單狀態
        let status = '';
        if(i.paid === true){
            status = '已處理';
        }else{
            status = '未處理';
        }

        // 訂單渲染
        str += `
        <tr>
            <td>${i.id}</td>
            <td>
                <p>${i.user.name}</p>
                <p>${i.user.tel}</p>
            </td>
            <td>${i.user.address}</td>
            <td>${i.user.email}</td>
            <td>
                <p>${ptStr}</p>
            </td>
            <td>${orderDate}</td>
            <td class="orderStatus">
                <a href="#" data-id="${i.id}">${status}</a>
            </td>
            <td>
                <input type="button" data-id="${i.id}" class="delSingleOrder-Btn" value="刪除">
            </td>
        </tr>
        `;
    });
    orderList.innerHTML = str;
    // document.querySelectorAll('.section-title button')[0].setAttribute('class','checked');
    c3Render();
};


// 訂單狀態切換+刪除
orderList.addEventListener('click',chgDel);
function chgDel(e){
    e.preventDefault();
    let orderId = e.target.getAttribute('data-id');
    orderData.forEach(i=>{
        if(i.id === orderId){
            // 訂單狀態切換
            if(e.target.nodeName === 'A'){
                let status = '';
                if(i.paid === true){
                    status = false;
                }else{
                    status = true;
                }
                chgStatus(orderId,status);
            };

            // 刪除單筆訂單
            if(e.target.getAttribute('class') === 'delSingleOrder-Btn'){
                delOne(orderId);
            };            
        }
    })
};


// 訂單狀態切換
function chgStatus(id,paid){
    let obj = {
        "data": {
          "id": id,
          "paid": paid
        }
    };
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiKey}/orders`,obj,config).then(function(response){
            alert('訂單狀態切換成功!!');
            getOrder();
        }).catch(function(error){
            alert('訂單狀態切換失敗!!');
        });
};


// 刪除單筆訂單
function delOne(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiKey}/orders/${id}`,config).then(function(response){
            alert('刪除該筆訂單成功!!');
            getOrder();
        }).catch(function(error){
            alert('刪除該筆訂單失敗!!');
        });
};


// 刪除全部訂單
const delAll = document.querySelector('.discardAllBtn');
delAll.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiKey}/orders/`,config).then(function(response){
            alert('刪除全部訂單成功!!');
            getOrder();
        }).catch(function(error){
            alert('刪除全部訂單失敗!!');
        });
});

// c3圖表切換
const c3Buts = document.querySelector('.section-title');
c3Buts.addEventListener('click',function(e){
    e.preventDefault();
    if(e.target.nodeName === 'BUTTON'){
        e.target.setAttribute('class','checked');
        if(e.target.textContent === '全產品類別營收比重'){
            e.target.setAttribute('class','checked');
            e.target.nextElementSibling.setAttribute('class','');
            c3Render();
        }else if(e.target.textContent === '全品項營收比重'){
            e.target.setAttribute('class','checked');
            e.target.previousElementSibling.setAttribute('class','');
            c3RenderLv2();
        };
    }else{
        return;
    };    
})

// C3.js
// 類別營收比重
function c3Render(){
    let c3Obj ={};
    orderData.forEach(i=>{        
        i.products.forEach(p=>{
            if(c3Obj[p.category] === undefined){
                c3Obj[p.category] = p.quantity * p.price;
            }else{
                c3Obj[p.category] += p.quantity * p.price;
            };            
        })
    });
    let result = Object.entries(c3Obj);
    // console.log(result);

    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: result,
            colors:{
                "床架":"#9D7FEA",
                "收納":"#5434A7",
                "窗簾": "#DACBFF",
            }
        },
    });
};

// 全品項營收圓餅圖
function c3RenderLv2(){
    let c3Obj = {};
    orderData.forEach(i=>{
        i.products.forEach(p=>{
            if(c3Obj[p.title] === undefined){
                c3Obj[p.title] = p.price * p.quantity;
            }else{
                c3Obj[p.title] += p.price * p.quantity;
            }
        })
    });

    let result = Object.entries(c3Obj);
    result.sort(function(a,b){
        return b[1]-a[1];
    });

    if(result.length > 3){
        let otherPrice = 0;
        result.forEach((i,id)=>{
            if(id>2){
                otherPrice += i[1]
            };
        });
        result.splice(3,result.length-1);
        result.push(['其他',otherPrice]);
    };

    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: result,
            colors:{
                "Louvre 單人床架":"#DACBFF",
                "Charles 雙人床架":"#6846be",
                "Louvre 雙人床架／雙人加大": "#5434A7",
                "Antony 床邊桌":"#240771",
                "Antony 雙人床架／雙人加大":"#9D7FEA",
                "Charles 系列儲物組合": "#5434A7",
                "Jordan 雙人床架／雙人加大":"#4723a6",
                "Antony 遮光窗簾":"#9D7FEA",
                "其他": "#301E5F",
            }
        },
    });
}


