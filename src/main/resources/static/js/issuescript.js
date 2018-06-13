

//status, downvotes, subject, id, assignee, description, assignedTo, comments

/* Ignore : test for functions
* addIssue("closed","11","Calendar is loading Slow","125","Karthick","smartly pick the team to be assigned based on the tags Assigned to should be like bling/none by default.","Claws/Velu","4");
  addIssue("open","123","Appointments disappearing all of a sudden","009","Prince","Jingle bells jingle bells jingle all the way. Twinkle twinkle little star how I wonder what I want, Up above the world so hight like a diamond in the sky","Avengers/Thulsi","390");
* */

document.getElementById("create-post").addEventListener("click",function (ev) {
    var createPostDiv = document.createElement("div");
    createPostDiv.classList.add("create-post-popup-div");

});

var events = {

    issueDownvote : function () {

        console.log("downvote is called");

        $(".issue-main-container").click(function (evt) {
            evt.preventDefault();
            // console.log(this);
            $(".button-downvote .btn").click(function(evt){
                evt.stopImmediatePropagation();
                console.log(evt.target);
                // console.log($(evt).find(".downvote-numbers"));
                if($(evt.target).hasClass("downvote-numbers")){
                    let eletext = $(evt.target);
                    eletext.html(+(eletext.html())+1);
                    console.log($(eletext).html());

                }
                else if($(evt.target).hasClass("arrow-down")) {
                    let dn = $(evt.target).siblings()[0];
                    console.log($(evt.target).siblings()[0]);
                    $(dn).html(+($(dn).html())+1);
                    console.log($(dn).html());

                }

                else{
                    let dn = $(evt.target).find(".downvote-numbers")[0];
                    console.log(dn);
                    $(dn).html(+($(dn).html()) + 1);
                    console.log($(dn).html());
                }
                //elet.html(+(elet.html()) + 1);
            });
            // let eletext = $(this).find(".downvote-numbers");
            // console.log(eletext);
            // eletext.html(+(eletext.html()) + 1);
        });
    },

    showIssueDetails : function(){
        $(window).click(function(evt){

            $(".issue .description").click(function(evt){

                issue.showBox("issue-details-popup");
                console.log("issue description is clicked");
                // $("#issue-details-popup").toggle();
                // dimBackgroundExcept("issue-details-popup");
                let issueID = $(this).data("issue-id");
                //console.log("issueid: "+issueID);
                let issueContent = "none";
                evt.stopPropagation();
                issueContent = getIssue(issueID).then((res) => {
                    return res;
                });

                console.log(issueContent);
            });
        });
    },
}

events[Symbol.iterator] = function() {

    var self = this;
    var priceIndex = 0;
    let keys = [];
    for(k in self){
        keys.push(k);
    }

    // @@Iterator returns an iterator object
    return {
        // iterator object must implement next method
        next: function() {
            return priceIndex < keys.length ?
                { value: self[keys[priceIndex++]], done: false } :
                { done: true };
        }
    };
};

var issue = {};

    issue.addIssue = function(status, downvotes, subject, id, assignee, description, assignedTo, noofcomments) {
        var issue = document.createElement("div");
        issue.classList.add("issue");
        issue.innerHTML = "            <div class = \"downvote-button\">\n" +
            "                <div>\n" +
            "                    <img src=\"img/status-" + status + "-symbol.png\">\n" +
            "                </div>\n" +
            "                <div class =\"button-downvote\">\n" +
            "                    <button class=\"btn\">\n" +
            "                        <div class=\"arrow-down\"></div>\n" +
            "                        <div class=\"downvote-numbers\">" + downvotes + "</div>\n" +
            "                    </button>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "            <div class=\"issue-body\">\n" +
            "                <div class = \"title\">\n" +
            "                    " + subject + "\n" +
            "                </div>\n" +
            "                <div class=\"assignee\">\n" +
            "                    #" + id.toString().slice(-3) + " by " + assignee +
            "                </div>\n" +
            "                <div class=\"description\" data-issue-id=" + id.toString() + ">\n" +
            "                    " + description +
            "                </div>\n" +
            "                <div class=\"assignedTo\">\n" +
            "                    " + assignedTo +
            "                </div>\n" +
            "            </div>\n" +
            "            <div class=\"comments\">\n" +
            "                <img src=\"img/comment-symbol.png\">\n" +
            "                <div class=\"number-of-comments\">" + noofcomments + "</div>\n" +
            "            </div>";
        document.getElementsByClassName("issue-main-container")[0].appendChild(issue);
    }

    issue.fetchAndPopulateView = function(limit,cursor){

        let url = "/issue/readall?cursor="+cursor+"&limit="+limit;
        let init = {
            method : "GET",
            headers : {
                'Accept' : 'application/json,text/plain,*/*'
            }
        };

        loading = true;

        let nextcurs = "o";

        return fetch(url,init).then(function(val){

            //starts loading gif
            $(window).trigger("loading");

            function x() {
                var promise = new Promise(function(resolve, reject) {
                    if(loading) {
                        window.setTimeout(function () {
                            resolve('done!');
                        }, 200);
                    }
                });

                return promise;
            }

            return x().then(function() {
                if(cursor !== undefined){
                    console.log(val); // --> 'done!'
                    return val.json();
                }

                else{
                    throw "Fatal : cursor undefined";
                }
            });

        }, function (reason) {
            console.log("fetch failed due to "+reason);
            return "{'result':'failed'}"
        }).then((valuejson) => {

            if(valuejson.result === 'failed' || !valuejson.next){
                throw "end of line reached";
            }

            console.log("next cursor: "+valuejson.next);
            nextcurs = valuejson.next;
            return valuejson;
        }).then(function(value){

            //console.log(value);
            if(value.ok && nextcurs !== "") {
                let issues = value.issues;
                if(issues.length > 0) {
                    issues.forEach(issue => {
                        let issueCode = issue.code;
                        let subject = issue.subject;
                        let assignee = issue.assignee;
                        let assignedto = issue.assignedto;
                        let tags = issue.tags; //for debugging

                        let status = (function(){
                            if(issue.status != "open" && issue.status != "closed"){
                                return "open";
                            }

                            else{
                                return issue.status;
                            }
                        })();

                        let description = issue.description;
                        console.log(this);

                        this.issue.addIssue(status, 10, subject, issueCode, assignee, description, assignedto, 5);
                        // this.addIssue(status, 10, subject, issueCode, assignee, description, assignedto, 5);
                    });


                }
            }
            //loading = false;
            return value.next;
        }).catch(function(reason){
            //loading = false;
            console.log("end of results "+reason);
            loading = false;
        }).finally(()=>{
            loading = false;
            $(window).trigger("loading");
        });

    }

    issue.readOnScroll = function(){

        var cursor = {next:""};

        function read(evt) {
            if ($(window).scrollTop() == $(document).height() - $(window).height()) {

                console.log("scrolled!");
                (function displayNextCursor(){

                    console.log(this);
                    // let caller = issue.fetchAndPopulateView.bind(issue);
                    issue.fetchAndPopulateView.call(issue,6,cursor.next).then((y) =>{

                        if(y) {
                            console.log("I got this: " + y);
                            cursor.next = y;
                        }
                    });
                })();

            }
        }

        let tempfn = read;
        $(window).on('scroll',function(evt){
            if(!loading && tempfn){
                tempfn(evt);
            }

            else if(loading){
                tempfn = undefined;
                setTimeout(()=>{
                    tempfn = read;
                },350)
            }
        });
    }

    issue.showBox= function(boxId){

        //var elem = document.getElementById(boxId);
        console.log(this);
        // elem.innerHTML = "";
        //let form = $("#create-issue-popup-form");
        $(window).on('keyup keypress', function(e) {
            var keyCode = e.keyCode || e.which;

            //prevent submit on enter key
            if (keyCode === 13) {
                console.log(keyCode);
                e.preventDefault();
                return false;
            }

            //pressing esc closes the popup
            else if(keyCode === 27){
                this.issue.hideBox(boxId);
            }
        });

        //disables scroll while loading to prevent loading more data with redundant scrolling
        $( 'body').css({
            overflow: 'hidden',
            height: '50%'
        });

        // elem.removeAttribute("hidden");
        $("#"+boxId).show();

        //dims the bg while form creation
        dimBackgroundExcept(boxId);

    }

    issue.hideBox= function(boxId){
        //var elem = document.getElementById("create-issue-popup");
        //re-enable the locked scrolling
        $('body').css({
            overflow: 'auto',
            height: 'auto'
        });
        $("#"+boxId).hide();
        //elem.setAttribute("hidden","");
        reverseDimBackgroundExcept(boxId);
    }

    issue.createIssue = function(){

        let tags = $(".create-issue-popup-tags input").val();
        let subject = $(".create-issue-popup-subject input").val();
        let description = $(".create-issue-popup-description textarea").val();
        let assignee = $(".create-issue-popup-assignee input").val();
        let assignedTo = $(".create-issue-popup-assigned-to input").val();

        let tagsList = tags.split(",");

        for(let i = 0 ; i < tagsList.length ; i++){
            tagsList[i] = tagsList[i].trim();
        }

        console.log(tags+","+subject+","+description+","+assignedTo+","+assignee);

        let issuej = {};

        issuej.tags = tagsList;
        issuej.subject = subject;
        issuej.description = description;
        issuej.assignee = assignee;
        issuej.assignedTo = assignedTo;
        issuej.toString = function(){
            return this.tags+this.subject+this.description+this.assignee+this.assignedTo;
        }

        console.log(issuej.toString());

        let init = {
            method : "POST",
            body : JSON.stringify(issuej),
            headers : {
                'Accept' : 'application/json,text/plain,*/*',
                'Content-type' : 'application/json'
            }
        };

        let url = "/issue/create";

        fetch(url,init).then(function (value) {
            return value.json();
        },function (reason) {
            console.log(reason);
            return "{'result':'failed'}";
        }).then(function (val) {

            let issueTicketResponse = val;
            console.log(issueTicketResponse);
            if(issueTicketResponse.ok) {
                console.log(issueTicketResponse);
                alert("ticket created | ticketCode: "+issueTicketResponse.code);
                this.hideBox();
            }

            else{
                alert("ticket creation failed | reason: "+issueTicketResponse.status);
            }
        });
    }

    issue.downvote = "";

//delete after refactor check
// function addIssue(status, downvotes, subject, id, assignee, description, assignedTo, noofcomments){
//     var issue = document.createElement("div");
//     issue.classList.add("issue");
//     issue.innerHTML="            <div class = \"downvote-button\">\n" +
//         "                <div>\n" +
//         "                    <img src=\"img/status-"+status+"-symbol.png\">\n" +
//         "                </div>\n" +
//         "                <div class =\"button-downvote\">\n" +
//         "                    <button class=\"btn\">\n" +
//         "                        <div class=\"arrow-down\"></div>\n" +
//         "                        <div class=\"downvote-numbers\">"+downvotes+"</div>\n" +
//         "                    </button>\n" +
//         "                </div>\n" +
//         "            </div>\n" +
//         "            <div class=\"issue-body\">\n" +
//         "                <div class = \"title\">\n" +
//         "                    "+subject+"\n" +
//         "                </div>\n" +
//         "                <div class=\"assignee\">\n" +
//         "                    #"+id.toString().slice(-3)+" by "+ assignee +
//         "                </div>\n" +
//         "                <div class=\"description\" data-issue-id="+id.toString()+">\n" +
//         "                    "+description +
//         "                </div>\n" +
//         "                <div class=\"assignedTo\">\n" +
//         "                    " +assignedTo+
//         "                </div>\n" +
//         "            </div>\n" +
//         "            <div class=\"comments\">\n" +
//         "                <img src=\"img/comment-symbol.png\">\n" +
//         "                <div class=\"number-of-comments\">"+noofcomments+"</div>\n" +
//         "            </div>";
//     document.getElementsByClassName("issue-main-container")[0].appendChild(issue);
// }

//delete after refactor check
// function createIssueButton(){
//
//     var elem = document.getElementById("create-issue-popup");
//     // elem.innerHTML = "";
//     //let form = $("#create-issue-popup-form");
//     $(window).on('keyup keypress', function(e) {
//         var keyCode = e.keyCode || e.which;
//
//         //prevent submit on enter key
//         if (keyCode === 13) {
//             console.log(keyCode);
//             e.preventDefault();
//             return false;
//         }
//
//         //pressing esc closes the popup
//         else if(keyCode === 27){
//             hideIssueButton();
//         }
//     });
//
//     //disables scroll while loading to prevent loading more data with redundant scrolling
//     $( 'body').css({
//         overflow: 'hidden',
//         height: '50%'
//     });
//
//     elem.removeAttribute("hidden");
//
//     //dims the bg while form creation
//     dimBackgroundExcept("create-issue-popup");
//
// }

//global function or util fn.
function dimBackgroundExcept(id){

    let bodyelems = document.getElementsByTagName("body")[0];
    console.log(bodyelems);

    Array.from(bodyelems.children).forEach(el => {
        el.style.opacity = el.tagName.toLowerCase() == "div" && el.getAttribute("id") != id ? 0.2 : 1;
    });
}


//delet after refactor check
// function hideIssueButton(){
//     var elem = document.getElementById("create-issue-popup");
//     //re-enable the locked scrolling
//     $('body').css({
//         overflow: 'auto',
//         height: 'auto'
//     });
//     elem.setAttribute("hidden","");
//
//
//     reverseDimBackgroundExcept("create-issue-popup");
// }

//global fn or util fn.
function reverseDimBackgroundExcept(id){
    var elem = document.getElementById(id);
    //restore background opacity
    let bodyelems = document.getElementsByTagName("body")[0];
    Array.from(bodyelems.children).forEach(el => {
        if(el.tagName.toLowerCase() == "div" && el.getAttribute("id") != id){
            el.style.opacity = 1;
        }
    });
}

//not required at all -->>>
// $(".create-issue-popup-done .create-post-btn").click(function(ev){
//     ev.preventDefault();
//
//     // createIssue();
//
//     //refactor to do
//     let tags = $(".create-issue-popup-tags input").val();
//     let subject = $(".create-issue-popup-subject input").val();
//     let description = $(".create-issue-popup-description textarea").val();
//     let assignee = $(".create-issue-popup-assignee input").val();
//     let assignedTo = $(".create-issue-popup-assigned-to input").val();
//
//     let tagsList = tags.split(",");
//
//     for(let i = 0 ; i < tagsList.length ; i++){
//         tagsList[i] = tagsList[i].trim();
//     }
//
//     console.log(tags+","+subject+","+description+","+assignedTo+","+assignee);
//
//     let issue = {};
//
//     issue.tags = tagsList;
//     issue.subject = subject;
//     issue.description = description;
//     issue.assignee = assignee;
//     issue.assignedTo = assignedTo;
//     issue.toString = function(){
//         return this.tags+this.subject+this.description+this.assignee+this.assignedTo;
//     }
//
//     console.log(issue.toString());
//
//     let init = {
//         method : "POST",
//         body : JSON.stringify(issue),
//         headers : {
//             'Accept' : 'application/json,text/plain,*/*',
//             'Content-type' : 'application/json'
//         }
//     };
//
//     let url = "/issue/create";
//
//     fetch(url,init).then(function (value) {
//         return value.json();
//     },function (reason) {
//         console.log(reason);
//         return "{'result':'failed'}";
//     }).then(function (val) {
//
//         let issueTicketResponse = val;
//         console.log(issueTicketResponse);
//         if(issueTicketResponse.ok) {
//             console.log(issueTicketResponse);
//             alert("ticket created | ticketCode: "+issueTicketResponse.code);
//             hideIssueButton();
//         }
//
//         else{
//             alert("ticket creation failed | reason: "+issueTicketResponse.status);
//         }
//     });
// });

//hits backend api /issue/create{payload}
//delete after refactor
// function createIssue(){
//
//     let tags = $(".create-issue-popup-tags input").val();
//     let subject = $(".create-issue-popup-subject input").val();
//     let description = $(".create-issue-popup-description textarea").val();
//     let assignee = $(".create-issue-popup-assignee input").val();
//     let assignedTo = $(".create-issue-popup-assigned-to input").val();
//
//     let tagsList = tags.split(",");
//
//     for(let i = 0 ; i < tagsList.length ; i++){
//         tagsList[i] = tagsList[i].trim();
//     }
//
//     console.log(tags+","+subject+","+description+","+assignedTo+","+assignee);
//
//     let issue = {};
//
//     issue.tags = tagsList;
//     issue.subject = subject;
//     issue.description = description;
//     issue.assignee = assignee;
//     issue.assignedTo = assignedTo;
//     issue.toString = function(){
//         return this.tags+this.subject+this.description+this.assignee+this.assignedTo;
//     }
//
//     console.log(issue.toString());
//
//     let init = {
//         method : "POST",
//         body : JSON.stringify(issue),
//         headers : {
//             'Accept' : 'application/json,text/plain,*/*',
//             'Content-type' : 'application/json'
//         }
//     };
//
//     let url = "/issue/create";
//
//     fetch(url,init).then(function (value) {
//         return value.json();
//     },function (reason) {
//         console.log(reason);
//         return "{'result':'failed'}";
//     }).then(function (val) {
//
//         let issueTicketResponse = val;
//         console.log(issueTicketResponse);
//         if(issueTicketResponse.ok) {
//             console.log(issueTicketResponse);
//             alert("ticket created | ticketCode: "+issueTicketResponse.code);
//             hideIssueButton();
//         }
//
//         else{
//             alert("ticket creation failed | reason: "+issueTicketResponse.status);
//         }
//     });
// }

//add downvotes
//delete after refactor
// $(".button-downvote").click(function(evt){
//     evt.preventDefault();
//     console.log($(this));
//     let eletext = $(this).find(".downvote-numbers");
//     console.log(eletext);
//     eletext.html(+(eletext.html())+1);
// });


let tags = ( function() {
    var availableTags = [
        "ActionScript",
        "AppleScript",
        "Asp",
        "BASIC",
        "C",
        "C++",
        "Clojure",
        "COBOL",
        "ColdFusion",
        "Erlang",
        "Fortran",
        "Groovy",
        "Haskell",
        "Java",
        "JavaScript",
        "Lisp",
        "Perl",
        "PHP",
        "Python",
        "Ruby",
        "Scala",
        "Scheme"
    ];

    addTags : function addTags(element){
        availableTags.push(element);
    }

    return {
        addTags : addTags,
        tags:availableTags
    }
});

//select elements via up/down/enter
$(".create-issue-popup-tags input").on("keyup",{index : 0, prev:""},function(ev){

    console.log("value change "+ev.keyCode);
    console.log($(this).val());

    let currentVal = $(this).val();
    let ulElement = $(".create-issue-popup-listing ul");
    $(ulElement).children().remove();
    autoCompleteHelper(tags().tags,currentVal).forEach((el) => {
        let liElement = document.createElement("li");
        liElement.innerHTML = el;
        ulElement.append(liElement);
    });


    function autoCompleteHelper(array, element){
        let resarr = [];
        array.forEach((ele) => {

            function generateSubstrings(text){
                let subarr = [];
                for(let n = 1 ; n <= text.length ; n++){
                    subarr.push(text.substring(0,n));
                }
                return subarr;
            }

            if(generateSubstrings(ele).includes(element)){
                resarr.push(ele);
            }
        })

        return resarr;
    }


    switch (ev.keyCode){

        case 38:
            var listel = $(".create-issue-popup-listing li");
            console.log("up arrow pressed on "+$(ev.target).html());
            if(ev.data.index >= 0){
                ev.data.index--;
                listel.eq(ev.data.index).addClass("create-issue-popup-listing-active");
                listel.eq((ev.data.index)+1).removeClass("create-issue-popup-listing-active");
            }
            else{
                ev.data.index = 0;
            }
            break;

        case 40:
            console.log("down arrow pressed on "+$(ev.target).html());
            var listel = $(".create-issue-popup-listing li");
            if(ev.data.index < listel.length){
                ev.data.index++;
                listel.eq(ev.data.index).addClass("create-issue-popup-listing-active");
                listel.eq((ev.data.index)-1).removeClass("create-issue-popup-listing-active");
            }

            else{
                ev.data.index = listel.length-1;
            }
            break;

        case 13:
            console.log("enter pressed : ");
            var listel = $(".create-issue-popup-listing li");
            $("#autoC").val(listel.eq(ev.data.index).html());
            $(ulElement).children().remove();
            break;
    }
});

//populate home page - below is a util fn for readonscroll()
//remove after re-factoring
// function readIssues(limit,cursor){
//
//     let url = "/issue/readall?cursor="+cursor+"&limit="+limit;
//     let init = {
//         method : "GET",
//         headers : {
//             'Accept' : 'application/json,text/plain,*/*'
//         }
//     };
//
//     loading = true;
//
//     let nextcurs = "o";
//
//     return fetch(url,init).then(function(val){
//         $(window).trigger("loading");
//
//         function x() {
//             var promise = new Promise(function(resolve, reject) {
//                 window.setTimeout(function() {
//                     resolve('done!');
//                 },500);
//             });
//             return promise;
//         }
//
//         return x().then(function() {
//             if(cursor !== undefined){
//                 console.log(val); // --> 'done!'
//                 return val.json();
//             }
//
//             else{
//                 throw "Fatal : cursor undefined";
//             }
//         });
//
//     }, function (reason) {
//         console.log("fetch failed due to "+reason);
//         return "{'result':'failed'}"
//     }).then((valuejson) => {
//
//         if(valuejson.result === 'failed' || !valuejson.next){
//             throw "end of line reached";
//         }
//
//         console.log("next cursor: "+valuejson.next);
//         nextcurs = valuejson.next;
//         return valuejson;
//     }).then(function(value){
//
//         //console.log(value);
//         if(value.ok && nextcurs !== "") {
//             let issues = value.issues;
//             if(issues.length > 0) {
//                 issues.forEach(issue => {
//                     let issueCode = issue.code;
//                     let subject = issue.subject;
//                     let assignee = issue.assignee;
//                     let assignedto = issue.assignedto;
//                     let tags = issue.tags; //for debugging
//
//                     let status = (function(){
//                         if(issue.status != "open" && issue.status != "closed"){
//                             return "open";
//                         }
//
//                         else{
//                             return issue.status;
//                         }
//                     })();
//
//                     let description = issue.description;
//
//                     addIssue(status, 10, subject, issueCode, assignee, description, assignedto, 5);
//                 });
//
//
//             }
//         }
//         //loading = false;
//         return value.next;
//     }).catch(function(reason){
//         //loading = false;
//         console.log("end of results "+reason);
//         loading = false;
//     }).finally(()=>{
//         loading = false;
//         $(window).trigger("loading");
//     });
//
// }

//refactor to do
var loading = false;


//global function
function displayLoading(){
    if(!loading){
        return;
    }
    $("#loading-icon").css({'top': "0px" , 'left': $("#sidebar").outerWidth() + ($(".issue-main-container").outerWidth())/2+"px"});
    $("#loading-icon").show();
    dimBackgroundExcept("loading-icon");
}


//global function
function hideLoading(){
    if(loading){
        return;
    }
    $("#loading-icon").hide();
    reverseDimBackgroundExcept("loading-icon");
}

//remove after re-factr
// function readOnscroll(){
//
//     var cursor = {next:""};
//
//     $(window).on('scroll',function(evt) {
//         if ($(window).scrollTop() == $(document).height() - $(window).height() ) {
//
//             console.log("scrolled!");
//
//             (function displayNextCursor(){
//
//                 readIssues(6,cursor.next).then((y) =>{
//                     if(y) {
//                         console.log("I got this: " + y);
//                         cursor.next = y;
//                     }
//                 });
//
//                 // return x;
//             })();
//         }
//     });
// };

//global func.
$(window).on("loading",function (event) {

    console.log("loading triggered...");
    event.stopPropagation();

    if(loading) {
        //disables scroll while loading to prevent loading more with redundant scrolling
        // $( 'body').css({
        //     overflow: 'hidden',
        //     height: '10%'
        // });
        console.log("already loading.. scroll disabled"+$('body').scrollTop());
        displayLoading();
    }
    else {
        //enables the scroll back
        // $('body').css({
        //     overflow: 'auto',
        //     height: 'auto'
        // });
        console.log("loading complete")
        hideLoading();
    }
});
// $(window).trigger("scroll");

// $(".issue-details-frame iframe").css({
//     height : $(window).height()-$("#header").height()-30 + 'px'
// });

//global fn.
(function(){
    console.log(this);
    // var context = issue.readOnScroll;
    // var bound = context.bind(issue);
    // bound();

    issue.readOnScroll.call(this.issue,"");
    $(window).trigger("scroll");
    //issue.downvote.call(this.issue,"");

    //initialising all the event listeners
    for(let event of events){
        console.log(event);
        event();
    }

})();
//readOnscroll();
// $(window).trigger("scroll");


function getIssue(issueId){

    let url = "/issue/readbyid?id="+issueId;
    let init = {
        method : "GET",
        headers : {
            'Accept' : 'application/json,text/plain,*/*',
            'Content-type' : 'application/json'
        }
    };

    return fetch(url,init).then(function (value) {
        //console.log(value.json());
        return value.json();
    },function (reason) {
        console.log(reason);
        return "{'result':'failed'}";
    }).then(function (val) {

        if(val.issue.code) {
            // console.log("inside promise: "+viewdetail+val.issue);
            //alert("comment added | ticketCode: "+viewdetail.code);
            return val.issue;
        }
        else{
            alert("ticket creation failed | reason: "+viewdetail.ok);
            return "no issue found with id "+issueId;
        }
    });

}

// $(window).click(function(evt){
//
//     $(".issue .description").click(function(evt){
//         console.log("issue description is clicked");
//         let issueID = $(this).data("issue-id");
//         //console.log("issueid: "+issueID);
//         let issueContent = "none";
//         evt.stopPropagation();
//         issueContent = getIssue(issueID).then((res) => {
//             return res;
//         });
//
//         console.log(issueContent);
//     });
// });





function addComment(issueID, parentID, message, author){

    let comment = {};
    comment.issueid = issueID;
    comment.parentid = parentID;
    comment.message = message;
    comment.author = author;

    let init = {
        method : "POST",
        body : JSON.stringify(comment),
        headers : {
            'Accept' : 'application/json,text/plain,*/*',
            'Content-type' : 'application/json'
        }
    };

    let url = "/comments/add";

    fetch(url,init).then(function (value) {
        return value.json();
    },function (reason) {
        console.log(reason);
        return "{'result':'failed'}";
    }).then(function (val) {

        let commentResponse = val;
        console.log(commentResponse);
        if(commentResponse.ok) {
            console.log(commentResponse);
            alert("comment added | ticketCode: "+commentResponse.id);
            hideIssueButton();
        }

        else{
            alert("ticket creation failed | reason: "+commentResponse.ok);
        }
    });
}