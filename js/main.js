(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });
    
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
    // --- Carrito global ---
    var cart = {};

    // Helper: obtener nombre del producto desde el DOM
    function getProductName($container) {
        // Busca el <span> dentro de <h5> para el nombre
        return $container.find('h5 span').first().text().trim();
    }

    // Helper: obtener precio unitario desde el DOM
    function getProductPrice($container) {
        // Busca el siguiente <span> dentro de <h5> para el precio
        let priceText = $container.find('h5 span').eq(1).text().trim();
        let match = priceText.match(/\$([\d,.]+)/);
        if (match) {
            return parseFloat(match[1].replace(/,/g, ''));
        }
        return 0;
    }

    // Mapea los productos seleccionados a sus precios unitarios
    function getCartWithPrices() {
        var result = {};
        // Busca en el DOM los productos actualmente en el carrito
        $('.d-flex.flex-column').each(function() {
            var name = getProductName($(this));
            if (cart[name]) {
                result[name] = {
                    qty: cart[name],
                    price: getProductPrice($(this))
                };
            }
        });
        return result;
    }

    // Actualiza el carrito cuando cambia la cantidad
    function updateCart($container) {
        var name = getProductName($container);
        var qty = parseInt($container.find('.quantity-selector input[type="number"]').val(), 10) || 1;
        if (qty > 0) {
            cart[name] = qty;
        } else {
            delete cart[name];
        }
        updateCartBadge();
    }

    // Mostrar cantidad total en el botón flotante
    function updateCartBadge() {
        var total = Object.values(cart).reduce((a, b) => a + b, 0);
        $('.cart-float-btn .cart-badge').text(total > 0 ? total : '');
    }

    // Mostrar resumen del carrito en el modal
    function renderCartSummary() {
        var $list = $('#cart-summary-list');
        $list.empty();
        var cartWithPrices = getCartWithPrices();
        var total = 0;
        if (Object.keys(cartWithPrices).length === 0) {
            $list.append('<li class="list-group-item">El carrito está vacío.</li>');
            $('#cart-send-btn').prop('disabled', true);
            // Borra el total si existe
            $('#cart-summary-total').remove();
            return;
        }
        for (var name in cartWithPrices) {
            var item = cartWithPrices[name];
            var subtotal = item.qty * item.price;
            total += subtotal;
            $list.append('<li class="list-group-item d-flex justify-content-between align-items-center">'
                + '<span>' + name + '<br><small class="text-muted">$' + item.price.toLocaleString('es-MX', {minimumFractionDigits:2}) + ' c/u</small></span>'
                + '<span>'
                + '<span class="badge bg-primary rounded-pill me-2">' + item.qty + '</span>'
                + '<button class="btn btn-sm btn-danger btn-remove-item" data-name="' + encodeURIComponent(name) + '"><i class="fa fa-trash"></i></button>'
                + '</span>'
                + '</li>');
        }
        // Mostrar total
        if ($('#cart-summary-total').length === 0) {
            $list.after('<div id="cart-summary-total" class="mt-3 text-end fw-bold h5">Total: $<span id="cart-total-value">' + total.toLocaleString('es-MX', {minimumFractionDigits:2}) + '</span></div>');
        } else {
            $('#cart-total-value').text(total.toLocaleString('es-MX', {minimumFractionDigits:2}));
        }
        $('#cart-send-btn').prop('disabled', false);
    }

    // Add-to-cart quantity selector logic
    $(document).on('click', '.add-to-cart-btn', function() {
        var $container = $(this).closest('.d-flex.flex-column');
        var $selector = $container.find('.quantity-selector');
        $selector.toggleClass('d-none');
        // Optionally, hide other selectors
        $('.quantity-selector').not($selector).addClass('d-none');
        // Actualiza carrito si se muestra
        if (!$selector.hasClass('d-none')) {
            updateCart($container);
        }
    });

    $(document).on('click', '.plus-btn, .minus-btn', function() {
        var $container = $(this).closest('.d-flex.flex-column');
        var $input = $container.find('.quantity-selector input[type="number"]');
        var val = parseInt($input.val(), 10) || 1;
        if ($(this).hasClass('plus-btn')) {
            $input.val(val + 1);
        } else if ($(this).hasClass('minus-btn') && val > 1) {
            $input.val(val - 1);
        }
        updateCart($container);
    });

    $(document).on('change', '.quantity-selector input[type="number"]', function() {
        var $container = $(this).closest('.d-flex.flex-column');
        updateCart($container);
    });

    // Botón flotante para ver el carrito
    if ($('.cart-float-btn').length === 0) {
        $('body').append('<button type="button" class="btn btn-warning cart-float-btn position-fixed" style="bottom:30px;right:30px;z-index:1050;">🛒 <span class="cart-badge badge bg-danger"></span> Ver pedido</button>');
    }
    $(document).on('click', '.cart-float-btn', function() {
        renderCartSummary();
        $('#cartModal').modal('show');
    });
    // Crear modal si no existe
    if ($('#cartModal').length === 0) {
        $('body').append(`
        <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="cartModalLabel">Resumen del pedido</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div class="modal-body">
                <ul class="list-group" id="cart-summary-list"></ul>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-success" id="cart-send-btn">Hacer pedido</button>
              </div>
            </div>
          </div>
        </div>
        `);
    }
    // Eliminar producto del carrito desde el modal
    $(document).on('click', '.btn-remove-item', function() {
        var name = decodeURIComponent($(this).data('name'));
        delete cart[name];
        renderCartSummary();
        updateCartBadge();
        // Borra el total si el carrito queda vacío
        if (Object.keys(cart).length === 0) {
            $('#cart-summary-total').remove();
        }
    });

    // Mostrar formulario de datos al hacer pedido
    $(document).on('click', '#cart-send-btn', function() {
        $('#cartModal').modal('hide');
        setTimeout(function() { // Espera a que cierre el modal anterior
            $('#orderFormModal').modal('show');
        }, 400);
    });

    // Validación y envío del formulario de pedido
    $(document).on('submit', '#order-form', function(e) {
        e.preventDefault();
        let formNombre = $('#order-nombre').val().trim();
        let formTelefono = $('#order-telefono').val().trim();
        let formUbicacion = $('#order-ubicacion').val().trim();
        let valid = true;
        // Validación básica
        if (formNombre.length < 2) {
            $('#order-nombre').addClass('is-invalid');
            valid = false;
        } else {
            $('#order-nombre').removeClass('is-invalid');
        }
        if (!/^\d{10,}$/.test(formTelefono)) {
            $('#order-telefono').addClass('is-invalid');
            valid = false;
        } else {
            $('#order-telefono').removeClass('is-invalid');
        }
        if (formUbicacion.length < 5) {
            $('#order-ubicacion').addClass('is-invalid');
            valid = false;
        } else {
            $('#order-ubicacion').removeClass('is-invalid');
        }
        if (!valid) return;
        // Enviar a WhatsApp
        var waNumber = '529932171855'; // Cambia este número al tuyo (con código de país, sin + ni espacios)
        var pais = $('#order-pais').val();
        var nombrePais = $('#order-pais option:selected').text();
        var carrito = getCartWithPrices();
        var total = 0;
        var resumen = '';
        for (var prod in carrito) {
            var item = carrito[prod];
            var subtotal = item.qty * item.price;
            total += subtotal;
            resumen += `*${prod}* (${item.qty} x $${item.price.toLocaleString('es-MX',{minimumFractionDigits:2})}) = $${subtotal.toLocaleString('es-MX',{minimumFractionDigits:2})}\n`;
        }
        var mensaje =
            `*Nuevo pedido desde la web*\n` +
            `Nombre: ${formNombre}\n` +
            `Teléfono: +${pais} ${formTelefono} (${nombrePais})\n` +
            `Ubicación: ${formUbicacion}\n\n` +
            `*Pedido:*\n${resumen}\n*Total:* $${total.toLocaleString('es-MX',{minimumFractionDigits:2})}`;
        var waUrl = `https://wa.me/${waNumber}?text=` + encodeURIComponent(mensaje);
        $('#orderFormModal').modal('hide');
        setTimeout(function() {
            var win = window.open(waUrl, '_blank');
            // Si el popup es bloqueado, muestra el modal de éxito
            if (!win) {
                $('#pedidoExitoModal').modal('show');
            }
        }, 300);
    });

    // Crear modal de formulario si no existe
    if ($('#orderFormModal').length === 0) {
        $('body').append(`
        <div class="modal fade" id="orderFormModal" tabindex="-1" aria-labelledby="orderFormModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <form class="modal-content" id="order-form" autocomplete="off">
              <div class="modal-header">
                <h5 class="modal-title" id="orderFormModalLabel">Datos para el pedido</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label for="order-nombre" class="form-label">Nombre completo</label>
                  <input type="text" class="form-control" id="order-nombre" required>
                  <div class="invalid-feedback">Por favor ingresa tu nombre.</div>
                </div>
                <div class="mb-3">
                  <label for="order-telefono" class="form-label">Teléfono celular</label>
                  <div class="input-group">
                    <select class="form-select" id="order-pais" style="max-width:120px;">
                      <option value="52" selected>🇲🇽 +52</option>
                      <option value="1">🇺🇸 +1</option>
                      <option value="506">🇨🇷 +506</option>
                      <option value="57">🇨🇴 +57</option>
                      <option value="34">🇪🇸 +34</option>
                      <!-- Agrega más países si lo deseas -->
                    </select>
                    <input type="tel" class="form-control" id="order-telefono" pattern="[0-9]{10}" maxlength="10" inputmode="numeric" placeholder="Ej: 9991234567" required>
                  </div>
                  <div class="form-text">Formato: 10 dígitos, solo el número local.</div>
                  <div class="invalid-feedback">Ingresa un teléfono válido de 10 dígitos.</div>
                </div>
                <div class="mb-3">
                  <label for="order-ubicacion" class="form-label">Ubicación/Colonia</label>
                  <input type="text" class="form-control" id="order-ubicacion" required>
                  <div class="invalid-feedback">Por favor ingresa tu ubicación.</div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-success">Proceder al pago</button>
              </div>
            </form>
          </div>
        </div>
        `);
    }

    // Modal de éxito de pedido profesional
    if ($('#pedidoExitoModal').length === 0) {
        $('body').append(`
        <div class="modal fade" id="pedidoExitoModal" tabindex="-1" aria-labelledby="pedidoExitoModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content text-center">
              <div class="modal-body py-5">
                <div class="mb-3">
                  <i class="fa fa-check-circle fa-4x text-success mb-3"></i>
                </div>
                <h4 class="mb-3" id="pedidoExitoModalLabel">¡Pedido enviado con éxito!</h4>
                <p class="mb-4">Gracias por tu pedido. Nos pondremos en contacto para coordinar el pago y la entrega.</p>
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
        `);
    }


})(jQuery);

