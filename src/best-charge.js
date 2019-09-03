function inputItems(selectedItems) {
  const allItems = loadAllItems(selectedItems);
  return selectedItems.map(item => {
    const[id, quantity] = item.split(' x ');
    const result = allItems.find(it => it.id === id);
    return {
      ...result,
      quantity : +quantity,
      sum : quantity * result.price,
    }
  });
}

function chooseCheaper(order_items, promotions) {
  const noPromotion = {type: null, moneySaved: 0};
  return promotions.map(promotion => {
    switch(promotion.type) {
      case "满30减6元" : {
        const sum = order_items.reduce((pre, it) => pre + it.sum, 0);
        return sum >= 30 ? {
          type: promotion.type,
          moneySaved: 6,
        } : noPromotion;
      }
      case "指定菜品半价" : {
        const moneySaved = order_items.reduce((pre, it) => {
          return pre + (promotion.items.includes(it.id)? it.sum / 2 : 0);
        }, 0);
        const foodNames = order_items.filter(it => promotion.items.includes(it.id)).map(it => it.name).join('，');
        return moneySaved > 0 ? {
          type: `${promotion.type}(${foodNames})`,
          moneySaved,
        } : noPromotion;
      }
    }
  }).reduce((pre, promotion) => pre.moneySaved < promotion.moneySaved ? promotion : pre);
}

function getMessageList(order_items) {
  const promotion = chooseCheaper(order_items, loadPromotions());

  return {
    order_message: order_items.map(orderIt => ({
      foodName: orderIt.name,
      quantity: orderIt.quantity,
      price: orderIt.sum,
    })),
    promotion,
    sum_price: order_items.reduce((pre, orderIt) => pre + orderIt.sum, 0) - (promotion.type ? promotion.moneySaved : 0),
  }
}

function printMessage({order_message, promotion, sum_price}) {
  const strOrderMessage = order_message.map(it => `${it.foodName} x ${it.quantity} = ${it.price}元`).join('\n');
  const strPromotion = promotion.type ? `${promotion.type}，省${promotion.moneySaved}元` : '';
  return '============= 订餐明细 =============\n' +
         strOrderMessage + '\n' +
         '-----------------------------------\n' +
         (promotion.type ? ('使用优惠:\n' + strPromotion +
         '\n-----------------------------------\n') : '') +
         `总计：${sum_price}元\n` +
         '===================================';

}

function bestCharge(selectedItems) {
  const order_items = inputItems(selectedItems);
  const order = getMessageList(order_items);
  return printMessage(order);
}
