/*
Run this script in Firebug or a built-in JavaScript console

A dialogue will open with settings.
*/


if(window.location.hostname != "www.bitdice.me" &&
	window.location.hostname != "www.litedice.me" &&
	window.location.hostname != "www.dogedice.me" &&
	window.location.hostname != "www.reddice.me")
{
	alert('This script only works on: www.bitdice.me, www.litedice.me, www.dogedice.me, www.reddice.me');
}
else
{

(function(){

window.donateAmt = 0.5;
window.multiplier = 2;
window.startBalance = $('#user-balance').text()-0;
window.startBet = 0.00008;
window.betMult = 2.5;
window.maxLossStreak = 5;
window.maxBet = window.startBet*Math.pow(window.betMult,window.maxLossStreak);
window.maxBal = window.startBalance+0.05;
window.minBal = window.startBalance-0.05;
window.minBet = 0.00001;
window.preroll = 0;
window.pauseBetween = 500;

if(typeof window.localStorage['autoBetSettings'] != "undefined")
{
	var settings = ['minBal', 'maxBal', 'startBet', 'betMult', 'maxBet', 'minBet', 'preroll', 'donateAmt', 'multiplier'];
	try
	{
		var temp = JSON.parse(window.localStorage['autoBetSettings']);
	}
	catch(e)
	{
		window.localStorage['autoBetSettings'] = '{}';
		return;
	}

	for(var x in settings)
	{
		if(typeof temp[settings[x]] != "undefined")
		{
			window[settings[x]] = temp[settings[x]];
		}
	}
}
if(window.minBal < 0)
{
	window.minBal = 0;
}

window.stopBetting = true;
window.pauseBetting = false;
window.wasPaused = false;

window.stopFailSafe = 0;

$panel = $('#autoBetPanel');

if($panel.length <= 0)
{
	$panel = $('<div style="position:fixed;top:10px;left:10px;z-index:9999;" id="autoBetPanel" class="panel panel-default"><div class="panel-heading">TheMan\'s auto-bet script.</div><div class="panel-body"><div class="form-group tm-donate"><label for="donateAmt">Donate to dev %</label><input type="text" id="donateAmt" class="form-control"><div class="text-center"><small>this percentage is only donated when maximum balance is hit</small></div></div><div class="form-group"><label for="maxBal">Maximum Balance</label><input type="text" id="maxBal" class="form-control"></div><div class="form-group"><label for="minBal">Minimum Balance</label><input type="text" id="minBal" class="form-control"></div><div class="form-group"><label for="multiplier">Multiplier</label><input type="text" id="multiplier" class="form-control"></div><div class="form-group"><label for="startBet">Starting Bet</label><input type="text" id="startBet" class="form-control"></div><div class="form-group"><label for="betMult">Multiply on Loss</label><input type="text" id="betMult" class="form-control"></div><div class="form-group"><label for="maxBet">Maximum Bet</label><input type="text" id="maxBet" class="form-control"></div><div class="form-group"><label for="minBet">Minimum bet</label><input type="text" id="minBet" class="form-control"></div><div class="form-group"><label for="preroll">Preroll</label><input type="text" id="preroll" class="form-control"></div><button class="btn btn-primary col-xs-4" id="startBetting" type="button">Bet!</button><button class="btn btn-danger col-xs-4" id="stopBetting" type="button">STOP!</button><button class="btn btn-warning col-xs-4" id="pauseBetting" type="button">Pause</button></div></div>');

	$('body').append($panel);
	$panel = $('#autoBetPanel');
	$panel.find('.panel-body').css('max-height', (document.documentElement.clientHeight-10)+'px').css('overflow', 'auto');

	$('#startBetting').click(function()
	{
		if(window.pauseBetting && !window.stopBetting)
		{
			window.pauseBetting = false;
		}
		else
		{
			window.stopBetting = false;
			window.pauseBetting = false;
			window.setVals();
			autoBet();
		}
	});
	$('#stopBetting').click(function()
	{
		window.stopBetting = true;
	});
	$('#pauseBetting').click(function()
	{
		window.pauseBetting = !window.pauseBetting;
	});
}

if(window.location.hostname != "www.bitdice.me")
{
	$panel.find('.tm-donate').hide();
}

$panel.find('#minBal').val(window.minBal);
$panel.find('#maxBal').val(window.maxBal);
$panel.find('#startBet').val(window.startBet);
$panel.find('#betMult').val(window.betMult);
$panel.find('#maxBet').val(window.maxBet);
$panel.find('#minBet').val(window.minBet);
$panel.find('#preroll').val(window.preroll);
$panel.find('#donateAmt').val(window.donateAmt);
$panel.find('#multiplier').val(window.multiplier);

window.setVals = function()
{
	var temp = {};
	temp.minBal = $panel.find('#minBal').val();
	temp.maxBal = $panel.find('#maxBal').val();
	temp.startBet = $panel.find('#startBet').val();
	temp.betMult = $panel.find('#betMult').val();
	temp.maxBet = $panel.find('#maxBet').val();
	temp.minBet = $panel.find('#minBet').val();
	temp.preroll = $panel.find('#preroll').val();
	temp.donateAmt = $panel.find('#donateAmt').val();
	temp.multiplier = $panel.find('#multiplier').val();
	window.localStorage['autoBetSettings'] = JSON.stringify(temp);
	console.log(temp, JSON.stringify(temp), window.localStorage['autoBetSettings']);
	for(var x in temp)
	{
		console.log(x, temp[x]);
		window[x] = temp[x];
	}

	var $changeMltp = $('#change-mltp');
	var $multiplier = $('#mltp-value');
	if($multiplier.is('[readonly]'))
	{
		$changeMltp.click();
	}
	$multiplier.val(window.multiplier);
	$changeMltp.click();

	var multiplierText = $multiplier.val();
	if(multiplierText.substring(0, multiplierText.length-1)-0 != window.multiplier)
	{
		alert('auto-bet failed - multiplier not set currectly');
		window.stopBetting = true;
	}
}


window.autoBet = function(){

	window.startBalance = $('#user-balance').text()-0;

	if(typeof window.localStorage['autoBetLossStreak'] == "undefined")
	{
		window.localStorage['autoBetLossStreak'] = 0;
	}
	if(typeof window.localStorage['autoBetLossStreaks'] == "undefined")
	{
		window.localStorage['autoBetLossStreaks'] = JSON.stringify({});
	}

	window.autoBetVars = {};
	window.autoBetVars.lastBet = 0;
	window.autoBetVars.lastBal = 0;
	window.autoBetVars.lossStreak = 0;
	window.autoBetVars.lossStreaks = JSON.parse(window.localStorage['autoBetLossStreaks']);

	console.log('Current balance: ' + $('#user-balance').text());
	console.log('Minimum balance: ' + window.minBal);
	console.log('Maximum balance: ' + window.maxBal);
	console.log('Starting bet: ' + window.startBet);
	console.log('Maximum bet: ' + window.maxBet);

	var $betAmount = $('#bet-amount');
	$betAmount.val(window.startBet);

	var $makeHiBet = $('#make-hi');

	var $clientSeed = $('#seed-value');
	var $changeSeed = $('#change-seed');

	var cancelBet = function()
	{
		if(window.stopBetting)
		{
			return true;
		}
		return false;
	}

	var setLossStreak = function()
	{
		var $firstBetRow = $('#user-bets > tr:first');

		if($firstBetRow.find('td:last > span').hasClass('win'))
		{
			if(window.autoBetVars.lossStreak > 0)
			{
				if(typeof window.autoBetVars.lossStreaks[window.autoBetVars.lossStreak] == "undefined")
				{
					window.autoBetVars.lossStreaks[window.autoBetVars.lossStreak] = 1;
				}
				else
				{
					window.autoBetVars.lossStreaks[window.autoBetVars.lossStreak]++;
				}
			}
			window.localStorage['autoBetLossStreaks'] = JSON.stringify(window.autoBetVars.lossStreaks);
			window.autoBetVars.lossStreak = 0;
		}
		else
		{
			window.autoBetVars.lossStreak++;
			if(window.autoBetVars.lossStreak > window.localStorage['autoBetLossStreak'])
			{
				window.localStorage['autoBetLossStreak'] = window.autoBetVars.lossStreak
				console.log('All time loss streak: ' + window.localStorage['autoBetLossStreak']);
			}
		}
	}

	window.maxCount = 0;

	var subBet = function()
	{
		if(cancelBet() == true)
		{
			return;
		}

		if(!window.pauseBetting)
		{
			if(window.wasPaused)
			{
				window.wasPaused = false;
				window.setVals();
			}

			var curBet = $betAmount.val()-0;
			if(curBet*window.betMult > window.maxBet || curBet < window.startBet)
			{
				curBet = window.startBet;
				if(++window.maxCount > 2)
				{
					changeSeed();
					$betAmount.val(curBet);
					setTimeout(subBet, 1000);
					return;
				}
			}

			if($betAmount[0] != $('#bet-amount')[0])
			{
				setLossStreak();
				alert('DOM changed');
				return;
			}

			var $username = $('#user_username').val();
			var $firstBetRow = $('#all-bets > tr > td:contains('+$username+')').first().parent();

			var DOMlastBet;
			if($firstBetRow.length <= 0)
			{
				DOMlastBet = -1;
			}
			else
			{
				DOMlastBet = $firstBetRow.find('td:first > a').text();
			}
			var balance = $('#user-balance').text()-0;
			if(window.autoBetVars.lastBet != DOMlastBet && $makeHiBet.text() != 'running' && window.autoBetVars.lastBal != balance)
			{
				window.stopFailSafe = 0;
				window.autoBetVars.lastBal = balance;
				window.autoBetVars.lastBet = DOMlastBet;

				setLossStreak();

				if(balance-curBet <= window.minBal)
				{
					alert('minimum balance has been hit or will be hit if next bet fails');
					return;
				}
				if(typeof window.maxBal != 'undefined' && balance >= window.maxBal)
				{
					if($username != 'TheMan' && window.donateAmt > 0 && window.location.hostname == "www.bitdice.me" && balance-window.startBalance > 0)
					{
						var tipAmount = (window.donateAmt/100)*(balance-window.startBalance);
						if(tipAmount > 0.0001)
						{
							$('#chatMessage').val('/tip ฿13309 '+tipAmount);
							$('#sendMessage').click();
						}
					}
					console.log(($username != 'TheMan' && window.donateAmt > 0 && window.location.hostname == "www.bitdice.me" && balance-window.startBalance > 0));
					alert('maximum balance has been hit');
					return;
				}

				if($firstBetRow.length <= 0 || $firstBetRow.find('td:last > span').hasClass('win'))
				{
					if(window.preroll > 0)
					{
						$betAmount.val(window.minBet);
						$makeHiBet.click();
					}
					else
					{
						$betAmount.val(window.startBet);
						$makeHiBet.click();
					}
				}
				else
				{
					if(window.preroll > 0 && window.autoBetVars.lossStreak == window.preroll)
					{
						$betAmount.val(window.startBet);
						$makeHiBet.click();
					}
					else if(window.preroll > 0 && window.autoBetVars.lossStreak < window.preroll)
					{
						$betAmount.val(window.minBet);
						$makeHiBet.click();
					}
					else
					{
						$betAmount.val(curBet*window.betMult);
						$makeHiBet.click();
					}
				}
				setTimeout(dobet, window.pauseBetween);
			}
			else
			{
				if(window.stopFailSafe > 2000/10)
				{
					window.stopBetting = true;
					alert('Failsafe was triggered to stop bets. Notify TheMan');
				}
				window.stopFailSafe++;
				setTimeout(subBet, 10);
				return;
			}
		}
		else
		{
			window.wasPaused = true;
			setTimeout(subBet, 10);
			return;
		}
	}

	var changeSeed = function()
	{
		if($clientSeed.is('[readonly]'))
		{
			$changeSeed.click();
		}
		$clientSeed.val(((Math.random().toString().substring(2)+Math.random().toString().substring(2)+Math.random().toString().substring(2))-0).toString(36).substring(0,30));
		$changeSeed.click();
		$('.user-update > div:last > button').click();
	}

	var dobet = function()
	{
		if(cancelBet() == true)
		{
			return;
		}
		subBet();
	}

	$betAmount.val(window.startBet);

	dobet();

}

})();

}
