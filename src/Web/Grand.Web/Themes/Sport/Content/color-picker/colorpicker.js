
var Picker = Vue.extend({
    el: "#color-picker",
    data() {
        return {
            color: "#50b890",
            colorStyle: "#50b890",
            toggle: true,
        };
    },
    methods: {
        hexToRgbA(hex) {
            var c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = '0x' + c.join('');
                this.colorStyle = '' + [(c >> 16) & 255, (c >> 8) & 255, c & 255] + '';
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255] + ')';
            }
            throw new Error('Bad Hex');
        },
        setColor() {
            localStorage.setItem('SavedColorSport', this.color);
            var circle = document.querySelector('#color-picker .circle span');
            circle.classList.add("animate__animated", "animate__backInDown", "show");
            setTimeout(function () {
                circle.classList.remove("animate__animated", "animate__backInDown");
            }, 1500)
        },
        toggleChange: function () {
            this.toggle = !this.toggle;
        }
    },
    mounted() {
        if (localStorage.getItem("SavedColorSport") !== null) {
            this.color = localStorage.getItem("SavedColorSport");
            this.colorStyle = localStorage.getItem("SavedColorSport");
        }
    }
});
var picker = new Picker().$mount('#color-picker')