if(window.location.hostname != "www.bitdice.me" &&
	window.location.hostname != "www.litedice.me" &&
	window.location.hostname != "www.dogedice.me" &&
	window.location.hostname != "www.reddice.me")
{
	alert('This script only works on: www.bitdice.me, www.litedice.me, www.dogedice.me, www.reddice.me');
}
else
{

	switch(window.location.hostname)
	{
		case 'www.bitdice.me':
			window.user_prefix = '฿';
			break;
		case 'www.litedice.me':
			window.user_prefix = 'Ł';
			break;
		case 'www.dogedice.me':
			window.user_prefix = 'Ð';
			break;
		case 'www.reddice.me':
			window.user_prefix = 'Ɍ';
			break;
		default:
			break;
	}

	(function()
	{
		$panel = $('#autoTipPanel');

		if($panel.length <= 0)
		{
			$panel = $(
				'<div style="position:fixed;top:10px;left:10px;z-index:9999;" id="autoTipPanel" class="panel panel-default">'+
					'<div class="panel-heading">TheMan\'s auto-tip script.</div>'+
					'<div class="panel-body">'+
						'<div class="form-group">'+
							'<label for="codeEval">Code to evaluate</label>'+
							'<code>function(user_id, bet_amount) {</code><br>'+
							'<textarea id="codeEval" class="form-control">this.sendMessage(\'testscript: userid \'+user_id+\' just bet \'+bet_amount+\' coins\');</textarea>'+
							'<code>}</code><br>'+
							'<label for="exampleCode">Example:</label>'+
							'<pre id="exampleCode">'+
							'var tip_amount = bet_amount*0.01;'+"\n"+
							'if(this.balance > tip_amount)'+"\n"+
							'{'+"\n"+
							'	this.tip(user_id, tip_amount);'+"\n"+
							'	this.sendMessage(\'I just sent an automated tip!\');'+"\n"+
							'	console.log(this.data);'+"\n"+
							'}'+"\n"+
							'</pre>'+
						'</div>'+
						'<button class="btn btn-primary col-xs-6" id="startTipping" type="button">Start tipping</button>'+
						'<button class="btn btn-danger col-xs-6" id="stopTipping" type="button">Stop tipping</button>'+
					'</div>'+
				'</div>'
			);

			$('body').append($panel);
			$panel = $('#autoTipPanel');
			$panel.find('.panel-body').css('max-height', (document.documentElement.clientHeight-10)+'px').css('overflow', 'auto');

			$('#startTipping').click(function()
			{
				window.stopTipping = false;
				window.autoTip();
			});
			$('#stopTipping').click(function()
			{
				window.stopTipping = true;
			});
		}

		window.autoTip = function()
		{
			var code = $('#codeEval').val();
			console.log(code);
			var scope = {};
			scope.user_function = function(user_id, bet_amount){eval(code);}
			scope.tip = function(user_id, tip_amount)
			{
				$('#chatMessage').val('/tip '+user_id+' '+tipAmount);
				$('#sendMessage').click();
			}
			scope.sendMessage = function(message)
			{
				$('#chatMessage').val(message);
				$('#sendMessage').click();
			}
			scope.balance = $('#user-balance').text()-0;

			if(typeof window.autoTipHandler == 'function')
			{
				$('.chat-box').unbind('DOMNodeInserted', window.autoTipHandler);
			}

			window.autoTipHandler = function(e)
			{
				if(window.stopTipping)
				{
					return;
				}
				var $target = $(e.target);

				scope.balance = $('#user-balance').text()-0;

				var symbol = $target.find('.amount').text().slice(-1);
				var sitename = '';

				switch(symbol)
				{
					case '฿':
						sitename = 'www.bitdice.me';
						break;
					case 'Ł':
						sitename = 'www.litedice.me';
						break;
					case 'Ð':
						sitename = 'www.dogedice.me';
						break;
					case 'Ɍ':
						sitename = 'www.reddice.me';
						break;
					default:
						break;
				}

				if(sitename != window.location.hostname)
				{
					return;
				}

				if($target.find('.system:contains(BetBot)').first().text() === 'BetBot')
				{
					var betNumber = $target.find('.check-bet').data('bet');
					var temp = function()
					{
						$.getJSON('/api/'+betNumber, function(data)
						{
							scope.data = data;
							scope.user_function(window.user_prefix+data.user_id, data.amount);
						})
						.fail(function()
						{
							setTimeout(temp, 100);
						});
					}
					setTimeout(temp, 250);
				}
			}
			$('.chat-box').bind('DOMNodeInserted', window.autoTipHandler);
		}
	})();

}
