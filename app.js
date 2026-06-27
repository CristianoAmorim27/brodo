// CONFIGURAÇÕES DO ESTABELECIMENTO
const CONFIG = {
    whatsappNumber: "5548999999999", // Número do WhatsApp (DDI + DDD + Número, apenas dígitos)
    prices: {
        verde: 26.00,
        caipira: 26.00,
        serrano: 26.00,
        bacon: 4.00,
        torresmo: 4.00,
        croutons: 3.00
    },
    names: {
        verde: "Brodo Verde (500ml)",
        caipira: "Brodo Caipira (500ml)",
        serrano: "Brodo Serrano (500ml)",
        bacon: "Bacon Crocante Extra (50g)",
        torresmo: "Torresmo Adicional (50g)",
        croutons: "Porção de Croutons Crocantes"
    },
    pixDiscount: 0.05 // 5% de desconto para pagamentos via Pix
};

// ESTADO DA APLICAÇÃO (CARRINHO)
let cart = {
    verde: 0,
    caipira: 0,
    serrano: 0,
    bacon: 0,
    torresmo: 0,
    croutons: 0
};

// Seletores temporários nas cartas de produto (exibidos na página antes de adicionar)
let cardQuantities = {
    verde: 0,
    caipira: 0,
    serrano: 0
};

// 1. GERENCIAMENTO DAS QUANTIDADES NAS CARTAS DOS PRODUTOS
function changeQuantity(flavor, delta) {
    let currentQty = cardQuantities[flavor];
    let newQty = currentQty + delta;
    
    if (newQty < 0) newQty = 0;
    
    cardQuantities[flavor] = newQty;
    document.getElementById(`qty-${flavor}`).innerText = newQty;
}

// Adiciona os itens selecionados na carta ao carrinho de fato
function addToCart(flavor) {
    let qty = cardQuantities[flavor];
    
    // Se o usuário clicar em adicionar e a quantidade for 0, assumimos 1 unidade por conveniência
    if (qty === 0) {
        qty = 1;
    }
    
    cart[flavor] += qty;
    
    // Reseta o contador da carta do produto
    cardQuantities[flavor] = 0;
    document.getElementById(`qty-${flavor}`).innerText = 0;
    
    // Atualiza o carrinho e abre o Drawer lateral
    updateCart();
    toggleCartDrawer(true);
    
    // Feedback visual rápido no botão
    const btn = document.getElementById(`btn-add-${flavor}`);
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-check"></i> Adicionado!`;
    btn.style.backgroundColor = "var(--color-terracotta)";
    btn.style.borderColor = "var(--color-terracotta)";
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = "";
        btn.style.borderColor = "";
    }, 1500);
}

// 2. GERENCIAMENTO DOS ACOMPANHAMENTOS (EXTRAS) DIRETAMENTE
function changeExtraQuantity(extra, delta) {
    let currentQty = cart[extra];
    let newQty = currentQty + delta;
    
    if (newQty < 0) newQty = 0;
    
    cart[extra] = newQty;
    document.getElementById(`qty-extra-${extra}`).innerText = newQty;
    
    updateCart();
}

// Altera quantidade de itens diretamente dentro do carrinho lateral
function changeCartItemQuantity(id, delta) {
    let newQty = cart[id] + delta;
    if (newQty < 0) newQty = 0;
    cart[id] = newQty;
    
    // Sincroniza displays de extras na página se aplicável
    if (id === 'bacon' || id === 'torresmo' || id === 'croutons') {
        document.getElementById(`qty-extra-${id}`).innerText = newQty;
    }
    
    updateCart();
}

// 3. CALCULO E RENDERIZAÇÃO DO CARRINHO
function updateCart() {
    const listElement = document.getElementById("cart-items-list");
    const summarySection = document.getElementById("cart-summary-section");
    const checkoutForm = document.getElementById("checkout-form");
    const badgeCount = document.getElementById("cart-badge-count");
    
    let totalItems = 0;
    let subtotalCaldos = 0;
    let totalExtras = 0;
    let htmlContent = "";
    
    // Contagem de caldos e extras no carrinho
    const caldosKeys = ['verde', 'caipira', 'serrano'];
    const extrasKeys = ['bacon', 'torresmo', 'croutons'];
    
    // Renderiza Caldos
    caldosKeys.forEach(key => {
        const qty = cart[key];
        if (qty > 0) {
            totalItems += qty;
            const price = CONFIG.prices[key];
            const itemTotal = price * qty;
            subtotalCaldos += itemTotal;
            
            htmlContent += `
                <div class="cart-item">
                    <div class="cart-item-header">
                        <span class="cart-item-name">${CONFIG.names[key]}</span>
                        <span class="cart-item-price">R$ ${itemTotal.toFixed(2)}</span>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-selector-container">
                            <button type="button" class="qty-btn minus" onclick="changeCartItemQuantity('${key}', -1)">-</button>
                            <span class="qty-display">${qty}</span>
                            <button type="button" class="qty-btn plus" onclick="changeCartItemQuantity('${key}', 1)">+</button>
                        </div>
                        <button type="button" class="cart-item-remove" onclick="removeCartItem('${key}')">Remover</button>
                    </div>
                </div>
            `;
        }
    });
    
    // Renderiza Extras
    extrasKeys.forEach(key => {
        const qty = cart[key];
        if (qty > 0) {
            totalItems += qty;
            const price = CONFIG.prices[key];
            const itemTotal = price * qty;
            totalExtras += itemTotal;
            
            htmlContent += `
                <div class="cart-item">
                    <div class="cart-item-header">
                        <span class="cart-item-name">${CONFIG.names[key]}</span>
                        <span class="cart-item-price">R$ ${itemTotal.toFixed(2)}</span>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-selector-container">
                            <button type="button" class="qty-btn minus" onclick="changeCartItemQuantity('${key}', -1)">-</button>
                            <span class="qty-display">${qty}</span>
                            <button type="button" class="qty-btn plus" onclick="changeCartItemQuantity('${key}', 1)">+</button>
                        </div>
                        <button type="button" class="cart-item-remove" onclick="removeCartItem('${key}')">Remover</button>
                    </div>
                </div>
            `;
        }
    });
    
    // Atualiza o crachá do carrinho no header
    badgeCount.innerText = totalItems;
    
    if (totalItems === 0) {
        listElement.innerHTML = `
            <div class="empty-cart-message">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Seu carrinho está vazio.</p>
                <a href="#cardapio" class="btn btn-primary" onclick="toggleCartDrawer(false)">Escolher Caldos</a>
            </div>
        `;
        summarySection.style.display = "none";
        checkoutForm.style.display = "none";
    } else {
        listElement.innerHTML = htmlContent;
        summarySection.style.display = "block";
        checkoutForm.style.display = "block";
        
        // Atualiza resumo financeiro
        const totalGeral = subtotalCaldos + totalExtras;
        const totalPix = totalGeral * (1 - CONFIG.pixDiscount);
        
        document.getElementById("summary-subtotal").innerText = `R$ ${subtotalCaldos.toFixed(2)}`;
        
        const extrasRow = document.getElementById("summary-extras-row");
        if (totalExtras > 0) {
            extrasRow.style.display = "flex";
            document.getElementById("summary-extras").innerText = `R$ ${totalExtras.toFixed(2)}`;
        } else {
            extrasRow.style.display = "none";
        }
        
        document.getElementById("summary-total").innerText = `R$ ${totalGeral.toFixed(2)}`;
        document.getElementById("pix-total").innerText = `R$ ${totalPix.toFixed(2)}`;
    }
}

// Remove item por completo
function removeCartItem(key) {
    cart[key] = 0;
    
    // Sincroniza display do cardápio se aplicável
    if (key === 'bacon' || key === 'torresmo' || key === 'croutons') {
        document.getElementById(`qty-extra-${key}`).innerText = 0;
    }
    
    updateCart();
}

// 4. ABERTURA E FECHAMENTO DO DRAWER LATERAL
function toggleCartDrawer(forceState) {
    const drawer = document.getElementById("cart-drawer");
    if (forceState !== undefined) {
        if (forceState) drawer.classList.add("open");
        else drawer.classList.remove("open");
    } else {
        drawer.classList.toggle("open");
    }
}

// Ouvinte para o botão de carrinho do cabeçalho
document.getElementById("cart-toggle-btn").addEventListener("click", () => {
    toggleCartDrawer(true);
});

// 5. INTERATIVIDADE DO FORMULÁRIO DE CHECKOUT
function toggleDeliveryFields(isDelivery) {
    const addressFields = document.getElementById("address-fields");
    const pickupInfo = document.getElementById("pickup-info");
    const deliveryTaxSummary = document.getElementById("summary-delivery-tax");
    
    // Inputs de endereço
    const streetInput = document.getElementById("address-street");
    const bairroInput = document.getElementById("address-bairro");
    
    if (isDelivery) {
        addressFields.style.display = "block";
        pickupInfo.style.display = "none";
        deliveryTaxSummary.innerText = "A combinar";
        
        // Torna obrigatórios os campos de endereço
        streetInput.required = true;
        bairroInput.required = true;
    } else {
        addressFields.style.display = "none";
        pickupInfo.style.display = "block";
        deliveryTaxSummary.innerText = "Grátis (Retirada)";
        
        // Remove a obrigatoriedade
        streetInput.required = false;
        bairroInput.required = false;
        streetInput.value = "";
        bairroInput.value = "";
    }
}

function handlePaymentChange() {
    const method = document.getElementById("payment-method").value;
    const trocoField = document.getElementById("troco-field");
    const trocoInput = document.getElementById("troco-value");
    
    if (method === "dinheiro") {
        trocoField.style.display = "block";
    } else {
        trocoField.style.display = "none";
        trocoInput.value = "";
    }
}

// 6. FORMATAÇÃO E ENVIO DO PEDIDO PARA WHATSAPP
function submitOrder(event) {
    event.preventDefault();
    
    // Pegar informações do cliente
    const name = document.getElementById("client-name").value.trim();
    const phone = document.getElementById("client-phone").value.trim();
    const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;
    const paymentMethod = document.getElementById("payment-method").value;
    const notes = document.getElementById("order-notes").value.trim();
    
    // Validar se há itens
    let hasItems = false;
    for (const key in cart) {
        if (cart[key] > 0) hasItems = true;
    }
    if (!hasItems) {
        alert("Por favor, selecione pelo menos um caldo antes de finalizar.");
        return;
    }
    
    // Detalhes do Endereço (se for Delivery)
    let addressText = "";
    if (deliveryType === "delivery") {
        const street = document.getElementById("address-street").value.trim();
        const bairro = document.getElementById("address-bairro").value.trim();
        const complement = document.getElementById("address-complement").value.trim();
        const ref = document.getElementById("address-ref").value.trim();
        
        addressText = `*Endereço de Entrega:*\n📍 Rua/Nº: ${street}\n📍 Bairro: ${bairro}`;
        if (complement) addressText += `\n📍 Compl: ${complement}`;
        if (ref) addressText += `\n📍 Ref: ${ref}`;
    } else {
        addressText = `*Método de Entrega:* 🏬 Retirada no Local (Centro, Fpolis)`;
    }
    
    // Detalhes de Itens Pedidos
    let itemsText = "";
    let subtotalCaldos = 0;
    let totalExtras = 0;
    
    for (const key in cart) {
        const qty = cart[key];
        if (qty > 0) {
            const price = CONFIG.prices[key];
            const itemTotal = price * qty;
            if (['verde', 'caipira', 'serrano'].includes(key)) {
                subtotalCaldos += itemTotal;
            } else {
                totalExtras += itemTotal;
            }
            itemsText += `• ${qty}x ${CONFIG.names[key]} (R$ ${itemTotal.toFixed(2)})\n`;
        }
    }
    
    // Calcular totais
    const totalGeral = subtotalCaldos + totalExtras;
    let totalComDesconto = totalGeral;
    let paymentText = "";
    
    if (paymentMethod === "pix") {
        totalComDesconto = totalGeral * (1 - CONFIG.pixDiscount);
        paymentText = `Pix (com 5% de desconto aplicado)`;
    } else if (paymentMethod === "credito") {
        paymentText = `Cartão de Crédito`;
    } else if (paymentMethod === "debito") {
        paymentText = `Cartão de Débito`;
    } else if (paymentMethod === "dinheiro") {
        const troco = document.getElementById("troco-value").value.trim();
        paymentText = `Dinheiro`;
        if (troco) paymentText += ` (Precisa de troco para ${troco})`;
    }
    
    // Montagem da Mensagem do WhatsApp
    let message = `🍲 *NOVO PEDIDO - BRODO CALDOS* 🍲\n\n`;
    message += `*Cliente:* ${name}\n`;
    message += `*Contato:* ${phone}\n\n`;
    message += `*Itens do Pedido:*\n${itemsText}\n`;
    
    if (totalExtras > 0) {
        message += `*Subtotal Caldos:* R$ ${subtotalCaldos.toFixed(2)}\n`;
        message += `*Subtotal Acompanhamentos:* R$ ${totalExtras.toFixed(2)}\n`;
    }
    
    message += `*Total Geral:* R$ ${totalGeral.toFixed(2)}\n`;
    if (paymentMethod === "pix") {
        message += `*Total Final (Pix):* R$ ${totalComDesconto.toFixed(2)}\n`;
    }
    message += `\n*Forma de Pagamento:* ${paymentText}\n\n`;
    message += `${addressText}\n`;
    
    if (notes) {
        message += `\n*Observações:* ${notes}\n`;
    }
    
    message += `\n_Pedido gerado via site Brodo Caldos. Aguardando confirmação._`;
    
    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
    
    // Redirecionar para o WhatsApp
    window.open(whatsappUrl, "_blank");
}

// 7. INICIALIZAÇÃO E BINDING DE COMPORTAMENTOS AUXILIARES
window.onload = function() {
    // Configura campos iniciais do formulário de endereço
    toggleDeliveryFields(true);
    
    // Inicia carrinho
    updateCart();
    
    // Habilita comportamento de fechar o menu flutuante clicando na tecla ESC
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            toggleCartDrawer(false);
        }
    });
};
