// http://localhost:3000/items

const searchItems = document.querySelector("#search");
const searchBtns = document.querySelectorAll(".btn-search");
let allProductsdata = [];
const filters = {
  searchItems: "",
};
/////////////////
const productsDOM = document.querySelector(".products-center");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContant = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-Cart");

let cart = [];
let buttonsDOM = [];

class UI {
  displayProducts(products) {
    console.log(products)
    if (products.length < 1) {

      productsDOM.innerHTML = []
      return
    }
    let result = "";
    products.forEach((item) => {
      result += `<div class="bg-gray-100 rounded overflow-hidden mx-auto shadow mb-3 h-auto max-w-[400px]">
            <img src=${item.imageURL} alt="" />
            <div class="flex justify-between pt-5 px-5">
              <span>${item.price}</span>
              <p>${item.title}</p>
            </div>
            <div class="flex justify-center">
              <button class="add-to-cart bg-indigo-200 p-2 m-3 rounded" data-id=${item.id}>add to Cart</button>
            </div>
          </div>`;
      productsDOM.innerHTML = result;
    });
  }
  getAddToCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addToCartBtns
    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      // check if this product id is in cart or not
      const isInCart = cart.find((p) => p.id == id);
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
        return;
      }
      btn.addEventListener("click", (event) => {
        // console.log(event.target.dataset.id);
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // get product from products
        const addedProducts = {
          ...Storage.getProducts(id),
          quantity: 1,
        };
        // add to cart
        cart = [...cart, addedProducts];
        // save cart to local storage
        Storage.saveCart(cart);

        // update cart value
        this.setCartValue(cart);

        // add to cart item
        this.addCartItem(addedProducts);
        // get cart from storage
      });
    });
  }
  setCartValue(cart) {
    // cart items
    // cart total price
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `total price: ${totalPrice.toFixed(2)} $`;
    cartItems.innerHTML = tempCartItems;
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<div class="flex justify-between p-4 items-center">
    <img class="w-24 rounded" src=${cartItem.imageURL} alt="" />
    <div class="flex flex-col">
      <span>${cartItem.title}</span>
      <span class="text-gray-400">$ ${cartItem.price}</span>
    </div>
    <div class="flex flex-col items-center">      
      <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
      <span>${cartItem.quantity}</span>
      <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>  
    </div>      
    <i data-id=${cartItem.id} class="fas fa-trash-alt"></i>    
  </div>`;
    cartContant.appendChild(div);
  }
  setupApp() {
    // get cart from storage
    cart = Storage.getCart() || [];
    // add cart item
    cart.forEach((cartItem) => this.addCartItem(cartItem));
    // set Values price + item
    this.setCartValue(cart);
  }
  cartLogic() {
    // clear cart
    clearCart.addEventListener("click", () => this.clearCart());
    // cart functionality
    cartContant.addEventListener("click", (event) => {
      // console.log(event.target);
      if (event.target.classList.contains("fa-chevron-up")) {
        // console.log(event.target.dataset.id);
        const addQuantity = event.target;
        // get item from cart
        const addedItem = cart.find(
          (cItem) => cItem.id == addQuantity.dataset.id
        );
        addedItem.quantity++;
        // update cart value
        this.setCartValue(cart);
        // save cart
        Storage.saveCart(cart);
        // ui update cart item
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("fa-trash-alt")) {
        const removeItem = event.target;
        const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);
        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartContant.removeChild(removeItem.parentElement.parentElement);
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const subQuantity = event.target;
        // get item from cart
        const substractedItem = cart.find(
          (cItem) => cItem.id == subQuantity.dataset.id
        );
        if (substractedItem.quantity === 1) {
          this.removeItem(substractedItem.id);
          cartContant.removeChild(
            subQuantity.parentElement.parentElement.parentElement
          );
          return;
        }
        substractedItem.quantity--;
        // update cart value
        this.setCartValue(cart);
        // save cart
        Storage.saveCart(cart);
        // ui update cart item
        subQuantity.previousElementSibling.innerText = substractedItem.quantity;
      }
    });
  }
  clearCart() {
    // remove: (DRY)
    cart.forEach((cItem) => this.removeItem(cItem.id));
    // remove cart content children:
    while (cartContant.children.length) {
      cartContant.removeChild(cartContant.children[0]);
    }
    closeModal();
  }
  removeItem(id) {
    // update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    // total price & cart items
    this.setCartValue(cart);
    // update storage:
    Storage.saveCart(cart);

    // get add to cart btns : update text and disable
    this.getSingleButton(id);
  }
  getSingleButton(id) {
    const button = buttonsDOM.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    button.innerText = "add to cart";
    button.disabled = false;

  }
}

// 3.storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProducts(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

function renderProducts(_products, _fileters) {
  const filteredProducts = _products.filter((p) => {
    return p.title.toLowerCase().includes(_fileters.searchItems.toLowerCase());
  });
  // render to DOM
  let productsData = filteredProducts;
  const ui = new UI();
  ui.setupApp();
  ui.displayProducts(productsData);
  ui.getAddToCartBtns();
  ui.cartLogic();
  Storage.saveProducts(productsData);
}
document.addEventListener("DOMContentLoaded", () => {
  axios
    .get("http://localhost:3000/items")
    .then((res) => {
      allProductsdata = res.data;
      renderProducts(allProductsdata, filters);
      searchItems.addEventListener("input", (e) => {
        filters.searchItems = e.target.value;
        renderProducts(allProductsdata, filters);       
      });      
    })
    .catch((err) => console.log(err));
});

searchBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const filter = e.target.dataset.filter
    console.log(filter)
    filters.searchItems = filter
    renderProducts(allProductsdata, filters);    
  })
})