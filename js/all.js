
let productData = [];
let cartData = [];
const productList = document.querySelector('.productWrap');

// 預設
function init(){
    getData();
    getCartList();
};
init();

// 商品列表
function getData(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiKey}/products`).then(function(response){
        productData = response.data.products;
        render();
        return;
    }).catch(function(error){
        alert('資料讀取錯誤!!');
    })
};

// 商品列表-渲染
function render(){
    let str = '';
    productData.forEach(i=>{

        str += `
        <li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${i.images}" alt="">
            <a href="#" data-id="${i.id}" class="addCardBtn">加入購物車</a>
            <h3>${i.title}</h3>
            <del class="originPrice">NT$${toThousands(i.origin_price)}</del>
            <p class="nowPrice">NT$${toThousands(i.price)}</p>
        </li>
        `;
    });
    productList.innerHTML = str;
    filterProduct();
};

// 商品-過濾
function filterProduct(){

    let allCategory = productData.map(i=> i.category)
    let filteResult = allCategory.filter((i,id)=>{
        return allCategory.indexOf(i) === id;
    });
    
    const productSelect = document.querySelector('.productSelect');

    let optionStr = `<option value="全部" selected>全部</option>`;
    filteResult.forEach(i=>{
        optionStr += `
        <option value="${i}">${i}</option>
        `
    });
    productSelect.innerHTML = optionStr;
};

// 加入購物車
productList.addEventListener('click',addCart);
function addCart(e){
    e.preventDefault();
    if(e.target.getAttribute('class') === 'addCardBtn'){
        let productId = e.target.getAttribute('data-id');
        let addNum = 1;
        
        cartData.forEach(i=>{
            if(i.product.id === productId){                
                i.quantity += 1;
                addNum = i.quantity;
            }
        });

        let obj = {
            "data": {
              "productId": productId,
              "quantity": addNum
            }
        };

        axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiKey}/carts`,obj).then(function(response){
            alert('加入購物車成功!!');
            getCartList();
        }).catch(function(error){
            alert('加入購物車失敗!!')
        })

    };
    
}


// 我的購物車-列表
const cartList = document.querySelector('.shoppingCart tbody');
const allPrice = document.querySelector('.shoppingCart [data-price="all"]');

function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiKey}/carts`).then(function(response){

        cartData = response.data.carts;

        let priceAll = 0;

        let cartStr = '';
        cartData.forEach(i=>{
            priceAll += i.product.price * i.quantity;
            cartStr += `
            <tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${i.product.images}" alt="">
                        <p>${i.product.title}</p>
                    </div>
                </td>
                <td>NT$${toThousands(i.product.price)}</td>
                <td><a href="#" data-id="${i.id}"  class="chgBtn">-</a>${i.quantity}<a href="#" data-id="${i.id}" class="chgBtn">+</a></td>
                <td>NT$${toThousands(i.product.price * i.quantity)}</td>
                <td class="discardBtn">
                    <a href="#" data-id="${i.id}" class="material-icons">
                        clear
                    </a>
                </td>
            </tr>
            `
        });
        cartList.innerHTML = cartStr;
        allPrice.textContent = `NT$${toThousands(priceAll)}`;
    }).catch(function(error){
        alert('購物車資料讀取錯誤!');
    });
};


// 我的購物車-刪除單項+更新數量判斷
cartList.addEventListener('click',delOneChgNum);
function delOneChgNum(e){
    e.preventDefault();
    let cartId = e.target.getAttribute('data-id');
    if(e.target.getAttribute('class') === 'chgBtn'){
        
        let num = 1;
        if(e.target.textContent === '+'){
            cartData.forEach(i=>{
                if(cartId === i.id){
                    i.quantity += 1;
                    num = i.quantity;
                }
            });
        }else if(e.target.textContent === '-'){
            cartData.forEach(i=>{
                if(cartId === i.id && i.quantity >= 2){
                    i.quantity -= 1;
                    num = i.quantity;
                }
            });
        };
        chgQuantity(cartId,num);
    };
    if(e.target.getAttribute('class')==='material-icons'){
        
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiKey}/carts/${cartId}`).then(function(response){
            alert('該品項刪除成功!!')
            getCartList();
        }).catch(function(error){
            alert('該品項刪除失敗!!')
        })
    }
};

// 我的購物車-更新數量
function chgQuantity(cartId,num){
    let chgObj = {
        "data": {
          "id": cartId,
          "quantity": num
        }
    };
    axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiKey}/carts/`,chgObj).then(function(response){            
            if(num <= 1){
                alert('已更新品項數量，購物車品項至少要有一件!!')
            }else{
                alert('已更新品項數量!!');
            };
            getCartList();
        }).catch(function(error){
            alert('更新品項數量失敗!!');
            // console.log(error);
        })
}

// 我的購物車-刪除全部
const delAll = document.querySelector('.discardAllBtn');
delAll.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiKey}/carts/`).then(function(response){
            alert('所有品項皆已刪除成功!!')
            getCartList();
        }).catch(function(error){
            alert('購物車已清空，請勿重覆點擊!!')
        })
});

// 送出訂單
const orderBtn = document.querySelector('.orderInfo-btn');
orderBtn.addEventListener('click',getOrder);
function getOrder(e){
    e.preventDefault();

    if(cartData.length === 0){
        alert('您的購物車無商品,無法送出!');
        return;
    }

    const customerName = document.querySelector('#customerName');
    const customerPhone = document.querySelector('#customerPhone');
    const customerEmail = document.querySelector('#customerEmail');
    const customerAddress = document.querySelector('#customerAddress');
    const tradeWay = document.querySelector('#tradeWay');

    let orderObj = {
        "data": {
          "user": {
            "name": customerName.value,
            "tel": customerPhone.value,
            "email": customerEmail.value,
            "address": customerAddress.value,
            "payment": tradeWay.value,
          }
        }
    };

    // validate
    const form = document.querySelector('.orderInfo-form');
    const attention = document.querySelectorAll('.orderInfo-form p'); 
    const constraints = {
        '姓名':{
            presence:{
                message:'不可空白!'
            }
        },
        '電話':{
            presence:{
                message:'不可空白!'
            }
        },
        'Email':{
            presence:{
                message:'不可空白!'
            }
        },
        '寄送地址':{
            presence:{
                message:'不可空白!'
            }
        }
    };    
    let errors = validate(form,constraints);    
    if(errors){
        let errorKeys = Object.keys(errors);
        attention.forEach(i=>{
            errorKeys.forEach(key=>{
                if(i.getAttribute('data-message') === key){
                    i.textContent = `${errors[key]}`;
                }
            })
        });
        return;
    };


    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiKey}/orders`,orderObj).then(function(response){
        alert('送出訂單成功!!');
        customerName.value = '';
        customerPhone.value = '';
        customerEmail.value = '';
        customerAddress.value = '';
        tradeWay.value = 'ATM';
        attention.forEach(i => {
            i.textContent = '';
        });
        getCartList();
    }).catch(function(error){
        alert('送出訂單失敗!!')
    })
};


// 千分位
function toThousands(x){
    let parts = x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
    return parts.join(".");
};

