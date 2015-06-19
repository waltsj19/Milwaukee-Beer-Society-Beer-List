jQuery.widget("ui.autocomplete", jQuery.ui.autocomplete, {
    _renderItem: function (ul, item) {
        if (item.beer.beer_label.indexOf("badge-beer-default.png") > -1)
            item.beer.beer_label = bl_settings.beerDefaultImage;
        var li = jQuery("<li class='ac_item'>");
        var p_info = jQuery("<p class='info'>");
        var p_label = jQuery("<p class='label'>");
        var img = jQuery("<img src='" + item.beer.beer_label + "'>");
        var span_beer = jQuery("<span class='ac_beer'>").text(item.beer.beer_name);
        var span_brewery = jQuery("<span class='ac_brewery'>").text(item.brewery.brewery_name);
        p_label.append(img);
        p_info.append(span_beer);
        p_info.append(span_brewery);
        li.append(p_label);
        li.append(p_info);
        li.appendTo(ul);
        return li;
    },
});
(function ($) {
    //var output = $('#postdivrich textarea.wp-editor-area');
    var postdivrich = $('#postdivrich');
    var bl_button = postdivrich
		.find('div.wp-editor-tabs button:first')
		.clone()
		.attr("id", "content-bl")
		.text("Beer List")
		.removeClass("switch-tmce")
		.addClass("switch-bl");
    var tabs = $('div.wp-editor-tabs');
    tabs.prepend(bl_button);

    var inputs = '<div id="beerlist" class="postbox" style="display:none">' +
                '<h3>Beer List</h3>' +
                '<input id="bl_search" type="text" class="item autocomplete" placeholder="Enter Beers"></input>' +
                '<p id="bl_search_instructions">' +
                '<span>Add beers using the search box above</span>' +
				'</p>' +
				'<p id="bl_headers" style="display:none">' + 
				'<span class="bName">Beer Name</span>' + 
				'<span class="rName">Brewery</span>' + 
				'<span class="rLocation">Location</span>' + 
				'<span class="bStyle">Beer Style</span>' + 
				'<span class="bABV">ABV</span>' + 
				'<span class="bIBU">IBU</span>' + 
				'</p>';

    inputs += '</div>';
    $('div#postdivrich').after(inputs);
    tabs.find('button:not(#content-bl)').click(function (event) {
        $('#wp-content-editor-container,#post-status-info').show();
        $('#wp-content-wrap').removeClass('bl-active');
        $('#beerlist').hide();
    })
    bl_button.click(function (event) {
        $('#wp-content-editor-container,#post-status-info').hide();
        $('#wp-content-wrap').removeClass('tmce-active html-active').addClass('bl-active');
        updateItemsFromHtml($('#wp-content-editor-container textarea').val());
        $('#beerlist').show();
    });

    var apikey = bl_settings.options;
    var ut_autocomplete = function (request, response) {
        $.ajax({
            url: 'https://api.untappd.com/v4/search/beer?q=' + request.term + '&limit=' + apikey.bl_numberofbeers + '&client_id=' + apikey.ut_clientid + '&client_secret=' + apikey.ut_clientsecret,
            type: 'GET',
            async: true,
            contentType: 'application/json',
            success: function (result) {
                var filtered = $.each(result.response.beers.items, function (index, brew) {
                    brew.label = brew.brewery.brewery_name + ' ' + brew.beer.beer_name;
                    brew.value = brew.beer.beer_name;
                });
                response(filtered);
            }
        });
    }
    $('input.autocomplete').autocomplete({
        source: ut_autocomplete,
        autoFocus: true,
        delay: 300,
        minLength: 3,
        select: function (evt, ui) {
			createInput(ui.item);
			//$('#bl_search').focus();
			$('#bl_search').val('');
            return false;
        }
    }).keydown(function(e){
		var keyCode = e.keyCode || e.which; 
		//if it's a tab, don't tab...keep focus in search box
		if (keyCode == 9) { 
			return false;
		}
	});
	
	function createInput(item){
		var bid = item.beer.bid;
		var bName = item.beer.beer_name;
		var bLabel = item.beer.beer_label;
		if (bLabel.indexOf("badge-beer-default.png") > -1)
			bLabel = bl_settings.beerDefaultImage;
		if(bLabel.indexOf('url') !== 0)
			bLabel = 'url(' + bLabel + ')';
		var bStyle = item.beer.beer_style;
		var bABV = item.beer.beer_abv;
		if (bABV === 0)
			bABV = "";
		else if (bABV.toString().indexOf('.') < 0) {
			bABV = bABV + '.0';
		}
		var bIBU = item.beer.beer_ibu;
		if (bIBU === 0)
			bIBU = "";
		var rName = item.brewery.brewery_name;
		var rLocation;
		if(item.brewery.brewer_city_state){
			rLocation = item.brewery.brewer_city_state;
		}
		else{
			var rCity = item.brewery.location.brewery_city;
			var rRegion = item.brewery.location.brewery_state;
			if (rRegion === "")
				rRegion = item.brewery.country_name;
			rLocation = rCity + ", " + rRegion;
		}
		var $last_child = $('#beerlist p.item_inputs:last-child');
		var pos = 0;
		if($last_child.length > 0)
			pos = $last_child.attr('data-pos') * 1 + 1;
		var p_inputs = $('<p id="item_' + pos + '" class="item_inputs" data-pos=' + pos + ' data-bid=' + bid + '>');
		var input_bName = $('<input>').attr("id", "input_bName_" + pos).addClass("bName").val(bName);
		var input_rName = $('<input>').attr("id", "input_rName_" + pos).addClass("rName").val(rName);
		var input_rLocation = $('<input>').attr("id", "input_rLocation_" + pos).addClass("rLocation").val(rLocation);
		var input_bStyle = $('<input>').attr("id", "input_bStyle_" + pos).addClass("bStyle").val(bStyle);
		var input_bABV = $('<input>').attr("id", "input_bABV_" + pos).addClass("bABV").val(bABV);
		var input_bIBU = $('<input>').attr("id", "input_bIBU_" + pos).addClass("bIBU").val(bIBU);
		var input_bLabel = $('<input>').attr("id", "input_bLabel_" + pos).addClass("bLabel").val(bLabel);
		var input_bCode = $('<input>').attr("id", "input_bCode_" + pos).addClass("bCode");
		input_bName.appendTo(p_inputs);
		input_rName.appendTo(p_inputs);
		input_rLocation.appendTo(p_inputs);
		input_bStyle.appendTo(p_inputs);
		input_bABV.appendTo(p_inputs);
		input_bIBU.appendTo(p_inputs);
		input_bLabel.appendTo(p_inputs);
		input_bCode.appendTo(p_inputs);
		p_inputs.appendTo('#beerlist');
		p_inputs.children('input')
			.attr("data-pos",pos)
			.change(function (event) {
				updateHtmlFromItems($(this).parent());
			});

		$('#bl_search_instructions').hide();
		$('#bl_headers').show();
		$('#bl_search').attr('placeholder', 'Add Another Beer').val('');
        input_bName.change();
	}

    function updateItemsFromHtml(editor_html) {
        var $html = $('<div>');
        $html.html(editor_html);
        var $blArea = $html.find('#bl_area');
        //if ($blArea.length === 0)
        //    return false;
        var $listItems = $blArea.find('li.bl_item');
        $listItems.each(function (idx, elem) {
            var $elem = $(elem);
            var pos = $elem.attr('data-pos');
			var bid = $elem.attr('data-bid');
            var bName = $elem.find('.bl_beer').text();
            var rName = $elem.find('.bl_brewery').text();
            var rLocation = $elem.find('.bl_location').text().replace('(','').replace(')','');
            var bStyle = $elem.find('.bl_style').text();
            var bABV = $elem.find('.bl_abv').text();
            var bIBU = $elem.find('.bl_ibu').text();
			var bLabel = $elem.css('background-image');
			if($('#input_bName_' + pos).length > 0){
				$('#input_bName_' + pos).val(bName);
				$('#input_rName_' + pos).val(rName);
				$('#input_rLocation_' + pos).val(rLocation);
				$('#input_bStyle_' + pos).val(bStyle);
				$('#input_bABV_' + pos).val(bABV);
				$('#input_bIBU_' + pos).val(bIBU);
				$('#input_bLabel_' + pos).val(bLabel)
			}else{
				var item = {
					beer: {
						 beer_name: bName
						,beer_style: bStyle
						,beer_abv: bABV
						,beer_ibu: bIBU
						,beer_label: bLabel
					},
					brewery: {
						 brewery_name: rName
						,brewer_city_state: rLocation						
					}
				};
				createInput(item);
			}
        });
		$('#beerlist p.item_inputs').each(function(idx, elem){
			var pos = $(elem).attr('data-pos');
			var $deleteme = $.grep($listItems,function(elem2, idx2){
				if($(elem2).attr('data-pos') === pos)
					return true;
				else
					return false;
			});
			if($deleteme.length === 0){
				$(this).remove();
			}
		});
		if($('#beerlist p.item_inputs').length === 0){
			$('#bl_search_instructions').show();
			$('#bl_headers').hide();
			$('#bl_search').attr('placeholder', 'Enter Beer').val('');
		}
    }

    function updateHtmlFromItems($item) {
        var bName = $item.children('input.bName').val();
        var rName = $item.children('input.rName').val();
        var rLocation = $item.children('input.rLocation').val();
        var bStyle = $item.children('input.bStyle').val();
        var bABV = $item.children('input.bABV').val();
        var bIBU = $item.children('input.bIBU').val();
        var bLabel = $item.children('input.bLabel').val();

        var pos = $item.attr('data-pos');
		var bid = $item.attr('data-bid');
        var $editor = $('#wp-content-editor-container textarea');
        var $html = $('<div>');
        var editor_html = $editor.val();
        $html.html(editor_html);

        var $blArea = $html.find('#bl_area');
        if ($blArea.length === 0) {
            $blArea = $('<div id="bl_area">');
            $blArea.appendTo($html);
        }
        var $listItem = $blArea.find('li.bl_item[data-pos=' + pos + ']');
        var li = $("<li data-pos=" + pos + " data-bid=" + bid + " class='bl_item'>");
		li.css("background-image",bLabel);
		li.css("background-position","0px 4px");
		li.css("background-size","40px 40px");
		li.css("background-repeat","no-repeat");
        //creating the initial code to place on the page and placing in hidden input (input_bCode);

        var div_meat = jQuery("<div class='meat'>");
        var div_bones = jQuery("<div class='bones'>");
        var p_info = jQuery("<p class='info'>");
        var span_beer = jQuery("<span class='bl_beer'>")
            .text(bName);
        var span_brewery = jQuery("<span class='bl_brewery'>")
            .text(rName);
        var span_location = jQuery("<span class='bl_location'>")
            .text("(" + rLocation + ")");
        p_info.append(span_beer);
        p_info.append(span_brewery);
        p_info.append(span_location);
        div_meat.append(p_info);
        var p_other = jQuery("<p class='other'>");
        var span_style = jQuery("<span class='bl_style'>")
            .text(bStyle);
        var span_deets = jQuery("<span class='bl_deets'>")
            .html('ABV: <span class="bl_abv">' + bABV + '</span>%' + (bIBU === '' ? '' : ', IBU: <span class="bl_ibu">' + bIBU + '</span>'));
        p_other.append(span_style);
        p_other.append(span_deets);
        div_bones.append(p_other);
        li.append(div_meat);
        li.append(div_bones);

        if ($listItem.length === 0)
            li.appendTo($blArea);
        else
            $listItem.replaceWith(li.get()[0].outerHTML);

        $editor.val($html.html());
    }

}(jQuery));


var testdata = { "meta": { "code": 200, "response_time": { "time": 0.108, "measure": "seconds" }, "init_time": { "time": 0.015, "measure": "seconds" } }, "notifications": { "type": "notifications", "unread_count": { "comments": 0, "toasts": 0, "friends": 0, "messages": 0, "news": 0 } }, "response": { "message": "", "brewery_id": false, "search_type": "", "type_id": 0, "search_version": 3, "found": 1222, "offset": 0, "limit": 8, "term": "captain", "parsed_term": "captain*", "beers": { "count": 8, "items": [{ "checkin_count": 19467, "have_had": false, "your_count": 0, "beer": { "bid": 302091, "beer_name": "IPA", "beer_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/beer_logos\/beer-_302091_6938b2a0db4d429bbe065272057d.jpeg", "beer_abv": 7, "beer_ibu": 65, "beer_description": "Hops, hops & more hops. This beer is brewed using only the finest US grown hops from our good friends out West. With a robust hop aroma from the dry hopping process this beer delivers on its promise to provide a full sensory assault on your taste buds. ", "created_at": "Tue, 29 Jan 2013 13:25:02 +0000", "beer_style": "American IPA", "auth_rating": 0, "wish_list": false, "in_production": 1 }, "brewery": { "brewery_id": 341, "brewery_name": "Captain Lawrence Brewing Company", "brewery_slug": "captain-lawrence-brewing-company", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-CaptainLawrenceBrewingCompany_341.jpeg", "country_name": "United States", "contact": { "twitter": "cptlawrencebeer", "facebook": "http:\/\/www.facebook.com\/CaptainLawrence", "instagram": "captlawrence", "url": "http:\/\/captainlawrencebrewing.com" }, "location": { "brewery_city": "Elmsford", "brewery_state": "NY", "lat": 41.07, "lng": -73.8152 }, "brewery_active": 1 } }, { "checkin_count": 17450, "have_had": false, "your_count": 0, "beer": { "bid": 10920, "beer_name": "Freshchester Pale Ale", "beer_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/beer_logos\/beer-FreshChesterPaleAle_10920.jpeg", "beer_abv": 5.5, "beer_ibu": 35, "beer_description": "", "created_at": "Thu, 25 Nov 2010 09:42:20 +0000", "beer_style": "American Pale Ale", "auth_rating": 0, "wish_list": false, "in_production": 1 }, "brewery": { "brewery_id": 341, "brewery_name": "Captain Lawrence Brewing Company", "brewery_slug": "captain-lawrence-brewing-company", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-CaptainLawrenceBrewingCompany_341.jpeg", "country_name": "United States", "contact": { "twitter": "cptlawrencebeer", "facebook": "http:\/\/www.facebook.com\/CaptainLawrence", "instagram": "captlawrence", "url": "http:\/\/captainlawrencebrewing.com" }, "location": { "brewery_city": "Elmsford", "brewery_state": "NY", "lat": 41.07, "lng": -73.8152 }, "brewery_active": 1 } }, { "checkin_count": 14030, "have_had": false, "your_count": 0, "beer": { "bid": 5749, "beer_name": "Captain's Reserve Imperial IPA", "beer_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/beer_logos\/beer-CaptainsReserveImperialIPA_5749.jpeg", "beer_abv": 9, "beer_ibu": 90, "beer_description": "This beer is a salute to the ingenuity and creativity of the American craft brewers. A uniquely American style of beer, the Double or Imperial IPA, has become the calling card of many craft brewers who aren't afraid to push the limits of what hops can add to a beer. This beer is big and hoppy - not for the faint of heart! Be prepared to experience sensory overload as you savor this Imperial IPA.", "created_at": "Sat, 21 Aug 2010 09:26:35 +0000", "beer_style": "Imperial \/ Double IPA", "auth_rating": 0, "wish_list": false, "in_production": 1 }, "brewery": { "brewery_id": 341, "brewery_name": "Captain Lawrence Brewing Company", "brewery_slug": "captain-lawrence-brewing-company", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-CaptainLawrenceBrewingCompany_341.jpeg", "country_name": "United States", "contact": { "twitter": "cptlawrencebeer", "facebook": "http:\/\/www.facebook.com\/CaptainLawrence", "instagram": "captlawrence", "url": "http:\/\/captainlawrencebrewing.com" }, "location": { "brewery_city": "Elmsford", "brewery_state": "NY", "lat": 41.07, "lng": -73.8152 }, "brewery_active": 1 } }, { "checkin_count": 14018, "have_had": false, "your_count": 0, "beer": { "bid": 32370, "beer_name": "Two Captains Double IPA", "beer_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/beer_logos\/beer-_32370_sm_68040b0cc2553e1c7bac4f84cdebfd.jpeg", "beer_abv": 8.5, "beer_ibu": 100, "beer_description": "Jan Halvor Fjeld, winner of Norwegian homebrewing championship 2010 brewed his champion double IPA at Nøgne Ø.  We at Nøgne Ø are of course proud to be with him in making this happen.\n\nThis double IPA is truly American inspired. It is fairly dry, which allows the hops to dominate. There is bitterness up front, some balanced malts in the middle and complex fruity and resiny hop aromas which simply has no end.", "created_at": "Mon, 21 Feb 2011 10:55:28 +0000", "beer_style": "Imperial \/ Double IPA", "auth_rating": 0, "wish_list": false, "in_production": 1 }, "brewery": { "brewery_id": 923, "brewery_name": "Nøgne Ø", "brewery_slug": "n-gne", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-nogneo_923.jpeg", "country_name": "Norway", "contact": { "twitter": "nogneo", "facebook": "http:\/\/www.facebook.com\/nogneo", "instagram": "nogneo", "url": "http:\/\/www.nogne-o.com\/" }, "location": { "brewery_city": "Grimstad", "brewery_state": "", "lat": 58.406, "lng": 8.63723 }, "brewery_active": 1 } }, { "checkin_count": 13398, "have_had": false, "your_count": 0, "beer": { "bid": 11002, "beer_name": "Captain Sig's Northwestern Ale", "beer_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/beer_logos\/beer-CaptainSigsNorthwesternAle_11002.jpeg", "beer_abv": 6.2, "beer_ibu": 80, "beer_description": "Tasting Notes:\nDeep red in color, this ale starts off with a floral, slightly citrus hop nose, hop flavor soon fades into the malty backbone of this red ale.\n\n8 Ingredients:\nCarastan, Chocolate, Great Western 2-Row Malts; Amarillo, Perle & Cascade Hops; Rogue's Pacman Yeast & Free Range Coastal Water.\n\nFood Pairing: Beef, Seafood \n\nHISTORY\nRogue's Northwestern Ale, brewed for Captain Sig Hansen joins the Rogue family of World Class Ales, Stouts, Porters, and Lagers. \n\nDedicated to the Hansen Brothers--Sig, Edgar, and Norman--the Rogues of the Bering Sea.", "created_at": "Thu, 25 Nov 2010 15:16:08 +0000", "beer_style": "American Amber \/ Red Ale", "auth_rating": 0, "wish_list": false, "in_production": 1 }, "brewery": { "brewery_id": 4565, "brewery_name": "Rogue Ales", "brewery_slug": "rogue-ales", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-rogue.jpg", "country_name": "United States", "contact": { "twitter": "rogueales", "facebook": "http:\/\/www.facebook.com\/rogueales", "instagram": "", "url": "http:\/\/www.rogue.com\/" }, "location": { "brewery_city": "Newport", "brewery_state": "OR", "lat": 44.6202, "lng": -124.052 }, "brewery_active": 1 } }, { "checkin_count": 12164, "have_had": false, "your_count": 0, "beer": { "bid": 5747, "beer_name": "Liquid Gold", "beer_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/beer_logos\/beer-LiquidGold_5747.jpeg", "beer_abv": 6, "beer_ibu": 16, "beer_description": "Don't let the golden color fool you - this isn't your father's lite beer!\n\nBrewed with imported German malts and US-grown hops, this beer is a full-flavored introduction to craft-brewed beer. We add the hops late in the boil, allowing you to enjoy the flavor and aroma of the hops without an aggressive bitterness.", "created_at": "Sat, 21 Aug 2010 09:26:35 +0000", "beer_style": "Belgian Pale Ale", "auth_rating": 0, "wish_list": false, "in_production": 1 }, "brewery": { "brewery_id": 341, "brewery_name": "Captain Lawrence Brewing Company", "brewery_slug": "captain-lawrence-brewing-company", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-CaptainLawrenceBrewingCompany_341.jpeg", "country_name": "United States", "contact": { "twitter": "cptlawrencebeer", "facebook": "http:\/\/www.facebook.com\/CaptainLawrence", "instagram": "captlawrence", "url": "http:\/\/captainlawrencebrewing.com" }, "location": { "brewery_city": "Elmsford", "brewery_state": "NY", "lat": 41.07, "lng": -73.8152 }, "brewery_active": 1 } }, { "checkin_count": 9176, "have_had": false, "your_count": 0, "beer": { "bid": 831199, "beer_name": "Captain's Daughter", "beer_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/beer_logos\/beer-831199_8ce08_sm.jpeg", "beer_abv": 8.5, "beer_ibu": 69, "beer_description": "", "created_at": "Thu, 02 Oct 2014 22:48:23 +0000", "beer_style": "Imperial \/ Double IPA", "auth_rating": 0, "wish_list": false, "in_production": 1 }, "brewery": { "brewery_id": 20319, "brewery_name": "Grey Sail Brewing of RI", "brewery_slug": "grey-sail-brewing-of-ri", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-greysailbrewingcompany_20319.jpeg", "country_name": "United States", "contact": { "twitter": "GreySail", "facebook": "http:\/\/www.facebook.com\/GreySail", "instagram": "", "url": "http:\/\/www.greysailbrewing.com\/" }, "location": { "brewery_city": "Westerly", "brewery_state": "RI", "lat": 41.3849, "lng": -71.8325 }, "brewery_active": 1 } }, { "checkin_count": 8371, "have_had": false, "your_count": 0, "beer": { "bid": 6311, "beer_name": "Captain Stout", "beer_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/beer_logos\/beer-CaptainStout_6311.jpeg", "beer_abv": 6, "beer_ibu": 0, "beer_description": "The Captain is leader of a fire crew. This beer takes charge of your taste buds with its rich flavor. Roasty malt character that has hints of chocolate and coffee which balances the smooth, velvety finish. The thick, creamy head lasts and lasts, leaving lace in your glass as your beer disappears.", "created_at": "Thu, 07 Oct 2010 15:15:37 +0000", "beer_style": "Stout", "auth_rating": 0, "wish_list": false, "in_production": 1 }, "brewery": { "brewery_id": 29, "brewery_name": "Alpine Beer Company (CA)", "brewery_slug": "alpine-beer-company-ca", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-AlpineBeerCompany_29.jpeg", "country_name": "United States", "contact": { "twitter": "", "facebook": "http:\/\/www.facebook.com\/alpinebeercompany", "instagram": "", "url": "http:\/\/alpinebeerco.com" }, "location": { "brewery_city": "Alpine", "brewery_state": "CA", "lat": 32.8354, "lng": -116.766 }, "brewery_active": 1 } }] }, "homebrew": { "count": 0, "items": [] }, "breweries": { "items": [{ "brewery": { "brewery_id": 341, "beer_count": 461, "brewery_name": "Captain Lawrence Brewing Company", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-CaptainLawrenceBrewingCompany_341.jpeg", "country_name": "United States", "location": { "brewery_city": "", "brewery_state": "", "lat": 0, "lng": 0 } } }, { "brewery": { "brewery_id": 10327, "beer_count": 1, "brewery_name": "Captain Tony's", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/assets\/images\/temp\/badge-brewery-default.png", "country_name": "United States", "location": { "brewery_city": "", "brewery_state": "", "lat": 0, "lng": 0 } } }, { "brewery": { "brewery_id": 8550, "beer_count": 15, "brewery_name": "The Captain Cook Brewery", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-8550_997cc.jpeg", "country_name": "England", "location": { "brewery_city": "", "brewery_state": "", "lat": 0, "lng": 0 } } }, { "brewery": { "brewery_id": 74296, "beer_count": 70, "brewery_name": "Captain Jacks (Homebrew)", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/assets\/images\/temp\/badge-brewery-default.png", "country_name": "England", "location": { "brewery_city": "", "brewery_state": "", "lat": 0, "lng": 0 } } }, { "brewery": { "brewery_id": 168222, "beer_count": 4, "brewery_name": "Captain Morgan Co.", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-168222_a4974.jpeg", "country_name": "United States", "location": { "brewery_city": "", "brewery_state": "", "lat": 0, "lng": 0 } } }, { "brewery": { "brewery_id": 86479, "beer_count": 9, "brewery_name": "Captain Fatty's Craft Brewery", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-CaptainFattys_86479_6b5ac.jpeg", "country_name": "United States", "location": { "brewery_city": "", "brewery_state": "", "lat": 0, "lng": 0 } } }, { "brewery": { "brewery_id": 64951, "beer_count": 1, "brewery_name": "Captain's Cove Restaurant", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/assets\/images\/temp\/badge-brewery-default.png", "country_name": "United States", "location": { "brewery_city": "", "brewery_state": "", "lat": 0, "lng": 0 } } }, { "brewery": { "brewery_id": 109500, "beer_count": 4, "brewery_name": "Captain Red Beard (Homebrew)", "brewery_label": "https:\/\/d1c8v1qci5en44.cloudfront.net\/site\/brewery_logos\/brewery-109500_d897d.jpeg", "country_name": "United States", "location": { "brewery_city": "", "brewery_state": "", "lat": 0, "lng": 0 } } }], "count": 8 } } };