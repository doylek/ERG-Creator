var thisSegmentNumber = 2;


function basicSegmentHtml(thisSegmentNumber) {
    return ('<div id="segment' + thisSegmentNumber + '" class="segment">' +
        '<div class="form-group">' +
        '    <label for="groupName' + thisSegmentNumber + '">Segment ' + thisSegmentNumber + '</label>' +
        '    <div class="input-group">' +
        '        <input type="text" class="form-control groupName" id="groupName' + thisSegmentNumber + '" value="Segment ' + thisSegmentNumber + '">' +
        '        <div class="input-group-append">' +
        '            <button class="btn btn-outline-secondary button-grouper grouper' + thisSegmentNumber + '" type="button" onclick="groupWithNext(' + thisSegmentNumber + ')">Group with next segment</button>' +
        '        </div>' +
        '    </div>' +
        '</div>' +
        '<div class="form-group">' +
        '    <label for="segTime' + thisSegmentNumber + '">Segment Time</label>' +
        '    <div class="col input-group">' +
        '        <input type="number" min="0" class="form-control segTime" id="segTime' + thisSegmentNumber + '" value="5">' +
        '    </div>' +
        '    <label for="segEff' + thisSegmentNumber + '">Segment Effort</label>' +
        '    <div class="col input-group">' +
        '        <input type="number" min="0" class="form-control segEff" id="segEff' + thisSegmentNumber + '" value="70">' +
        '        <div class="input-group-append"> <span class="input-group-text typeToggle">%</span></div>' +
        '    </div>' +
        '</div>' +
        '       <div class="text-right"> <button type="button" onclick="deleteSegment(' + thisSegmentNumber + ')" class="btn btn-danger btn-sm">Delete Segment ' + thisSegmentNumber + '</button></div>' +
        '</div>;');
}

function addSegment() {
    $(basicSegmentHtml(thisSegmentNumber)).insertBefore("#addSegButton");

    return (thisSegmentNumber + 1);
}

function groupWithNext(segmentnumber) {
    
    var presentSegments = [];
    $("#setupForm").find(".segment").each(function(){ presentSegments.push( Number(this.id.slice(-1)) ); });
    
    var nextNeighbor = presentSegments[getNextHighestIndex(presentSegments, segmentnumber)];
    
    var segThis = $('#segment' + segmentnumber),
        nameThis = $('#groupName' + segmentnumber),
        segNext = $('#segment' + (nextNeighbor)),
        nameNext = $('#groupName' + (nextNeighbor)),
        master = $('#segment' + segmentnumber).attr('class').split(' ').filter(s => s.includes("master"))[0],
        masterNext = $('#segment' + (nextNeighbor)).attr('class').split(' ').filter(s => s.includes("master"))[0];

    if (segNext.length === 0) {
        // segment has not yet been made, skipping all assignments
        console.warn('Warning: Next segment does not exist.');
    } else {
        if (segNext.hasClass('groupparent')) {
            
            segThis.addClass('group groupparent groupmaster' + segmentnumber);
            segNext.removeClass('groupparent');
            segNext.addClass('groupmid');
            var nextMasterGroup = $('.' + masterNext);
            nextMasterGroup.removeClass(masterNext);
            nextMasterGroup.addClass('groupmaster' + segmentnumber);
            
            nextMasterGroup.find('.groupName').each(function(index) {
              if (index > 0) {
                $(this).val(nameThis.val());
              }
            });
            
        } else if (segThis.hasClass('groupparent')) {
          
        } else if (segThis.hasClass('group')) {
            segThis.removeClass('groupend');
            segThis.addClass('groupmid');
            segNext.addClass('group groupend ' + master);
        } else {
            segThis.addClass('group groupparent groupmaster' + segmentnumber);
            segNext.addClass('group groupend groupmaster' + segmentnumber);
        }

        nameNext.prop("readonly", true);
        nameNext.val(nameThis.val());
        
        segThis.find(".button-grouper").attr("onclick","unGroup(" + segmentnumber + ")");
        segThis.find(".button-grouper").html("Break group");

    }
}

function unGroup(segmentnumber) {
  var segThis = $('#segment' + segmentnumber);
  var master = $('#segment' + segmentnumber).attr('class').split(' ').filter(s => s.includes("master"))[0];
  
  var group = $('.' + master);
  
  group.find('.groupName').prop('readonly', false);
  
  group.find('.groupName').each(function(index) {
    if (index > 0) {
      $(this).val($(this).attr('value'));
    }
  });
  
  group.removeClass('group');
  group.removeClass('groupparent');
  group.removeClass('groupend');
  group.removeClass('groupmid');
  group.removeClass(master);
  
  group.find('.button-grouper').each(function(index) {
    num = $(this).attr('class').split(' ').filter(s => s.includes("grouper"))[1];
    num = num[num.length -1];
    $(this).attr("onclick","groupWithNext(" + num + ")");
    $(this).html("Group with next segment");
  });
  
}

function deleteSegment(segmentnumber) {
  unGroup(segmentnumber);
  $('#segment'+segmentnumber).remove();
}

function proceedToReps() {
  
  $('#setupForm').hide();
  $('#repsForm').show();
  
  var names = $(".groupName").map(function(){ return $(this).val(); });
  names = $.unique(names);
  
  $('#groupsArea').html('');
  
  var i;
  for (i = 0; i < names.length; i++) {
    var thisName = names[i] === '' ? 'Group ' + (i+1) : names[i];
    
    $('#groupsArea').append(
    '<div class="form-group row">' +
        '<label for="' + (i+1) + '" class="col-sm-8 col-form-label" id="groupRepLabel' + (i+1) + '">' + thisName + '</label>' +
        '<div class="col-sm-4">' +
            '<input type="number" min="1" class="form-control" id="groupRep' + (i+1) + '" value="1">' +
        '</div>' +
    '</div>'
  );
  } 
  
  
  
}

function backButton() {
  $('#repsForm').hide();
  $('#outputArea').hide();
  $('#downloadButton').remove();
  $('#setupForm').show();
}


function doneButton() {
  
  var segments = $('.segment');
  
  var title = $('#workoutName').val() === '' ? 'workout' : $('#workoutName').val();
  title = title.replace(/['"]+/g, '');
  var filename = title.replace(/ /g, '_') + '.erg';  
  var measureChoice = $('input:checked','#measureChoice').val() == 'percent' ? 'PERCENT' : 'WATTS';
  var writeLaps = $('#lapCheck').prop('checked');
  
  var outputText = '[COURSE HEADER] \n' +
'VERSION = 2.0\n' +
'UNITS = ENGLISH\n' +
'DESCRIPTION = '+ title + '\n' +
'FILE NAME = ' + filename + '\n' +
'MINUTES ' + measureChoice + '\n' +
'[END COURSE HEADER]\n' +
'[COURSE DATA]\n' ;
  
  var time = 0;
  
  var i, j, h;
  var names = $(".groupName").map(function(){ return $(this).val(); });
  var uniquenames = $.unique($(".groupName").map(function(){ return $(this).val(); }));
  
  var times = $(".segTime").map(function(){ return $(this).val(); });
  var effs = $(".segEff").map(function(){ return $(this).val(); });
  
  var thisArray = [];
  
  var ntimes = 1;
  var thisText = '';
  
  $('#downloadButton').remove();
  
  for (i = 0; i < uniquenames.length; i++) {
  
    thisArray = searchArray(uniquenames[i], names);
    
    ntimes = $('#groupsArea').children().children().children()[i].value;
    
    for (h = 0; h < ntimes; h++) {
      
      for (j = 0; j < thisArray.length; j++) {
        
        thisText = time + '    ' + effs[thisArray[j]] + '\n';
        time = Number( times[thisArray[j]] ) + time;
        thisText = thisText + time + '    ' + effs[thisArray[j]] + '\n';
        
        console.log(' ' + j + thisArray.length + i + uniquenames.length + h + ntimes);
        // this complicated pile checks if all interators are at their maximum
        Final = ((j+1)==thisArray.length)&&((i+1)==uniquenames.length)&&((h+1)==ntimes);
        
        // do we write laps and is this the final rep in the group?
        if (writeLaps && ((j+1)==thisArray.length)) {
          // is this the final record to be written?
          if (!Final) {
            thisText = thisText + time + '    LAP \n';
          }
        }
      
        outputText = outputText + thisText;  
      }
    }
  }
  
  outputText = outputText + '[END COURSE DATA]';
  $('#output').val(outputText);
  
  
  var textFileAsBlob = new Blob([outputText], {type:'text/plain'});
  var downloadLink = document.createElement("a");
  downloadLink.setAttribute('class', 'btn btn-default btn-light');
  downloadLink.setAttribute('id', 'downloadButton');
  downloadLink.setAttribute('role', 'button');
  downloadLink.download = filename;
  downloadLink.innerHTML = "Save to File";

  downloadLink.href = window.URL.createObjectURL(textFileAsBlob); 
  
  $('#outputArea').append(downloadLink);
  $('#outputArea').show();
}

function saveToFile() {
  var title = $('#workoutName').val() === '' ? 'workout' : $('#workoutName').val();
  title = title.replace(/['"]+/g, '');
  var filename = title.replace(/ /g, '_') + '.erg'; 
  
  
}

function changeMeasure(changeTo) {
  console.log(changeTo);
  $('.typeToggle').text(changeTo);
}

function searchArray(keyword, array) {
  var i = 0;
  var matches = [];
  for (i = 0; i < array.length; i++) {
    if (array[i] == keyword) {
      matches.push(i);
    }
  }
  return(matches);
}

function getNextHighestIndex(arr, value) {
    var i = arr.length;
    while (arr[--i] > value);
    return ++i; 
}
