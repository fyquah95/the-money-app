app.controller("sessionsNewCtrl" , [ "$scope" , "$http" , "session" , "page" , "User" , "spinner" , "alerts" , "$timeout" , 
function($scope , $http , session , page , User , spinner , alerts , $timeout){
    page.redirectIfSignedIn();
    $scope.user = {};
    $scope.submit = function(){
        spinner.start();
        if( !$scope.user.email && !$scope.user.password) {
            alerts.push("danger" , "user and password combination incorrect!");
            spinner.stop();
            return;
        }
        var data = {
            user: {
                email: $scope.user.email,
                password: $scope.user.password
            }
        };
        $http({
            method: "POST",
            url: "/sessions.json",
            data: data
        }).success(function(data){
            console.log(data);
            session.currentUser(new User(data.user));
            console.log(session.currentUser());
            alerts.removeAll();
            page.redirect("/home");
            alerts.push("success" , "Log in successful! Welcome to the money app");
            spinner.stop();
        }).error(function(data , status){
            try {
                console.log(data);
                // kemungkinan invalid credential
                if (status === 400 && data.error) {
                    alerts.removeAll();
                    alerts.push("danger" , data.error);
                }
            } catch (e) {
                // error 5** [ISE] !!!
                alert("an unkown error occured");
            }
            spinner.stop();
        });
    };

}]);

app.controller("usersNewCtrl" , ["page" , "User" , "$scope" , "session" , "$http" , "alerts" , "$location" , function(page , User , $scope , session , $http , alerts , $location){
    page.redirectIfSignedIn();
    (function(){
        $scope.user = {};
    })();

    $scope.submit = function(){
        var data = {
            user: {
                name: $scope.user.name,
                email: $scope.user.email,
                password: $scope.user.password,
                password_confirmation: $scope.user.password_confirmation
            }
        };
        $http({
            method: "POST" ,
            url: "/users.json" ,
            data: data
        }).
        success(function(data){
            session.currentUser(new User(data.user));
            $location.path("/home");
        }).
        error(function(data , status){;
            if (status === 400) {
                alerts.removeAll();
                angular.forEach(data.error , function(err , index , obj){
                    alerts.push({type: "danger" , msg: err});
                });
            } else {
                console.log(data);
                alert("an unkown error has occurred!");
            }
        });
    }
}]);

app.controller("usersEditCtrl" , function($scope , $http , $routeParams, session , User, page , alerts , spinner){
    if($routeParams.id.toString() !== session.currentUser().id.toString()){
        page.redirect("/home");
        alerts.push("danger" , "You are not authorized to view this page");
        return;
    }
    $scope.user = angular.copy(session.currentUser());

    $scope.submit = function(){
        var data = {
            user: $scope.user
        };
        spinner.start();
        // update then change current user into that
        $http({
            method: "PATCH",
            url: "/users/" + session.currentUser().id + ".json",
            data: data
        }).
        success(function(data){
            session.currentUser(new User(data.user));
            console.log(session.currentUser());
            alerts.push("success" , "Updated your user credentials!");
            spinner.stop();
        }).
        error(function(data , status){
            if (status === 400) {
                console.log(data);
                angular.forEach(data.error , function(err){
                    alerts.push("danger" , err);
                });
            } else {
                alert("An unkown error has happened!");
            }
            spinner.stop();
        });
    }
});

app.controller("alertsCtrl" , [ "alerts" , "$scope" , function(alerts , $scope){
    $scope.all = alerts.all;
    $scope.remove = alerts.remove;
    $scope.removeAll = alerts.removeAll;
}]);

app.controller("menuBarCtrl" , [ "session" , "$scope" , function(session , $scope){
    $scope.session = session;
}]);

app.controller("accountBooksNewCtrl" , ["alerts" , "page" , "$http", "$scope" , "spinner" , function(alerts , page, $http, $scope, spinner){
    if(page.redirectUnlessSignedIn()){
        return;
    }

    $scope.new_account_book = {};

    $scope.submit = function(){
        var data = {
            account_book: {
                name: $scope.new_account_book.name
            }
        };
        $http({
            method: "POST",
            url: "/account_books.json",
            data: data
        }).
        success(function(data){
            // console.log(da)
            page.redirect("/account-books/" + data.account_book.id)
        }).
        error(function(data, status){
            console.log(data);
        })
    }
}]);

app.controller("accountBooksIndexCtrl" , ["alerts" , "page" , "$http", "$scope" , "spinner" , function(alerts , page, $http, $scope, spinner){
    if(page.redirectUnlessSignedIn()){
        return;
    }
    // query ajax data to get all the 
    $http({
        method: "GET",
        url: "/account_books.json"
    }).
    success(function(data){
        $scope.account_books = data.account_books;
        spinner.stop();
    }).
    error(function(data , status){
        
        spinner.stop();
    });
}]);

app.controller("accountBooksShowCtrl" , ["alerts" , "page" , "$http", "$scope" , "spinner" , "$routeParams", "AccountBook" , function(alerts , page, $http, $scope, spinner , $routeParams, AccountBook){
    if(page.redirectUnlessSignedIn()){
        return;
    }
    spinner.start();
    $scope.edit = {};
    // query ajax data to get all the 
    AccountBook.find($routeParams.id).then(function(account_book){
        $scope.account_book = account_book;
        spinner.stop();

        $scope.removeTransaction = function(index){
            account_book.removeTransaction(index).catch(function(){
                alerts.push("danger", "An unkown error has just occured while removing transaction");
            });
        };

        $scope.addNewTransaction = function(){
            account_book.addNewTransaction({
                description: $scope.new_accounting_transaction.description,
                date: $scope.new_accounting_transaction.date
            });
        };

        $scope.renameAccountBook = function(){
            account_book.updateAttribute("name", $scope.new_account_book_name).
            catch(function(msg){
                if (msg.err) {
                    alerts.push("danger", msg.err);
                }
            }).
            finally(function(){
                $scope.edit.rename_account_book = false;
            });
        };

        $scope.addNewExpenditure = function(){
            account_book.addNewExpenditure($scope.new_expenditure).finally(function(){
                edit.add_new_expenditure = false;
            });
        };

        $scope.addNewIncome = function(){
            account_book.addNewIncome($scope.new_income).finally(function(){
                edit.add_new_income = false;
            });
        }
    }, null, null);
}]);

app.controller('accountBooksRecordsCtrl', ['$scope', "$http", "alerts", "session", "$routeParams", "page", "spinner", function($scope, $http, alerts, session, $routeParams, page, spinner){
    if(page.redirectUnlessSignedIn()){
        return;
    }

    spinner.start();
    $scope.accounts = {};
    $scope.account_book_id = $routeParams.id;
    $http({
        method: "GET",
        url: "/account_books/" + $routeParams.id + "/records.json"
    }).success(function(data){
        spinner.stop();
        $scope.accounts = data.account_book_records;
        if ($routeParams.account) {
            $scope.accounts = {};
            $scope.accounts[unescape($routeParams.account)] = data.account_book_records[unescape($routeParams.account)];
            $scope.display_back_link = true;
        }

        for(var acc_name in $scope.accounts){
            var sum_fnc = function(memo, record, index){
                return memo + (record.amount || 0);
            }
            $scope.accounts[acc_name].debit_total = $scope.accounts[acc_name].debit_records.reduce(sum_fnc, 0);
            $scope.accounts[acc_name].credit_total = $scope.accounts[acc_name].credit_records.reduce(sum_fnc, 0);
        }
        console.log(data);
    }).error(function(data){
        spinner.stop();
        console.log(data);
    })
}])

app.controller("accountingTransactionsShowCtrl" , ["$scope", "$http", "alerts", "session","$routeParams", "page", "spinner", function($scope, $http, alerts, session, $routeParams, page, spinner){
    page.redirectUnlessSignedIn();
    spinner.start();

    $http({
        method: "GET",
        url: "/accounting_transactions/" + $routeParams.id + ".json"
    }).
    success(function(data){
        // data = data.accounting_transaction;
        console.log(data);
        $scope.accounting_transaction = data.accounting_transaction;
        $scope.accounting_transaction.amount = function(){
            var reduce_fnc = function(memo, record, index){
                var x = record._destroy ? 0 : (record.amount || 0);
                return memo + Number(x);
            }
            var d = $scope.accounting_transaction.debit_records.reduce(reduce_fnc, 0),
                c = $scope.accounting_transaction.credit_records.reduce(reduce_fnc, 0);
            return (d === c ? d : ("NOT BALANCED!"));
        };
        spinner.stop();
    }).
    error(function(data, status){
        alerts.push("danger", "An unkown error occured!");
        spinner.stop();
    });

    $scope.edit = {
        accounting_transaction: {}
    };

    $scope.update = function(component){
        spinner.start();
        var save_promise, data = {};
        if (component === "records") {
            ["debit_records" , "credit_records"].forEach(function(prop){
                data[prop + "_attributes"] = $scope.accounting_transaction[prop];
            });
        }
        else if (component) { // update one component
            data[component] = $scope.accounting_transaction[component];
        } else { // update everything
            for (var prop in $scope.accounting_transaction) {
                data[prop] = $scope.accounting_transaction[prop];
            }
            console.log(data);
        }
        save_promise = $http({
            method: "PATCH",
            url: "/accounting_transactions/" + $routeParams.id + ".json",
            data: {
                accounting_transaction: data
            }
        }).
        success(function(data){
            alerts.push("success", "updated your " + component);
            spinner.stop();
        }).
        error(function(data){
            alerts.push("danger", "Error updating " + component);
            spinner.stop();
        });
    };

    $scope.prompt_record = function(r_type) {
        $scope.new_account_record = {
            record_type: r_type
        }
        $scope.edit.add_new_record = true;
    };

    $scope.addNewRecord = function(){
        var r_type = $scope.new_account_record.record_type;
        delete $scope.new_account_record.record_type;
        if (r_type === "debit") {
            $scope.accounting_transaction.debit_records.push($scope.new_account_record);
        } else if (r_type === "credit") {
            $scope.accounting_transaction.credit_records.push($scope.new_account_record);
        }
        $scope.edit.add_new_record = false;
    };

    $scope.removeRecord = function(r_type, index){

    }
}])