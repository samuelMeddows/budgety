// BUDGET CONTROLLER - MODEL
var budgetController = (function() {

    // Expense Constructor
    // --------------------
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Calculate Percentage Prototype
    // -----------------
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // Get Percentage Prototype
    // -----------------
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    // Income Constructor
    // -------------------
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Calculate Total Constructor
    // -------------------
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum = sum += cur.value;
        });
        data.totals[type] = sum;
    };

    // Data Array 
    // ----------
    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage: -1
    };

    return {
        // addItem Function
        //-----------------
        addItem: function(type, des, val) {
              var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

              // Create new item based on 'inc' or 'exp' type
              if (type === 'exp'){
                newItem = new Expense(ID, des, val);
              } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
              }

              // Push it into our data structure 
              data.allItems[type].push(newItem);

              // Return the new elemnt 
              return newItem;
              
        },

        // deleteItem Function
        // -------------------
        deleteItem: function(type, id) {
                var ids, index;

                // Map method
                // ids = [1 2 4 6 8]
                // index 3
                ids = data.allItems[type].map(function(current) {
                    return current.id;
                });

                index = ids.indexOf(id);

                if (index !== -1) {

                    data.allItems[type].splice(index, 1);

                }

        },

        //calculateItem Function
        // ---------------------
        calculateBudget: function() {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
          },

          // calculatePercentages Function
          // -----------------------------
          calculatePercentages(){
            // e / 100  = p
            data.allItems.exp.forEach(function(cur) {
                    cur.calcPercentage(data.totals.inc);
            });

          },

          // getPercentages Function
          // -----------------------
          getPercentages : function() {
                var allPerc = data.allItems.exp.map(function(cur) {
                    return cur.getPercentage();
                });
                return allPerc;
          },
          
          // getBudget Function
          // ------------------1`   
          getBudget: function() {
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                }
          },

        // TEMP - Testing Function
        testing: function() {
            console.log(data);
        }
    };

})();


// UI CONTROLLER - VIEW
var UIController = (function() {

    // DOM Strings Object
    // ------------------
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    // formatNumber Function
    // ---------------------
    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        /*
        + or - before number
        exactly 2 deceimal points
        comma separating the thousands
        */

        num = Math.abs(num);
        num = num.toFixed(2); // Always put two decimal numbers

        numSplit = num.split('.');

        int = numSplit[0];
       
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(length - 3, int.length); // input 2310, output 2,310
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : '+') + ' ' + int + '.' + dec;

    };

        // Node list forEach loop
        // ----------------------
        var nodeListForEach = function(list, callback) {

            for (var i = 0; i < list.length; i++) {
                callback(list[i], i);
            }

        };

    return {
        // getInput Function
        // -----------------
        getInput: function() {
            return {
                 type: document.querySelector(DOMstrings.inputType).value, // Will be either income or expense
                 description: document.querySelector(DOMstrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        // addListItem Function
        // --------------------
        addLisItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text with some actual daata
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        
        // deleteListItem Function
        // -----------------------
        deleteListItem: function(selectorID) {

            var el =  document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        // clearFields Function
        // --------------------
        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        // displayBudget Function
        // ----------------------
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent =  '---';
            }

        },

        // displayPercentages Function
        // ---------------------------
        displayPercentages: function(percentages) {

                var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

                nodeListForEach(fields, function(current, index) {

                    if (percentages[index] > 0) {
                        current.textContent = percentages[index] + '%';
                    } else {
                        current.textContent = percentages[index] + '---';
                    } 
                });
        },

        displayMonth: function() {
            var now, months, month, year;

            months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        chnageType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

                nodeListForEach(fields, function(cur) {

                    cur.classList.toggle('red-focus');

                });

                document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLLER - CONTROLLER
var controller =(function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
             if (event.keyCode === 13 || event.which === 13 ) {
                 ctrlAddItem();
             }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.chnageType);
    }

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetController.calculateBudget();

        // 2. Return the budget
        var budget = budgetController.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var uupdatePercentages = function() {

        // 1. Calculate the percentages
        budgetController.calculatePercentages();

        // 2. Read percentages for thje budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        var input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            var newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UIController.addLisItem(newItem, input.type);

            // 4. Clear the field
            UIController.clearFields();
            
            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            uupdatePercentages();
        }
        
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);

        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item fro mthe data structure 
            budgetController.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UIController.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            uupdatePercentages();
        }
    } 

    return {
        init: function() {
            console.log('Application has started.')
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();