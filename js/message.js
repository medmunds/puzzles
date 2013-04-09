var Message = (function($) {
    "use strict";

    function Message(selector, closeOnBackdrop) {
        var $msg = $(selector),
            $backdrop = $msg.parent(),
            shown = function() {};

        var message = {
            show: function() {
                $backdrop.css('display', 'block');
                $msg.css('display', 'inline-block');
                setTimeout(shown, 100);
            },
            hide: function() {
                $msg.hide();
                $backdrop.hide();
            },
            shown: function(f) {
                shown = f;
            }
        };

        $msg.on('click', '.close', message.hide);
        if (closeOnBackdrop) {
            $backdrop.on('click', message.hide);
        }

        return message;
    }

    return Message;
})(jQuery);
