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
            console.log(ex_started);
        }
    });
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
            var totalVal = [];
            var holder = [];
            $('#repsCont input').each(function(index){
                totalVal.push({
                    name: $(this).prop('name'),
                    value: $(this).val()
            });
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
                    }
                });
                }
            else{
                console.log("enter everything");
                }
            }  
        }
});

