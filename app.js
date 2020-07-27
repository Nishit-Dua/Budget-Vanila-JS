var BugdetController = (function () {
    //Some Code
    class Expence {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        getPercentage() {
            if (data.totals.inc > 0) {
                this.percentage = Math.round((this.value / data.totals.inc) * 100);
            }
            else {
                this.percentage = -1;
            }

            return this.percentage;
        }
    }

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    data = {
        allItems: {
            inc: [],
            exp: []
        },

        totals: {
            inc: 0,
            exp: 0
        },

        budget: 0,
        percentage: -1
    };

    var sumAll = function (type) {
        var sum = 0;
        for (temp of data.allItems[type]) {
            sum += temp.value;
        }
        return sum;
    }

    return {
        addItem: function (type, description, value) {
            var newItem, ID;
            ID = 0;

            //new ID
            if (data.allItems[type].length === 0) {
                ID = 0;
            } else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            //new Data
            if (type == 'exp') {
                newItem = new Expence(ID, description, value);
            } else if (type == 'inc') {
                newItem = new Income(ID, description, value);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, ID) {
            IDs = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = IDs.indexOf(ID);

            if (index !== -1) {
                data.budget -= data.allItems[type][index].value
                data.allItems[type].splice(index, 1)
            }
        },

        getPercentagesArray: function () {
            var percentages;
            percentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            })
            return percentages;
        },

        calculateBudget: function () {
            data.totals.inc = sumAll('inc');
            data.totals.exp = sumAll('exp');

            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = 0;
            }
        },

        getBudget: function () {

            return {
                budget: data.budget,
                income: data.totals.inc,
                expences: data.totals.exp,
                percentage: data.percentage
            }
        },

        exposeData: function () {
            return data;
        }
    }

})();

var UIConstroller = (function () {

    var DOM = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        button: '.add__btn',
        incomeContainer: '.income__list',
        expenceContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expencesLabel: '.budget__expenses--value',
        expencePercentage: '.item__percentage',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };

    return {

        getDOM: function () {
            return DOM
        },

        getInput: function () {
            return {
                type: document.querySelector(DOM.type).value,
                description: document.querySelector(DOM.description).value,
                value: parseFloat(document.querySelector(DOM.value).value)
            }
        },

        addListItem: function (obj, type) {
            var html, element;

            // console.log(obj)

            if (type === 'exp') {
                element = DOM.expenceContainer;
                html = `<div class="item clearfix" id="exp-${obj.id}">
                <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                    <div class="item__value">- ${(obj.value).toFixed(2)}</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
            } else if (type === 'inc') {
                element = DOM.incomeContainer;
                html = `<div class="item clearfix" id="inc-${obj.id}">
                <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                        <div class="item__value">+ ${(obj.value).toFixed(2)}</div>
                        <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
            }

            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        clearFields: function () {
            var fields;
            fields = document.querySelectorAll(`${DOM.description} , ${DOM.value}`);

            var fieldsArray = Array.from(fields);

            fieldsArray.forEach(function (current) {
                current.value = '';
            });

            fieldsArray[0].focus();
        },

        updateLabels: function (obj) {
            document.querySelector(DOM.budgetLabel).textContent = (obj.budget).toFixed(2);
            document.querySelector(DOM.incomeLabel).textContent = (obj.income).toFixed(2);
            document.querySelector(DOM.expencesLabel).textContent = (obj.expences).toFixed(2);
            document.querySelector(DOM.percentageLabel).textContent = obj.percentage + '%';
        },

        updatePercentageUI: function (array) {
            var elms = Array.from(document.querySelectorAll(DOM.expencePercentage));
            for (i in array) {
                elms[i].textContent = array[i] + '%';
            }
        },

        changeColor: function () {
            var elms;
            elms = Array.from(document.querySelectorAll(`${DOM.type} , ${DOM.description}, ${DOM.value}`));
            for (el of elms) {
                el.classList.toggle('red-focus');
            }

            document.querySelector(DOM.button).classList.toggle('red')

        }
    }

})();

var Controller = (function (Budgetctrl, UIctrl) {

    var setUpEventListeners = function () {
        var DOM = UIctrl.getDOM();

        document.querySelector(DOM.button).addEventListener('click', addItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode == 13) {
                addItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', removeItem);

        document.querySelector(DOM.type).addEventListener('change', UIctrl.changeColor);
    }

    var updatePercentage = function () {
        per = Budgetctrl.getPercentagesArray();
        console.log(per);
        UIctrl.updatePercentageUI(per);
    }

    var updateBudget = function () {
        Budgetctrl.calculateBudget();

        budget = Budgetctrl.getBudget();

        // console.log(budget);

        UIctrl.updateLabels(budget);
    }

    var removeFromList = function (elID) {
        el = document.getElementById(elID);
        el.parentNode.removeChild(el);
    }

    //called when pressed return key or clicked button
    // event listeners above
    var addItem = function () {
        var inp, newItem;
        inp = UIctrl.getInput();

        if (inp.description !== '' && !isNaN(inp.value) && inp.value > 0) {
            newItem = Budgetctrl.addItem(inp.type, inp.description, inp.value);

            UIctrl.addListItem(newItem, inp.type);

            UIctrl.clearFields();

            updateBudget();

            updatePercentage();
        }
    }

    var removeItem = function (event) {
        var itemID, splitID, ID, type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            Budgetctrl.deleteItem(type, ID);

            updateBudget();

            removeFromList(itemID)

            updatePercentage();
        }
    }


    return {
        init: function () {
            console.log('app has started');
            UIctrl.updateLabels({
                budget: 0,
                income: 0,
                expences: 0,
                percentage: ''
            });
            setUpEventListeners();
        }
    }

})(BugdetController, UIConstroller);


Controller.init();