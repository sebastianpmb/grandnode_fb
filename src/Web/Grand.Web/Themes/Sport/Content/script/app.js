// color picker

Vue.component('v-style', {
    render: function (createElement) {
        return createElement('style', this.$slots.default)
    }
});

// color picker end

Vue.use(VueAwesomeSwiper)

var vm = new Vue({
    el: '#app',
    data: function () {
        return {
            show: false,
            fluid: false,
            hover: false,
            darkMode: false,
            active: false,
            NextDropdownVisible: false,
            value: 5,
            searchitems: null,
            searchcategories: null,
            searchbrands: null,
            searchblog: null,
            searchproducts: null,
            flycartfirstload: true,
            leftSideOpen: false,
            catalogProdCols: 4,
            PopupAddToCartVueModal: null,
            PopupQuickViewVueModal: null,
            QuickViewSlider: {
                swiperOptions: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                    navigation: {
                        nextEl: '#ModalQuickView .swiper-button-next',
                        prevEl: '#ModalQuickView .swiper-button-prev'
                    }
                },
            },
            QuickViewSliderThumbs: {
                swiperOptions: {
                    spaceBetween: 10,
                    slidesPerView: 5,
                    watchSlidesVisibility: true,
                    watchSlidesProgress: true,
                    slideToClickedSlide: true,
                },
            },
            index: null,
            RelatedProducts: null,
            topHeaderInfo: {
                swiperOptions: {
                    slidesPerView: 1,
                    autoplay: {
                        delay: '3000'
                    },
                    effect: 'flip',
                    flipEffect: {
                        slideShadows: false,
                    },
                    loop: true,
                    spaceBetween: 10,
                }
            }
        }
    },
    props: {
        flycart: null,
        flycartitems: null,
        flycartindicator: undefined,
        flywish: null,
        wishlistitems: null,
        wishindicator: undefined,
    },
    mounted: function () {
        if (localStorage.fluid == "true") this.fluid = "fluid";
        if (localStorage.fluid == "fluid") this.fluid = "fluid";
        if (localStorage.fluid == "") this.fluid = "false";
        if (localStorage.darkMode == "true") this.darkMode = true;
        this.isMobile();
        this.homePage();
    },
    watch: {
        fluid: function (newName) {
            localStorage.fluid = newName;
        },
        darkMode: function (newValue) {
            localStorage.darkMode = newValue;
        },
        PopupQuickViewVueModal: function () {
            vm.getLinkedProductsQV(vm.PopupQuickViewVueModal.Id);
            if (vm.PopupQuickViewVueModal.ProductSpecifications.length > 0) {
                vm.PopupQuickViewVueModal.ProductSpecifications = vm.groupBy(vm.PopupQuickViewVueModal.ProductSpecifications, 'SpecificationAttributeName')
            }
        },
    },
    methods: {
        slideTo: function (e) {
            vm.$refs.QuickViewSlider.$swiper.slideTo(e.dataset.index);
        },
        homePage: function () {
            if (location.pathname == "/") {
                this.noHome = false;
            } else {
                this.noHome = true;
            }
        },
        updateFly: function () {
            axios({
                baseURL: '/Component/Index?Name=SidebarShoppingCart',
                method: 'get',
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Response-View': 'Json'
                }
            }).then(response => (
                this.flycart = response.data,
                this.flycartitems = response.data.Items,
                this.flycartindicator = response.data.TotalProducts,
                this.flycartfirstload = false
            ))
        },
        updateWishlist: function () {
            axios({
                baseURL: '/wishlist',
                method: 'get',
                data: null,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Response-View': 'Json'
                }
            }).then(response => (
                this.flywish = response.data,
                this.wishlistitems = response.data.Items,
                this.wishindicator = response.data.Items.length
            ))
        },
        showModalOutOfStock: function () {
            this.$refs['out-of-stock'].show()
        },
        productImage: function (event) {
            var Imagesrc = event.target.parentElement.getAttribute('data-href');
            function collectionHas(a, b) {
                for (var i = 0, len = a.length; i < len; i++) {
                    if (a[i] == b) return true;
                }
                return false;
            }
            function findParentBySelector(elm, selector) {
                var all = document.querySelectorAll(selector);
                var cur = elm.parentNode;
                while (cur && !collectionHas(all, cur)) {
                    cur = cur.parentNode;
                }
                return cur;
            }

            var yourElm = event.target
            var selector = ".product-box";
            var parent = findParentBySelector(yourElm, selector);
            var Image = parent.querySelectorAll(".main-product-img")[0];
            Image.setAttribute('src', Imagesrc);
        },
        productImageSlide: function (event) {
            var Imagesrc = event.target.parentElement.getAttribute('data-href');
            function collectionHas(a, b) {
                for (var i = 0, len = a.length; i < len; i++) {
                    if (a[i] == b) return true;
                }
                return false;
            }
            function findParentBySelector(elm, selector) {
                var all = document.querySelectorAll(selector);
                var cur = elm.parentNode;
                while (cur && !collectionHas(all, cur)) {
                    cur = cur.parentNode;
                }
                return cur;
            }

            var yourElm = event.target
            var selector = ".product-box-slide";
            var parent = findParentBySelector(yourElm, selector);
            var Image = parent.querySelectorAll(".main-product-img")[0];
            Image.setAttribute('src', Imagesrc);
        },
        validateBeforeSubmit: function (event) {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    event.srcElement.submit();
                    return
                } else {
                    if (vm.$refs.selected !== undefined && vm.$refs.selected.checked) {
                        event.srcElement.submit();
                        return
                    }
                    if (vm.$refs.visible !== undefined && vm.$refs.visible.style.display == "none") {
                        event.srcElement.submit();
                        return
                    }
                }
            });
        },
        validateBeforeClick: function (event) {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    var callFunction = event.srcElement.getAttribute('data-click');
                    eval(callFunction)
                    return
                }
            });
        },
        validateBeforeSubmitParam: function (event, param) {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    var para = document.createElement("input");
                    para.name = param;
                    para.type = 'hidden';
                    event.srcElement.appendChild(para);
                    event.srcElement.submit();
                    return
                } else {
                    if ((vm.$refs.selected !== undefined && vm.$refs.selected.checked) ||
                        (vm.$refs.visible !== undefined && vm.$refs.visible.style.display == "none")) {
                        var para = document.createElement("input");
                        para.name = param;
                        para.type = 'hidden';
                        event.srcElement.appendChild(para);
                        event.srcElement.submit();
                        return
                    }
                }
            });
        },
        isMobile: function () {
            return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
        },
        attrchange: function (productId, hasCondition, loadPicture) {
            var form = document.getElementById('product-details-form');
            var data = new FormData(form);
            axios({
                url: '/product/productdetails_attributechange?productId=' + productId + '&validateAttributeConditions=' + hasCondition + '&loadPicture=' + loadPicture,
                data: data,
                method: 'post',
                params: { product: productId },
            }).then(function (response) {
                if (response.data.price) {
                    vm.PopupQuickViewVueModal.ProductPrice.Price = response.data.price;
                }
                if (response.data.sku) {
                    vm.PopupQuickViewVueModal.Sku = response.data.sku;
                }
                if (response.data.mpn) {
                    vm.PopupQuickViewVueModal.Mpn = response.data.mpn;
                }
                if (response.data.gtin) {
                    vm.PopupQuickViewVueModal.Gtin = response.data.gtin;
                }
                if (response.data.stockAvailability) {
                    vm.PopupQuickViewVueModal.StockAvailability = response.data.stockAvailability;
                }
                if (response.data.buttonTextOutOfStockSubscription) {
                    PopupQuickViewVueModal.StockAvailability = response.data.stockAvailability;
                }
                if (response.data.enabledattributemappingids) {
                    for (var i = 0; i < response.data.enabledattributemappingids.length; i++) {
                        document.querySelector('#product_attribute_label_' + response.data.enabledattributemappingids[i]).style.display = "table-cell";
                        document.querySelector('#product_attribute_input_' + response.data.enabledattributemappingids[i]).style.display = "table-cell";
                    }
                }
                if (response.data.disabledattributemappingids) {
                    for (var i = 0; i < response.data.disabledattributemappingids.length; i++) {
                        document.querySelector('#product_attribute_label_' + response.data.disabledattributemappingids[i]).style.display = "none";
                        document.querySelector('#product_attribute_input_' + response.data.disabledattributemappingids[i]).style.display = "none";
                    }
                }
                if (response.data.pictureDefaultSizeUrl !== null) {
                    if (vm.PopupQuickViewVueModal.PictureModels.length > 1) {
                        var active_img_src = vm.$refs.QuickViewSlider.$swiper.slides[vm.$refs.QuickViewSlider.$swiper.activeIndex].querySelector("img").dataset.srcs;
                        if (!(active_img_src == response.data.pictureDefaultSizeUrl)) {
                            vm.$refs.QuickViewSlider.$swiper.slides.forEach(function (element, index) {
                                var img_src = element.querySelector('img').dataset.srcs;
                                if (img_src == response.data.pictureDefaultSizeUrl) {
                                    vm.$refs.QuickViewSlider.$swiper.slideTo(index, 1000, false)
                                }
                            })
                        }
                    } else {
                        vm.PopupQuickViewVueModal.DefaultPictureModel.ImageUrl = response.data.pictureDefaultSizeUrl;
                    }
                }
            });
        },
        uploadFile: function (e) {
            var formData = new FormData();
            var imagefile = e;
            var url = imagefile.getAttribute('data-url');
            formData.append("image", qqfile.files[0]);
            axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(function (response) {
                if (response.data.success) {
                    var message = response.data.message;
                    var downloadGuid = response.data.downloadGuid;
                    var downloadUrl = response.data.downloadUrl;
                    var downloadBtn = document.querySelector('.download-file');
                    var messageContainer = document.getElementById('download-message');

                    e.setAttribute('qq-button-id', downloadGuid);
                    document.querySelector('.hidden-upload-input').value = downloadGuid;

                    messageContainer.style.display = "block";
                    messageContainer.classList.remove('alert-danger');
                    messageContainer.classList.add('alert-info');
                    messageContainer.innerText = message;

                    downloadBtn.style.display = "block";
                    downloadBtn.children[0].setAttribute('href', downloadUrl);

                } else {
                    var message = response.data.message;
                    var messageContainer = document.getElementById('download-message');
                    messageContainer.style.display = "block";
                    messageContainer.classList.remove('alert-info');
                    messageContainer.classList.add('alert-danger');
                    messageContainer.innerText = message;
                }
            })
        },
        initReservationQV: function () {
            var productId = vm.PopupQuickViewVueModal.Id;
            var fullDate = vm.PopupQuickViewVueModal.ReservationFullDate;
            var year = vm.PopupQuickViewVueModal.ReservationYear;
            var month = vm.PopupQuickViewVueModal.ReservationMonth;
            Reservation.init(fullDate, year, month, "No available reservations", "/Product/GetDatesForMonth", productId, "/product/productdetails_attributechange?productId=" + productId + "&validateAttributeConditions=False");
        },
        getLinkedProductsQV: function (id) {
            var data = { productId: id };
            axios({
                url: '/Component/Index',
                method: 'post',
                params: { "name": "RelatedProducts" },
                data: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Response-View': 'Json'
                }
            }).then(function (response) {
                vm.RelatedProducts = response.data;
            });
        },
        groupBy(xs, key) {
            return xs.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        },
        warehouse_change_handler(id, url) {
            var whId = document.getElementById('WarehouseId').value;
            var data = { warehouseId: whId }
            axios({
                url: url + '?productId=' + id,
                data: JSON.stringify(data),
                params: { product: id },
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Response-View': 'Json'
                }
            }).then(function (response) {
                if (response.data.stockAvailability) {
                    vm.PopupQuickViewVueModal.StockAvailability = response.data.stockAvailability;
                }
            })
        },
        QuickViewShown: function () {
            if (vm.PopupQuickViewVueModal.ProductAttributes.length > 0) {
                vm.attrchange(vm.PopupQuickViewVueModal.Id, vm.PopupQuickViewVueModal.HasCondition, true)
            }
        }
    }
});