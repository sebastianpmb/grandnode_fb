var AjaxFilter = {
    url: false,
    query: '',
    baseurl: '',
    spinnerToggle: function (wantShow) {
        if (wantShow) {
            catalog.loading = true;
        } else {
            catalog.loading = false;
        }
    },
    init: function (url, query, baseurl) {
        this.url = url;
        this.query = query.replace(/amp;/g, '');
        this.baseurl = baseurl;
        var ajaxproducts = document.getElementById("AjaxProducts");
        document.querySelector(".page").appendChild(ajaxproducts);
        if (document.getElementById("filter-button")) {
            document.querySelector(".sort-container.change-view").appendChild(document.getElementById("filter-button"));
        }
        document.querySelectorAll(".ajaxfilter-section input:checked").forEach(function (element) {
            var firstName = element.parentElement.querySelector("label").innerText.split("(")[0],
                firstClass = element.classList[0];
            renderActiveFilters(firstClass, firstName);
        });
        document.querySelectorAll('.ajaxfilter-section select option').forEach(function (element) {
            if (element.value.length > 0 && element.selected) {
                var firstId = element.parentElement.id;
                listenToSelect(firstId)
            }
        });
    },
    setFilter: function (flt) {

        catalogAxios.loading = true;
        if (flt !== 'pagenumber' && flt !== 'update') {
            document.querySelector("#PageNumber").value = 0;
        }

        var formData = new FormData(document.getElementById('ajaxfilter-form'))

        var newFormData = new FormData();

        for (var [key, value] of formData) {
            var res = key.charAt(0);
            if (res == "[") {
                var newkey = 'model' + key;
            } else {
                var newkey = 'model[' + key + ']';
            }
            newFormData.append(newkey, value);
        }
        newFormData.append('typ', flt);

        AjaxFilter.spinnerToggle(true);

        axios({
            baseURL: this.url + this.query,
            data: newFormData,
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-Response-View': 'XMLHttpRequest'
            }
        }).then(function (response) {
            AjaxFilter.spinnerToggle(false);
            catalog.AjaxProducts = response.data;
            catalog.Model.PagingFilteringContext.PageSize = response.data.Data.AjaxProductsModel.PagingFilteringContext.PageSize;
            catalog.Model.PagingFilteringContext.PageNumber = response.data.Data.AjaxProductsModel.PagingFilteringContext.PageNumber;

            if (response.data.Data.PageSize < response.data.Data.AjaxProductsModel.Count) {
                if (response.data.Data.PageSize > 0) {
                    var p_size = response.data.Data.PageSize;
                } else {
                    var p_size = 1;
                }
                var p_count = response.data.Data.AjaxProductsModel.Count;
                totalPage = Math.ceil(p_count / p_size);
                var p_numbers = Array.from(Array(totalPage).keys());
                catalog.AjaxProducts.pager = p_numbers;
            }
            if (response.data.Data) {
                var ajax_pos = document.getElementById("AjaxProducts").offsetTop - (window.innerHeight / 2);
                if (response.data.Url.length > 0) {
                    window.history.replaceState({ path: response.data.Url }, '', response.data.Url);
                    AjaxFilter.query = response.data.Url;
                }
                else {
                    window.history.replaceState({ path: AjaxFilter.baseurl }, '', AjaxFilter.baseurl);
                    AjaxFilter.query = '';
                }
                if (response.data.Data.AjaxProductsModel) {
                    var count = response.data.Data.AjaxProductsModel.Count;
                    if (document.querySelector('.items-total')) {
                        document.querySelector('.items-total').innerHTML = count;
                    }
                    var pagenum = response.data.Data.AjaxProductsModel.PagingFilteringContext.PageNumber;
                    var firstitem = response.data.Data.AjaxProductsModel.PagingFilteringContext.FirstItem;
                    var lastitem = response.data.Data.AjaxProductsModel.PagingFilteringContext.LastItem;
                    if (document.querySelector('.number')) {
                        document.querySelector('.number').innerHTML = firstitem + ' - ' + lastitem;
                    }
                }
                if (response.data.Type.length > 0) {
                    if (response.data.Type != 'm') {


                        document.querySelectorAll(".manufacturer-section input[type='checkbox']:not(:checked)").forEach(function (element) {
                            element.setAttribute("disabled", true);
                        });

                        document.querySelectorAll('#manufacturers-filter-section .ajaxfilter-section ul li label span').forEach(function (element) {
                            element.innerText = '(0)';
                        });
                        document.querySelectorAll(".manufacturer-section select option").forEach(function (element) {
                            if (element + ":not(:selected)" && element.index > 0) {
                                element.setAttribute('disabled', true);
                            }
                        });
                        if (response.data.Data.manufacturerModel.Manufacturers.length > 0) {
                            response.data.Data.manufacturerModel.Manufacturers.forEach(function (entry) {
                                document.querySelectorAll(".manufacturer-section input[value='" + entry.Id + "']").forEach(function (element) {
                                    element.removeAttribute("disabled");
                                });
                                document.querySelectorAll('#manufacturers-filter-section .ajaxfilter-section ul li[data-id="' + entry.Id + '"] label span').forEach(function (element) {
                                    element.innerText = '(' + entry.Count + ')';
                                });
                                if (document.querySelector(".manufacturer-section select option[value='" + entry.Id + "']")) {
                                    document.querySelector(".manufacturer-section select option[value='" + entry.Id + "']").removeAttribute('disabled');
                                }
                            });
                        }

                    }
                    if (response.data.Type != 'v') {

                        document.querySelectorAll(".vendors-section input[type='checkbox']:not(:checked)").forEach(function (element) {
                            element.setAttribute("disabled", true);
                        });
                        document.querySelectorAll('#vendors-filter-section .ajaxfilter-section ul li label span').forEach(function (entry) {
                            entry.innerText = '(0)';
                        });
                        document.querySelectorAll(".vendors-section select option").forEach(function (element) {
                            if (element + ":not(:selected)" && element.index > 0) {
                                element.setAttribute('disabled', true);
                            }
                        });
                        if (response.data.Data.vendorsModel.Vendors.length > 0) {
                            response.data.Data.vendorsModel.Vendors.forEach(function (entry) {
                                if (document.querySelector(".vendors-section input")) {
                                    document.querySelector(".vendors-section input[value='" + entry.Id + "']").removeAttribute("disabled");
                                    document.querySelector('#vendors-filter-section .ajaxfilter-section ul li[data-id="' + entry.Id + '"] label span').innerText = '(' + entry.Count + ')';
                                }
                                if (document.querySelector(".vendors-section select")) {
                                    document.querySelector(".vendors-section select option[value='" + entry.Id + "']").removeAttribute('disabled');
                                }
                            });
                        }

                    }
                    if (response.data.Type.startsWith('s')) {
                        var id = response.data.Type.split('-').pop();
                        var specSection = document.querySelectorAll('.specification-section .filter-section');
                        specSection.forEach(function (entry) {
                            var specification = entry;

                            var idSpec = entry.getAttribute("data-id");
                            if (idSpec != id) {
                                entry.querySelectorAll("#specification-filter-section input[type='checkbox']").forEach(function (element) {
                                    element.setAttribute("disabled", true);
                                });
                                entry.querySelectorAll("select option").forEach(function (element) {
                                    if (element + ":not(:selected)" && element.index > 0) {
                                        element.setAttribute('disabled', true);
                                    }
                                });

                                document.querySelectorAll('#specification-filter-section .specification-section .filter-section[data-id="' + idSpec + '"]  .ajaxfilter-section ul li label span').forEach(function (entry) {
                                    entry.innerText = '(0)';
                                });
                                if (response.data.Data.specyficationModel.SpecificationAttributes.length > 0) {
                                    response.data.Data.specyficationModel.SpecificationAttributes.filter(function (item) {
                                        item.SpecificationAttributeOptions.filter(function (option) {
                                            if (document.querySelector("#specification-filter-section .ajaxfilter-section ul li input[type='checkbox']")) {
                                                document.querySelector('#specification-filter-section .specification-section .filter-section[data-id="' + item.Id + '"] .ajaxfilter-section ul li[data-id="' + option.Id + '"] label span').innerText = '(' + option.Count + ')';
                                            }
                                        });
                                    });
                                }

                            }
                            response.data.Data.specyficationModel.SpecificationAttributes.filter(function (item) {
                                if (item.Id == idSpec) {
                                    item.SpecificationAttributeOptions.forEach(function (option) {
                                        specification.querySelectorAll("input[value='" + option.Id + "']").forEach(function (element) {
                                            element.removeAttribute('disabled');
                                        });
                                        specification.querySelectorAll("select option[value='" + option.Id + "']").forEach(function (element) {
                                            element.removeAttribute('disabled');
                                        });
                                    });
                                }
                            });
                            specification.querySelectorAll('input[type=checkbox]').forEach(function (element) {
                                if (element.checked == true) {
                                    element.removeAttribute('disabled')
                                }
                            })
                        });


                    }
                    else {
                        var specSection = document.querySelectorAll('.specification-section .filter-section');
                        specSection.forEach(function (entry) {
                            var specification = entry;
                            specification.querySelectorAll("input[type='checkbox']").forEach(function (ele) {
                                ele.setAttribute("disabled", true);
                            });
                            entry.querySelectorAll("select option").forEach(function (element) {
                                if (element + ":not(:selected)" && element.index > 0) {
                                    element.setAttribute('disabled', true);
                                }
                            });
                            var idSpec = entry.getAttribute("data-id");
                            response.data.Data.specyficationModel.SpecificationAttributes.filter(function (item) {
                                if (item.Id == idSpec) {
                                    item.SpecificationAttributeOptions.forEach(function (option) {
                                        specification.querySelectorAll("input[value='" + option.Id + "']").forEach(function (element) {
                                            element.removeAttribute("disabled");
                                        });
                                        specification.querySelectorAll("select option[value='" + option.Id + "']").forEach(function (element) {
                                            element.removeAttribute("disabled");
                                        });
                                    });
                                }
                            });
                            specification.querySelectorAll('input[type=checkbox]:disabled:checked').forEach(function (element) {
                                element.removeAttribute("disabled");
                            });

                        });

                        document.querySelectorAll('#specification-filter-section .specification-section .filter-section .ajaxfilter-section ul li label span').forEach(function (element) {
                            element.innerText = '(0)';
                        });
                        if (response.data.Data.specyficationModel.SpecificationAttributes.length > 0) {
                            response.data.Data.specyficationModel.SpecificationAttributes.filter(function (item) {
                                item.SpecificationAttributeOptions.filter(function (option) {
                                    if (document.querySelector("#specification-filter-section input[type='checkbox']")) {
                                        document.querySelector('#specification-filter-section .specification-section .filter-section[data-id="' + item.Id + '"] .ajaxfilter-section ul li[data-id*="' + option.Id + '"] label span').innerText = '(' + option.Count + ')'
                                    }
                                });
                            });
                        }
                    }
                    if (response.data.Type.startsWith('a')) {
                        var id = response.data.Type.split('-').pop();
                        var attrSection = document.querySelectorAll('#attribute-filter-section .filter-section:not(.' + response.data.Type + ')');
                        attrSection.forEach(function (element) {
                            var attribute = element;
                            element.querySelectorAll("input[type='checkbox']").forEach(function (element) {
                                element.setAttribute("disabled", true);
                            });
                            element.querySelectorAll("select option").forEach(function (element) {
                                if (element + ":not(:selected)" && element.index > 0) {
                                    element.setAttribute('disabled', true);
                                }
                            });
                            var idattr = element.getAttribute("data-id");
                            document.querySelectorAll('#attribute-filter-section .filter-section[data-id="' + idattr + '"] .ajaxfilter-section ul li label span').forEach(function (element) {
                                element.innerText = '(0)';
                            });
                            response.data.Data.attributesModel.ProductVariantAttributes.filter(function (item) {
                                if (item.Id == idattr) {
                                    item.ProductVariantAttributesOptions.forEach(function (option) {
                                        attribute.querySelectorAll("input[value='" + option.Name + "']").forEach(function (element) {
                                            element.removeAttribute("disabled");
                                        });
                                        attribute.querySelectorAll("select option[value='" + option.Name + "']").forEach(function (element) {
                                            element.removeAttribute("disabled");
                                        });
                                        if (document.querySelector('#attribute-filter-section .ajaxfilter-section ul li[data-id="' + option.Name + '"]')) {
                                            document.querySelector('#attribute-filter-section .filter-section[data-id="' + item.Id + '"] .ajaxfilter-section ul li[data-id="' + option.Name + '"] label span').innerText = '(' + option.Count + ')';
                                        }
                                    });
                                }
                                else {
                                    item.ProductVariantAttributesOptions.forEach(function (option) {
                                        if (document.querySelector('#attribute-filter-section .ajaxfilter-section ul li[data-id="' + option.Name + '"]')) {
                                            document.querySelector('#attribute-filter-section .filter-section[data-id="' + item.Id + '"] .ajaxfilter-section ul li[data-id="' + option.Name + '"] label span').innerText = '(' + option.Count + ')';
                                        }
                                    });
                                }
                            });
                            element.querySelectorAll('input[checkbox]').forEach(function (element) {
                                if (element.checked == true) {
                                    element.removeAttribute('disabled');
                                }
                            });
                        });



                    }
                    else {
                        var attrSection = document.querySelectorAll('#attribute-filter-section .filter-section');
                        attrSection.forEach(function (element) {
                            var attribute = element;
                            attribute.querySelectorAll("input[type='checkbox']").forEach(function (ele) {
                                ele.setAttribute("disabled", true);
                            });
                            element.querySelectorAll("select option").forEach(function (element) {
                                if (element + ":not(:selected)" && element.index > 0) {
                                    element.setAttribute('disabled', true);
                                }
                            });
                            var idattr = element.getAttribute("data-id");
                            response.data.Data.attributesModel.ProductVariantAttributes.filter(function (item) {
                                if (item.Id == idattr) {
                                    item.ProductVariantAttributesOptions.forEach(function (option) {
                                        attribute.querySelectorAll("input[value='" + option.Name + "']").forEach(function (element) {
                                            element.removeAttribute("disabled");
                                        });
                                        attribute.querySelectorAll("select option[value='" + option.Name + "']").forEach(function (element) {
                                            element.removeAttribute("disabled");
                                        });
                                    });
                                }
                            });
                            element.querySelectorAll('input[type=checkbox]:disabled:checked').forEach(function (element) {
                                element.removeAttribute("disabled");
                            });
                        });

                        document.querySelectorAll('#attribute-filter-section .filter-section .ajaxfilter-section ul li label span').forEach(function (element) {
                            element.innerText = '(0)';
                        });

                        if (response.data.Data.attributesModel.ProductVariantAttributes.length > 0) {
                            response.data.Data.attributesModel.ProductVariantAttributes.filter(function (item) {
                                item.ProductVariantAttributesOptions.filter(function (option) {
                                    if (document.querySelector("#attribute-filter-section input[type='checkbox']")) {
                                        document.querySelector('#attribute-filter-section .filter-section[data-id="' + item.Id + '"] .ajaxfilter-section ul li[data-id="' + option.Name + '"] label span').innerText = '(' + option.Count + ')';
                                    }
                                });
                            });
                        }

                    }

                }
            }
            catalogAxios.loading = false;
        })
    }
};

var urlParam = function (purl, name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(purl);
    if (results == null) {
        return null;
    }
    else {
        return decodeURI(results[1]) || 0;
    }
};


document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('select[name="products-orderby"] option').forEach(function (v, i) {
        var orderby = urlParam(v.value.toLowerCase(), 'orderby');
        v.value = orderby;
    });

    if (document.querySelector('select[name="products-orderby"]')) {
        document.querySelector('select[name="products-orderby"]').removeAttribute('onchange');
        document.querySelector('select[name="products-orderby"]').addEventListener("change", function (e) {
            document.querySelector("#SortOption").value = this.value;
            AjaxFilter.setFilter('orderby');
        });
        document.querySelector("#SortOption").value = document.querySelector('select[name="products-orderby"]').value;
    }


    document.querySelectorAll('#products-pagesize option').forEach(function (v, i) {
        var pagesize = urlParam(v.value.toLowerCase(), 'pagesize');
        v.value = pagesize;
    });

    document.querySelectorAll(".viewmode-icon").forEach(function (element) {
        element.addEventListener("click", function (e) {
            e.preventDefault();
            if (element.classList.contains("Grid")) {
                document.querySelector('#ViewMode').value = 'Grid';
                AjaxFilter.setFilter('viewmode');
            } else {
                document.querySelector('#ViewMode').value = 'List';
                AjaxFilter.setFilter('viewmode');
            }
        });
    });
});


function resetFiltersOnPrice() {
    document.querySelectorAll(".ajaxfilter-section input").forEach(function (element) {
        if (element.checked == true) {
            document.querySelector(".clearAllfilters").style.display = "block";
        } else {

            document.querySelector(".clearAllfilters").style.display = "none";

            (function getSelected() {
                var priceMin = document.getElementById("min-price").value,
                    priceCurrent = document.getElementById("price-current-min").value,
                    emptyVal = "",
                    foo = [];

                foo = foo.filter(v => v != '');

                if (foo.length > 0 || priceMin !== priceCurrent) {
                    document.querySelector(".clearAllfilters").style.display = "block";
                } else {
                    document.querySelector(".clearAllfilters").style.display = "none";
                }

            })();
        }
    });
    var nonLinearSlider = document.getElementById('nonlinear');
    var currentMin = Math.trunc(nonLinearSlider.noUiSlider.get()[0]);
    var currentMax = Math.trunc(nonLinearSlider.noUiSlider.get()[1]);

    document.getElementById("price-current-min").value = currentMin;
    document.getElementById("price-current-max").value = currentMax;

    document.getElementById("price-range-min-value").innerText = currentMin;
    document.getElementById("price-range-max-value").innerText = currentMax;
    AjaxFilter.setFilter('p');
};


function resetFilters() {
    'use strict';
    if (document.querySelector("#min-price")) {
        var priceMin = document.querySelector("#min-price").value,
            priceCurrent = document.querySelector("#price-current-min").value;
    }

    document.querySelector(".clearAllfilters").style.display = "none";

    if (priceMin !== priceCurrent) {
        document.querySelector(".clearAllfilters").style.display = "block";
    }
    document.querySelectorAll(".ajaxfilter-section input[type='checkbox']").forEach(function (element) {
        if (element.checked == true) {
            document.querySelector(".clearAllfilters").style.display = "block";
        }
    });

    (function getSelected() {
        if (document.querySelector("#min-price")) {
            var priceMin = document.querySelector("#min-price").value,
                priceCurrent = document.querySelector("#price-current-min").value,
                emptyVal = "",
                selectedValues = [];
        } else {
            var emptyVal = "",
                selectedValues = [];
        }

        document.querySelectorAll('.ajaxfilter-section select option').forEach(function (selected, i) {
            selectedValues[i] = selected.value;
        });


        selectedValues = selectedValues.filter(v => v != '');

        if (document.querySelector("#min-price")) {
            if (selectedValues.length > 0 || priceMin !== priceCurrent) {
                document.querySelector(".clearAllfilters").style.display = "block";
            }
        } else {
            if (selectedValues.length > 0) {
                document.querySelector(".clearAllfilters").style.display = "block";
            }
        }

    })();
};



function renderActiveFilters(renderClass, name) {

    //var labelFor = document.querySelector(".id-" + renderClass).getAttribute('id').replace("square_", "");

    function removeSingleFilter() {
        var getedClass = this.name.replace("filtredBy", "");
        //document.querySelector(".selectedOptions input[name = 'filtredBy" + renderClass + "' ].remover").unbind("click");
        document.querySelector("input.id-" + getedClass).click();
    }
    if (document.querySelector(".Name-" + renderClass + ".square").classList.contains('active')) {
        function setAttributes(el, attrs) {
            for (var key in attrs) {
                el.setAttribute(key, attrs[key]);
            }
        }

        var container = document.createElement('DIV');

        setAttributes(container, { 'class': 'col-12 itemHolder' + renderClass, 'readonly': true, 'name': "sector" + renderClass, 'value': name })
        document.querySelector('.selectedOptions').appendChild(container);


        var input = document.createElement('INPUT');

        setAttributes(input, { 'class': 'btn btn-sm btn-secondary col-10', 'readonly': true, 'name': "filtredBy" + renderClass, 'value': name })
        document.querySelector('.itemHolder' + renderClass).appendChild(input);

        var remover_container = document.createElement('DIV');
        var remover = document.createElement('INPUT');

        setAttributes(remover_container, { 'class': 'btn btn-sm btn-secondary col-2 icons icon-close' })
        setAttributes(remover, { 'class': 'remover', 'readonly': true, 'name': "filtredBy" + renderClass, 'value': 'x' })

        remover_container.appendChild(remover)
        document.querySelector('.itemHolder' + renderClass).appendChild(remover_container);

        document.querySelector("input[name = 'filtredBy" + renderClass + "' ].remover").addEventListener('click', removeSingleFilter);

    } else {
        document.querySelector('.itemHolder' + renderClass).remove();

    }
    resetFilters();
}

function listenToCheckBox(element, id, name) {
    document.querySelectorAll(".id-" + id).forEach(function (element) {
        element.classList.toggle("active");
    })
    renderActiveFilters(id, name);
};

//generate filter by section
function listenToSelect(selectId) {

    var newselectId = selectId;

    // reset filterby by select
    function removeSingleFilterSelect() {
        var getedClass = this.name.replace("filtredBy", "");
        selector = document.querySelector("select#" + selectId)

        for (var i = 0; i < selector.length; i++) {
            selector[i].selected = false;
            selector[i].selectedIndex = 0;
        }

        AjaxFilter.setFilter(''),
            resetFilters(),
            document.querySelector('.itemHolder' + selectId).remove();


    };
    if (document.querySelector('.itemHolder' + selectId)) {
        var value = document.querySelector('.itemHolder' + selectId).remove();
    };
    if (document.querySelector("select#" + selectId).value !== "") {
        function setAttributes(el, attrs) {
            for (var key in attrs) {
                el.setAttribute(key, attrs[key]);
            }
        }

        var text = document.querySelector("select#" + selectId).options[document.querySelector("select#" + selectId).selectedIndex].text;

        var container = document.createElement('DIV');

        setAttributes(container, { 'class': 'col-12 itemHolder' + selectId, 'readonly': true, 'name': "sector" + selectId, 'value': name })
        document.querySelector('.selectedOptions').appendChild(container);


        var input = document.createElement('INPUT');

        setAttributes(input, { 'class': 'btn btn-sm btn-secondary col-10', 'readonly': true, 'name': "filtredBy" + selectId, 'value': text })
        document.querySelector('.itemHolder' + selectId).appendChild(input);

        var remover_container = document.createElement('DIV');
        var remover = document.createElement('INPUT');

        setAttributes(remover_container, { 'class': 'btn btn-sm btn-secondary col-2 icons icon-close' })
        setAttributes(remover, { 'class': 'remover', 'readonly': true, 'name': "filtredBy" + selectId, 'value': 'x' })

        remover_container.appendChild(remover)
        document.querySelector('.itemHolder' + selectId).appendChild(remover_container);

        document.querySelector("input[name = 'filtredBy" + selectId + "' ].remover").addEventListener('click', removeSingleFilterSelect);

        //var input = document.createElement('INPUT');

        //setAttributes(input, { 'class': 'btn btn-sm btn-secondary col-10', 'readonly': true, 'name': "filtredBy" + selectId, 'value': text })
        //document.querySelector('.itemHolder' + selectId).appendChild(input);

        //var remover = document.createElement('INPUT');

        //setAttributes(remover, { 'class': 'btn btn-sm btn-secondary remover col-2', 'readonly': true, 'name': "filtredBy" + selectId, 'value': 'x' })
        //document.querySelector('.itemHolder' + selectId).appendChild(remover);

        //document.querySelector(".selectedOptions input[name = 'filtredBy" + selectId + "' ].remover").addEventListener('click', removeSingleFilterSelect);

    } else {

        document.querySelector('.itemHolder' + selectId).remove();

    }
};


if (document.querySelector(".ajax-filter-section div") !== undefined) {
    document.querySelector('.closeAllFilters').style.display = "none";
};

document.querySelector(".closeAllFilters").addEventListener("click", function (element) {

    var that = element;

    if (that.classList.contains("open")) {

        document.querySelector(".filter-section .title").forEach(function (element) {

            $(".closeAllFilters").removeClass("open").addClass("close");

            //element.classList.remove("close").classList.add("open").siblings(".ajaxfilter-section").slideUp("slow");
            element.querySelectorAll(".arrowHold").classList.remove("rotate");

        })

    } else {

        document.querySelector(".filter-section .title").forEach(function (element) {
            element.classList.remove("close").classList.add("open");
            document.querySelector(".filter-section .title").classList.remove("close").classList.add("open");
            //$(".ajaxfilter-section").slideDown("slow");
            document.querySelector(".filter-section .title").querySelectorAll(".arrowHold").classList.add("rotate");
        })
    };
});
if (document.querySelector(".ajaxfilter-section select")) {
    document.querySelectorAll(".ajaxfilter-section select").forEach(function (element) {
        element.addEventListener("click", function () {
            resetFilters();
        });
    });
}

// clear all click
function clearAllFilters() {
    // empty set filters box
    document.querySelector(".selectedOptions").innerHTML = "";

    // cumulate activity to default state

    document.querySelectorAll(".ajaxfilter-section input:checked").forEach(function (element) {
        element.checked = false;
    }),

        document.querySelectorAll(".ajaxfilter-section input").forEach(function (element) {
            element.removeAttribute("disabled");
        }),

        document.querySelectorAll('.ajaxfilter-section select').forEach(function (element) {
            for (var i = 0; i < element.length; i++) {
                element[i].selected = false;
                element[i].selectedIndex = 0;
            }
            element.querySelectorAll("option").forEach(function (element) {
                element.removeAttribute("disabled");
            })
        });

    document.querySelectorAll(".square.active").forEach(function (element) {
        element.classList.remove("active")
    });

    AjaxFilter.setFilter('');
    resetFilters();
    // reset values in brackets
    if (document.querySelector(".ajaxfilter-clear-price")) {
        document.querySelector(".ajaxfilter-clear-price").click();
    }
}