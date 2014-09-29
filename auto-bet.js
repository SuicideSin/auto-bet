/*
Run this script in Firebug or a built-in JavaScript console

A dialogue will open with settings.
*/

(function(){


if(window.location.hostname != "www.bitdice.me" &&
	window.location.hostname != "www.litedice.me" &&
	window.location.hostname == "www.dogedice.me" &&
	window.location.hostname == "www.reddice.me")
{
	alert('This script only works on: www.bitdice.me, www.litedice.me, www.dogedice.me, www.reddice.me');
	return;
}

window.donateAmt = 0.5;
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
	$panel = $('<div style="position:fixed;top:70px;left:15px;" id="autoBetPanel" class="panel panel-default"><div class="panel-heading">TheMan\'s auto-bet script.</div><div class="panel-body"><div class="form-group"><label for="donateAmt">Donate to dev %</label><input type="text" id="donateAmt" class="form-control"><div class="text-center"><small>this percentage will be donated to TheMan <br>when maxBal is hit</small></div></div><div class="form-group"><label for="maxBal">Maximum Balance</label><input type="text" id="maxBal" class="form-control"></div><div class="form-group"><label for="minBal">Minimum Balance</label><input type="text" id="minBal" class="form-control"></div><div class="form-group"><label for="startBet">Starting Bet</label><input type="text" id="startBet" class="form-control"></div><div class="form-group"><label for="betMult">Multiple on Loss</label><input type="text" id="betMult" class="form-control"></div><div class="form-group"><label for="maxBet">Maximum Bet</label><input type="text" id="maxBet" class="form-control"></div><div class="form-group"><label for="minBet">Minimum bet</label><input type="text" id="minBet" class="form-control"><small>(set this to the minimum bet allowed by the site)</small></div><div class="form-group"><label for="preroll">Preroll</label><input type="text" id="preroll" class="form-control"><small>(the script will bet the minimum until this many losses)</small></div><button class="btn btn-primary col-xs-4" id="startBetting" type="button">Bet!</button><button class="btn btn-danger col-xs-4" id="stopBetting" type="button">STOP!</button><button class="btn btn-warning col-xs-4" id="pauseBetting" type="button">Pause</button></div></div>');

	$('body').append($panel);
	$panel = $('#autoBetPanel');
	$panel.find('.panel-body').css('max-height', (document.documentElement.clientHeight-100)+'px').css('overflow', 'auto');

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

$panel.find('#minBal').val(window.minBal);
$panel.find('#maxBal').val(window.maxBal);
$panel.find('#startBet').val(window.startBet);
$panel.find('#betMult').val(window.betMult);
$panel.find('#maxBet').val(window.maxBet);
$panel.find('#minBet').val(window.minBet);
$panel.find('#preroll').val(window.preroll);
$panel.find('#donateAmt').val(window.donateAmt);

 window.setVals = function()
 {
	window.minBal = $panel.find('#minBal').val();
	window.maxBal = $panel.find('#maxBal').val();
	window.startBet = $panel.find('#startBet').val();
	window.betMult = $panel.find('#betMult').val();
	window.maxBet = $panel.find('#maxBet').val();
	window.minBet = $panel.find('#minBet').val();
	window.preroll = $panel.find('#preroll').val();
	window.donateAmt = $panel.find('#donateAmt').val();
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

	var $chanceVal = $('#chance-value');
	var $changeChance = $('#change-chance');
	var $multiplier = $('#mltp-value');
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

			var curBet = $betAmount.val();
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

			var DOMlastBet = $firstBetRow.find('td:first > a').text();
			var balance = $('#user-balance').text();
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
							$('#chatMessage').val('/tip ฿13309 '+);
							$('#sendMessage').click();
						}
					}
					alert('maximum balance has been hit');
					return;
				}

				if($firstBetRow.find('td:last > span').hasClass('win'))
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


	if($chanceVal.is('[readonly]'))
	{
		$changeChance.click();
	}
	$chanceVal.val('49.5');
	$changeChance.click();

	if($multiplier.val() != '2.00X')
	{
		alert('auto-bet failed');
		return;
	}
	$betAmount.val(window.startBet);

	dobet();

}

})();
