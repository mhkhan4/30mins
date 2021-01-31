$(document).ready(function(){
    var margin = ($(window).width() / 2) - ($("#mainCard").width() / 2);
    $("#mainCard").css("margin-left",margin);

    var ex_started;
    $.ajax({
        url: '/session_ex',
        contentType: 'application/json',
        success:function(response){
            if(response === 'false'){
                ex_started = 'false';
            }
            else{
                ex_started = response;
           }
        },
        complete : function(){
         $( "#mainCard fieldset input" ).checkboxradio();
            if(ex_started === 'false'){
                $.ajax({
                    url: '/dbExercises',
                    contentType: 'application/json',
                    success: function(response) {
                        response.exercises.forEach(function(element){
                            $("#exAddBtn").before(`<label for="${element.ex_type}">${element.ex_type}</label><input type="checkbox" name="${element.ex_type}" id="${element.ex_type}">`);
                        });
                    },
                    complete : function(){
                        $( "#mainCard fieldset input" ).checkboxradio();
                    }
            });
            
            
            $("#exAddBtn").click(function(){
                $(this).prop("disabled", true);
                $("#mainCard .card-header").prepend("<div class=\"form-group label-floating\" ><label class=\"control-label\" style=\"font-size:120%;color:black\">add exercise</label><input style=\"font-size:150%;\" name=\"new_ex\"  type=\"text\" class=\"form-control\"><a id=\"saveExBtn\" class=\"btn btn-primary btn-round\">Add</a></div>");
                
                $("#saveExBtn").click(function(){
                    var newEx = $('input[name ="new_ex"]').val();
                    $.ajax({
                        url: '/new_ex',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ name: newEx }),
                        success: function(response){
                            console.log(response);
                            newEx('');
                        }
                    });
                });
            });
            
            $("#startBtn").click(function(){
                var selectedEx = [];
                $(this).prop("disabled", true);
                $("#mainCard fieldset input,#mainCard fieldset button").prop("disabled", true);
                $("#mainCard fieldset input:checked").each(function(){
                    selectedEx.push($(this).attr('name'));
                });
                if(selectedEx.length > 0){
                    $("#repsContModal").modal("show");
                    for(var i = 0; i < selectedEx.length;i++){
                        $("#repsCont").append(`<div class="col-md-5"><input class="form-control reps mr-sm-2" type="number" placeholder="${selectedEx[i]}" name="${selectedEx[i]}" required></div>`);
                    }
                    $("#repsCont").append(`<div class='w3-container'><label class="w3-text-indigo"><b>total sets</b></label><input class="w3-input w3-border" type="number" placeholder="Enter" name='sets_count'></div>`);
            
                }
                else{
                    alert('put the exercise you want to do');
                }
               
                document.body.onkeyup = function(e){
                    if(e.keyCode === 13){
                        var totalVal = {};
                        var holder = [];
                        $('#repsCont input').each(function(index){
                            totalVal[$(this).prop('name')] = $(this).val();
                            holder.push($(this).val());
                        });
                        if(holder.includes("") === false){
                            $.ajax({
                                url: '/reps_ex',
                                method: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify({ name: totalVal }),
                                success: function(response){
                                    console.log(response);
                                },
                                complete : function(){
                                    location.reload();
                                }
                            });
                            }
                        else{
                            alert("enter everything");
                            }
                        }  
                    }
            });
            
            
            }
        else{
            $("#timer").show();
            let minutes = 30;
            var len = ex_started.length - 1;
            let ttlSets = parseInt(ex_started.sets_count);
    
            let ttlSec = minutes * 60;
            let progPerSet = minutes / ttlSets; // 30/10 = 3
            progPerSet = progPerSet / minutes * 100;  // 3/1000
            let initialProg = 0;
            let setsDone = 0;
            document.body.onkeyup = function(e){
                if(e.keyCode === 32){
                    if(initialProg >= 100){
                    // do the code for after the session is succesfully comleted before the time running out
                    }else{
                        $("li.contextHeading").each(function(){
                            $(this).children("span").text(parseInt($(this).children("span").text()) - parseInt($(this).attr("id")));
                        })
                        initialProg += progPerSet;
                        $("#currentExBar").css("width", initialProg + "%");
                        // check not overbound 100 first
                        setsDone++;   
                        }
                       
                    }   
                }
            let seconds_left = minutes * 60;
            let timeString,minutesLeft,parsedSeconds,crntPace;
            function crnt_pace(ttlSec,secLeft,ttlSets,setsDone){
                let secPassed = ttlSec - secLeft;
                let setsPerSecRatio = ttlSec / ttlSets;
                let timeCovered = setsDone * setsPerSecRatio;
                let retStruct = {
                    "percent" : ((timeCovered - secPassed) / ttlSec * 100).toFixed(2),
                    "sec" : (timeCovered - secPassed)
                }
                return retStruct;
            }
            var interval = setInterval(function(){
                timeStr = "";
                --seconds_left;
                if(seconds_left % 60 === 0 && seconds_left / 60 !== 0){
                    minutesLeft = parseInt(seconds_left / 60 - 1);
                    parsedSeconds = 60;
                }else{
                    minutesLeft = parseInt(seconds_left / 60);
                    parsedSeconds = seconds_left % 60;
                }
                //console.log(minutesLeft + " : " + parsedSeconds);
                let timerWidth = Math.round(100 - seconds_left / (60 * minutes) * 100);
                if(timerWidth < 12){
                    timerWidth = 12;
                }
                $("#timeBar").css("width", timerWidth + "%").html(parseInt(((minutes * 60) - seconds_left) / 60)  + "m : " + ((minutes * 60) - seconds_left) % 60 + "s");
                crntPace = crnt_pace(ttlSec, seconds_left,ttlSets,setsDone);
                $("#currentExBar").html(`<em>${crntPace.percent}%</em>`);
                if(crntPace.percent < 1){
                    $("#timeBar").removeClass("w3-lime").addClass("w3-red");
                }else{
                    $("#timeBar").removeClass("w3-red").addClass("w3-lime");
                }
                if (seconds_left <= 0 || initialProg >= 100){
                    clearInterval(interval);
                    var session_done = [ttlSets, setsDone];
                    $.ajax({
                        url : '/session_completed',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ name: session_done }),
                        success : function(response){
                            console.log(response);
                        }
                        });
                    }
                }, 1000);
                console.log(ex_started);
            
                $("#startBtn").prop("disabled", true);
                var exInfoObj = {
                    'reps' : {},
                    'sets' : undefined
                };
                $("#mainCard .card-header").html('<ul id="sortable"></ul>');
        
                for(var index in ex_started){
                    if(index === 'sets_count'){
                        return;
                    }
                  
                    exInfoObj.reps[$(this).attr("id")] = $( this ).text();
                    $("#sortable").append(`<li id='${$( this ).text()}' class="contextHeading ui-state-default"> ${$(this).attr("id")} <br> <span class='w3-indigo badge badge-light'> ${(parseInt(ex_started[index]) * ttlSets)} </span></li>`);
                }
                /*
                $("#mainCard fieldset input:not(:checked)").prev().remove();
                $("#mainCard fieldset input:not(:checked), #mainCard fieldset button,#mainCard fieldset legend").remove();*/
                $( function() {
                    $( "#sortable" ).sortable();
                    $( "#sortable" ).disableSelection();
                });
                exInfoObj.sets = ttlSets.toString();
        }

        }
    });
});
    