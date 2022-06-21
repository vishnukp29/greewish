// const { response } = require("../../app")
// const { count } = require("../../Model/productschema")

function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                // alert(response)
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $('#cart-count').html(parseInt(count))
            }
            
        }
    })
}

function qtyProduct(cartId,pro_Id,count){
    let quantity = parseInt(document.getElementById(pro_Id).value);
    let price=parseInt(document.getElementById('price'+pro_Id.innerHTML))
    $.ajax({
        url:'/change-product-quantity',
        data:{
            cart:cartId,
            product:pro_Id,
            count:count,
            quantity:quantity            
        },
        method:'post',
        success:(response)=>{
        console.log(response)
        // alert(response)
            if(response){
                location.reload()
            }
            else{
                document.getElementById(pro_Id).value=quantity+count;
            }
        }
    })
}




