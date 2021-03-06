// Host Autocomplete Magic
var pageName = basename($(location).attr('pathname'));

function themeReady() {
	var hostTimer = false;
	var clickTimeout = false;
	var hostOpen = false;

	// Add nice search filter to filters
	$('input[id="filter"]').after("<i class='fa fa-search filter'/>").attr('autocomplete', 'off').attr('placeholder', 'Enter a search term').parent('td').css('white-space', 'nowrap');

	$('input#filter').addClass('ui-state-default ui-corner-all');

	$('input[type="text"], input[type="password"], input[type="checkbox"], textarea').not('image').addClass('ui-state-default ui-corner-all');

	$.ui.selectmenu.prototype._renderItem = function(ui, item) {
		if (item.element.closest('select').hasClass('colordropdown')) {
			if (item.label != 'None') {
				var li = $("<li>").css( "background-color", '#'+item.label );
			}else{
				var li = $("<li>").css( "background-color", '' );
			}
		}else if (item.element.closest('select').hasClass('iconselect')) {
			var li = $('<li>', { text: item.label });

			if ( item.disabled ) {
				li.addClass('ui-state-disabled');
			}

			$('<span>', {
				style: item.element.attr('data-style'),
				'class': 'ui-icon ' + item.element.attr('data-class')
			}).appendTo(li);

			return li.appendTo(ui);
		}else{
			var li = $("<li>");
		}

		if (item.disabled) {
			li.addClass("ui-state-disabled");
		}

		this._setText(li, item.label);

		return li.appendTo(ui);
	}

	$('.checkboxgroup').children('br').remove();
	$('.checkboxgroup').buttonset();

	$('select').each(function() {
		if ($(this).prop('multiple') != true) {
			$(this).selectmenu({
				change: function(event, ui) {
					$(this).val(ui.item.value).change();
				},
				position: {
					my: "left top",
					at: "left bottom",
					collision: "flip"
				},
			}).each(function() {
				id = $(this).attr('id');
				minWidth = 0;
				$('#'+id+' > option').each(function() {
					width=$(this).textWidth();
					if (width > minWidth) {
						minWidth = width;
					}
				});

				minWidth+=60;
				$('#'+id+'-button').css('min-width', minWidth+'px').css('max-width', '400px').css('width','');
				$('#'+id+'-menu').css('max-height', '250px');
			});
		}else{
			$(this).addClass('ui-state-default ui-corner-all');
		}
	});

	$('#host').unbind().autocomplete({
		source: pageName+'?action=ajax_hosts',
		autoFocus: true,
		minLength: 0,
		select: function(event,ui) {
			$('#host_id').val(ui.item.id);
			applyFilter();
		}
	}).addClass('ui-selectmenu-text').css('border', 'none').css('background-color', 'transparent');

	$('#host_click').css('z-index', '4');
	$('#host_wrapper').unbind().dblclick(function() {
		hostOpen = false;
		clearTimeout(hostTimer);
		clearTimeout(clickTimeout);
		$('#host').autocomplete('close');
	}).click(function() {
		if (hostOpen) {
			$('#host').autocomplete('close');
			clearTimeout(hostTimer);
			hostOpen = false;
		}else{
			clickTimeout = setTimeout(function() {
				$('#host').autocomplete('search', '');
				clearTimeout(hostTimer);
				hostOpen = true;
			}, 200);
		}
	}).on('mouseenter', function() {
		$(this).addClass('ui-state-hover');
		$('input#host').addClass('ui-state-hover');
	}).on('mouseleave', function() {
		hostTimer = setTimeout(function() { $('#host').autocomplete('close'); }, 800);
	});

	var hostPrefix = '';
	$('#host').autocomplete('widget').each(function() {
		hostPrefix=$(this).attr('id');
	});

	if (hostPrefix != '') {
		$('ul[id="'+hostPrefix+'"]').on('mouseover', function() {
			clearTimeout(hostTimer);
		}).on('mouseout', function() {
			hostTimer = setTimeout(function() { $('#host').autocomplete('close'); }, 800);
			$(this).removeClass('ui-state-hover');
			$('input#host').removeClass('ui-state-hover');
		});
	}
}
